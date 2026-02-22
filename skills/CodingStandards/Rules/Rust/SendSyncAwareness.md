### RS3.4 SendSyncAwareness

**Impact: HIGH (Using non-Send types across .await points causes confusing compiler errors and incorrect fixes)**

When you spawn a tokio task, the future must be Send + 'static because the runtime may move it between worker threads at any .await point. Types like Rc, RefCell, and MutexGuard (from std) are not Send. If they are alive across an .await, the compiler rejects the future with an error that points at the spawn call, not at the offending type -- making diagnosis difficult. Understanding Send/Sync boundaries prevents developers from reaching for incorrect fixes like unsafe impl Send.

**Incorrect: Rc<RefCell<T>> across .await**

```rust
use std::cell::RefCell;
use std::rc::Rc;

async fn process(data: Rc<RefCell<Vec<String>>>) {
    // Rc is not Send -- this future cannot be spawned on tokio
    let snapshot = data.borrow().clone();
    // The Rc is still alive across this .await point
    send_report(&snapshot).await;
    data.borrow_mut().clear();
}

// ERROR: future cannot be sent between threads safely
// tokio::spawn(process(shared_data));
```

**Correct: Arc<tokio::sync::Mutex<T>> for shared async state**

```rust
use std::sync::Arc;
use tokio::sync::Mutex;

async fn process(data: Arc<Mutex<Vec<String>>>) {
    // Arc is Send + Sync, tokio::sync::Mutex is Send + Sync
    let snapshot = {
        let guard = data.lock().await;
        guard.clone()
    };
    send_report(&snapshot).await;
    data.lock().await.clear();
}

// Compiles and runs correctly:
// tokio::spawn(process(shared_data));
```

**When acceptable:**
- Single-threaded runtime (flavor = "current_thread") where futures are never moved between threads, making Send unnecessary
- Local tasks spawned with tokio::task::spawn_local, which does not require Send
- Non-async code or synchronous threads where Rc/RefCell is the correct lightweight choice
