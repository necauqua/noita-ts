local ffi = require 'ffi'

---@class Section
--- @field name string
--- @field offset number
--- @field len number
--- @field code boolean whether this section holds executable code
local Section = {}

--- @param name string
--- @param offset number
--- @param len number
--- @param code boolean? whether this section holds executable code
function Section.new(name, offset, len, code)
    return setmetatable({
        name = name,
        offset = offset,
        len = len,
        code = code or false,
    }, { __index = Section })
end

ffi.cdef [[
    void* memchr(const void* ptr, int value, size_t num);
    int memcmp(const void *buffer1, const void *buffer2, size_t count);
]]

--- @noita-ts-include ../hde32.dll
local hde32 = ffi.load('mods/' .. require('$mod').MOD_ID .. '/lua_modules/@noita-ts/ffi/hde32.dll')

ffi.cdef [[
    unsigned int hde32_len(const void* addr);
]]

-- to be exported by ffi
function Section._hde32_len(ptr)
    return hde32.hde32_len(ptr)
end

--- @param condition boolean
--- @param message string
--- @param name string
--- @param depth number
local function check(condition, message, name, depth)
    if not condition then
        error(string.format('%s %s', name, message), depth)
    end
end

--- A byte of a needle table that matches any byte, exported to TS as `ffi._`.
Section.ANY_BYTE = {}

--- A needle ready to be matched against memory.
--- @class Pattern
--- @field data ffi.cdata* the needle bytes, with wildcards zeroed out
--- @field len number the length of the whole needle
--- @field runs number[] flat (offset, length) pairs of the parts without wildcards
--- @field anchor number the byte scans look for to find a candidate
--- @field anchor_off number where that byte sits inside the needle

--- @param needle ffi.cdata* | (number | table)[] | number | string
--- @param name string
--- @return Pattern
local function compile(needle, name)
    local runs = nil

    -- if a sole number is given we assume its a 4-byte little-endian integer 🤷
    if type(needle) == 'number' then
        needle = ffi.new('char[4]', {
            bit.band(needle, 0xFF),
            bit.band(bit.rshift(needle, 8), 0xFF),
            bit.band(bit.rshift(needle, 16), 0xFF),
            bit.band(bit.rshift(needle, 24), 0xFF),
        })
    elseif type(needle) == 'table' then
        local len = #needle
        local bytes = ffi.new('char[?]', len)
        local start = nil
        runs = {}

        for i = 1, len do
            local byte = needle[i]
            if byte == Section.ANY_BYTE then
                if start then
                    runs[#runs + 1] = start - 1
                    runs[#runs + 1] = i - start
                    start = nil
                end
            else
                bytes[i - 1] = byte
                start = start or i
            end
        end
        if start then
            runs[#runs + 1] = start - 1
            runs[#runs + 1] = len - start + 1
        end
        check(#runs ~= 0, 'invalid needle: only wildcards', name, 2)

        needle = bytes
    elseif type(needle) == 'string' then
        needle = ffi.new('char[?]', #needle, needle)
    end

    local len = ffi.sizeof(needle)
    check(len and len ~= 0 or false, 'invalid needle', name, 2)

    -- a needle without wildcards is a single run over the whole thing; keeping
    -- one shape here keeps the scan loops monomorphic, which the JIT needs to
    -- compile them into a single trace
    runs = runs or { 0, len }

    local anchor_off = runs[1]
    return {
        data = needle,
        len = len --[[ @as number ]],
        runs = runs,
        anchor = ffi.cast('uint8_t*', needle)[anchor_off],
        anchor_off = anchor_off,
    }
end

--- @param pattern Pattern
--- @param ptr ffi.cdata* a `uint8_t*` to the candidate position
--- @return boolean
local function matches(pattern, ptr)
    -- one byte load rejects almost every candidate before any call
    if ptr[pattern.anchor_off] ~= pattern.anchor then
        return false
    end
    local runs = pattern.runs
    local data = pattern.data
    -- compare only the parts between the wildcards
    for i = 1, #runs, 2 do
        local off = runs[i]
        if ffi.C.memcmp(ptr + off, data + off, runs[i + 1]) ~= 0 then
            return false
        end
    end
    return true
end

--- @param offset number
--- @param len number
--- @param pattern Pattern
--- @param limit number
--- @param name string
--- @return number
local function memfind(offset, len, pattern, limit, name)
    local needle_len = pattern.len
    local anchor_off = pattern.anchor_off
    local search_ptr = ffi.cast('uint8_t*', offset)
    local remaining = len
    local scanned = 0

    while remaining >= needle_len do
        check(scanned < limit, 'not found: scan cutoff limit reached', name, 2)

        -- Find the anchor byte, the first byte of the pattern that is not a wildcard
        local window = math.min(remaining - needle_len + 1, limit - scanned)
        local found = ffi.C.memchr(search_ptr + anchor_off, pattern.anchor, window)
        if found == nil then
            break
        end
        local at = ffi.cast('uint8_t*', found) - anchor_off

        -- Check if full pattern matches
        if matches(pattern, at) then
            return tonumber(ffi.cast('size_t', at)) --[[ @as number ]]
        end

        -- Move past this match and continue
        local advance = at - search_ptr + 1
        search_ptr = search_ptr + advance
        remaining = remaining - advance
        scanned = scanned + advance
    end

    ---@diagnostic disable-next-line: missing-return -- ugh lmao
    check(false, 'not found: scanned the entire range', name, 2)
end

--- Walk instruction boundaries (via hde32) looking for the needle.
--- Only valid for executable code: a machine-code pattern must begin at an
--- instruction boundary, so this avoids false matches inside instruction
--- operands and inspects far fewer positions than a byte-by-byte scan.
--- Here `limit` counts instructions walked rather than bytes.
--- @param offset number
--- @param len number
--- @param pattern Pattern
--- @param limit number
--- @param name string
--- @return number
local function memfindcode(offset, len, pattern, limit, name)
    local ptr = ffi.cast('uint8_t*', offset)
    local end_ptr = ptr + len - pattern.len
    local scanned = 0

    while ptr <= end_ptr do
        check(scanned < limit, 'not found: scan cutoff limit reached', name, 2)

        if matches(pattern, ptr) then
            return tonumber(ffi.cast('size_t', ptr)) --[[ @as number ]]
        end

        local ilen = hde32.hde32_len(ptr)
        -- hde32 returns 0 on a decode error; step a single byte to resynchronise
        -- rather than spinning forever
        ptr = ptr + (ilen > 0 and ilen or 1)
        scanned = scanned + 1
    end

    ---@diagnostic disable-next-line: missing-return -- ugh lmao
    check(false, 'not found: scanned the entire range', name, 2)
end

--- @param offset number
--- @param len number
--- @param pattern Pattern
--- @param limit number
--- @param name string
--- @return number
local function memrfind(offset, len, pattern, limit, name)
    local anchor_off = pattern.anchor_off
    local search_ptr = ffi.cast('uint8_t*', offset)
    local end_ptr = search_ptr + len - pattern.len
    local scanned = 0

    while end_ptr >= search_ptr do
        check(scanned < limit, 'not found: scan cutoff limit reached', name, 2)

        if end_ptr[anchor_off] == pattern.anchor then
            if matches(pattern, end_ptr) then
                return tonumber(ffi.cast('size_t', end_ptr)) --[[ @as number ]]
            end
        end
        end_ptr = end_ptr - 1
        scanned = scanned + 1
    end

    ---@diagnostic disable-next-line: missing-return -- ugh lmao
    check(false, 'not found: scanned the entire range', name, 2)
end

---@class ScanParams
--- @field skip number?
--- @field at number?
--- @field back true?
--- @field limit number?
--- @field name string?

--- @param needle ffi.cdata* | (number | table)[] | number | string
--- @param params ScanParams?
--- @return number
function Section:scan(needle, params)
    params = params or {}
    local skip = params.skip or 0
    local back = params.back
    local at = params.at
    local limit = params.limit or 256
    local name = params.name or ('needle in ' .. self.name)

    local pattern = compile(needle, name)
    local needle_len = pattern.len

    if not back then
        local index = 0
        if at then
            index = at - self.offset
            check(index >= 0 and index <= self.len, 'not found: at parameter out of bounds', name, 1)
        end
        local find = self.code and memfindcode or memfind
        for _ = 0, skip do
            local found = find(self.offset + index, self.len - index, pattern, limit, name)
            index = found - self.offset + needle_len
        end
        return self.offset + index - needle_len
    end

    local index = self.len
    if at then
        index = at - self.offset
        check(index >= 0 and index <= self.len, 'not found: at parameter out of bounds', name, 1)
    end
    for _ = 0, skip do
        local found = memrfind(self.offset, index, pattern, limit, name)
        index = found - self.offset
    end
    return self.offset + index
end

--- @param needle ffi.cdata* | (number | table)[] | number | string
--- @param params ScanParams?
--- @return number
function Section:scanAll(needle, params)
    params = params or {}
    if not params.limit then
        params.limit = self.len
    end
    return self:scan(needle, params)
end

return Section
