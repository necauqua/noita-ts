pub mod component_parser;
pub mod lua_parser;
pub(crate) mod parsing;

pub fn init_logging() -> anyhow::Result<()> {
    // they gotta add a oneliner for this
    tracing::subscriber::set_global_default(
        tracing_subscriber::fmt::Subscriber::builder()
            .with_env_filter(
                tracing_subscriber::EnvFilter::builder().parse(
                    std::env::var(tracing_subscriber::EnvFilter::DEFAULT_ENV)
                        .as_deref()
                        .unwrap_or("info"),
                )?,
            )
            .finish(),
    )?;
    Ok(())
}
