### RS6.3 ModuleBoundarySafety

**Impact: HIGH (Module privacy is the mechanism that makes unsafe abstractions sound)**

When unsafe code relies on invariants (e.g., a pointer always being valid, an index always being in bounds), those invariants must be protected by module privacy. If a field that unsafe depends on is `pub`, any code anywhere can break the invariant and introduce undefined behavior without writing a single `unsafe` keyword.

**Incorrect: Public field exposes invariant unsafe depends on**

```rust
pub struct RingBuffer {
    pub buf: *mut u8,
    pub cap: usize,
    pub head: usize,  // must always be < cap
}

impl RingBuffer {
    pub fn peek(&self) -> u8 {
        // SAFETY: head < cap is required... but any caller can
        // set self.head = 9999 without unsafe.
        unsafe { *self.buf.add(self.head) }
    }
}

// Soundness broken from safe code:
let mut rb = RingBuffer { buf: ptr, cap: 16, head: 0 };
rb.head = 1000; // No unsafe needed, instant UB on next peek()
```

**Correct: Private fields protect the invariant**

```rust
pub struct RingBuffer {
    buf: *mut u8,
    cap: usize,
    head: usize, // invariant: head < cap, enforced by all methods
}

impl RingBuffer {
    pub fn new(cap: usize) -> Self {
        let layout = std::alloc::Layout::array::<u8>(cap).unwrap();
        // SAFETY: layout has non-zero size because cap > 0.
        let buf = unsafe { std::alloc::alloc(layout) };
        Self { buf, cap, head: 0 }
    }

    pub fn advance(&mut self) {
        self.head = (self.head + 1) % self.cap; // invariant preserved
    }

    pub fn peek(&self) -> u8 {
        // SAFETY: head < cap is maintained by advance() and new().
        // Fields are private, so no external code can violate this.
        unsafe { *self.buf.add(self.head) }
    }
}
```

**When acceptable:**
- The struct contains no unsafe code and the public fields carry no invariants
- The type is a plain data transfer object with no methods that depend on field relationships
