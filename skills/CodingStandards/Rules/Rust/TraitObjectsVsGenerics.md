### RS5.4 TraitObjectsVsGenerics

**Impact: HIGH (Choosing wrong dispatch mechanism costs either runtime performance or binary size)**

Static dispatch via generics (monomorphization) produces specialized machine code for each concrete type -- zero overhead at runtime but increased binary size. Dynamic dispatch via `dyn Trait` uses a vtable pointer -- single compiled function, smaller binary, but indirect call overhead and loss of inlining. Default to generics for performance-critical paths; use `dyn Trait` when you need heterogeneous collections, plugin architectures, or to reduce compile times on cold paths.

**Incorrect: Trait objects in a hot loop where static dispatch is free**

```rust
trait Processor {
    fn process(&self, value: f64) -> f64;
}

struct Doubler;
impl Processor for Doubler {
    fn process(&self, value: f64) -> f64 { value * 2.0 }
}

// Dynamic dispatch prevents inlining -- bad in a tight loop
fn process_batch(processor: &dyn Processor, data: &mut [f64]) {
    for v in data.iter_mut() {
        *v = processor.process(*v); // vtable call on every iteration
    }
}
```

**Correct: Generics allow inlining and vectorization**

```rust
trait Processor {
    fn process(&self, value: f64) -> f64;
}

struct Doubler;
impl Processor for Doubler {
    fn process(&self, value: f64) -> f64 { value * 2.0 }
}

// Static dispatch -- compiler can inline and vectorize
fn process_batch<P: Processor>(processor: &P, data: &mut [f64]) {
    for v in data.iter_mut() {
        *v = processor.process(*v); // direct call, inlineable
    }
}

// Use dyn Trait when you need heterogeneous collections
fn run_pipeline(steps: &[Box<dyn Processor>], value: f64) -> f64 {
    steps.iter().fold(value, |acc, step| step.process(acc))
}
```

**When acceptable:**
- Heterogeneous collections where elements have different concrete types (`Vec<Box<dyn Trait>>`)
- Plugin or extension systems where concrete types are not known at compile time
- Reducing compile times and binary size on non-performance-critical paths
- Recursive types that would be infinite without indirection (`Box<dyn Trait>` breaks the cycle)
