---@diagnostic disable: undefined-global

-- idk luals is confused
---@class ffi.cdata*

local ffi = require 'ffi'

ffi.cdef [[
    void* GetModuleHandleA(char* lpModuleName);

    void* memchr(const void* ptr, int value, size_t num);

    int memcmp(const void* ptr1, const void* ptr2, size_t num);

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

---@class Section
--- @field offset number
--- @field len number

--- @type Section
local data
--- @type Section
local rdata

for i = 0, pe.NumberOfSections - 1 do
    local section = sections[i]
    local name = ffi.string(section.Name, 8)
    if name == '.data\0\0\0' then
        data = {
            offset = base + section.VirtualAddress,
            len = section.VirtualSize,
        }
    elseif name == '.rdata\0\0' then
        rdata = {
            offset = base + section.VirtualAddress,
            len = section.VirtualSize,
        }
    end
end

-- if nolla ever makes it 64-bit it would be so
-- worth breaking this I can't even describe
if not data or not rdata then
    error('Noita stopped being 32-bit PE?')
end

--- @param section Section
--- @param needle ffi.cdata* | string
--- @return number|nil
local function memfind(section, needle)
    local first_byte = ffi.cast('uint8_t*', needle)[0]
    local search_ptr = ffi.cast('uint8_t*', section.offset)
    local remaining = section.len

    local needle_len = type(needle) == 'string' and #needle or ffi.sizeof(needle)

    while remaining >= needle_len do
        -- Find first byte of pattern
        local found = ffi.C.memchr(search_ptr, first_byte, remaining - needle_len + 1)
        if found == nil then
            break
        end

        -- Check if full pattern matches
        if ffi.C.memcmp(found, needle, needle_len) == 0 then
            return tonumber(ffi.cast('size_t', found))
        end

        -- Move past this match and continue
        local advance = ffi.cast('uint8_t*', found) - search_ptr + 1
        search_ptr = search_ptr + advance
        remaining = remaining - advance
    end

    return nil
end

--- @param value number
--- @return ffi.cdata*
local function to_le_bytes(value)
    local bytes = ffi.new('unsigned char[4]')
    bytes[0] = bit.band(value, 0xFF)
    bytes[1] = bit.band(bit.rshift(value, 8), 0xFF)
    bytes[2] = bit.band(bit.rshift(value, 16), 0xFF)
    bytes[3] = bit.band(bit.rshift(value, 24), 0xFF)
    return bytes
end

-- function log(fmt, ...)
--     print_error(string.format('[engine locator] ' .. fmt .. '\n', ...))
-- end
local log = log or function(...) end

local M = {}

--- @param name string
--- @return number|nil
function M.locateVftable(name)
    -- first we find the part of the RTTI type descriptor that contains
    --  the type name that should not ever change I hope
    local in_desc = memfind(data, name)
    if not in_desc then
        log('did not string `%s` in .data', name)
        return
    end
    log('found string `%s` at 0x%08X', name, in_desc)
    -- offset back to get the descriptor pointer value
    --  and scan for the usage of that value, which should be in an RTTI locator thing
    local in_locator = memfind(rdata, to_le_bytes(in_desc - 8))
    if not in_locator then
        log('did not RTTI locator for `%s` in .rdata', name)
        return
    end
    log('found RTTI locator for `%s` at 0x%08X', name, in_locator)

    -- same thing but to find usages of the locator, the vftable meta pointer
    local vftable_meta_ptr = memfind(rdata, to_le_bytes(in_locator - 12))
    if not vftable_meta_ptr then
        log('did not find vftable meta pointer for `%s` in .rdata', name)
        return
    end

    -- which is right before the vftable
    local vftable = vftable_meta_ptr + 4

    log('found vftable for %s: 0x%08X', name, vftable)

    return vftable
end

--- @param name string
--- @return number|nil
function M.locateStaticGlobal(name)
    local vftable = M.locateVftable(name)
    if not vftable then
        -- locator does the logs
        return
    end
    local vftable_bytes = to_le_bytes(vftable)
    -- which is at the beginning of the static global
    local addr = memfind(data, vftable_bytes)
    if not addr then
        log('did not find static global for `%s` in .data', name)
        return
    end
    log('found static global %s: 0x%08X', name, addr)
    return addr
end

return M
