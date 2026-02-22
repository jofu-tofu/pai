### RS9.3 LifetimeParameterDesign

**Impact: MEDIUM (Descriptive lifetimes make borrow relationships readable; excessive parameters create API friction)**

Lifetime parameters are part of your public API surface. Minimize their count by relying on elision where possible, and when explicit lifetimes are necessary, name them descriptively to communicate what they borrow. Names like `'a` and `'b` force readers to trace data flow manually; names like `'input`, `'conn`, or `'query` make the borrowing relationship self-documenting.

**Incorrect: Excessive and opaque lifetime parameters**

```rust
// Three single-letter lifetimes -- reader cannot tell what each borrows
struct QueryResult<'a, 'b, 'c> {
    connection: &'a Connection,
    query: &'b str,
    params: &'c [Value],
}

// Unnecessary lifetime parameter -- could return owned String
fn format_name<'a>(first: &'a str, last: &'a str) -> &'a str {
    // This can't actually work -- you'd need to allocate
    // The lifetime param here signals a misunderstanding
    todo!()
}

impl<'a, 'b, 'c> QueryResult<'a, 'b, 'c> {
    fn execute(&self) -> Vec<Row> { todo!() }
}
```

**Correct: Minimal, descriptively named lifetime parameters**

```rust
// Single lifetime when all borrows share the same scope
struct QueryResult<'conn> {
    connection: &'conn Connection,
    query: String,        // Owned -- no lifetime needed
    params: Vec<Value>,   // Owned -- no lifetime needed
}

// Elision handles the common case -- no annotation needed
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}

// When multiple lifetimes are genuinely needed, name them
fn merge_results<'left, 'right>(
    left: &'left SearchIndex,
    right: &'right SearchIndex,
) -> MergedView<'left, 'right> {
    todo!()
}
```

**When acceptable:**
- Single-letter lifetimes (`'a`) in short, private helper functions where the scope is obvious
- Trait implementations where the trait definition dictates the lifetime parameter names
- Closure or iterator adaptor chains where descriptive names would add noise to already dense generic bounds
