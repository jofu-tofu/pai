### RS5.6 PhantomDataForTypeConstraints

**Impact: MEDIUM (PhantomData lets you use type parameters without storing data, enabling zero-cost type-level distinctions)**

When a struct has a generic type parameter that does not correspond to any stored field, Rust requires `PhantomData<T>` to tell the compiler how the type parameter relates to the struct. This enables patterns like units of measurement, tagged IDs, and typestate markers where the type parameter exists solely for compile-time safety -- it occupies zero bytes at runtime.

**Incorrect: Storing unnecessary data or ignoring type safety**

```rust
// No type-level distinction between meters and seconds
struct Measurement {
    value: f64,
    // unit: String, // runtime check -- forgettable and allocates
}

fn add_measurements(a: Measurement, b: Measurement) -> Measurement {
    // Nothing prevents adding meters to seconds
    Measurement { value: a.value + b.value }
}

fn main() {
    let distance = Measurement { value: 100.0 };
    let time = Measurement { value: 9.58 };
    let nonsense = add_measurements(distance, time); // compiles, meaningless
}
```

**Correct: PhantomData encodes units at zero cost**

```rust
use std::marker::PhantomData;
use std::ops::Add;

struct Meters;
struct Seconds;

struct Measurement<Unit> {
    value: f64,
    _unit: PhantomData<Unit>,
}

impl<Unit> Measurement<Unit> {
    fn new(value: f64) -> Self {
        Measurement { value, _unit: PhantomData }
    }
}

impl<Unit> Add for Measurement<Unit> {
    type Output = Self;
    fn add(self, rhs: Self) -> Self {
        Measurement::new(self.value + rhs.value)
    }
}

fn main() {
    let d1 = Measurement::<Meters>::new(100.0);
    let d2 = Measurement::<Meters>::new(50.0);
    let _total = d1 + d2; // OK -- same units
    // let t = Measurement::<Seconds>::new(9.58);
    // let _ = d1 + t; // compile error: Meters != Seconds
}
```

**When acceptable:**
- The struct only has one meaningful interpretation and adding a phantom type parameter would be over-engineering
- The generic is used only in a single internal location where the type distinction provides no safety benefit
- You are working with FFI types where phantom data may confuse layout expectations
