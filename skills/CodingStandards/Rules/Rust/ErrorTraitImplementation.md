### RS2.5 ErrorTraitImplementation

**Impact: HIGH (Errors that skip Display, Debug, or source() break error reporting chains and lose causal information)**

Custom error types must implement `std::error::Error`, `Display`, and `Debug`. The `source()` method must return the underlying cause when one exists, so that error reporters (like anyhow's `{:?}` chain) can walk the full causal chain. Manual implementations are verbose and error-prone; `thiserror` generates correct implementations from annotations.

**Incorrect: Manual impl that drops the error chain**

```rust
use std::fmt;

#[derive(Debug)]
pub struct ConfigError {
    message: String,
    cause: Option<Box<dyn std::error::Error>>,
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
        // cause is never displayed -- caller sees "config error"
        // but not "invalid JSON at line 12"
    }
}

impl std::error::Error for ConfigError {
    // source() not implemented -- error chain is broken
    // anyhow's {:#} and {:?} formats cannot walk the chain
}
```

**Correct: thiserror derives complete Error + Display + source()**

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("failed to read config file: {path}")]
    ReadFailed {
        path: String,
        #[source]  // source() returns this, enabling error chain traversal
        cause: std::io::Error,
    },
    #[error("invalid config JSON")]
    InvalidJson(#[from] serde_json::Error),  // #[from] implies #[source]
    #[error("missing required field: {0}")]
    MissingField(&'static str),
}

// If manual impl is needed, always implement source():
impl std::error::Error for LegacyError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.cause.as_deref()  // preserves the causal chain
    }
}
```

**When acceptable:**
- Leaf errors with no underlying cause (e.g., validation errors with only a message) may omit `source()`
- Error types in `#[no_std]` environments where `thiserror` is not available
- Wrapper types around foreign errors that do not implement `std::error::Error`
