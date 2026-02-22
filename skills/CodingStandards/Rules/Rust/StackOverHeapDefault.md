### RS9.1 StackOverHeapDefault

**Impact: HIGH (Stack allocation avoids heap overhead and improves cache locality)**

Rust defaults to stack allocation, which is faster and requires no allocator interaction. Reserve `Box<T>` for cases that genuinely require indirection: recursive types, trait objects, and large buffers that would overflow the stack. Unnecessarily boxing small structs adds allocation cost and pointer chasing for zero benefit.

**Incorrect: Boxing small structs that fit on the stack**

```rust
// Pointless heap allocation for a 24-byte struct
struct Point3D {
    x: f64,
    y: f64,
    z: f64,
}

fn compute_centroid(points: &[Box<Point3D>]) -> Box<Point3D> {
    let mut sum = Box::new(Point3D { x: 0.0, y: 0.0, z: 0.0 });
    for p in points {
        sum.x += p.x;
        sum.y += p.y;
        sum.z += p.z;
    }
    let n = points.len() as f64;
    sum.x /= n;
    sum.y /= n;
    sum.z /= n;
    sum
}
```

**Correct: Stack-allocated structs with Box only where required**

```rust
struct Point3D {
    x: f64,
    y: f64,
    z: f64,
}

// Recursive type genuinely needs indirection
enum Expr {
    Literal(f64),
    Add(Box<Expr>, Box<Expr>),
    Mul(Box<Expr>, Box<Expr>),
}

fn compute_centroid(points: &[Point3D]) -> Point3D {
    let n = points.len() as f64;
    Point3D {
        x: points.iter().map(|p| p.x).sum::<f64>() / n,
        y: points.iter().map(|p| p.y).sum::<f64>() / n,
        z: points.iter().map(|p| p.z).sum::<f64>() / n,
    }
}
```

**When acceptable:**
- Recursive data structures (trees, linked lists, ASTs) where indirection is required by the type system
- Trait objects (`Box<dyn Trait>`) for dynamic dispatch
- Very large structs (>= several KB) that risk stack overflow, especially in deeply recursive call chains
- FFI boundaries where heap allocation is required by the C API contract
