### RS7.4 TypesOverBooleans

**Impact: MEDIUM (Eliminates ambiguous boolean parameters and makes call sites self-documenting)**

Boolean parameters force readers to look up the function signature to understand what `true` and `false` mean at each call site. An enum with named variants communicates intent directly. Enums also prevent the silent swap of two booleans in adjacent parameter positions and make it easy to add a third option later without a breaking API change.

**Incorrect: Boolean parameters with opaque meaning at call sites**

```rust
fn draw_line(
    start: (f64, f64),
    end: (f64, f64),
    dashed: bool,
    arrow_head: bool,
) {
    // ...
}

// What do true, false mean here? Reader must check the signature.
draw_line((0.0, 0.0), (10.0, 10.0), true, false);

// Easy to accidentally swap the two booleans -- still compiles
draw_line((0.0, 0.0), (10.0, 10.0), false, true);
```

**Correct: Enums make every call site readable**

```rust
#[derive(Debug, Clone, Copy)]
pub enum LineStyle {
    Solid,
    Dashed,
}

#[derive(Debug, Clone, Copy)]
pub enum ArrowHead {
    None,
    Forward,
    Both, // easy to add a third variant later
}

fn draw_line(
    start: (f64, f64),
    end: (f64, f64),
    style: LineStyle,
    arrow: ArrowHead,
) {
    // ...
}

// Self-documenting -- no ambiguity at the call site
draw_line((0.0, 0.0), (10.0, 10.0), LineStyle::Dashed, ArrowHead::None);
```

**When acceptable:**
- Single boolean parameter with an unambiguous name like `enabled` or `recursive`
- Private helper functions where the call site is immediately adjacent and obvious
- Feature flags or toggles where the boolean semantics are universally understood (e.g., `verbose: bool`)
