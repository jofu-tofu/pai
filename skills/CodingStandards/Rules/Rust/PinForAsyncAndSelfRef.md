### RS9.2 PinForAsyncAndSelfRef

**Impact: HIGH (Incorrect pinning causes undefined behavior or compiler errors with async futures)**

Async futures in Rust are state machines that may contain self-referential pointers across `.await` points. Moving such a future after it has been polled invalidates those internal pointers. `Pin<T>` guarantees the value will not be moved, making it safe to hold self-references. Use `pin!()` for stack-pinned locals and `Box::pin()` when the future must be heap-allocated or returned from a function.

**Incorrect: Attempting to use a self-referential future without pinning**

```rust
use std::future::Future;

// Returning an unboxed future that the caller cannot pin correctly
fn make_retry_future(url: &str) -> impl Future<Output = Result<String, Error>> {
    // This future holds references to its own state across awaits
    async {
        let client = reqwest::Client::new();
        let response = client.get(url).send().await?;
        // After this await, the future is self-referential --
        // moving it would invalidate internal pointers
        let body = response.text().await?;
        Ok(body)
    }
}

// Caller tries to store futures in a Vec and poll them --
// without pinning, this is unsound or won't compile
let mut futures: Vec<Box<dyn Future<Output = Result<String, Error>>>> = vec![];
futures.push(Box::new(make_retry_future("https://example.com")));
```

**Correct: Pin futures appropriately for stack and heap contexts**

```rust
use std::pin::{Pin, pin};
use std::future::Future;

// Return a pinned, boxed future for dynamic dispatch or storage
fn make_retry_future(
    url: String,
) -> Pin<Box<dyn Future<Output = Result<String, reqwest::Error>> + Send>> {
    Box::pin(async move {
        let client = reqwest::Client::new();
        let response = client.get(&url).send().await?;
        let body = response.text().await?;
        Ok(body)
    })
}

// Stack-pinning with pin!() for local futures
async fn fetch_with_timeout(url: &str) -> Result<String, reqwest::Error> {
    let future = pin!(reqwest::get(url));
    // `future` is now Pin<&mut impl Future> and cannot be moved
    future.await?.text().await
}
```

**When acceptable:**
- Simple futures that do not hold self-references across `.await` points (the compiler will tell you)
- When using `tokio::spawn` or `tokio::select!`, which handle pinning internally
- When a combinator like `.map()` or `.then()` already returns a pinned future
