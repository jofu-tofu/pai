### RS7.5 DebugAndDisplayForAll

**Impact: HIGH (Enables logging, error messages, and assert output for every public type)**

Every public type should derive or implement `Debug` so it can appear in `dbg!()`, `assert_eq!` failure messages, log output, and error chains. Types that are user-facing -- errors, identifiers, status values -- should also implement `Display` to provide human-readable formatting. Without `Debug`, generic code that bounds on `Debug` (including most test assertion macros and logging frameworks) cannot use your types.

**Incorrect: Public types without Debug or Display**

```rust
// No Debug -- cannot use in dbg!(), assert_eq!, or format!("{:?}", ...)
pub struct Config {
    pub host: String,
    pub port: u16,
}

pub enum AppError {
    NotFound(String),
    PermissionDenied,
}

fn handle(err: AppError) {
    // Cannot print err -- no Debug or Display
    // println!("{err}");   // compile error
    // println!("{err:?}"); // compile error
}
```

**Correct: Debug on all public types, Display on user-facing types**

```rust
#[derive(Debug, Clone)]
pub struct Config {
    pub host: String,
    pub port: u16,
}

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    PermissionDenied,
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound(resource) => write!(f, "not found: {resource}"),
            Self::PermissionDenied => write!(f, "permission denied"),
        }
    }
}

impl std::error::Error for AppError {}

fn handle(err: AppError) {
    println!("{err}");     // human-readable via Display
    println!("{err:?}");   // structured via Debug
}
```

**When acceptable:**
- Types that contain fields which cannot implement Debug (e.g., raw function pointers, certain FFI types) -- implement Debug manually with placeholder output
- Internal types in a private module that are never logged, asserted on, or formatted
- Types where Debug output would expose sensitive data (secrets, tokens) -- implement Debug manually to redact fields
