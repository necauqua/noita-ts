local original_require = require

function require(module)
    if module == "$mod" then
        return { MOD_ID = "{{MOD_ID}}", DEV = "{{DEV}}" }
    end
    local filename = (module:match '^data/.-%.lua$' or module:match '^mods/.-%.lua$' or (module:match '^[^./]+$' and module ~= 'lualib_bundle'))
        and module
        or 'mods/{{MOD_ID}}/' .. module:gsub('^src%.', ''):gsub('%.lua$', ''):gsub('%.', '/') .. '.lua'
    local cached = __loadonce[filename]
    if cached ~= nil then
        return cached[1]
    end
    local f, err = loadfile(filename)
    if f == nil then
        if original_require ~= nil then
            local result = original_require(module)
            __loadonce[filename] = { result }
            return result
        end
        return f, err
    end
    local env = setmetatable({}, { __index = _G })
    local result = setfenv(f, env)()
    local captured = {}
    for k, v in pairs(env) do captured[k] = v end
    if type(result) ~= 'table' then
        captured.default = result
        result = captured
    end
    __loadonce[filename] = { result }
    -- do_mod_appends(filename) -- figuring out setfenv setup for mod appends for now :(
    return result
end
