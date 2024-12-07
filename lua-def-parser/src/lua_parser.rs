use std::{
    collections::HashSet,
    fmt::{self, Debug},
    str::FromStr,
};

use anyhow::Context;

pub fn parse_lua(input: String) -> anyhow::Result<Vec<Result<LuaApiDef, String>>> {
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
    pub ret: Option<LuaReturnType>,
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
            .or_else(|| rest.split_once('(')) // "Debugist function" ones
            .unwrap_or((rest, ""));

        let ret = maybe_ret
            .trim()
            .strip_prefix("->")
            .map(LuaReturnType::parse);

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
    pub ty: String,
    pub default: Option<String>,
}

impl LuaApiParam {
    fn parse(s: &str) -> Self {
        let s = s.trim();
        let (name, rest) = s.split_once(':').unwrap_or((s, ""));
        let (ty, default) = rest.split_once('=').unwrap_or((rest, ""));

        Self {
            name: name.trim().to_owned(),
            ty: ty.trim().to_owned(),
            default: match default.trim() {
                "" => None,
                _ => Some(default.to_owned()),
            },
        }
    }
}

pub enum LuaReturnType {
    Basic(String),
    Named(String, Box<LuaReturnType>),
    Array(Box<LuaReturnType>),
    Multi(Vec<Box<LuaReturnType>>),
    Disjoint(Vec<Box<LuaReturnType>>),
}

fn paren_balanced_split(s: &str, sep: char) -> Vec<String> {
    let mut parts = Vec::new();
    let mut buf = String::new();
    let mut depth = 0;

    for ch in s.chars() {
        if ch == sep && depth == 0 {
            parts.push(std::mem::take(&mut buf));
            continue;
        }
        buf.push(ch);
        depth += match ch {
            '(' | '{' => 1,
            ')' | '}' => -1,
            _ => 0,
        };
    }

    if !buf.is_empty() {
        parts.push(buf.to_owned());
    }

    parts
}

fn strip_balanced_outer_parens(s: &str, open: char, close: char) -> Option<&str> {
    let mut chars = s.chars();
    if chars.next() != Some(open) || chars.next_back() != Some(close) {
        return None;
    }
    let mut depth = 0;
    for ch in chars {
        if ch == open {
            depth += 1;
        } else if ch == close {
            // negative depth means first paren got closed before the end
            if depth == 0 {
                return None;
            }
            depth -= 1;
        }
    }
    // from above we know that first and last chars are 1 byte
    // and there's >=2 chars in the string
    Some(&s[1..s.len() - 1])
}

impl LuaReturnType {
    /// Walk the return type and collect all the basic types
    /// For example, `named:a|b,c,{d|c}` would return `{"a", "b", "c", "d"}`
    pub fn breakdown(&self) -> HashSet<&str> {
        fn recur<'s>(tpe: &'s LuaReturnType, set: &mut HashSet<&'s str>) {
            use LuaReturnType::*;
            match tpe {
                Basic(s) => {
                    set.insert(s);
                }
                Named(_, ty) | Array(ty) => recur(ty, set),
                Multi(parts) | Disjoint(parts) => {
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
        use LuaReturnType::*;
        match self {
            Array(inner) => Array(inner.merge().into()),
            Multi(parts) => {
                let mut merged = Vec::new();
                for part in parts {
                    match *part {
                        Multi(inner_parts) => {
                            for inner in inner_parts {
                                merged.push(inner.merge().into());
                            }
                        }
                        part => merged.push(part.merge().into()),
                    }
                }
                Multi(merged)
            }
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
            other => other,
        }
    }

    fn do_parse(s: &str) -> Self {
        let s = s.trim();

        if let Some(inner) = strip_balanced_outer_parens(s, '(', ')') {
            return Self::parse(inner);
        }
        if let Some(inner) = strip_balanced_outer_parens(s, '{', '}') {
            return Self::Array(Box::new(Self::parse(inner)));
        }

        // now we do splits from lowest to highest precedence

        // multi types are lowest
        let multi_parts = paren_balanced_split(s, ',');
        if multi_parts.len() > 1 {
            let parsed_parts = multi_parts
                .into_iter()
                .map(|part| Box::new(Self::parse(&part)))
                .collect();
            return Self::Multi(parsed_parts);
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
        let disjoint_parts = paren_balanced_split(s, '|');
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

impl Debug for LuaReturnType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        use LuaReturnType::*;

        fn recur(f: &mut fmt::Formatter<'_>, ty: &LuaReturnType, indent: usize) -> fmt::Result {
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
                Multi(parts) => {
                    write!(f, "(multi")?;
                    for part in parts {
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
            insta::assert_debug_snapshot!(LuaReturnType::parse($expr), @$snap);
        };
    }

    #[test]
    fn test_return_types() {
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
        (multi
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
          (multi
            (basic "number")
            (basic "component")))
        "#);

        check!("number|component,entity_scale:number", @r#"
        (multi
          (disj
            (basic "number")
            (basic "component"))
          (named "entity_scale"
            (basic "number")))
        "#);

        check!("(number|component),entity_scale:number", @r#"
        (multi
          (disj
            (basic "number")
            (basic "component"))
          (named "entity_scale"
            (basic "number")))
        "#);

        check!("number|(component,entity_scale:number)", @r#"
        (disj
          (basic "number")
          (multi
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
          (multi
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
        (multi
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
    }
}
