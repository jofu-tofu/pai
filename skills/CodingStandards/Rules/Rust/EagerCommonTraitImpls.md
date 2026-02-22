### RS5.8 EagerCommonTraitImpls

**Impact: HIGH (Missing common trait derives make public types painful to use in collections, debugging, and tests)**

Public types that lack `Debug`, `Clone`, `PartialEq`, or `Hash` become second-class citizens in the Rust ecosystem. They cannot be printed in assert messages, stored in `HashSet`/`HashMap`, compared in tests, or cloned when needed. Deriving these traits eagerly on public types costs nothing at the definition site and prevents friction everywhere the type is used. Omitting them forces downstream users to wrap your type or write boilerplate.

**Incorrect: Missing derives make the type unusable in common contexts**

```rust
// No derives -- callers cannot debug-print, compare, or hash this type
pub struct Config {
    pub name: String,
    pub max_retries: u32,
    pub timeout_ms: u64,
}

fn main() {
    let a = Config { name: "prod".into(), max_retries: 3, timeout_ms: 5000 };
    let b = Config { name: "prod".into(), max_retries: 3, timeout_ms: 5000 };

    // println!("{:?}", a);  // error: Config doesn't implement Debug
    // assert_eq!(a, b);     // error: Config doesn't implement PartialEq
    // let copy = a.clone(); // error: Config doesn't implement Clone
}
```

**Correct: Eagerly derive common traits on public types**

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash, Default)]
pub struct Config {
    pub name: String,
    pub max_retries: u32,
    pub timeout_ms: u64,
}

fn main() {
    let a = Config { name: "prod".into(), max_retries: 3, timeout_ms: 5000 };
    let b = a.clone();

    println!("{a:?}");     // works: Debug
    assert_eq!(a, b);      // works: PartialEq + Eq
    let mut set = std::collections::HashSet::new();
    set.insert(a);         // works: Hash + Eq
}
```

**When acceptable:**
- Types containing fields that cannot derive the trait (e.g., `f64` prevents `Eq` and `Hash` -- derive what you can)
- Types where `Clone` would be semantically misleading (e.g., unique handles, RAII guards)
- Internal types with very narrow usage where the derive would be dead code
- Types where `PartialEq` has domain-specific semantics that differ from field-by-field comparison
