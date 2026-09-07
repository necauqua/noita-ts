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

    uint16_t AddAtomA(const char* str);
    uint16_t FindAtomA(const char* str);
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

    -- for the rare case of scanning memory outside of the module
    Section = Section,

    -- the wildcard byte of scan patterns
    _ = Section.ANY_BYTE,
}

--- Splits a number into its 4 little-endian bytes.
--- @param n number
--- @return number[]
function M.le32(n)
    return {
        bit.band(n, 0xFF),
        bit.band(bit.rshift(n, 8), 0xFF),
        bit.band(bit.rshift(n, 16), 0xFF),
        bit.band(bit.rshift(n, 24), 0xFF),
    }
end

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
    local imm = M.le32(addr)
    return text:scanAll(
        { 0x68, imm[1], imm[2], imm[3], imm[4] }, -- PUSH imm32
        { name = string.format('PUSH 0x%08X ("%s")', addr, str) }
    )
end

--- @param rtti_name string
--- @return number
function M.locateVftable(rtti_name)
    -- first we find the part of the RTTI type descriptor that contains
    --  the type name that should not ever change I hope
    local in_desc = data:scanAll(rtti_name, {
        name = string.format('string `%s` in .data', rtti_name),
    })

    -- The complete object locator is `signature, offset, cdOffset, pTypeDescriptor`,
    --  all zero but the last for a class without virtual bases. Its base-class
    --  descriptors reference the same descriptor at their own offset 0 and can come
    --  earlier in .rdata, so scanning for the descriptor alone hits those - match
    --  the three zero dwords in front of it instead.
    local desc = M.le32(in_desc - 8)
    local col = rdata:scanAll({
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        desc[1], desc[2], desc[3], desc[4],
    }, {
        name = string.format('complete object locator for `%s` (descriptor at 0x%08X)', rtti_name, in_desc - 8),
    })

    -- the locator is pointed to from a place right before the vftable
    local vftable_meta_ptr = rdata:scanAll(col, {
        name = string.format('vftable meta pointer for `%s` (locator at 0x%08X)', rtti_name, col),
    })

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

local ONCE_PREFIX = 'noita-ts.'

--- Returns true the first time it is called with a given name, and false after
--- that, for as long as the process lives.
---
--- @param name string
--- @return boolean
function M.once(name)
    local key = ONCE_PREFIX .. name
    if ffi.C.FindAtomA(key) ~= 0 then
        return false
    end
    if ffi.C.AddAtomA(key) == 0 then
        error(string.format('could not add the atom for the once flag `%s`', name))
    end
    return true
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

-- length of a `JMP rel32`
local JMP_LEN = 5

--- Encodes a `JMP rel32` placed at `from` that lands on `to`.
--- @param from number
--- @param to number
--- @return number[]
local function jmpRel32(from, to)
    local rel = M.le32(to - (from + JMP_LEN))
    return { 0xE9, rel[1], rel[2], rel[3], rel[4] }
end

--- How many bytes of whole instructions a `JMP rel32` at `addr` displaces.
--- @param addr number
--- @return number
local function displaced(addr)
    local stolen = 0
    while stolen < JMP_LEN do
        local len = M.instrLen(addr + stolen)
        if len == 0 then
            error(string.format('could not decode the instruction at 0x%08X', addr + stolen))
        end
        stolen = stolen + len
    end
    return stolen
end

-- see https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc
local MEM_COMMIT_RESERVE = 0x3000

-- the Windows allocation granularity: a `VirtualAlloc` reservation is rounded up
-- to this, so small allocations are bump-allocated out of one arena instead of
-- burning a whole 64KiB reservation each
local ARENA_SIZE = 0x10000

--- @type ffi.cdata*|nil
local arena
local arenaLeft = 0

--- Bump-allocates `size` bytes of readable, writable and executable memory,
--- 16-byte aligned, reserving a new arena when the current one runs out.
---
--- The memory is never released - it lives for as long as the process does.
---
--- @param size number
--- @return ffi.cdata* ptr a `char*` to the allocation
function M.allocExec(size)
    -- keep allocations 16-byte aligned
    size = bit.band(math.max(size, 1) + 15, bit.bnot(15))

    if arenaLeft < size then
        local n = math.max(ARENA_SIZE, size)
        local mem = ffi.C.VirtualAlloc(nil, n, MEM_COMMIT_RESERVE, PAGE_EXECUTE_READ_WRITE)
        if mem == nil then
            error(string.format('could not reserve %d bytes of executable memory', n))
        end
        arena = ffi.cast('char*', mem)
        arenaLeft = n
    end

    local ptr = arena
    arena = ptr + size
    arenaLeft = arenaLeft - size

    -- ptr can never be nil here
    ---@diagnostic disable-next-line: return-type-mismatch
    return ptr
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
--- `bytes` may also be a function, as returned by linking an assembled patch
--- without a value for its `BASE` reloc: the cave is allocated first and the
--- function is called with its address to produce the final bytes.
---
--- If the resulting byte array carries an `entry` offset (the patch's `entry`
--- label), the hook jumps there rather than to the start of the cave, so a patch
--- can put data in front of its code.
---
--- @param addr number the address to hook
--- @param bytes ffi.cdata*|number[]|string|fun(base: number): number[] the code to run in the cave
--- @return number cave the address of the allocated cave
function M.cave(addr, bytes)
    -- a patch that needs its own address can only be linked once the cave is
    -- allocated, and allocating needs the size - which linking does not change,
    -- so link once at a dummy base just to measure, then again for real
    local link = type(bytes) == 'function' and bytes --[[ @as fun(base: number): number[] ]]
    if link then
        bytes = link(0)
    end
    local entry = 0
    if type(bytes) == 'table' then
        entry = bytes['entry'] or 0
    end
    local size = type(bytes) == 'cdata' and ffi.sizeof(bytes) --[[ @as number ]] or #bytes

    local stolen = displaced(addr)
    local finalSize = size + stolen + JMP_LEN

    local cavePtr = M.allocExec(finalSize)
    local caveAddr = tonumber(ffi.cast('uint32_t', cavePtr)) --[[ @as number ]]

    if link then
        bytes = link(caveAddr)
    end
    if type(bytes) == 'table' or type(bytes) == 'string' then
        bytes = ffi.new('char[?]', size, bytes)
    end

    -- the payload, then the displaced instructions, then a jump back
    ffi.copy(cavePtr, bytes, size)
    ffi.copy(cavePtr + size, ffi.cast('char*', addr), stolen)

    local back = jmpRel32(caveAddr + size + stolen, addr + stolen)
    ffi.copy(cavePtr + size + stolen, ffi.new('char[?]', JMP_LEN, back), JMP_LEN)

    -- and finally the jump into the cave, padded with NOPs
    -- if it landed in the middle of an instruction
    local patch = jmpRel32(addr, caveAddr + entry)
    for i = JMP_LEN + 1, stolen do
        patch[i] = 0x90 -- NOP
    end
    M.patchRaw(addr, patch)

    return caveAddr
end

--- Builds the trampoline of a hook: it saves the state of the CPU and calls
--- `cb` with a pointer to the saved registers.
---
--- @param cb number the address of the callback
--- @return number[]
local function trampoline(cb)
    local imm = M.le32(cb)
    return {
        0x9C,                                 -- PUSHFD
        0x60,                                 -- PUSHAD
        0xFC,                                 -- CLD, the direction flag the ABI wants
        0x54,                                 -- PUSH ESP, the frame PUSHAD left
        0xB8, imm[1], imm[2], imm[3], imm[4], -- MOV EAX, <callback>
        0xFF, 0xD0,                           -- CALL EAX
        0x83, 0xC4, 0x04,                     -- ADD ESP, 4, cdecl cleans up
        0x61,                                 -- POPAD
        0x9D,                                 -- POPFD
    }
end

-- the callback of every live hook: LuaJIT holds it weakly through the finalizer
-- that undoes the hook, and only this keeps it around to be finalized at all
---@diagnostic disable-next-line: unused-local
local hooks = {}

--- Wraps `fn` so that nothing is thrown across the C call boundary, which takes
--- the process down.
--- @param fn function
--- @return function
local function guarded(fn)
    return function(...)
        local ok, err = pcall(fn, ...)
        if not ok then
            print(string.format('noita-ts: a hook errored: %s', tostring(err)))
        end
    end
end

local CALLBACK = ffi.typeof('void (__cdecl *)(struct { uint32_t edi, esi, ebp, esp, ebx, edx, ecx, eax; }*)')

--- Hooks `addr` with a cave that calls `fn` with the registers of the hooked
--- code, as a pointer to the frame that `PUSHAD` leaves - writing to a field
--- puts the value back into the register, except for `esp`.
---
--- @param addr number the address to hook
--- @param fn function the function to call
--- @return table hook the hook, with `cave` and `remove`
function M.hook(addr, fn)
    local cb = ffi.cast(CALLBACK, guarded(fn))

    -- the bytes the cave is about to displace, to put back on `remove`
    local stolen = displaced(addr)
    local original = ffi.new('char[?]', stolen)
    ffi.copy(original, ffi.cast('char*', addr), stolen)

    ---@diagnostic disable-next-line: param-type-mismatch bruh
    local cave = M.cave(addr, trampoline(tonumber(ffi.cast('uint32_t', cb))))

    local removed = false

    --- Puts the hooked code back the way it was.
    local function undo()
        if not removed then
            removed = true
            M.patchRaw(addr, original)
        end
    end

    -- a callback dies with the Lua state that made it, while the cave lives on,
    -- so the hook has to be gone by then - and the address free to hook again.
    -- `undo` deliberately holds no reference to `cb`: it hangs on it as the key
    -- of the weak finalizer table of LuaJIT
    ffi.gc(cb, undo)
    ---@diagnostic disable-next-line: unused-local
    hooks[cb] = true

    local hook = { cave = cave }

    --- Undoes the hook: the hooked code goes back to what it was, and the
    --- callback is released. The cave itself stays, as nothing ever frees it.
    function hook.remove()
        if removed then return end
        undo()
        ---@diagnostic disable-next-line: unused-local
        hooks[cb] = nil
        ---@diagnostic disable-next-line: undefined-field
        cb:free()
    end

    return hook
end

---@param needle ffi.cdata* | (number | AnyByte)[] | number | string
---@param params ScanParams?
function M.scan(needle, params)
    return text:scan(needle, params)
end

---@param needle ffi.cdata* | (number | AnyByte)[] | number | string
---@param patch ffi.cdata*|number[]|string
---@param params ScanParams?
function M.patch(needle, patch, params)
    M.patchRaw(text:scanAll(needle, params), patch)
end

-- for TS default export
M.default = M

return setmetatable(M, { __index = ffi })
