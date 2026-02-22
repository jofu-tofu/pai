### RS2.4 ContextualErrors

**Impact: HIGH (Bare `?` propagation strips the "what was I trying to do" context, producing error messages that point at the symptom instead of the cause)**

When an error is propagated with `?`, the original error describes what went wrong at the lowest level (e.g., "No such file or directory") but not what the program was trying to accomplish. Adding `.context()` or `.map_err()` before `?` attaches the high-level operation, producing error chains like "failed to load user profile: config.toml: No such file or directory" that are immediately actionable.

**Incorrect: Bare ? loses operational context**

```rust
use std::fs;

fn load_pipeline(path: &str) -> anyhow::Result<Pipeline> {
    // Error: "No such file or directory (os error 2)"
    // Which file? What operation? Caller has no idea.
    let content = fs::read_to_string(path)?;
    let config: PipelineConfig = toml::from_str(&content)?;
    let db = Database::connect(&config.db_url)?;
    Ok(Pipeline::new(config, db))
}
```

**Correct: Every ? carries context about the operation**

```rust
use anyhow::Context;
use std::fs;

fn load_pipeline(path: &str) -> anyhow::Result<Pipeline> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("failed to read pipeline config from {path}"))?;
    let config: PipelineConfig = toml::from_str(&content)
        .context("failed to parse pipeline config as TOML")?;
    let db = Database::connect(&config.db_url)
        .context("failed to connect to pipeline database")?;
    Ok(Pipeline::new(config, db))
}

// In library code without anyhow, use map_err:
fn parse_port(s: &str) -> Result<u16, ConfigError> {
    s.parse()
        .map_err(|e| ConfigError::InvalidValue {
            field: "port",
            reason: format!("{e}"),
        })
}
```

**When acceptable:**
- When the error type already carries sufficient context (e.g., a typed error variant that includes the file path)
- Internal helper functions where the caller immediately adds context
- One-liner conversions where the `From` impl provides adequate information
