### RS3.3 SpawnBlockingForCpuWork

**Impact: CRITICAL (CPU-bound work on the async runtime starves all other tasks on that worker thread)**

Tokio's async runtime uses a small pool of worker threads (typically equal to CPU cores). Each worker cooperatively multiplexes thousands of tasks by switching at .await points. A task that performs CPU-intensive computation without yielding monopolizes its worker thread -- every other task scheduled on that thread stops making progress. Under load this cascades: timeouts fire, health checks fail, and the service appears hung even though only one task is doing heavy computation.

**Incorrect: CPU-intensive hash on the async runtime**

```rust
use sha2::{Sha256, Digest};

async fn hash_password(password: String) -> Vec<u8> {
    // This burns CPU for milliseconds, blocking the worker thread.
    // Every other task on this thread is frozen.
    let mut hasher = Sha256::new();
    for _ in 0..100_000 {
        hasher.update(password.as_bytes());
    }
    hasher.finalize().to_vec()
}
```

**Correct: Offload to spawn_blocking**

```rust
use sha2::{Sha256, Digest};
use tokio::task;

async fn hash_password(password: String) -> Vec<u8> {
    // Runs on a dedicated blocking thread pool, async runtime stays free
    task::spawn_blocking(move || {
        let mut hasher = Sha256::new();
        for _ in 0..100_000 {
            hasher.update(password.as_bytes());
        }
        hasher.finalize().to_vec()
    })
    .await
    .expect("blocking task panicked")
}
```

**When acceptable:**
- Computation completes in microseconds (e.g., a single SHA-256 hash of a short input) where the overhead of spawn_blocking exceeds the work itself
- You are already running on a dedicated thread (inside spawn_blocking or a non-async context)
- The runtime is configured with a large thread pool specifically for mixed workloads and the CPU work is bounded
