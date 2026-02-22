### RS3.1 NoMutexAcrossAwait

**Impact: CRITICAL (Holding std::sync::Mutex across .await can deadlock the entire tokio runtime)**

A std::sync::Mutex blocks the OS thread while waiting to acquire the lock. In an async runtime, that thread is a worker thread shared among many tasks. If a task holds a std::sync::Mutex guard and then yields at an .await point, the worker thread is blocked for the entire duration the task is suspended -- potentially forever if the task that needs to release the lock is scheduled on the same (now-blocked) worker thread. This is a deadlock that only manifests under load.

**Incorrect: Mutex guard held across .await**

```rust
use std::sync::Mutex;
use std::sync::Arc;

async fn update_and_notify(
    state: Arc<Mutex<Vec<String>>>,
    msg: String,
) {
    let mut guard = state.lock().unwrap();
    guard.push(msg);
    // Guard is still alive here -- the worker thread is blocked
    // while waiting for the network call to complete
    notify_subscribers(&guard).await;
    // guard dropped here, far too late
}
```

**Correct: Drop guard before .await**

```rust
use std::sync::Mutex;
use std::sync::Arc;

async fn update_and_notify(
    state: Arc<Mutex<Vec<String>>>,
    msg: String,
) {
    // Scope the lock so the guard is dropped before .await
    let snapshot = {
        let mut guard = state.lock().unwrap();
        guard.push(msg);
        guard.clone() // take a snapshot if needed downstream
    };
    // Guard is dropped, worker thread is free
    notify_subscribers(&snapshot).await;
}

// Alternative: use tokio::sync::Mutex when you truly need
// to hold the lock across an await point
use tokio::sync::Mutex as AsyncMutex;

async fn update_and_notify_async(
    state: Arc<AsyncMutex<Vec<String>>>,
    msg: String,
) {
    let mut guard = state.lock().await; // async-aware lock
    guard.push(msg);
    notify_subscribers(&guard).await; // safe to hold across .await
}
```

**When acceptable:**
- Using tokio::sync::Mutex, which is designed to be held across .await points
- The critical section is guaranteed to contain no .await points and is wrapped in a block scope that makes this visually obvious
- Single-threaded runtime (flavor = "current_thread") where deadlock from thread starvation cannot occur
