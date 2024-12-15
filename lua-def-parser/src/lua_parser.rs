use std::{
    collections::HashSet,
    fmt::{self, Debug},
    str::FromStr,
};

use anyhow::Context;

use crate::parsing::StringExt as _;

pub fn parse_lua(input: &str) -> anyhow::Result<Vec<Result<LuaApiDef, String>>> {
    let mut lines = input.lines();

    let header = lines.next().context("Lua doc input file is empty")?;

    if let Some(version) = header.strip_prefix("Current modding API version: ") {
        tracing::info!(version, "Found lua doc header")
    } else {
        tracing::warn!("Lua doc header not found")
    }

    lines
        .next()
        .context("Lua doc input file is missing the splitter")?;

    Ok(lines.map(|s| s.parse()).collect())
}

#[derive(Debug)]
pub struct LuaApiDef {
    pub name: String,
    pub params: Vec<LuaApiParam>,
    pub ret: Option<LuaType>,
    pub doc: Option<String>,
}

impl FromStr for LuaApiDef {
    type Err = String;

    fn from_str(def: &str) -> Result<Self, Self::Err> {
        tracing::debug!(def, "Parsing lua definition");

        let (name, rest) = def.split_once('(').ok_or_else(|| def.to_owned())?;
        let (params, rest) = rest.split_once(')').ok_or_else(|| def.to_owned())?;

        let params = params.split(',').collect::<Vec<_>>();
        // typical split thing, eh
        let params = if params == [""] { Vec::new() } else { params };

        let params = params.into_iter().map(LuaApiParam::parse).collect();

        let (maybe_ret, maybe_doc) = rest
            .split_once("[")
            .or_else(|| rest.split_once('(')) // "Debugish function" ones
            .unwrap_or((rest, ""));

        let ret = maybe_ret.trim().strip_prefix("->").map(LuaType::parse);

        let doc = match maybe_doc.trim() {
            "" => None,
            doc => Some(doc.strip_suffix("]").unwrap_or(doc).replace("\\n", "\n")),
        };

        Ok(Self {
            name: name.trim().to_owned(),
            params,
            ret,
            doc,
        })
    }
}

#[derive(Debug)]
pub struct LuaApiParam {
    pub name: String,
    pub ty: LuaType,
    pub default: Option<String>,
}

impl LuaApiParam {
    fn parse(s: &str) -> Self {
        let s = s.trim();
        let (rest, default) = s.split_once('=').unwrap_or((s, ""));
        let (name, ty) = rest
            .split_once(':')
            .or_else(|| rest.split_once(' ').map(|(a, b)| (b, a)))
            .unwrap_or((rest, ""));

        Self {
            name: name.trim().to_owned(),
            ty: LuaType::parse(ty),
            default: match default.trim() {
                "" => None,
                d => Some(d.to_owned()),
            },
        }
    }
}

pub enum LuaType {
    Basic(String),
    Named(String, Box<LuaType>),
    Array(Box<LuaType>),
    Table(Box<LuaType>, Box<LuaType>),
    Disjoint(Vec<Box<LuaType>>),
    ReturnList(Vec<Box<LuaType>>),
}

impl LuaType {
    /// Walk the return type and collect all the basic types
    /// For example, `named:a|b,c,{d|c}` would return `{"a", "b", "c", "d"}`
    pub fn breakdown(&self) -> HashSet<&str> {
        fn recur<'s>(tpe: &'s LuaType, set: &mut HashSet<&'s str>) {
            use LuaType::*;
            match tpe {
                Basic(s) => {
                    set.insert(s);
                }
                Named(_, ty) | Array(ty) => recur(ty, set),
                Table(k, v) => {
                    recur(k, set);
                    recur(v, set);
                }
                ReturnList(parts) | Disjoint(parts) => {
                    for part in parts {
                        recur(part, set)
                    }
                }
            }
        }

        let mut set = HashSet::new();
        recur(self, &mut set);
        set
    }

    // lol
    fn merge(self) -> Self {
        use LuaType::*;
        match self {
            Array(inner) => Array(inner.merge().into()),
            Table(k, v) => Table(k.merge().into(), v.merge().into()),
            Disjoint(parts) => {
                let mut merged = Vec::new();
                for part in parts {
                    match *part {
                        Disjoint(inner_parts) => {
                            for inner in inner_parts {
                                merged.push(inner.merge().into());
                            }
                        }
                        part => merged.push(part.merge().into()),
                    }
                }
                Disjoint(merged)
            }
            ReturnList(parts) => {
                let mut merged = Vec::new();
                for part in parts {
                    match *part {
                        ReturnList(inner_parts) => {
                            for inner in inner_parts {
                                merged.push(inner.merge().into());
                            }
                        }
                        part => merged.push(part.merge().into()),
                    }
                }
                ReturnList(merged)
            }
            other => other,
        }
    }

    fn do_parse(s: &str) -> Self {
        let s = s.trim();

        if let Some(inner) = s.strip_parens_balanced('(', ')') {
            return Self::parse(inner);
        }

        if let Some(inner) = s.strip_parens_balanced('{', '}') {
            return match &*inner.split_balanced('-') {
                [k, v] => Self::Table(Self::parse(k).into(), Self::parse(v).into()),
                _ => Self::Array(Self::parse(inner).into()),
            };
        }

        // now we do splits from lowest to highest precedence

        // return list types are the lowest
        let multi_parts = s.split_balanced(',');
        if multi_parts.len() > 1 {
            let parsed_parts = multi_parts
                .into_iter()
                .map(|part| Self::parse(&part).into())
                .collect();
            return Self::ReturnList(parsed_parts);
        }

        // then named types, to allow for `named:a|b`
        let mut chars = s.chars();
        let mut has_colon = false;
        let name = chars
            .by_ref()
            .take_while(|ch| {
                if *ch == ':' {
                    has_colon = true;
                    return false;
                }
                *ch == '_' || ch.is_ascii_alphanumeric()
            })
            .collect::<String>();
        let name = name.trim();
        if !name.is_empty() && has_colon {
            let rest = chars.collect::<String>();
            return Self::Named(name.to_owned(), Box::new(Self::parse(&rest)));
        }

        // disjoint types are tightest
        let disjoint_parts = s.split_balanced('|');
        if disjoint_parts.len() > 1 {
            let parsed_parts = disjoint_parts
                .into_iter()
                .map(|part| Box::new(Self::parse(&part)))
                .collect();
            return Self::Disjoint(parsed_parts);
        }

        // trim some inconsistencies between the return and the doc
        Self::Basic(s.trim_end_matches([' ', '.', '-']).to_owned())
    }

    pub fn parse(s: &str) -> Self {
        Self::do_parse(s).merge()
    }
}

impl Debug for LuaType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        use LuaType::*;

        fn recur(f: &mut fmt::Formatter<'_>, ty: &LuaType, indent: usize) -> fmt::Result {
            if f.alternate() {
                write!(f, "{: ^w$}", "", w = indent * 2)?;
            }
            match ty {
                Basic(s) => return write!(f, "(basic {s:?})"),
                Named(name, inner) => {
                    write!(f, "(named {name:?}")?;
                    if f.alternate() {
                        writeln!(f)?;
                    }
                    recur(f, inner, indent + 1)?;
                }
                Array(inner) => {
                    write!(f, "(array")?;
                    if f.alternate() {
                        writeln!(f)?;
                    }
                    recur(f, inner, indent + 1)?;
                }
                Table(k, v) => {
                    write!(f, "(table")?;
                    for part in [k, v] {
                        if f.alternate() {
                            writeln!(f)?;
                        }
                        recur(f, part, indent + 1)?;
                    }
                }
                Disjoint(parts) => {
                    write!(f, "(disj")?;
                    for part in parts {
                        if f.alternate() {
                            writeln!(f)?;
                        }
                        recur(f, part, indent + 1)?;
                    }
                }
                ReturnList(parts) => {
                    write!(f, "(return-list")?;
                    for part in parts {
                        if f.alternate() {
                            writeln!(f)?;
                        }
                        recur(f, part, indent + 1)?;
                    }
                }
            }
            write!(f, ")")
        }
        recur(f, self, 0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    macro_rules! check {
        ($expr:expr, @$snap:literal) => {
            insta::assert_debug_snapshot!(LuaType::parse($expr), @$snap);
        };
    }

    #[test]
    fn test_types() {
        crate::init_logging().unwrap();

        check!("component", @r#"(basic "component")"#);

        check!("entity_scale:number", @r#"
        (named "entity_scale"
          (basic "number"))
        "#);

        check!("{number}", @r#"
        (array
          (basic "number"))
        "#);

        check!("number,component", @r#"
        (return-list
          (basic "number")
          (basic "component"))
        "#);

        check!("number|component", @r#"
        (disj
          (basic "number")
          (basic "component"))
        "#);

        check!("{number,component}", @r#"
        (array
          (return-list
            (basic "number")
            (basic "component")))
        "#);

        check!("number|component,entity_scale:number", @r#"
        (return-list
          (disj
            (basic "number")
            (basic "component"))
          (named "entity_scale"
            (basic "number")))
        "#);

        check!("(number|component),entity_scale:number", @r#"
        (return-list
          (disj
            (basic "number")
            (basic "component"))
          (named "entity_scale"
            (basic "number")))
        "#);

        check!("number|(component,entity_scale:number)", @r#"
        (disj
          (basic "number")
          (return-list
            (basic "component")
            (named "entity_scale"
              (basic "number"))))
        "#);

        check!("{int|number|string}|nil", @r#"
        (disj
          (array
            (disj
              (basic "int")
              (basic "number")
              (basic "string")))
          (basic "nil"))
        "#);

        check!("(nil|script_return_type)|(nil,error_string)", @r#"
        (disj
          (basic "nil")
          (basic "script_return_type")
          (return-list
            (basic "nil")
            (basic "error_string")))
        "#);

        check!("named_union:number|string|nil", @r#"
        (named "named_union"
          (disj
            (basic "number")
            (basic "string")
            (basic "nil")))
        "#);

        check!("named_union:number|string|nil,second_return:bool|number", @r#"
        (return-list
          (named "named_union"
            (disj
              (basic "number")
              (basic "string")
              (basic "nil")))
          (named "second_return"
            (disj
              (basic "bool")
              (basic "number"))))
        "#);

        check!("{string-int}|named:{int-string|number}", @r#"
        (disj
          (table
            (basic "string")
            (basic "int"))
          (named "named"
            (table
              (basic "int")
              (disj
                (basic "string")
                (basic "number")))))
        "#);
    }

    #[test]
    fn snapshot_types() {
        crate::init_logging().unwrap();

        let input = include_str!("../lua_api_documentation.txt");

        let parsed = parse_lua(input).unwrap();

        let mut types = parsed
            .iter()
            .map(|d| d.as_ref().unwrap())
            .flat_map(|d| d.params.iter().map(|p| &p.ty).chain(d.ret.iter()))
            .flat_map(|t| t.breakdown().into_iter())
            .collect::<HashSet<_>>()
            .into_iter()
            .collect::<Vec<_>>();
        types.sort();

        insta::assert_debug_snapshot!(types, @r#"
        [
            "",
            "bool",
            "bool_is_new",
            "boolean",
            "component_id",
            "error_string",
            "float",
            "float x",
            "float y",
            "function",
            "int",
            "int_body_id",
            "item_entity_id",
            "multiple types",
            "multiple_types",
            "name",
            "new_text",
            "nil",
            "number",
            "obj",
            "physics_body_id",
            "replace_existing_cells",
            "script_return_type",
            "string",
            "uint",
            "uint32",
            "x",
            "y",
        ]
        "#);
    }
}
