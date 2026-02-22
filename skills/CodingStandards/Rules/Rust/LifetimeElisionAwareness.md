### RS1.7 LifetimeElisionAwareness

**Impact: MEDIUM (Elided lifetimes hide the borrowing contract, leading to confusion when the implicit rules do not match the actual data flow)**

Rust's lifetime elision rules allow omitting lifetime annotations in common cases: single input reference gets its lifetime assigned to the output, and `&self` / `&mut self` methods assign the self lifetime to all outputs. These rules cover the majority of cases, but when a function has multiple reference inputs, or when the output lifetime is not tied to the obvious input, explicit annotations prevent misunderstandings. Annotate lifetimes when the elision rules would produce a different contract than what the function actually implements.

**Incorrect: Elided lifetimes obscure the actual contract**

```rust
// Which input does the return value borrow from? Elision says `s`
// (first input), but the function actually borrows from `default`.
fn get_or_default(s: &str, default: &str) -> &str {
    if s.is_empty() {
        default  // Returns a borrow of `default`, not `s`
    } else {
        s
    }
}

// Elision hides that the iterator borrows from the struct
struct DataStore {
    items: Vec<String>,
}

impl DataStore {
    // Elision assigns &self lifetime to the return, which is correct
    // here but not obvious to readers unfamiliar with the rules
    fn find(&self, prefix: &str) -> Option<&str> {
        self.items.iter()
            .find(|item| item.starts_with(prefix))
            .map(|s| s.as_str())
    }
}
```

**Correct: Explicit lifetimes clarify the borrowing contract**

```rust
// Explicit: return value may borrow from either input
fn get_or_default<'a>(s: &'a str, default: &'a str) -> &'a str {
    if s.is_empty() {
        default
    } else {
        s
    }
}

// Explicit lifetime makes the borrow relationship clear in the API
struct DataStore {
    items: Vec<String>,
}

impl DataStore {
    // Explicit: return borrows from self, not from prefix
    fn find<'a>(&'a self, prefix: &str) -> Option<&'a str> {
        self.items.iter()
            .find(|item| item.starts_with(prefix))
            .map(|s| s.as_str())
    }
}
```

**When acceptable:**
- Single input reference, single output reference -- the elision rules are unambiguous and universally understood
- `&self` / `&mut self` methods returning a reference -- the convention that output borrows from self is well-known
- Private helper functions where the caller and callee are in the same module and the contract is obvious from context
