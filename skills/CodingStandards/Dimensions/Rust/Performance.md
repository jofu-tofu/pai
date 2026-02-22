# Performance -- Rust

> Write code that is fast by default through zero-cost abstractions and allocation awareness, and prove it is fast through measurement.

## Mental Model

Rust's performance story rests on three pillars: zero-cost abstractions, allocation awareness, and a profiling-first culture.

**Zero-cost abstractions** are the foundation. Iterators, trait dispatch, closures, and ownership transfers compile down to the same machine code as hand-written C loops. This means that idiomatic, readable Rust is already fast Rust. The temptation to "optimize" by dropping to raw index loops, unsafe pointer arithmetic, or manual memory management is almost always counterproductive -- it sacrifices readability and safety for performance gains that do not exist. The compiler's optimizer sees through iterator chains, inlines closures, and elides bounds checks when it can prove they are unnecessary. Writing idiomatic code is not a performance compromise; it is the performance strategy.

**Allocation awareness** is the second pillar. In garbage-collected languages, allocations are invisible -- you create objects and the runtime handles the rest. In Rust, every `String`, `Vec`, `Box`, and `HashMap` is an explicit trip to the global allocator. This visibility is a superpower: you can see exactly where heap allocations happen and decide whether they are necessary. The key patterns are: accept borrowed types (`&str`, `&[T]`) instead of owned types (`String`, `Vec<T>`) when you only need to read; preallocate collections when the size is known; use small-buffer optimization (`SmallVec`, `SmallString`) when most instances are small; and avoid materializing intermediate collections in iterator pipelines. The caller-control principle -- letting the caller decide whether to allocate -- is the API design corollary.

**Profiling-first culture** is the third pillar. Even with zero-cost abstractions and allocation awareness, real performance work requires empirical measurement. Developer intuition about bottlenecks is unreliable. A function that "looks slow" may account for 0.1% of runtime, while the actual bottleneck hides in an innocent-looking loop. Cargo-flamegraph, perf, DHAT, and criterion.rs provide the tools to measure where time and memory are actually spent. The rule is simple: profile in release mode with debug symbols, identify the hot path, optimize only that path, and benchmark to confirm the improvement. Optimizing without measurement is guessing.

Data layout completes the picture. Modern CPUs are cache-line machines: accessing contiguous memory is fast, chasing pointers is slow. When a tight loop touches only one field of a struct, storing all instances of that field contiguously (Struct-of-Arrays) can reduce cache misses by an order of magnitude compared to the default Array-of-Structs layout. This is not a universal transformation -- it trades API ergonomics for cache performance -- but in hot loops over large collections, it is often the single largest optimization available.

## Consumer Guide

### When Reviewing Code

Look for these performance signals: `.clone()` calls in hot paths (covered by the Ownership dimension but relevant here), `.collect()` calls that create intermediate Vec values only to be iterated again, functions that accept `String` or `Vec<T>` when they only read the data, empty `Vec::new()` followed by a loop of known iteration count, `#[bench]` on nightly instead of criterion, and `unsafe` blocks justified by "performance" without accompanying benchmark evidence. Each of these is a location where performance is being left on the table or, worse, where readability and safety are being sacrificed for imaginary gains.

### When Designing / Planning

Decide early whether a data structure will be in a hot path. If it will be iterated thousands of times per frame or per request, plan the data layout (SoA vs AoS) at design time -- retrofitting is expensive. Design function signatures to accept borrowed types by default; this is an API decision that is hard to change later without breaking callers. Plan the benchmarking strategy alongside the feature: which operations will be benchmarked, what are the acceptable latency targets, and how will regressions be detected in CI.

### When Implementing

Use iterators as the default loop construct. Preallocate with `with_capacity` when the size is known. Accept `&str` and `&[T]` in function parameters. Chain iterator adaptors lazily and call a single terminal operation. When serialization or deserialization is on the hot path, use `#[serde(borrow)]` or zerocopy to avoid per-field allocations. Set up criterion benchmarks for any function whose performance matters, and use `black_box` to prevent dead-code elimination. Profile with cargo-flamegraph before reaching for unsafe or exotic optimizations.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [IteratorsOverLoops](../../Rules/Rust/IteratorsOverLoops.md) | HIGH | Prefer iterator chains over manual index loops for equivalent or better compiled output |
| [PreallocateCollections](../../Rules/Rust/PreallocateCollections.md) | HIGH | Use Vec::with_capacity when the collection size is known or estimable |
| [AvoidUnnecessaryAllocations](../../Rules/Rust/AvoidUnnecessaryAllocations.md) | HIGH | Accept &str over String, use SmallVec for small collections, let callers control allocation |
| [BenchmarkWithCriterion](../../Rules/Rust/BenchmarkWithCriterion.md) | MEDIUM | Use criterion.rs with black_box for statistically rigorous benchmarks on stable Rust |
| [CacheFriendlyDataLayouts](../../Rules/Rust/CacheFriendlyDataLayouts.md) | MEDIUM | Use Struct-of-Arrays over Array-of-Structs for hot loops that touch few fields |
| [CollectLazilyConsumeEagerly](../../Rules/Rust/CollectLazilyConsumeEagerly.md) | HIGH | Chain iterators lazily without intermediate .collect() calls |
| [ProfileBeforeOptimizing](../../Rules/Rust/ProfileBeforeOptimizing.md) | MEDIUM | Use cargo flamegraph and DHAT to identify real bottlenecks before optimizing |
| [ZeroCopyDeserialization](../../Rules/Rust/ZeroCopyDeserialization.md) | MEDIUM | Use serde borrow, zerocopy, or rkyv to avoid per-field allocations in deserialization |

## Rule Interactions

**IteratorsOverLoops + CollectLazilyConsumeEagerly**: These rules form a pipeline. IteratorsOverLoops establishes that iterator chains are the default loop construct; CollectLazilyConsumeEagerly ensures those chains remain lazy until the final terminal operation. Together they produce single-pass, zero-intermediate-allocation pipelines.

**AvoidUnnecessaryAllocations + PreallocateCollections**: Complementary allocation strategies. AvoidUnnecessaryAllocations eliminates allocations that should not happen at all (borrowing instead of owning). PreallocateCollections optimizes the allocations that must happen by doing them once upfront instead of incrementally.

**ProfileBeforeOptimizing + BenchmarkWithCriterion**: ProfileBeforeOptimizing identifies where to optimize; BenchmarkWithCriterion measures whether the optimization worked. Profiling without benchmarking leaves improvements unverified; benchmarking without profiling risks optimizing the wrong code.

**CacheFriendlyDataLayouts + IteratorsOverLoops**: SoA layouts pay off when iteration is tight and touches few fields. Iterator chains over SoA Vecs with zip produce the cache-optimal access pattern that makes the layout transformation worthwhile.

## Anti-Patterns (Severity Calibration)

### HIGH

- **Intermediate .collect() in iterator chains**: Each collect allocates and fills a Vec that is immediately iterated again. In hot paths, this can double or triple allocation pressure for zero semantic benefit.
- **Functions accepting String/Vec when they only read**: Forces every caller to allocate or clone, even when they already have a borrowed view. This is an API-level performance bug that propagates to all call sites.
- **Growing a Vec from empty when the size is known**: Each geometric reallocation copies the entire buffer. For a million-element Vec, this means ~20 full-buffer copies instead of zero.

### MEDIUM

- **Array-of-Structs in tight numerical loops**: When a loop touches 8 bytes of a 200-byte struct, 96% of every cache line is wasted. The effect is measurable at ~1000 elements and dominant at ~100,000.
- **Using unsafe for "performance" without benchmark evidence**: Unsafe code that is not proven faster by measurement is pure risk with no reward. The compiler's optimizer handles the common cases.
- **Benchmarking in debug mode**: Debug builds disable optimizations, inline nothing, and include overflow checks. Performance measurements in debug mode are meaningless for production behavior.

### LOW

- **Not using black_box in benchmarks**: The optimizer may eliminate the computation under test, producing misleadingly fast results. The benchmark passes but measures nothing.
- **Missing debug symbols in release profile for profiling**: Flamegraphs without debug symbols show mangled or missing function names, making the profile unreadable.

## Does Not Cover

- **Async runtime tuning** (tokio worker threads, task budgeting) -- this dimension covers synchronous computation performance, not async scheduling.
- **SIMD intrinsics and explicit vectorization** -- a specialized topic that builds on top of the data layout and profiling foundations here.
- **Unsafe performance tricks** (unchecked indexing, transmute) -- the Ownership and Safety dimensions govern when unsafe is acceptable; this dimension focuses on safe performance.
- **Compile-time performance** (build times, incremental compilation) -- a separate concern from runtime performance.
- **Database query optimization and I/O tuning** -- external system performance is outside the scope of language-level coding standards.

## Sources

- The Rust Book, Chapter 13.4: Comparing Performance -- Loops vs. Iterators
- Effective Rust, Item 9: Consider using iterator transforms instead of explicit loops
- Effective Rust, Item 20: Optimize only when necessary, measure before and after
- Rust API Guidelines, C-CALLER-CONTROL: Functions minimize assumptions about parameters
- Clippy lint documentation: uninlined_format_args, manual_memcpy, needless_collect
- Criterion.rs documentation: benchmarking methodology, black_box, HTML reports
- cargo-flamegraph documentation: profiling Rust applications with perf and dtrace
- Data-Oriented Design in Rust: SoA vs AoS patterns and cache performance
- serde documentation: zero-copy deserialization with lifetimes and #[serde(borrow)]
- zerocopy crate documentation: safe transmutation and zero-copy parsing
