### RS6.1 MinimizeUnsafeScope

**Impact: CRITICAL (Limits the surface area where undefined behavior can hide)**

Unsafe blocks should be as small as possible, wrapping only the single operation that actually requires unsafe. A safe public API that internally uses a minimal unsafe block lets callers rely on the type system while concentrating the proof obligation in one auditable location.

**Incorrect: Entire function marked unsafe**

```rust
// The entire function is unsafe, but only one line needs it.
// Callers must now reason about safety for every call site.
unsafe fn get_value(ptr: *const u32, offset: usize) -> u32 {
    let base = ptr.add(offset);
    let value = *base;
    // 20 more lines of safe arithmetic and formatting...
    let scaled = value * 100;
    let clamped = scaled.min(10_000);
    clamped
}

// Every caller is forced into an unsafe block
let result = unsafe { get_value(ptr, 5) };
```

**Correct: Minimal unsafe block behind a safe API**

```rust
/// Returns the value at `offset` elements from `ptr`.
///
/// # Safety handled internally
/// The raw pointer dereference is contained in a minimal unsafe block.
/// Public callers use the safe `SafeBuffer` API.
pub struct SafeBuffer {
    ptr: *const u32,
    len: usize,
}

impl SafeBuffer {
    pub fn get(&self, offset: usize) -> Option<u32> {
        if offset >= self.len {
            return None;
        }
        // SAFETY: bounds check above guarantees offset < len,
        // and ptr is valid for len elements (enforced by constructor).
        let value = unsafe { *self.ptr.add(offset) };
        let scaled = value * 100;
        let clamped = scaled.min(10_000);
        Some(clamped)
    }
}
```

**When acceptable:**
- Implementing a low-level primitive where the entire function body is inherently unsafe (e.g., a custom allocator's `alloc` method)
- Marking a function `unsafe` because callers must uphold invariants that cannot be checked at runtime (e.g., `from_raw_parts`)
