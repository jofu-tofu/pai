### RS4.6 CollectLazilyConsumeEagerly

**Impact: HIGH (Each .collect() materializes an entire intermediate Vec; chaining iterators lazily fuses operations into a single pass with zero intermediate allocations)**

Rust iterators are lazy -- adaptors like `map`, `filter`, and `flat_map` build a pipeline that executes only when a terminal operation (`collect`, `sum`, `for_each`, `count`) consumes it. Calling `.collect()` between pipeline stages forces a full materialization of the intermediate result, allocating a Vec that exists only to be iterated again. Keep the chain lazy until the final terminal.

**Incorrect: Collecting intermediate results**

```rust
fn active_user_emails(users: &[User]) -> Vec<String> {
    let active: Vec<&User> = users.iter()
        .filter(|u| u.is_active)
        .collect(); // unnecessary Vec<&User> allocation

    let emails: Vec<String> = active.iter()
        .map(|u| u.email.clone())
        .collect(); // final collection

    emails
}

fn total_line_count(files: &[String]) -> usize {
    let all_lines: Vec<&str> = files.iter()
        .flat_map(|f| f.lines())
        .collect(); // allocates a Vec just to count it
    all_lines.len()
}
```

**Correct: Single lazy chain with one terminal operation**

```rust
fn active_user_emails(users: &[User]) -> Vec<String> {
    users.iter()
        .filter(|u| u.is_active)
        .map(|u| u.email.clone())
        .collect() // single allocation for the final result
}

fn total_line_count(files: &[String]) -> usize {
    files.iter()
        .flat_map(|f| f.lines())
        .count() // no allocation at all
}
```

**When acceptable:**
- You need to iterate the intermediate collection multiple times (lazy iterators are single-pass)
- Debugging requires inspecting intermediate results during development
- The intermediate Vec is passed to a function that requires a slice and cannot accept an iterator
