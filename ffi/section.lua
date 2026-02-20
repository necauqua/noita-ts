local ffi = require 'ffi'

---@class Section
--- @field name string
--- @field offset number
--- @field len number
local Section = {}

function Section.new(name, offset, len)
    return setmetatable({
        name = name,
        offset = offset,
        len = len,
    }, { __index = Section })
end

ffi.cdef [[
    void* memchr(const void* ptr, int value, size_t num);
    int memcmp(const void *buffer1, const void *buffer2, size_t count);
]]

--- @param condition boolean
--- @param message string
--- @param name string
--- @param depth number
local function check(condition, message, name, depth)
    if not condition then
        error(string.format('%s %s', name, message), depth)
    end
end

--- @param offset number
--- @param len number
--- @param needle ffi.cdata* | string
--- @param needle_len number
--- @param limit number
--- @param name string
--- @return number
local function memfind(offset, len, needle, needle_len, limit, name)
    local first_byte = ffi.cast('uint8_t*', needle)[0]
    local search_ptr = ffi.cast('uint8_t*', offset)
    local remaining = len
    local scanned = 0

    while remaining >= needle_len do
        check(scanned < limit, 'not found: scan cutoff limit reached', name, 2)

        -- Find first byte of pattern
        local found = ffi.C.memchr(search_ptr, first_byte, math.min(remaining - needle_len + 1, limit - scanned))
        if found == nil then
            break
        end

        -- Check if full pattern matches
        if ffi.C.memcmp(found, needle, needle_len) == 0 then
            return tonumber(ffi.cast('size_t', found)) --[[ @as number ]]
        end

        -- Move past this match and continue
        local advance = ffi.cast('uint8_t*', found) - search_ptr + 1
        search_ptr = search_ptr + advance
        remaining = remaining - advance
        scanned = scanned + advance
    end

    ---@diagnostic disable-next-line: missing-return -- ugh lmao
    check(false, 'not found: scanned the entire range', name, 2)
end

--- @param offset number
--- @param len number
--- @param needle ffi.cdata* | string
--- @param needle_len number
--- @param limit number
--- @param name string
--- @return number
local function memrfind(offset, len, needle, needle_len, limit, name)
    local first_byte = ffi.cast('uint8_t*', needle)[0]
    local search_ptr = ffi.cast('uint8_t*', offset)
    local end_ptr = search_ptr + len - needle_len
    local scanned = 0

    while end_ptr >= search_ptr do
        check(scanned < limit, 'not found: scan cutoff limit reached', name, 2)

        if end_ptr[0] == first_byte then
            if ffi.C.memcmp(end_ptr, needle, needle_len) == 0 then
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

--- @param needle ffi.cdata* | number[] | number | string
--- @param params ScanParams?
--- @return number
function Section:scan(needle, params)
    params = params or {}
    local skip = params.skip or 0
    local back = params.back
    local at = params.at
    local limit = params.limit or 256
    local name = params.name or ('needle in ' .. self.name)

    -- if a sole number is given we assume its a 4-byte little-endian integer 🤷
    if type(needle) == 'number' then
        needle = ffi.new('char[4]', {
            bit.band(needle, 0xFF),
            bit.band(bit.rshift(needle, 8), 0xFF),
            bit.band(bit.rshift(needle, 16), 0xFF),
            bit.band(bit.rshift(needle, 24), 0xFF),
        })
    elseif type(needle) == 'table' or type(needle) == 'string' then
        needle = ffi.new('char[?]', #needle, needle)
    end

    local needle_len = ffi.sizeof(needle)
    check(needle_len and needle_len ~= 0 or false, 'invalid needle', name, 1)

    if not back then
        local index = 0
        if at then
            index = at - self.offset
            check(index >= 0 and index <= self.len, 'not found: at parameter out of bounds', name, 1)
        end
        for _ = 0, skip do
            local found = memfind(self.offset + index, self.len - index, needle, needle_len --[[ @as integer ]], limit, name)
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
        local found = memrfind(self.offset, index, needle, needle_len --[[ @as integer ]], limit, name)
        index = found - self.offset
    end
    return self.offset + index
end

--- @param needle ffi.cdata* | number[] | number | string
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
