### RS1.6 CowForConditionalOwnership

**Impact: MEDIUM (Cow eliminates unnecessary allocations when a function may or may not need to modify borrowed data)**

`Cow<'a, T>` (Clone on Write) defers allocation until mutation is actually needed. Functions that sometimes return input unchanged and sometimes return a modified copy benefit from `Cow` because the common path avoids allocation entirely. Without `Cow`, developers either always clone (wasteful) or return an enum they invent themselves (reinventing `Cow` poorly). The standard library type communicates the intent clearly and integrates with `Deref` for transparent read access.

**Incorrect: Always cloning or using ad-hoc enums**

```rust
// Always allocates, even when no transformation is needed
fn normalize_path(path: &str) -> String {
    if path.contains("//") {
        path.replace("//", "/")     // allocation needed
    } else {
        path.to_owned()             // unnecessary allocation
    }
}

// Ad-hoc enum reinventing Cow
enum MaybeOwned<'a> {
    Borrowed(&'a str),
    Owned(String),
}

fn normalize_path_v2(path: &str) -> MaybeOwned<'_> {
    if path.contains("//") {
        MaybeOwned::Owned(path.replace("//", "/"))
    } else {
        MaybeOwned::Borrowed(path)
    }
}
```

**Correct: Use Cow for conditional ownership**

```rust
use std::borrow::Cow;

// Zero allocation on the common path (no double slashes)
fn normalize_path(path: &str) -> Cow<'_, str> {
    if path.contains("//") {
        Cow::Owned(path.replace("//", "/"))  // allocate only when needed
    } else {
        Cow::Borrowed(path)                  // zero-cost borrow
    }
}

fn main() {
    let clean = normalize_path("/usr/local/bin");    // Cow::Borrowed, no alloc
    let fixed = normalize_path("/usr//local//bin");  // Cow::Owned, one alloc

    // Both variants deref transparently to &str
    println!("clean: {clean}");
    println!("fixed: {fixed}");
}
```

**When acceptable:**
- The function always modifies the input -- returning `String` (or `Vec<T>`) directly is simpler and more honest
- The optimization is in a cold path where the allocation savings are negligible and `Cow` adds cognitive overhead
- The borrowed lifetime would propagate uncomfortably through the call stack, making `String` the pragmatic choice
