### RS4.3 AvoidUnnecessaryAllocations

**Impact: HIGH (Accepting &str instead of String avoids forcing callers to allocate; SmallVec eliminates heap allocation for small collections)**

Every heap allocation involves a call to the global allocator, which is orders of magnitude slower than stack access. Functions that accept owned types when they only need to read force callers to clone or allocate unnecessarily. The caller-control principle says: let the caller decide whether to allocate; the callee should accept the most general borrowed form.

**Incorrect: Requiring ownership when only reading**

```rust
fn greet(name: String) {
    println!("Hello, {name}!");
}

fn contains_keyword(words: Vec<String>, keyword: String) -> bool {
    words.iter().any(|w| w == &keyword)
}

fn main() {
    let name = String::from("Alice");
    greet(name.clone()); // forced allocation just to say hello
    greet(name);         // moves, cannot reuse

    let words = vec!["foo".into(), "bar".into()];
    contains_keyword(words, "foo".into()); // two unnecessary allocations
}
```

**Correct: Borrow when possible, use small-buffer optimization**

```rust
fn greet(name: &str) {
    println!("Hello, {name}!");
}

fn contains_keyword(words: &[String], keyword: &str) -> bool {
    words.iter().any(|w| w == keyword)
}

// SmallVec for collections that are usually small
use smallvec::SmallVec;

fn gather_errors(input: &[&str]) -> SmallVec<[String; 4]> {
    let mut errors = SmallVec::new(); // stack-allocated for <= 4 items
    for &item in input {
        if item.is_empty() {
            errors.push("empty item found".into());
        }
    }
    errors
}
```

**When acceptable:**
- The function genuinely needs to store the value beyond the call (inserting into a HashMap, sending to another thread)
- Using Cow<str> when the function sometimes needs to mutate and sometimes does not
- Builder patterns where the API is designed around owned values for ergonomic chaining
