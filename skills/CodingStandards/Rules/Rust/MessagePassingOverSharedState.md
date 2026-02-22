### RS3.2 MessagePassingOverSharedState

**Impact: HIGH (Shared mutable state via Arc<Mutex<T>> scatters synchronization logic and invites deadlocks)**

Channels encode the communication protocol in the type system: a sender and receiver make the data flow direction explicit and the compiler ensures only one consumer receives each message. Arc<Mutex<T>> hides the protocol -- any holder can read or write at any time, and the synchronization discipline exists only in the developer's head. Channels also eliminate lock contention entirely; senders never block on receivers and vice versa (with bounded back-pressure as the exception, which is desirable).

**Incorrect: Shared counter with Arc<Mutex<T>>**

```rust
use std::sync::{Arc, Mutex};
use tokio::task;

async fn count_events(urls: Vec<String>) -> usize {
    let counter = Arc::new(Mutex::new(0usize));
    let mut handles = Vec::new();

    for url in urls {
        let counter = Arc::clone(&counter);
        handles.push(task::spawn(async move {
            let count = fetch_event_count(&url).await;
            // Every task contends on the same lock
            let mut guard = counter.lock().unwrap();
            *guard += count;
        }));
    }

    for h in handles {
        h.await.unwrap();
    }
    *counter.lock().unwrap()
}
```

**Correct: Message-passing with mpsc channel**

```rust
use tokio::sync::mpsc;
use tokio::task;

async fn count_events(urls: Vec<String>) -> usize {
    let (tx, mut rx) = mpsc::channel::<usize>(urls.len());

    for url in urls {
        let tx = tx.clone();
        task::spawn(async move {
            let count = fetch_event_count(&url).await;
            let _ = tx.send(count).await;
        });
    }
    drop(tx); // close the sender so rx.recv() returns None when done

    let mut total = 0;
    while let Some(count) = rx.recv().await {
        total += count;
    }
    total
}
```

**When acceptable:**
- Read-heavy caches where RwLock contention is minimal and the data structure cannot be practically serialized through a channel
- Small, simple state (e.g., an AtomicBool shutdown flag) where channels add unnecessary ceremony
- When multiple tasks need random-access reads of a shared data structure and message-passing would require duplicating the entire structure
