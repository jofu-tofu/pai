### RS8.5 DocTestsAsExamples

**Impact: MEDIUM (Doc examples that compile and run guarantee documentation never drifts from actual behavior)**

Rust's `///` doc comments with code blocks are compiled and executed by `cargo test --doc`. This turns every example in your API documentation into a living test. When the API changes and the example breaks, the test suite fails immediately, preventing stale documentation.

**Incorrect: Documentation with no runnable example**

```rust
/// Parses a duration string into seconds.
///
/// Supports formats like "5s", "3m", "2h".
/// Returns None if the format is invalid.
pub fn parse_duration(input: &str) -> Option<u64> {
    // ...
}
// No example -- users must guess the API;
// nothing verifies the documentation is correct.
```

**Correct: Doc comment with tested example**

```rust
/// Parses a duration string into seconds.
///
/// Supports formats like `"5s"`, `"3m"`, `"2h"`.
/// Returns `None` if the format is invalid.
///
/// # Examples
///
/// ```
/// use my_crate::parse_duration;
///
/// assert_eq!(parse_duration("5s"), Some(5));
/// assert_eq!(parse_duration("3m"), Some(180));
/// assert_eq!(parse_duration("2h"), Some(7200));
/// assert_eq!(parse_duration("bad"), None);
/// ```
pub fn parse_duration(input: &str) -> Option<u64> {
    // ...
}
```

**When acceptable:**
- Private functions or internal helpers that are not part of the public API
- Functions whose usage requires complex setup (database, network) where a doc test would be misleading -- use `no_run` or `ignore` annotations with a comment explaining why
- Trait implementations where the trait-level docs already provide examples
