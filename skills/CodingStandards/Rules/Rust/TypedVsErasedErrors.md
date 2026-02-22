### RS2.7 TypedVsErasedErrors

**Impact: MEDIUM (Using the wrong error strategy forces callers to downcast when they need variants, or maintain enums nobody inspects)**

Typed error enums are appropriate when callers need to match on variants and take different actions per failure mode. Erased errors (`anyhow::Error`, `Box<dyn Error>`) are appropriate when callers only need to report or log the error without inspecting it. Choosing the wrong strategy creates friction: typed errors that nobody matches on add maintenance burden, while erased errors that callers need to downcast are fragile and bypass the type system.

**Incorrect: Erased errors in a public API where callers must distinguish failures**

```rust
// lib.rs -- callers need to retry on Timeout but abort on InvalidInput
pub fn send_request(req: Request) -> Result<Response, Box<dyn std::error::Error>> {
    // Caller must downcast to figure out what happened:
    // if let Some(timeout) = e.downcast_ref::<TimeoutError>() { ... }
    // This is fragile, not checked by the compiler, and breaks on refactors.
    let body = serde_json::to_vec(&req)?;
    let resp = http_client.post(url).body(body).send()?;
    Ok(resp)
}
```

**Correct: Match the error strategy to the caller's needs**

```rust
// Public API: callers need to act on specific failures -> typed enum
#[derive(Debug, thiserror::Error)]
pub enum RequestError {
    #[error("request timed out after {duration:?}")]
    Timeout { duration: Duration },
    #[error("invalid request payload")]
    InvalidPayload(#[from] serde_json::Error),
    #[error("connection refused: {0}")]
    ConnectionRefused(String),
}

pub fn send_request(req: Request) -> Result<Response, RequestError> {
    let body = serde_json::to_vec(&req)?;
    let resp = http_client.post(url).body(body).send()
        .map_err(|e| classify_http_error(e))?;
    Ok(resp)
}

// Internal plumbing: callers only report errors -> anyhow is fine
fn sync_background_cache() -> anyhow::Result<()> {
    let data = fetch_remote_data()
        .context("cache sync failed")?;
    write_cache(&data)
        .context("failed to write cache file")?;
    Ok(())
}
```

**When acceptable:**
- `Box<dyn Error>` in trait objects where the concrete error type cannot be named
- Erased errors in test helpers where matching on variants is unnecessary
- Migration periods when converting from stringly-typed errors to typed enums
