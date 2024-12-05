use std::{
    fmt::{self, Display},
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
        let params = if params == [""] { vec![] } else { params };

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

#[derive(Debug)]
pub enum LuaReturnType {
    Basic(String),
    BasicNamed(String, String),
    Array(Box<LuaReturnType>),
    Multi(Vec<Box<LuaReturnType>>),
    Disjoint(Vec<Box<LuaReturnType>>),
}

impl LuaReturnType {
    pub fn parse(s: &str) -> Self {
        let s = s.trim();
        let s = s
            .strip_prefix('(')
            .and_then(|s| s.strip_suffix(')'))
            .unwrap_or(s);

        if let Some(inner) = s.strip_prefix('{').and_then(|s| s.strip_suffix('}')) {
            return Self::Array(Box::new(Self::parse(inner)));
        }

        let mut multi_parts = vec![];
        let mut disjoint_parts = vec![];
        let mut current = String::new();
        let mut parens_depth = 0;

        for c in s.chars() {
            match c {
                '(' => {
                    parens_depth += 1;
                    current.push(c);
                }
                ')' => {
                    parens_depth -= 1;
                    current.push(c);
                }
                ',' if parens_depth == 0 => {
                    multi_parts.push(current.trim().to_owned());
                    current.clear();
                }
                '|' if parens_depth == 0 => {
                    disjoint_parts.push(current.trim().to_owned());
                    current.clear();
                }
                _ => current.push(c),
            }
        }

        if !current.is_empty() {
            if !multi_parts.is_empty() {
                multi_parts.push(current.trim().to_owned());
            } else {
                disjoint_parts.push(current.trim().to_owned());
            }
        }

        if multi_parts.len() > 1 {
            let parsed_parts = multi_parts
                .into_iter()
                .map(|part| Box::new(Self::parse(&part)))
                .collect();
            return Self::Multi(parsed_parts);
        }

        if disjoint_parts.len() > 1 {
            let parsed_parts = disjoint_parts
                .into_iter()
                .map(|part| Box::new(Self::parse(&part)))
                .collect();
            return Self::Disjoint(parsed_parts);
        }

        if let Some((name, basic)) = s.split_once(':') {
            return Self::BasicNamed(name.trim().to_owned(), basic.trim().to_owned());
        }

        Self::Basic(s.to_owned())
    }
}

impl Display for LuaReturnType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        use LuaReturnType::*;
        match self {
            Basic(s) => write!(f, "{s}"),
            BasicNamed(name, ty) => write!(f, "{name}:{ty}"),
            Array(inner) => write!(f, "{{{inner}}}"),
            Multi(parts) => {
                write!(f, "(")?;
                for (i, part) in parts.iter().enumerate() {
                    write!(f, "{part}")?;
                    if i != parts.len() - 1 {
                        write!(f, ",")?;
                    }
                }
                write!(f, ")")?;
                Ok(())
            }
            Disjoint(parts) => {
                write!(f, "(")?;
                for (i, part) in parts.iter().enumerate() {
                    write!(f, "{part}")?;
                    if i != parts.len() - 1 {
                        write!(f, "|")?;
                    }
                }
                write!(f, ")")?;
                Ok(())
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_return_types() {
        fn check(s: &str, expected: &str) {
            println!("Checking: {s}");
            let parsed = LuaReturnType::parse(s);
            assert_eq!(format!("{parsed}"), expected);
        }

        check("component", "component");
        check("entity_scale:number", "entity_scale:number");
        check("{number}", "{number}");
        check("number,component", "(number,component)");
        check("number|component", "(number|component)");
        check("{number,component}", "{(number,component)}");
        check(
            "(number|component),entity_scale:number",
            "((number|component),entity_scale:number)",
        );
        check(
            "number|(component,entity_scale:number)",
            "(number|(component,entity_scale:number))",
        );
    }
}
