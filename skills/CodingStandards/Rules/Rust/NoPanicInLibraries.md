### RS2.2 NoPanicInLibraries

**Impact: CRITICAL (A library panic terminates the caller's entire process with no recovery path)**

Libraries must never assume that a failure is unrecoverable -- that decision belongs to the caller. Every `unwrap()`, `expect()`, `panic!()`, and array index without bounds checking is a potential process abort that the caller cannot catch in safe code. Use `Result` to push the decision to the caller. When invariants truly cannot be violated, use `expect()` with a message explaining the invariant rather than bare `unwrap()`.

**Incorrect: Library function that panics on invalid input**

```rust
// lib.rs -- this kills the caller's process
pub fn get_user(users: &[User], id: usize) -> &User {
    // bare unwrap -- no context, no recovery
    users.iter().find(|u| u.id == id).unwrap()
}

pub fn parse_port(s: &str) -> u16 {
    // panics on non-numeric input; caller cannot handle gracefully
    s.parse().unwrap()
}
```

**Correct: Library returns Result, caller decides**

```rust
// lib.rs -- errors are the caller's decision
use thiserror::Error;

#[derive(Debug, Error)]
pub enum LookupError {
    #[error("user with id {0} not found")]
    UserNotFound(usize),
    #[error("invalid port number: {0}")]
    InvalidPort(#[from] std::num::ParseIntError),
}

pub fn get_user(users: &[User], id: usize) -> Result<&User, LookupError> {
    users.iter()
        .find(|u| u.id == id)
        .ok_or(LookupError::UserNotFound(id))
}

pub fn parse_port(s: &str) -> Result<u16, LookupError> {
    Ok(s.parse()?)
}

// Internal code where the invariant is provably guaranteed:
fn internal_init() {
    // expect() documents the invariant instead of bare unwrap()
    let regex = Regex::new(KNOWN_VALID_PATTERN)
        .expect("KNOWN_VALID_PATTERN is a compile-time constant and always valid");
}
```

**When acceptable:**
- `expect()` on provably infallible operations (e.g., regex compiled from a string literal, `Vec::push` on a non-full vec)
- Assertion macros (`assert!`, `debug_assert!`) that guard internal invariants which would indicate a bug in the library itself
- Implementing traits like `Index` where the trait signature requires a panic on out-of-bounds access
