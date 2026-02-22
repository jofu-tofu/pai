### RS1.4 InteriorMutabilityJustification

**Impact: HIGH (Cell/RefCell bypass compile-time borrow checking, moving safety guarantees to runtime where violations become panics)**

Interior mutability types (`Cell<T>`, `RefCell<T>`, `OnceCell<T>`, `Mutex<T>`) allow mutation through a shared reference, deliberately circumventing Rust's core compile-time borrow-checking guarantee. This is sometimes necessary, but every use should be accompanied by a comment explaining why compile-time borrowing is insufficient. Without justification, readers cannot distinguish intentional design from a workaround that hides an ownership modeling problem. `RefCell` in particular replaces compile-time borrow errors with runtime panics, which are strictly worse.

**Incorrect: RefCell used without justification or where restructuring would eliminate it**

```rust
use std::cell::RefCell;

struct Processor {
    // RefCell used because process() takes &self but needs to mutate cache
    // No comment explaining why &mut self is not viable
    cache: RefCell<HashMap<String, String>>,
    data: Vec<Record>,
}

impl Processor {
    fn process(&self, key: &str) -> String {
        if let Some(val) = self.cache.borrow().get(key) {
            return val.clone();
        }
        let result = expensive_compute(key);
        // Runtime panic if someone else holds a borrow
        self.cache.borrow_mut().insert(key.to_owned(), result.clone());
        result
    }
}
```

**Correct: Justify interior mutability or restructure to avoid it**

```rust
// Option A: Restructure to use &mut self (preferred)
struct Processor {
    cache: HashMap<String, String>,
    data: Vec<Record>,
}

impl Processor {
    fn process(&mut self, key: &str) -> &str {
        if !self.cache.contains_key(key) {
            let result = expensive_compute(key);
            self.cache.insert(key.to_owned(), result);
        }
        &self.cache[key]
    }
}

// Option B: Interior mutability with documented justification
struct SharedProcessor {
    // Justification: SharedProcessor is stored in an Rc and shared across
    // multiple UI components that each call process() through &self.
    // Restructuring to &mut self would require a single owner, breaking
    // the shared-observer architecture.
    cache: RefCell<HashMap<String, String>>,
}
```

**When acceptable:**
- The type is behind a shared reference (`Rc<T>`, `Arc<T>`) and mutation is genuinely needed by multiple holders
- Implementing lazy initialization patterns with `OnceCell` or `OnceLock` where the value is set once and read many times
- Mocking or test doubles that need to record calls through a shared trait interface
- `Mutex<T>` / `RwLock<T>` for thread-safe interior mutability in concurrent contexts (these already carry self-documenting synchronization semantics)
