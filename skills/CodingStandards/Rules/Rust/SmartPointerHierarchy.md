### RS1.3 SmartPointerHierarchy

**Impact: HIGH (Reaching for Arc or Rc prematurely adds synchronization overhead and obscures ownership boundaries)**

Rust provides a hierarchy of pointer types with increasing capability and cost: `&T` (zero-cost borrow) < `Box<T>` (single owner, heap) < `Rc<T>` (reference-counted, single-thread) < `Arc<T>` (atomic reference-counted, thread-safe). Each step up the hierarchy adds runtime overhead: `Box` adds a heap allocation, `Rc` adds a reference count increment/decrement on clone and drop, and `Arc` adds atomic operations that inhibit CPU caching optimizations. Start at the cheapest level that satisfies the ownership requirement and escalate only when the compiler or architecture demands it.

**Incorrect: Jumping to Arc when simpler alternatives work**

```rust
use std::sync::Arc;

// Arc used for single-threaded shared config -- atomic overhead is wasted
fn process_items(items: &[String], config: Arc<Config>) {
    for item in items {
        handle_item(item, Arc::clone(&config)); // atomic increment each iteration
    }
}

fn handle_item(item: &str, config: Arc<Config>) {
    println!("{}: {}", item, config.prefix);
}

// Arc used when a simple reference would suffice
fn format_report(data: Arc<ReportData>) -> String {
    format!("{}: {}", data.title, data.summary)
}
```

**Correct: Use the cheapest pointer that satisfies the requirement**

```rust
// A shared reference is sufficient -- no heap allocation or ref counting
fn process_items(items: &[String], config: &Config) {
    for item in items {
        handle_item(item, config); // zero-cost borrow
    }
}

fn handle_item(item: &str, config: &Config) {
    println!("{}: {}", item, config.prefix);
}

// Plain reference for read-only access
fn format_report(data: &ReportData) -> String {
    format!("{}: {}", data.title, data.summary)
}

// Arc only when data genuinely crosses thread boundaries
fn spawn_workers(data: Arc<Config>) {
    for i in 0..4 {
        let data = Arc::clone(&data);
        std::thread::spawn(move || {
            println!("Worker {i}: {}", data.prefix);
        });
    }
}
```

**When acceptable:**
- `Rc<T>` is appropriate when multiple owners in a single thread genuinely need to keep data alive (tree structures with parent back-references, observer patterns)
- `Arc<T>` is required when shared data must cross thread or async task boundaries
- `Box<T>` is needed for recursive types, trait objects, or large stack values that must move to the heap
