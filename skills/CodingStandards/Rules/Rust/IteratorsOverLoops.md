### RS4.1 IteratorsOverLoops

**Impact: HIGH (Iterator chains compile to equivalent or better machine code than manual loops while being more readable and less error-prone)**

Rust's iterator adaptors are zero-cost abstractions. The compiler inlines and optimizes iterator chains into the same LLVM IR as hand-written index loops -- and often produces better code because bounds checks are elided. Manual index loops introduce opportunities for off-by-one errors, unchecked indexing, and obscure intent behind loop mechanics.

**Incorrect: Manual index loop with bounds tracking**

```rust
fn sum_of_squares_of_evens(data: &[i32]) -> i64 {
    let mut result: i64 = 0;
    for i in 0..data.len() {
        if data[i] % 2 == 0 {
            result += (data[i] as i64) * (data[i] as i64);
        }
    }
    result
}

fn find_first_negative(values: &[f64]) -> Option<f64> {
    for i in 0..values.len() {
        if values[i] < 0.0 {
            return Some(values[i]);
        }
    }
    None
}
```

**Correct: Iterator chains express intent directly**

```rust
fn sum_of_squares_of_evens(data: &[i32]) -> i64 {
    data.iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| (x as i64) * (x as i64))
        .sum()
}

fn find_first_negative(values: &[f64]) -> Option<f64> {
    values.iter().copied().find(|&v| v < 0.0)
}
```

**When acceptable:**
- Mutating multiple elements in-place where the borrow checker makes iterator-based mutation awkward
- Complex loop bodies with multiple break/continue conditions and mutable state that does not map cleanly to fold or scan
- Interfacing with C-style APIs that require raw pointer arithmetic within the loop body
