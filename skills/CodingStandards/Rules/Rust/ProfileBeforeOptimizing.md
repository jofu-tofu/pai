### RS4.7 ProfileBeforeOptimizing

**Impact: MEDIUM (Optimizing without profiling wastes effort on cold code paths; cargo flamegraph and DHAT identify the actual bottlenecks in minutes)**

Developer intuition about where time is spent is wrong more often than it is right. Optimizing code that accounts for 2% of runtime while ignoring the function that accounts for 60% is a common failure mode. Profiling tools like cargo-flamegraph, perf, and DHAT provide empirical evidence of where CPU time and allocations actually go. Always profile in release mode with debug symbols enabled -- debug builds have fundamentally different performance characteristics.

**Incorrect: Guessing at bottlenecks without measurement**

```rust
// "This loop looks slow, let me optimize it with unsafe"
fn process(data: &[u8]) -> u64 {
    let mut sum: u64 = 0;
    // Switched to unsafe indexing "for performance" -- but this function
    // is called once at startup and accounts for 0.1% of total runtime
    unsafe {
        for i in 0..data.len() {
            sum += *data.get_unchecked(i) as u64;
        }
    }
    sum
}

// Cargo.toml -- default release profile, no debug symbols
// [profile.release]
// (empty)
```

**Correct: Profile first, then optimize the proven bottleneck**

```rust
// Cargo.toml -- enable debug symbols in release for profiling
// [profile.release]
// debug = true
//
// [profile.profiling]
// inherits = "release"
// debug = true
// strip = false

// Step 1: cargo flamegraph --release -- <args>
// Step 2: identify that `parse_records` is 58% of runtime
// Step 3: optimize parse_records specifically

fn parse_records(data: &[u8]) -> Vec<Record> {
    // Optimization justified by flamegraph evidence:
    // - preallocate based on estimated record count
    // - use memchr for fast delimiter scanning
    let estimated = data.len() / AVG_RECORD_SIZE;
    let mut records = Vec::with_capacity(estimated);
    // ... optimized parsing logic ...
    records
}
```

**When acceptable:**
- Applying well-known zero-cost improvements (using iterators, preallocating known-size collections) that have no readability cost
- Performance-critical libraries where benchmarks are part of the CI pipeline and regressions are caught automatically
- When the profiling infrastructure itself is being set up for the first time
