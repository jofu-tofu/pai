# Rust Dimensions

Structured knowledge lenses for Rust. Each dimension groups related rules with deep context for a specific concern.

## Dimensions

| ID | Dimension | File | Rules | Load When |
|----|-----------|------|-------|-----------|
| RS1 | Ownership & Borrowing | Ownership.md | 8 | Borrow checker issues, Clone abuse, Rc/Arc decisions, Cow usage, lifetime confusion |
| RS2 | Error Handling | ErrorHandling.md | 7 | Result/Option patterns, thiserror/anyhow, custom errors, ? operator, error propagation |
| RS3 | Concurrency & Async | Concurrency.md | 8 | async/await, Send/Sync bounds, tokio, channels, Mutex across await, deadlocks |
| RS4 | Performance | Performance.md | 8 | Allocations, iterators vs loops, benchmarking, profiling, zero-copy, cache layout |
| RS5 | Type System & Traits | TypeSystem.md | 8 | Traits, generics, newtype pattern, typestate, associated types, sealed traits, derives |
| RS6 | Unsafe Code | UnsafeCode.md | 6 | unsafe blocks, safety invariants, FFI, module boundaries, Miri, undefined behavior |
| RS7 | API Design | APIDesign.md | 8 | Naming conventions, From/Into, builder pattern, Display/Debug, #[non_exhaustive], docs |
| RS8 | Testing | Testing.md | 7 | Unit tests, integration tests, property testing, doc tests, fuzzing, mocking |
| RS9 | Memory & Lifetimes | MemoryLifetimes.md | 6 | Pin/Unpin, lifetime design, RAII, arenas, stack vs heap, memory leaks |
| RS10 | Project Structure | ProjectStructure.md | 7 | Workspaces, feature flags, modules, semver, re-exports, wildcard imports |

## Default

Load **Ownership & Borrowing (RS1)** and **Error Handling (RS2)** for any Rust task. Add task-specific dimensions on top.

## Overlap Notes

Some dimensions share conceptual territory. When both are relevant, load both:

- **RS1 + RS9**: RS1 owns borrowing/ownership transfer. RS9 owns lifetime annotation design and memory topology. Both load for borrow checker issues.
- **RS3 + RS9**: RS3 owns `Pin` in async contexts. RS9 owns `Pin` for general self-referential structs.
- **RS1 + RS3**: RS1 owns `Arc<T>` selection. RS3 owns `Arc<Mutex<T>>` async patterns.
- **RS5 + RS7**: RS5 owns internal type modeling (newtype, typestate). RS7 owns external-facing API contracts (naming, non_exhaustive).
