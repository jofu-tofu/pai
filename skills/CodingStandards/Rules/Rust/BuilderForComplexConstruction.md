### RS7.3 BuilderForComplexConstruction

**Impact: HIGH (Eliminates positional parameter confusion and supports backward-compatible addition of options)**

When a struct requires three or more configuration options -- especially when several share the same type or have sensible defaults -- a constructor with positional parameters becomes unreadable and fragile. A builder pattern names every parameter at the call site, makes defaults explicit, and lets you add new options in future versions without breaking existing callers.

**Incorrect: Constructor with many positional parameters**

```rust
pub struct HttpClient {
    base_url: String,
    timeout_ms: u64,
    max_retries: u32,
    follow_redirects: bool,
    user_agent: String,
    keep_alive: bool,
}

impl HttpClient {
    // Six positional params -- call sites are unreadable
    pub fn new(
        base_url: String, timeout_ms: u64, max_retries: u32,
        follow_redirects: bool, user_agent: String, keep_alive: bool,
    ) -> Self {
        Self { base_url, timeout_ms, max_retries, follow_redirects, user_agent, keep_alive }
    }
}

// What do true, "agent", true mean?
let client = HttpClient::new("https://api.example.com".into(), 5000, 3, true, "myapp/1.0".into(), true);
```

**Correct: Builder with named options and defaults**

```rust
pub struct HttpClient {
    base_url: String,
    timeout_ms: u64,
    max_retries: u32,
    follow_redirects: bool,
    user_agent: String,
    keep_alive: bool,
}

pub struct HttpClientBuilder {
    base_url: String,
    timeout_ms: u64,
    max_retries: u32,
    follow_redirects: bool,
    user_agent: String,
    keep_alive: bool,
}

impl HttpClientBuilder {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
            timeout_ms: 30_000,
            max_retries: 3,
            follow_redirects: true,
            user_agent: "rust-client/1.0".into(),
            keep_alive: true,
        }
    }

    pub fn timeout_ms(mut self, ms: u64) -> Self { self.timeout_ms = ms; self }
    pub fn max_retries(mut self, n: u32) -> Self { self.max_retries = n; self }
    pub fn user_agent(mut self, ua: impl Into<String>) -> Self { self.user_agent = ua.into(); self }

    pub fn build(self) -> HttpClient {
        HttpClient {
            base_url: self.base_url,
            timeout_ms: self.timeout_ms,
            max_retries: self.max_retries,
            follow_redirects: self.follow_redirects,
            user_agent: self.user_agent,
            keep_alive: self.keep_alive,
        }
    }
}

let client = HttpClientBuilder::new("https://api.example.com")
    .timeout_ms(5000)
    .user_agent("myapp/1.0")
    .build();
```

**When acceptable:**
- Structs with 1-2 required fields and no optional configuration
- Internal types used in a single module where the constructor is called once
- When the `derive_builder` or `bon` crate already generates the builder and manual implementation would be redundant
