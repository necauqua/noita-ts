use std::path::PathBuf;

use clap::Parser;
use lua_def_parser::lua_parser::parse_lua;
use tracing_subscriber::{fmt, EnvFilter};

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
    // they gotta add a oneliner for this
    tracing::subscriber::set_global_default(
        fmt::Subscriber::builder()
            .with_env_filter(
                EnvFilter::builder().parse(
                    std::env::var(EnvFilter::DEFAULT_ENV)
                        .as_deref()
                        .unwrap_or("info"),
                )?,
            )
            .finish(),
    )?;

    let args = Args::parse();
    let parsed = parse_lua(std::fs::read_to_string(args.lua)?)?;
    println!("{parsed:#?}");

    Ok(())
}
