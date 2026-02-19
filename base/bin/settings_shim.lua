function require(module)
    if module == "$mod" then
        return { MOD_ID = "{{MOD_ID}}", DEV = "{{DEV}}" }
    end
    local cached = __loadonce[module]
    if cached ~= nil then
        return cached[1]
    end
    local f, err = loadfile(module)
    if f == nil then
        return f, err
    end
    local env = setmetatable({}, { __index = _G })
    local result = setfenv(f, env)()
    local captured = {}
    for k, v in pairs(env) do
        captured[k] = v
    end
    if type(result) ~= 'table' then
        captured.default = result
        result = captured
    end
    __loadonce[module] = { result }
    -- do_mod_appends(module) -- figuring out setfenv setup for mod appends for now :(
    return result
end
