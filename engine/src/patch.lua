---@diagnostic disable: undefined-global

local ffi = require 'ffi'

-- see https://learn.microsoft.com/en-us/windows/win32/Memory/memory-protection-constants
local PAGE_EXECUTE_READ_WRITE = 0x40

ffi.cdef [[
    bool VirtualProtect(void* adress, size_t size, int new_protect, int* old_protect);
    int memcmp(const void *buffer1, const void *buffer2, size_t count);

    void* malloc(size_t size);
]]

local function print_array(ptr, len)
    local str = {}
    ptr = ffi.cast("unsigned char*", ptr)
    for i = 0, len - 1 do
        table.insert(str, ("%02x"):format(ptr[i]))
    end
    return table.concat(str, ", ")
end

---Attempts to patch a location in memory.
---Mostly stolen from (the old) disable-mod-restrictions by dextercd.
---
---@param location number The memory address to patch
---@param expect number[]|string The expected bytes at that location (before patching)
---@param patch_bytes number[]|string The bytes to write at that location
---@return boolean success Whether the patch was applied successfully
---@return string|nil error_message An error message if the patch failed
return function(location, expect, patch_bytes)
    if #expect ~= #patch_bytes then
        return false, 'patch size mismatch'
    end

    location = ffi.cast('void*', location)
    expect = ffi.new('char[?]', #expect, expect)
    patch_bytes = ffi.new('char[?]', #patch_bytes, patch_bytes)

    if ffi.C.memcmp(location, patch_bytes, ffi.sizeof(expect)) == 0 then
        -- Already patched
        return true
    end

    if ffi.C.memcmp(location, expect, ffi.sizeof(expect)) ~= 0 then
        return false, string.format("Unexpected instructions at location: %s\n  Expected: %s\n  Actual:   %s",
            tostring(location),
            print_array(expect, ffi.sizeof(expect)),
            print_array(location, ffi.sizeof(expect))
        )
    end

    local restore_protection = ffi.new("int[1]")
    local prot_success = ffi.C.VirtualProtect(
        location, ffi.sizeof(patch_bytes), PAGE_EXECUTE_READ_WRITE, restore_protection
    )

    if not prot_success then
        return false, 'couldn\'t change memory protection'
    end

    ffi.copy(location, patch_bytes, ffi.sizeof(patch_bytes))

    -- Restore protection
    ffi.C.VirtualProtect(
        location,
        ffi.sizeof(patch_bytes),
        restore_protection[0],
        restore_protection
    )

    return true
end
