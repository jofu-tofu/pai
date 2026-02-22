### RS7.1 ConversionNaming

**Impact: HIGH (Communicates cost and ownership semantics through naming alone)**

Rust's standard library follows a strict naming convention for conversions: `as_` means a cheap reference-to-reference view (O(1), no allocation), `to_` means an expensive conversion that may allocate, and `into_` means a consuming conversion that takes ownership. When your API deviates from these conventions, callers misjudge performance characteristics and ownership transfer, leading to unnecessary clones or surprising allocations in hot paths.

**Incorrect: Naming that misleads about cost and ownership**

```rust
pub struct Name {
    inner: String,
}

impl Name {
    // Misleading: "get_" says nothing about cost or ownership
    pub fn get_string(&self) -> String {
        self.inner.clone() // hidden allocation
    }

    // Misleading: "as_" implies cheap, but this allocates
    pub fn as_uppercase(&self) -> String {
        self.inner.to_uppercase() // allocation hidden behind as_ name
    }

    // Misleading: "to_" implies non-consuming, but this takes ownership
    pub fn to_inner(self) -> String {
        self.inner // consuming, should be into_
    }
}
```

**Correct: Names that match cost and ownership semantics**

```rust
pub struct Name {
    inner: String,
}

impl Name {
    // as_: cheap borrow-to-borrow, O(1), no allocation
    pub fn as_str(&self) -> &str {
        &self.inner
    }

    // to_: expensive, allocates a new value, borrows self
    pub fn to_uppercase(&self) -> String {
        self.inner.to_uppercase()
    }

    // into_: consumes self, moves ownership, no allocation
    pub fn into_inner(self) -> String {
        self.inner
    }
}
```

**When acceptable:**
- FFI boundary wrappers where Rust naming conventions conflict with the C API being wrapped
- When implementing standard library traits (e.g., `ToString`) that dictate the method name
- Internal private helpers where the audience is the same module and the cost is obvious from context
