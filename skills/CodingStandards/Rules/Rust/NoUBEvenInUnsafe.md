### RS6.6 NoUBEvenInUnsafe

**Impact: CRITICAL (Undefined behavior invalidates all compiler reasoning and can corrupt arbitrary memory)**

The `unsafe` keyword lifts the compiler's ability to check certain invariants -- it does not lift the requirement to uphold them. Data races, dangling references, invalid aliasing (`&mut` aliasing `&`), and uninitialized reads are UB regardless of whether the code is inside an `unsafe` block. Use `cargo miri test` to detect UB at runtime during testing.

**Incorrect: Aliased mutable references -- instant UB**

```rust
fn split_first_mut(slice: &mut [u32]) -> (&mut u32, &mut [u32]) {
    let ptr = slice.as_mut_ptr();
    unsafe {
        // BUG: first and rest can alias the same memory if len == 1.
        // Even in unsafe, &mut aliasing &mut is undefined behavior.
        let first = &mut *ptr;
        let rest = std::slice::from_raw_parts_mut(ptr, slice.len());
        (first, rest)
    }
}
// cargo miri test catches:
// error: Undefined Behavior: not granting access to tag <1234>
//        because that would remove [SharedReadOnly] on <5678>
```

**Correct: Non-overlapping splits with provenance respected**

```rust
fn split_first_mut(slice: &mut [u32]) -> Option<(&mut u32, &mut [u32])> {
    if slice.is_empty() {
        return None;
    }
    let ptr = slice.as_mut_ptr();
    let len = slice.len();
    unsafe {
        // SAFETY: ptr is valid for len elements. We split into
        // [0..1) and [1..len), which never overlap.
        let first = &mut *ptr;
        let rest = std::slice::from_raw_parts_mut(
            ptr.add(1),
            len - 1,
        );
        Some((first, rest))
    }
}
// cargo miri test passes -- no aliasing violations.
```

**When acceptable:**
- There are no acceptable exceptions. Undefined behavior is never permitted, even inside `unsafe` blocks. If Miri reports a violation, the code must be fixed.
