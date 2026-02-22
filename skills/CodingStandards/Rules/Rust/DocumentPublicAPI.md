### RS7.7 DocumentPublicAPI

**Impact: HIGH (Doc comments serve as the primary contract between library author and consumer)**

Every public item should have a doc comment (`///`) that explains what it does, documents error conditions with `# Errors`, panic conditions with `# Panics`, and includes a runnable example under `# Examples`. Runnable examples are tested by `cargo test --doc`, which means they serve double duty as documentation and regression tests. Missing docs can be enforced with `#![warn(missing_docs)]` at the crate root.

**Incorrect: Public API with no documentation**

```rust
pub struct RateLimiter {
    pub max_requests: u32,
    pub window_secs: u64,
}

impl RateLimiter {
    pub fn new(max_requests: u32, window_secs: u64) -> Self {
        Self { max_requests, window_secs }
    }

    pub fn check(&self, key: &str) -> bool {
        // Is true "allowed" or "rate-limited"? No way to tell without reading source.
        todo!()
    }
}
```

**Correct: Doc comments with examples, errors, and panics**

```rust
/// A sliding-window rate limiter that tracks request counts per key.
///
/// # Examples
///
/// ```
/// use my_crate::RateLimiter;
///
/// let limiter = RateLimiter::new(100, 60);
/// assert!(limiter.check("user-42").is_ok());
/// ```
pub struct RateLimiter {
    max_requests: u32,
    window_secs: u64,
}

impl RateLimiter {
    /// Creates a new rate limiter.
    ///
    /// # Panics
    ///
    /// Panics if `window_secs` is zero.
    pub fn new(max_requests: u32, window_secs: u64) -> Self {
        assert!(window_secs > 0, "window must be nonzero");
        Self { max_requests, window_secs }
    }

    /// Returns `Ok(())` if the request is allowed, or `Err(RateLimitExceeded)`
    /// if the key has exceeded `max_requests` within the current window.
    ///
    /// # Errors
    ///
    /// Returns [`RateLimitExceeded`] when the key's request count
    /// has reached the configured maximum.
    pub fn check(&self, key: &str) -> Result<(), RateLimitExceeded> {
        todo!()
    }
}
```

**When acceptable:**
- Private and `pub(crate)` items where the audience is the same team and the intent is obvious
- Trait implementations where the trait's own documentation fully describes the contract (e.g., `impl Display`)
- Generated code or FFI bindings where doc comments would be immediately stale
