### RS2.3 ErrorTypeGranularity

**Impact: HIGH (Monolithic error enums force callers to handle impossible variants and obscure the actual failure modes)**

Define error enums at the module or function-group level so that each variant represents a failure the caller can actually encounter. When a single error enum covers the entire crate, callers must write wildcard arms for variants that cannot occur in their code path, and the compiler cannot help verify exhaustiveness in a meaningful way.

**Incorrect: One error enum for the entire crate**

```rust
// error.rs -- every error in the crate lives here
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("template error: {0}")]
    Template(#[from] tera::Error),
    #[error("authentication failed")]
    AuthFailed,
    #[error("not found: {0}")]
    NotFound(String),
}

// Caller must handle Database, Http, Template even when calling parse_config
pub fn parse_config(input: &str) -> Result<Config, AppError> {
    Ok(serde_json::from_str(input)?)  // only Json variant is possible
}
```

**Correct: Module-scoped error enums with actionable variants**

```rust
// config/error.rs -- only config-related failures
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("invalid config JSON: {0}")]
    InvalidJson(#[from] serde_json::Error),
    #[error("missing required field: {field}")]
    MissingField { field: &'static str },
    #[error("invalid value for {field}: {reason}")]
    InvalidValue { field: &'static str, reason: String },
}

pub fn parse_config(input: &str) -> Result<Config, ConfigError> {
    let raw: RawConfig = serde_json::from_str(input)?;
    let host = raw.host.ok_or(ConfigError::MissingField { field: "host" })?;
    Ok(Config { host })
}

// db/error.rs -- only database-related failures
#[derive(Debug, thiserror::Error)]
pub enum DbError {
    #[error("query failed: {0}")]
    Query(#[from] sqlx::Error),
    #[error("record not found: {entity} with id {id}")]
    NotFound { entity: &'static str, id: i64 },
}
```

**When acceptable:**
- Small single-module crates where all functions share the same failure modes
- Top-level application error enums that aggregate module errors using `#[from]` for final reporting
- Prototyping where the error taxonomy is not yet settled
