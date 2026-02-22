### RS1.1 PreferBorrowOverClone

**Impact: CRITICAL (Clone used to silence the borrow checker masks ownership design flaws and adds hidden allocations)**

Calling `.clone()` to make the borrow checker happy is the most common Rust anti-pattern. It converts a compile-time ownership error into a runtime performance penalty and hides the real question: who should own this data? Every clone is an allocation and a copy; in hot paths this compounds into measurable overhead. More importantly, gratuitous clones obscure the data-flow contract -- readers cannot tell whether the clone is structurally necessary or was added to "just make it compile."

**Incorrect: Cloning to satisfy the borrow checker**

```rust
// Clone hides the fact that process_name only needs a read view
fn process_name(name: String) {
    println!("Processing: {name}");
}

fn main() {
    let name = String::from("Alice");
    process_name(name.clone()); // unnecessary heap allocation
    process_name(name.clone()); // another unnecessary allocation
    println!("Original: {name}");
}

// Clone inside a loop compounds the cost
fn find_longest(items: &Vec<String>) -> String {
    let mut longest = String::new();
    for item in items {
        if item.len() > longest.len() {
            longest = item.clone(); // allocation on every improvement
        }
    }
    longest
}
```

**Correct: Borrow instead of cloning**

```rust
// Accept a reference -- no allocation needed
fn process_name(name: &str) {
    println!("Processing: {name}");
}

fn main() {
    let name = String::from("Alice");
    process_name(&name); // zero-cost borrow
    process_name(&name); // still zero-cost
    println!("Original: {name}");
}

// Return a reference tied to the input lifetime
fn find_longest<'a>(items: &'a [String]) -> &'a str {
    let mut longest: &str = "";
    for item in items {
        if item.len() > longest.len() {
            longest = item; // borrow, no allocation
        }
    }
    longest
}
```

**When acceptable:**
- Data must cross a thread boundary and the source cannot be moved (clone is the only safe option)
- Small Copy types (integers, booleans, small fixed-size structs) where clone is a bitwise copy
- Prototype or test code where allocation cost is irrelevant and clarity is prioritized
- The value is needed in a `'static` context and no borrowed alternative exists
