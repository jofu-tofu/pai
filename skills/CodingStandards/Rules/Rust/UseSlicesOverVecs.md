### RS1.2 UseSlicesOverVecs

**Impact: HIGH (Accepting &Vec<T> or &String restricts callers unnecessarily and signals misunderstanding of Rust's borrowing model)**

Functions that accept `&Vec<T>` instead of `&[T]`, or `&String` instead of `&str`, force callers to allocate a heap container even when they already have data in a different form (array, slice, string literal). Accepting the borrowed slice type makes the API generic over all contiguous storage and communicates that the function only reads the data without caring about its container.

**Incorrect: Accepting owned container references**

```rust
// Forces caller to have a Vec, even if they have an array or slice
fn sum_values(values: &Vec<i32>) -> i32 {
    values.iter().sum()
}

// Forces caller to have a String, even for string literals
fn greet(name: &String) {
    println!("Hello, {name}!");
}

fn main() {
    let arr = [1, 2, 3, 4, 5];
    // Caller must allocate a Vec just to call sum_values
    let v = arr.to_vec();
    let total = sum_values(&v);

    // Caller must allocate a String just to call greet
    let name = String::from("Alice");
    greet(&name);
    // greet(&"Alice".to_string()); // forced allocation for a literal
}
```

**Correct: Accepting slices and string slices**

```rust
// Accepts any contiguous i32 data: &[i32], &Vec<i32>, &[i32; N]
fn sum_values(values: &[i32]) -> i32 {
    values.iter().sum()
}

// Accepts &str, &String (via Deref), and string literals
fn greet(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let arr = [1, 2, 3, 4, 5];
    let total = sum_values(&arr); // no allocation needed

    greet("Alice");               // string literal, zero allocation
    let name = String::from("Bob");
    greet(&name);                 // String auto-derefs to &str
}
```

**When acceptable:**
- The function needs to inspect `Vec`-specific metadata like `capacity()` that slices do not expose
- The function will call `Vec`-mutating methods (push, pop, truncate) on a `&mut Vec<T>`
- FFI boundaries where the exact container type is part of the ABI contract
