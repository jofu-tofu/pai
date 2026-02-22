### RS6.2 DocumentSafetyInvariants

**Impact: CRITICAL (Undocumented unsafe is a latent soundness hole that no reviewer can verify)**

Every `unsafe` block must have a `// SAFETY:` comment explaining why the operation is sound at that exact call site. Every `unsafe fn` must document the preconditions callers must uphold in a `# Safety` doc section. Without these comments, future maintainers cannot verify correctness during refactors.

**Incorrect: Bare unsafe with no justification**

```rust
pub unsafe fn transmute_slice(data: &[u8]) -> &[u32] {
    // No documentation of alignment, length, or lifetime requirements
    std::slice::from_raw_parts(
        data.as_ptr() as *const u32,
        data.len() / 4,
    )
}

fn process(buffer: &[u8]) {
    // Why is this safe? Nobody knows.
    let values = unsafe { transmute_slice(buffer) };
    println!("{:?}", values);
}
```

**Correct: Thorough SAFETY comments and doc preconditions**

```rust
/// Reinterprets a byte slice as a slice of `u32` values.
///
/// # Safety
/// - `data.as_ptr()` must be aligned to `align_of::<u32>()` (4 bytes).
/// - `data.len()` must be a multiple of `size_of::<u32>()` (4 bytes).
/// - The byte content must represent valid `u32` values for the
///   target endianness.
pub unsafe fn transmute_slice(data: &[u8]) -> &[u32] {
    // SAFETY: caller guarantees alignment and length divisibility.
    // Lifetime of returned slice is tied to `data` by the borrow.
    std::slice::from_raw_parts(
        data.as_ptr() as *const u32,
        data.len() / 4,
    )
}

fn process(buffer: &AlignedBuffer) {
    assert!(buffer.as_bytes().len() % 4 == 0);
    // SAFETY: AlignedBuffer guarantees 4-byte alignment (see its
    // constructor), and we verified length divisibility above.
    let values = unsafe { transmute_slice(buffer.as_bytes()) };
    println!("{:?}", values);
}
```

**When acceptable:**
- Trivially obvious operations where the safety comment would be pure tautology (extremely rare; when in doubt, write the comment)
- Generated code from trusted tools like `bindgen` where the safety contract is documented at the generation layer
