### RS4.2 PreallocateCollections

**Impact: HIGH (Vec::with_capacity avoids repeated reallocations that each copy the entire buffer, turning O(n) amortized into O(1) per push)**

When you know the final size of a collection -- or a reasonable upper bound -- preallocating eliminates the geometric reallocation strategy that Vec, HashMap, and String use internally. Each reallocation copies all existing elements to a new, larger buffer. For large collections built in loops, this means multiple full-buffer copies that are entirely avoidable.

**Incorrect: Growing from empty with repeated reallocations**

```rust
fn build_lookup(names: &[String]) -> Vec<String> {
    let mut result = Vec::new(); // capacity 0, will reallocate ~log2(n) times
    for name in names {
        result.push(name.to_uppercase());
    }
    result
}

fn read_all_lines(path: &std::path::Path) -> std::io::Result<String> {
    let mut output = String::new(); // unknown capacity
    let content = std::fs::read_to_string(path)?;
    for line in content.lines() {
        output.push_str(line);
        output.push('\n');
    }
    Ok(output)
}
```

**Correct: Preallocate when size is known or estimable**

```rust
fn build_lookup(names: &[String]) -> Vec<String> {
    let mut result = Vec::with_capacity(names.len());
    for name in names {
        result.push(name.to_uppercase());
    }
    result
}

fn read_all_lines(path: &std::path::Path) -> std::io::Result<String> {
    let content = std::fs::read_to_string(path)?;
    let mut output = String::with_capacity(content.len());
    for line in content.lines() {
        output.push_str(line);
        output.push('\n');
    }
    Ok(output)
}
```

**When acceptable:**
- Collection size is truly unknown and no reasonable upper bound exists
- The collection is small (fewer than ~16 elements) where the default capacity strategy is sufficient
- Building a collection lazily from an async stream where the total count is not available upfront
