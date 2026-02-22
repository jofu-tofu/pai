### RS2.1 ThiserrorForLibsAnyhowForApps

**Impact: CRITICAL (Mixing error crates breaks the library/application contract and forces callers into a single error strategy)**

Libraries must expose structured, typed errors so callers can match on variants and decide how to handle each case. Applications consume those typed errors and only need to report them, so erased errors via `anyhow` are appropriate. Using `anyhow::Error` in a library's public API strips callers of the ability to handle errors programmatically; using `thiserror` in a top-level application adds ceremony with no benefit since no downstream code will match on the variants.

**Incorrect: anyhow in a library's public API**

```rust
// lib.rs of a published crate
use anyhow::Result;

/// Callers cannot match on specific failure modes.
/// They receive an opaque error with no variants to inspect.
pub fn parse_config(input: &str) -> Result<Config> {
    let raw: RawConfig = serde_json::from_str(input)?;  // erased into anyhow
    if raw.version < MIN_VERSION {
        anyhow::bail!("unsupported version: {}", raw.version);  // string, not typed
    }
    Ok(Config::from(raw))
}
```

**Correct: thiserror in libraries, anyhow in applications**

```rust
// lib.rs -- library exposes typed errors
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("invalid JSON: {0}")]
    InvalidJson(#[from] serde_json::Error),
    #[error("unsupported config version: {version} (minimum: {min})")]
    UnsupportedVersion { version: u32, min: u32 },
}

pub fn parse_config(input: &str) -> Result<Config, ConfigError> {
    let raw: RawConfig = serde_json::from_str(input)?;
    if raw.version < MIN_VERSION {
        return Err(ConfigError::UnsupportedVersion {
            version: raw.version,
            min: MIN_VERSION,
        });
    }
    Ok(Config::from(raw))
}

// main.rs -- application uses anyhow for ergonomic reporting
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let input = std::fs::read_to_string("config.json")
        .context("failed to read config file")?;
    let config = mylib::parse_config(&input)
        .context("failed to parse config")?;
    run(config)
}
```

**When acceptable:**
- Internal/private modules within an application may use `anyhow` throughout since there is no external caller
- Prototype or throwaway code where the library/application boundary does not yet exist
- Binary-only crates that will never be consumed as a library dependency
