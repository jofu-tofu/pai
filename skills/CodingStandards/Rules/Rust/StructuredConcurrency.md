### RS3.5 StructuredConcurrency

**Impact: HIGH (Unstructured task spawning leaks tasks, loses errors, and makes cancellation impossible to reason about)**

Fire-and-forget tokio::spawn scatters tasks across the runtime with no parent-child relationship. Errors from spawned tasks are silently dropped if the JoinHandle is not awaited. Cancellation requires manually tracking every handle. Structured concurrency tools -- select!, JoinSet, and FuturesUnordered -- bind task lifetimes to a scope, propagate errors to the caller, and make cancellation automatic when the scope exits.

**Incorrect: Manual handle tracking with fire-and-forget**

```rust
use tokio::task::JoinHandle;

async fn process_batch(items: Vec<Item>) -> Vec<Result<Output, Error>> {
    let mut handles: Vec<JoinHandle<Result<Output, Error>>> = Vec::new();

    for item in items {
        // No limit on concurrency, no structured cancellation
        handles.push(tokio::spawn(async move {
            process_item(item).await
        }));
    }

    let mut results = Vec::new();
    for handle in handles {
        // If one task panics, unwrap crashes the whole collector
        results.push(handle.await.unwrap());
    }
    results
}
```

**Correct: JoinSet for structured task management**

```rust
use tokio::task::JoinSet;

async fn process_batch(items: Vec<Item>) -> Vec<Result<Output, Error>> {
    let mut set = JoinSet::new();

    for item in items {
        set.spawn(async move {
            process_item(item).await
        });
    }

    let mut results = Vec::new();
    // JoinSet handles panics gracefully via JoinError
    while let Some(result) = set.join_next().await {
        match result {
            Ok(inner) => results.push(inner),
            Err(join_err) => {
                eprintln!("Task failed: {join_err}");
                // Optionally: set.abort_all() to cancel remaining
            }
        }
    }
    // When set is dropped, all remaining tasks are cancelled
    results
}
```

**When acceptable:**
- Long-lived background services (metrics collectors, health checkers) that intentionally outlive any single request scope
- One-shot daemon tasks spawned at startup that run for the entire application lifetime
- Cases where FuturesUnordered with stream combinators provides better ergonomics for pipeline-style processing
