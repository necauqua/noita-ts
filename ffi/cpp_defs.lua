local ffi = require 'ffi'
local bit = require 'bit'

ffi.cdef [[
    typedef struct cpp_string {
        union {
            char buf[16];
            char* ptr;
        };
        uint32_t len;
        uint32_t cap;
    } cpp_string;
]]

ffi.metatype('cpp_string', {
    __tostring = function(s)
        return ffi.string(s.cap <= 15 and s.buf or s.ptr, s.len)
    end,
    __len = function(s)
        return s.len
    end,
})

ffi.cdef [[
    typedef struct cpp_vector_bool {
        char* start;
        char* end;
        char* end_cap;
        int len;
    } cpp_vector_bool;
]]

ffi.metatype('cpp_vector_bool', {
    __index = function(v, key)
        if type(key) == 'number' and key >= 0 and key < v.len then
            return bit.band(v.start[math.floor(key / 8)], bit.lshift(1, key % 8)) ~= 0
        end
    end,
    __newindex = function(v, key, value)
        if type(key) == 'number' then
            if key < 0 or key >= v.len then
                return
            end
            local byte_idx = math.floor(key / 8)
            local mask = bit.lshift(1, key % 8)
            if value then
                v.start[byte_idx] = bit.bor(v.start[byte_idx], mask)
            else
                v.start[byte_idx] = bit.band(v.start[byte_idx], bit.bnot(mask))
            end
        end
    end,
    __len = function(v)
        return v.len
    end,
})

-- opaque vector that is just padding where we know its a vector of something
ffi.cdef [[
    typedef struct cpp_vector_void {
        void* start;
        void* end;
        void* end_cap;
    } cpp_vector_void;
]]
-- ^ no metatype so we wont try to index into it or whatever, cant even know its length

local function vector_index(v, key)
    if type(key) == 'number' and key > 0 and key <= v['end'] - v.start then
        return v.start[key - 1]
    end
end

local function string_vec_to_table(self)
    local result = {}
    if not self.start or not self['end'] then
        return result
    end
    for i = 1, #self do
        result[i] = tostring(self.start[i - 1])
    end
    return result
end

local function string_vector_index(v, key)
    if type(key) == 'number' and key > 0 and key <= v['end'] - v.start then
        return v.start[key - 1]
    end
    if key == 'to_lua' then
        return string_vec_to_table
    end
end

-- a "generic" vector def
local function cpp_vector(item_type_name)
    local decl = string.gsub([[
        typedef struct cpp_vector_$type {
            $type* start;
            $type* end;
            $type* end_cap;
        } cpp_vector_$type;
    ]], '$type', item_type_name)

    ffi.cdef(decl)

    local tpe = ffi.typeof('cpp_vector_' .. item_type_name)

    ffi.metatype(tpe, {
        __index = item_type_name == 'cpp_string' and string_vector_index or vector_index,
        __newindex = function(v, key, value)
            if type(key) == 'number' and key >= 0 and key < v['end'] - v.start then
                v.start[key] = value
            end
        end,
        __len = function(v)
            return v['end'] - v.start
        end,
    })

    return tpe
end

cpp_vector('int')
cpp_vector('cpp_string')

---@param key_type_name string
---@param value_type_name string
local function cpp_map(key_type_name, value_type_name)

    local decl = string.gsub([[
        typedef struct cpp_map_$k_$v_node {
            struct cpp_map_$k_$v_node* left;
            struct cpp_map_$k_$v_node* up;
            struct cpp_map_$k_$v_node* right;
            uint32_t _meta;
            cpp_string key;
            int32_t value;
        } cpp_map_$k_$v_node;

        typedef struct cpp_map_$k_$v {
            cpp_map_$k_$v_node* root;
            uint32_t len;
        } cpp_map_$k_$v;
    ]], '$[kv]', { ['$k'] = key_type_name, ['$v'] = value_type_name })

    ffi.cdef(decl)

    local tpe = ffi.typeof('cpp_map_' .. key_type_name .. '_' .. value_type_name)

    ffi.metatype(tpe, {
        __index = {
            -- todo get assumes string keys 🤷
            get = function(self, key)
                if not self.root or not self.root.up then
                    return
                end
                local node = self.root.up
                while node ~= nil and node ~= self.root do
                    local node_key = tostring(node.key)
                    if key == node_key then
                        return node.value
                    elseif key < node_key then
                        node = node.left
                    else
                        node = node.right
                    end
                end
            end,
            to_lua = function(self)
                local result = {}
                if not self.root or not self.root.up then
                    return result
                end
                local function traverse(node)
                    if not node or node == self.root then
                        return
                    end
                    traverse(node.left)
                    result[tostring(node.key)] = node.value
                    traverse(node.right)
                end
                traverse(self.root.up)
                return result
            end,
        },
        __len = function(map)
            return map.len
        end,
    })
end

cpp_map('cpp_string', 'int32_t')
