use std::path::PathBuf;

use clap::Parser;

#[derive(Parser)]
struct Args {
    /// Path to lua_api_documentation.txt file to parse
    #[clap(short, long, default_value = "lua_api_documentation.txt")]
    lua: PathBuf,
    /// Path to component_documentation.txt file to parse
    #[clap(short, long, default_value = "component_documentation.txt")]
    components: PathBuf,
}

fn main() -> anyhow::Result<()> {
    lua_def_parser::init_logging()?;

    let _args = Args::parse();

    Ok(())
}
