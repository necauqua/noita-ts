use std::str::FromStr;

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

    Ok(lines.map(FromStr::from_str).collect())
}

#[derive(Debug)]
pub struct LuaApiDef {
    pub name: String,
    pub params: Vec<String>,
    pub ret: Option<String>,
    pub doc: Option<String>,
}

fn trim_own(s: &str) -> String {
    s.trim().to_owned()
}

impl FromStr for LuaApiDef {
    type Err = String;

    fn from_str(def: &str) -> Result<Self, Self::Err> {
        tracing::debug!(def, "Parsing lua definition");

        let (name, rest) = def.split_once('(').ok_or_else(|| def.to_owned())?;
        let (params, rest) = rest.split_once(')').ok_or_else(|| def.to_owned())?;

        let params = params.split(',').map(trim_own).collect();

        // typical split thing, eh
        let params = if params == [""] { vec![] } else { params };

        let (maybe_ret, maybe_doc) = rest.split_once("[").unwrap_or((rest, ""));
        let ret = maybe_ret.trim().strip_prefix("->").map(trim_own);
        let doc = match maybe_doc.trim() {
            "" => None,
            doc => Some(doc.strip_suffix("]").unwrap_or(doc).to_owned()),
        };

        Ok(Self {
            name: name.trim().to_owned(),
            params,
            ret,
            doc,
        })
    }
}
