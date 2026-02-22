### RS7.6 NonExhaustiveForEvolution

**Impact: MEDIUM (Prevents semver-breaking changes when adding enum variants or struct fields)**

Adding a variant to a public enum or a field to a public struct is a breaking change in Rust because downstream code may have exhaustive match arms or struct literals. Marking public enums and structs with `#[non_exhaustive]` forces downstream users to include a wildcard arm in match and prevents them from constructing the struct directly, preserving your ability to evolve the API in minor versions.

**Incorrect: Public enum without non_exhaustive -- adding a variant is a semver break**

```rust
// crate: my_lib v1.0
pub enum DatabaseError {
    ConnectionFailed,
    QueryFailed,
}

// downstream code -- exhaustive match
fn handle(err: my_lib::DatabaseError) {
    match err {
        DatabaseError::ConnectionFailed => retry(),
        DatabaseError::QueryFailed => report(),
        // Adding Timeout in v1.1 breaks this match
    }
}
```

**Correct: non_exhaustive preserves semver compatibility**

```rust
// crate: my_lib v1.0
#[non_exhaustive]
#[derive(Debug)]
pub enum DatabaseError {
    ConnectionFailed,
    QueryFailed,
}

// downstream code -- wildcard required by non_exhaustive
fn handle(err: my_lib::DatabaseError) {
    match err {
        DatabaseError::ConnectionFailed => retry(),
        DatabaseError::QueryFailed => report(),
        _ => log_unknown(err), // required, handles future variants
    }
}

// v1.1 safely adds Timeout -- no downstream breakage
#[non_exhaustive]
#[derive(Debug)]
pub enum DatabaseError {
    ConnectionFailed,
    QueryFailed,
    Timeout,
}
```

**When acceptable:**
- Enums that are genuinely closed and will never gain variants (e.g., `enum Ordering { Less, Equal, Greater }`)
- Internal types not exposed in the public API (`pub(crate)` enums and structs)
- Types in binary crates (applications) that have no downstream consumers
