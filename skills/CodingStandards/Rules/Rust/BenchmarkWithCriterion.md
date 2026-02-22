### RS4.4 BenchmarkWithCriterion

**Impact: MEDIUM (criterion provides statistically rigorous benchmarks with warmup, outlier detection, and regression tracking that #[bench] lacks)**

The built-in `#[bench]` attribute is nightly-only and provides minimal statistical analysis. criterion.rs runs on stable Rust, uses configurable warmup periods, detects outliers, compares against previous runs, and generates HTML reports. Without `black_box()`, the optimizer may eliminate the computation you are trying to measure, producing misleadingly fast results.

**Incorrect: Nightly-only bench with no statistical rigor**

```rust
#![feature(test)]
extern crate test;
use test::Bencher;

#[bench]
fn bench_sort(b: &mut Bencher) {
    b.iter(|| {
        let mut v = vec![5, 3, 1, 4, 2];
        v.sort(); // optimizer may discard result entirely
    });
}
```

**Correct: criterion with black_box and proper setup**

```rust
// benches/sorting.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_sort(c: &mut Criterion) {
    c.bench_function("sort_small_vec", |b| {
        b.iter(|| {
            let mut v = black_box(vec![5, 3, 1, 4, 2]);
            v.sort();
            black_box(&v); // prevent dead-code elimination
        });
    });
}

criterion_group!(benches, bench_sort);
criterion_main!(benches);

// Cargo.toml
// [[bench]]
// name = "sorting"
// harness = false
//
// [dev-dependencies]
// criterion = { version = "0.5", features = ["html_reports"] }
```

**When acceptable:**
- Quick one-off timing during development where `std::time::Instant` suffices
- Benchmarks in nightly-only projects that already depend on unstable features
- Micro-benchmarks inside unit tests using `#[cfg(test)]` for smoke-check timing (not rigorous measurement)
