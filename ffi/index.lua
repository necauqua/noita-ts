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
            section.VirtualSize
        )
    end
end

-- if nolla ever makes it 64-bit it would be so
-- worth breaking this I can't even describe
if not data or not rdata or not text then
    error('Noita stopped being 32-bit PE?')
end

local M = {
    data = data,
    rdata = rdata,
    text = text,
}

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
