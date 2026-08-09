-- idk luals is confused
---@class ffi.cdata*

local ffi = require 'ffi'
local Section = require 'section'

--- @type Section
local data
--- @type Section
local rdata
--- @type Section
local text

ffi.cdef [[
    void* GetModuleHandleA(char* lpModuleName);

    bool VirtualProtect(void* adress, size_t size, int new_protect, int* old_protect);

    void* VirtualAlloc(void* address, size_t size, uint32_t allocation_type, uint32_t protect);

    typedef struct {
        char pad[60];
        uint32_t e_lfanew;
    } IMAGE_DOS_HEADER;

    typedef struct {
        char pad[6];
        uint16_t NumberOfSections;
        char pad2[12];
        uint16_t SizeOfOptionalHeader;
        char pad3[2];
    } IMAGE_NT_HEADERS32;

    typedef struct {
        char Name[8];
        uint32_t VirtualSize;
        uint32_t VirtualAddress;
        char pad[24];
    } IMAGE_SECTION_HEADER;
]]

-- dont hardcode 0x00400000 because of ASLR
local base = tonumber(ffi.cast('uint32_t', ffi.C.GetModuleHandleA(nil)))

-- look at the PE header to figure out the exact ranges of .data and .rdata
-- sections to minimize the ranges we have to scan
-- (also avoids reading out-of-bounds memory if we dont find something)

--- @type { e_lfanew: number }
local dos = ffi.cast('IMAGE_DOS_HEADER*', base)
--- @type { SizeOfOptionalHeader: number; NumberOfSections : number }
local pe = ffi.cast('IMAGE_NT_HEADERS32*', base + dos.e_lfanew)
--- @type { [number]: { Name: any; VirtualAddress: number; VirtualSize: number } }
local sections = ffi.cast('IMAGE_SECTION_HEADER*', ffi.cast('char*', pe) + 24 + pe.SizeOfOptionalHeader)

for i = 0, pe.NumberOfSections - 1 do
    local section = sections[i]
    local name = ffi.string(section.Name, 8)
    if name == '.data\0\0\0' then
        data = Section.new(
            '.data',
            base + section.VirtualAddress,
            section.VirtualSize
        )
    elseif name == '.rdata\0\0' then
        rdata = Section.new(
            '.rdata',
            base + section.VirtualAddress,
            section.VirtualSize
        )
    elseif name == '.text\0\0\0' then
        text = Section.new(
            '.text',
            base + section.VirtualAddress,
            section.VirtualSize,
            true -- executable code: scanned by walking instruction boundaries
        )
    end
end

-- if nolla ever makes it 64-bit it would be so
-- worth breaking this I can't even describe
if not data or not rdata or not text then
    error('Noita stopped being 32-bit PE?')
end

local M = {
    base = base,
    data = data,
    rdata = rdata,
    text = text,
}

--- Fixes an address that was hardcoded for 0x00400000 base to the actual base address of the module.
--- @param addr any
--- @return unknown
function M.rebase(addr)
    return addr - 0x00400000 + base
end

--- Calculates the length of the instruction at the given address.
--- @param addr ffi.cdata* | number
--- @return number
function M.instrLen(addr)
    if type(addr) == 'number' then
        addr = ffi.cast('void*', addr)
    end
    return Section._hde32_len(addr)
end

--- @param str string
--- @return number
function M.locateString(str)
    -- just scan the entire .rdata
    return rdata:scan(str .. '\0', {
        name = string.format('string "%s" in .rdata', str),
        limit = rdata.len,
    })
end

--- @param str string
--- @return number
function M.locateStringPush(str)
    local addr = M.locateString(str)
    return text:scanAll({
        0x68, -- PUSH imm32
        bit.band(addr, 0xFF),
        bit.band(bit.rshift(addr, 8), 0xFF),
        bit.band(bit.rshift(addr, 16), 0xFF),
        bit.band(bit.rshift(addr, 24), 0xFF),
    }, { name = string.format('PUSH 0x%08X ("%s")', addr, str) })
end

--- @param rtti_name string
--- @return number
function M.locateVftable(rtti_name)
    -- first we find the part of the RTTI type descriptor that contains
    --  the type name that should not ever change I hope
    local in_desc = data:scanAll(rtti_name, {
        name = string.format('string `%s` in .data', rtti_name),
    })

    -- offset back to get the descriptor pointer value
    --  and scan for the usage of that value, which should be in an RTTI locator thing
    local in_locator = rdata:scanAll(in_desc - 8, {
        name = string.format('RTTI locator for `%s` (descriptor at 0x%08X)', rtti_name, in_desc - 8),
    })

    -- same thing but to find usages of the locator, the vftable meta pointer
    local vftable_meta_ptr = rdata:scanAll(in_locator - 12, {
        name = string.format('vftable meta pointer for `%s` (locator at 0x%08X)', rtti_name, in_locator - 12),
    })

    -- which is right before the vftable
    return vftable_meta_ptr + 4
end

--- @param rtti_name string
--- @return number
function M.locateStaticGlobal(rtti_name)
    local vftable = M.locateVftable(rtti_name)
    -- look for the reference to the vftable in .data,
    -- which is at the beginning of the static global
    return data:scanAll(vftable, {
        name = string.format('static global for `%s` (vftable at 0x%08X)', rtti_name, vftable),
    })
end

-- see https://learn.microsoft.com/en-us/windows/win32/Memory/memory-protection-constants
local PAGE_EXECUTE_READ_WRITE = 0x40

---@param addr number
---@param patch ffi.cdata*|number[]|string
function M.patchRaw(addr, patch)
    local ptr = ffi.cast('void*', addr)

    if type(patch) == 'table' or type(patch) == 'string' then
        patch = ffi.new('char[?]', #patch, patch)
    end

    local restore_protection = ffi.new 'int[1]'
    local success = ffi.C.VirtualProtect(
        ptr, ffi.sizeof(patch), PAGE_EXECUTE_READ_WRITE, restore_protection
    )

    if not success then
        error("couldn't change memory protection")
    end

    ffi.copy(ptr, patch, ffi.sizeof(patch) --[[ @as number ]])

    -- restore protection
    ffi.C.VirtualProtect(
        ptr,
        ffi.sizeof(patch),
        restore_protection[0],
        restore_protection
    )
end

-- see https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc
local MEM_COMMIT_RESERVE = 0x3000

-- length of a `JMP rel32`
local JMP_LEN = 5
local JMP_OP = 0xE9
local NOP = 0x90

--- Encodes a `JMP rel32` placed at `from` that lands on `to`.
--- @param from number
--- @param to number
--- @return number[]
local function jmpRel32(from, to)
    local rel = to - (from + JMP_LEN)
    return {
        JMP_OP,
        bit.band(rel, 0xFF),
        bit.band(bit.rshift(rel, 8), 0xFF),
        bit.band(bit.rshift(rel, 16), 0xFF),
        bit.band(bit.rshift(rel, 24), 0xFF),
    }
end

--- Allocates an executable code cave holding `bytes`, and redirects `addr` to it
--- with a `JMP rel32`.
---
--- The whole instructions covered by that jump are copied to the end of the
--- cave, followed by a jump back to the instruction right after them, and any
--- leftover bytes of a partially overwritten instruction are filled with NOPs.
---
--- Note that the displaced instructions are copied verbatim, so an instruction
--- with a relative operand (`CALL rel32`, `JMP`/`Jcc`, RIP-less but
--- offset-relative addressing) will not survive the move.
---
--- @param addr number the address to hook
--- @param bytes ffi.cdata*|number[]|string the code to run in the cave
--- @return number cave the address of the allocated cave
function M.cave(addr, bytes)
    if type(bytes) == 'table' or type(bytes) == 'string' then
        bytes = ffi.new('char[?]', #bytes, bytes)
    end
    local size = ffi.sizeof(bytes) --[[ @as number ]]

    -- walk instruction boundaries to see how much the jump displaces
    local stolen = 0
    while stolen < JMP_LEN do
        local len = M.instrLen(addr + stolen)
        if len == 0 then
            error(string.format('could not decode the instruction at 0x%08X', addr + stolen))
        end
        stolen = stolen + len
    end

    local finalSize = size + stolen + JMP_LEN

    local cave = ffi.C.VirtualAlloc(nil, finalSize, MEM_COMMIT_RESERVE, PAGE_EXECUTE_READ_WRITE)
    if cave == nil then
        error(string.format('could not allocate %d bytes for a code cave', finalSize))
    end
    local caveAddr = tonumber(ffi.cast('uint32_t', cave)) --[[ @as number ]]
    local cavePtr = ffi.cast('char*', cave)

    -- the payload, then the displaced instructions, then a jump back
    ffi.copy(cavePtr, bytes, size)
    ffi.copy(cavePtr + size, ffi.cast('char*', addr), stolen)

    local back = jmpRel32(caveAddr + size + stolen, addr + stolen)
    ffi.copy(cavePtr + size + stolen, ffi.new('char[?]', JMP_LEN, back), JMP_LEN)

    -- and finally the jump into the cave, padded with NOPs
    -- if it landed in the middle of an instruction
    local patch = jmpRel32(addr, caveAddr)
    for i = JMP_LEN + 1, stolen do
        patch[i] = NOP
    end
    M.patchRaw(addr, patch)

    return caveAddr
end

---@param needle ffi.cdata* | number[] | number | string
---@param params ScanParams?
function M.scan(needle, params)
    return text:scan(needle, params)
end

---@param needle ffi.cdata* | number[] | number | string
---@param patch ffi.cdata*|number[]|string
---@param params ScanParams?
function M.patch(needle, patch, params)
    M.patchRaw(text:scan(needle, params), patch)
end

-- for TS default export
M.default = M

return setmetatable(M, { __index = ffi })
