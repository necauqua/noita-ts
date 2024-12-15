use std::{borrow::Cow, fs::File, io::Write, path::PathBuf};

use clap::Parser;
use lua_def_parser::{
    component_parser::{parse_components, Component},
    lua_parser::{parse_lua, LuaApiDef, LuaType},
};

#[derive(Parser)]
enum Args {
    Lua {
        /// Path to lua_api_documentation.txt file to parse
        #[clap(default_value = "lua_api_documentation.txt")]
        input: PathBuf,
        /// Path to the output file. If not specified, output will be written to stdout
        #[clap(short, long)]
        out: Option<PathBuf>,
    },
    Components {
        /// Path to component_documentation.txt file to parse
        #[clap(short, long, default_value = "component_documentation.txt")]
        input: PathBuf,
        /// Path to the output file. If not specified, output will be written to stdout
        #[clap(short, long)]
        out: Option<PathBuf>,
    },
}

fn main() -> anyhow::Result<()> {
    lua_def_parser::init_logging()?;

    match Args::parse() {
        Args::Lua { input, out } => {
            let lua_api_defs = parse_lua(&std::fs::read_to_string(input)?)?
                .into_iter()
                .filter_map(|res| {
                    res.inspect_err(|e| tracing::error!("Failed to parse lua api def: {e}"))
                        .ok()
                })
                .collect::<Vec<_>>();
            write_lua_api(writer(out)?, &lua_api_defs)?;
        }
        Args::Components { input, out } => {
            let (components, errors) = parse_components(&std::fs::read_to_string(input)?);
            for error in errors {
                tracing::error!(
                    line = error.line_number,
                    component = error.component,
                    "Failed to parse component field, line: {}",
                    error.line
                )
            }
            write_components(writer(out)?, &components)?;
        }
    }

    Ok(())
}

fn writer(path: Option<PathBuf>) -> std::io::Result<Box<dyn Write>> {
    Ok(match path {
        Some(path) => Box::new(File::create(path)?),
        None => Box::new(std::io::stdout()),
    })
}

fn write_lua_api<W: Write>(mut w: W, lua_api_defs: &[LuaApiDef]) -> std::io::Result<()> {
    writeln!(w, "/** !Auto-generated! */")?;
    for def in lua_api_defs {
        writeln!(w, "\n/**")?;
        let doc = def.doc.as_deref().unwrap_or("No documentation from Nolla");
        writeln!(w, " * {doc}",)?;
        writeln!(w, " */")?;
        write!(w, "declare function {}(", def.name)?;
        for (i, param) in def.params.iter().enumerate() {
            if i != 0 {
                write!(w, ", ")?;
            }
            // that one stupid untyped "replace_existing_cells" boolean
            match (&*param.name, &param.ty) {
                ("", LuaType::Basic(basic)) => write!(w, "{basic}")?,
                _ => write!(w, "{}", param.name)?,
            }
            if param.default.is_some() {
                write!(w, "?")?;
            }
            write!(w, ": ")?;
            write_type(&mut w, &param.ty, Some(&param.name))?;
        }
        write!(w, "): ")?;
        match &def.ret {
            Some(ret) => write_type(&mut w, &ret, None)?,
            None => write!(w, "void")?,
        }
        writeln!(w, ";")?;
    }
    Ok(())
}

// some basic heuristics to reduce the amount of manual adjustments in TS
fn map_lua_type<'t>(lua_type: &'t str, name: Option<&str>) -> &'t str {
    match name {
        Some(n) if n.ends_with("entity_id") => return "EntityID",
        Some(n) if n.ends_with("component_id") => return "ComponentID",
        _ => {}
    }
    match lua_type {
        "nil" => "null",
        "bool" | "bool_is_new" | "replace_existing_cells" => "boolean",
        "component_id" => "ComponentID",
        "item_entity_id" => "EntityID",
        "physics_body_id" | "int_body_id" => "number", // brand those too?
        "error_string" | "name" | "new_text" => "string",
        "float" | "float x" | "float y" | "x" | "y" => "number",
        "uint" | "int" | "uint32" => "number", // make a branded generic int?
        "function" => "unknown",               // that one callback, type it manually
        "" | "obj" | "script_return_type" | "multiple types" | "multiple_types" => "any",
        x => x,
    }
}

fn write_type<W: Write>(w: &mut W, ty: &LuaType, name: Option<&str>) -> std::io::Result<()> {
    use LuaType::*;
    match ty {
        Basic(basic_type) => write!(w, "{}", map_lua_type(basic_type, name))?,
        Named(name, lua_type) => {
            write_type(w, lua_type, Some(name))?;
        }
        Array(lua_type) => {
            write_type(w, lua_type, None)?;
            write!(w, "[]")?;
        }
        Table(key_type, value_type) => {
            write!(w, "{{ [key: ")?;
            write_type(w, key_type, None)?;
            write!(w, "]: ")?;
            write_type(w, value_type, None)?;
            write!(w, " }}")?;
        }
        Disjoint(types) => {
            for (i, lua_type) in types.iter().enumerate() {
                if i != 0 {
                    write!(w, " | ")?;
                }
                write_type(w, lua_type, None)?;
            }
        }
        ReturnList(types) => {
            write!(w, "LuaMultiReturn<[")?;
            for (i, lua_type) in types.iter().enumerate() {
                if i != 0 {
                    write!(w, ", ")?;
                }
                write_type(w, lua_type, None)?;
            }
            write!(w, "]>")?;
        }
    }
    Ok(())
}

fn map_component_type(ty: &str) -> Cow<str> {
    match ty {
        "bool" => "boolean".into(),
        "int" | "float" => "number".into(),
        "std::string" => "string".into(),
        _ => format!("ComponentTypeMap['{ty}']").into(),
    }
}

fn write_components<W: Write>(mut w: W, components: &[Component]) -> std::io::Result<()> {
    writeln!(w, "/** !Auto-generated! */")?;
    writeln!(w, "\ndeclare type ComponentShapes = {{")?;
    for component in components {
        writeln!(w, "    {}: {{", component.name)?;
        for field in &component.fields {
            writeln!(w, "        /**")?;
            if !field.doc.is_empty() {
                // todo: wrap it
                writeln!(w, "         * {}", field.doc)?;
            }
            // we dont really care about categories too much idk
            // writeln!(w, "         * - Category: {}", field.category)?;
            if field.hints != "-" {
                // todo: parse the hints and show default and range separately
                writeln!(w, "         * - Hints: {}", field.hints)?;
            }
            writeln!(w, "         */")?;
            writeln!(
                w,
                "        {}: {},",
                field.name,
                map_component_type(&field.ty)
            )?;
        }
        writeln!(w, "    }};")?;
    }
    writeln!(w, "}};")?;
    Ok(())
}
