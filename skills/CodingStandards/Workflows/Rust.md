# Rust Workflow

> **Trigger:** File signals: `.rs`, `Cargo.toml`, `Cargo.lock`, `build.rs`, `.cargo/config.toml`

## Purpose

Apply Rust coding standards covering ownership, error handling, concurrency, performance, type system, unsafe code, API design, testing, memory management, and project structure across 73 rules in 10 dimensions.

## Reference Material

- `../Rules/Rust/` — 73 individual rule files across 10 categories

## Quick Decision Tree

**Start here when writing/reviewing Rust:**

1. **Borrow checker fighting you?** → Category 1: Ownership & Borrowing (CRITICAL)
2. **Error handling questions?** → Category 2: Error Handling (CRITICAL)
3. **Async/concurrency issues?** → Category 3: Concurrency & Async (CRITICAL)
4. **Performance concerns?** → Category 4: Performance (HIGH)
5. **Type design decisions?** → Category 5: Type System & Traits (HIGH)
6. **Writing unsafe code?** → Category 6: Unsafe Code (CRITICAL)
7. **Public API design?** → Category 7: API Design (HIGH)
8. **Testing strategy?** → Category 8: Testing (HIGH)
9. **Lifetime/memory questions?** → Category 9: Memory & Lifetimes (HIGH)
10. **Project organization?** → Category 10: Project Structure (HIGH)

**For detailed implementation:** Read the specific rule file from `../Rules/Rust/` folder.

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern |
|----------|----------|--------|-------------|
| 1 | Ownership & Borrowing | CRITICAL | Borrow over clone, slices over vecs, smart pointer hierarchy |
| 2 | Error Handling | CRITICAL | thiserror for libs, anyhow for apps, no panic in libraries |
| 3 | Unsafe Code | CRITICAL | Minimize scope, document safety, no UB even in unsafe |
| 4 | Concurrency & Async | CRITICAL | No mutex across await, spawn_blocking for CPU work |
| 5 | Type System & Traits | HIGH | Newtype pattern, trait objects vs generics, eager derives |
| 6 | API Design | HIGH | Conversion naming, From not Into, builder pattern |
| 7 | Performance | HIGH | Iterators over loops, preallocate, avoid allocations |
| 8 | Testing | HIGH | Unit tests in file, trait-based mocking, error paths |
| 9 | Memory & Lifetimes | HIGH | Stack over heap, RAII, Pin for async, arenas |
| 10 | Project Structure | HIGH | Workspaces, additive features, semver discipline |

## Top 10 High-Impact Rules

These provide the largest code quality gains:

1. **PreferBorrowOverClone** - Clone to satisfy borrow checker is always a code smell
2. **ThiserrorForLibsAnyhowForApps** - Library/application error boundary is fundamental
3. **NoMutexAcrossAwait** - Holding sync mutex across await causes deadlocks
4. **MinimizeUnsafeScope** - Smallest possible unsafe blocks with safe wrappers
5. **NoPanicInLibraries** - Libraries must never panic; return Result instead
6. **SpawnBlockingForCpuWork** - CPU work on async executor starves all tasks
7. **NewtypeForSemantics** - Zero-cost type safety prevents argument mixing
8. **DocumentSafetyInvariants** - Every unsafe block needs SAFETY comment
9. **IteratorsOverLoops** - Iterator chains compile to equivalent or better code
10. **AdditiveFeatureFlags** - Non-additive features cause impossible builds

## Examples

**Example 1: Ownership patterns**
```rust
// Problem: Cloning to satisfy borrow checker
let name = user.name.clone();
process(&name);

// Solution: PreferBorrowOverClone rule
process(&user.name);
```

**Example 2: Error handling**
```rust
// Problem: Library using anyhow
pub fn parse(input: &str) -> anyhow::Result<Config> { ... }

// Solution: ThiserrorForLibsAnyhowForApps rule
#[derive(thiserror::Error, Debug)]
pub enum ParseError {
    #[error("invalid syntax at line {0}")]
    Syntax(usize),
}
pub fn parse(input: &str) -> Result<Config, ParseError> { ... }
```

**Example 3: Async safety**
```rust
// Problem: Sync mutex held across await
let guard = data.lock().unwrap();
do_async_work(&guard).await;  // DEADLOCK RISK

// Solution: NoMutexAcrossAwait rule
let value = { data.lock().unwrap().clone() };
do_async_work(&value).await;
```

## How to Use Rules

**Pattern:** When applying a rule, read its specific file from `../Rules/Rust/` folder.

```
Decision tree identifies: Category 1 (Ownership & Borrowing)
Quick ref shows: PreferBorrowOverClone rule
Action: Read ../Rules/Rust/PreferBorrowOverClone.md
Result: Complete code examples and implementation guidance
```

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `prefer-borrow-over-clone` → `../Rules/Rust/PreferBorrowOverClone.md`
- `thiserror-for-libs-anyhow-for-apps` → `../Rules/Rust/ThiserrorForLibsAnyhowForApps.md`
- `no-mutex-across-await` → `../Rules/Rust/NoMutexAcrossAwait.md`

## Complete Rule Index

### 1. Ownership & Borrowing (CRITICAL) — 8 rules
- PreferBorrowOverClone
- UseSlicesOverVecs
- SmartPointerHierarchy
- InteriorMutabilityJustification
- AvoidSelfReferentialStructs
- CowForConditionalOwnership
- LifetimeElisionAwareness
- MoveSemanticsByDefault

### 2. Error Handling (CRITICAL) — 7 rules
- ThiserrorForLibsAnyhowForApps
- NoPanicInLibraries
- ErrorTypeGranularity
- ContextualErrors
- ErrorTraitImplementation
- QuestionMarkOverMatch
- TypedVsErasedErrors

### 3. Concurrency & Async (CRITICAL) — 8 rules
- NoMutexAcrossAwait
- MessagePassingOverSharedState
- SpawnBlockingForCpuWork
- SendSyncAwareness
- StructuredConcurrency
- ChannelCapacityBounds
- AsyncTraitConsiderations
- DeadlockPrevention

### 4. Performance (HIGH) — 8 rules
- IteratorsOverLoops
- PreallocateCollections
- AvoidUnnecessaryAllocations
- BenchmarkWithCriterion
- CacheFriendlyDataLayouts
- CollectLazilyConsumeEagerly
- ProfileBeforeOptimizing
- ZeroCopyDeserialization

### 5. Type System & Traits (HIGH) — 8 rules
- NewtypeForSemantics
- TypestatePattern
- AssociatedTypesOverGenerics
- TraitObjectsVsGenerics
- SealedTraitsForExtensibility
- PhantomDataForTypeConstraints
- DefaultTraitImplementations
- EagerCommonTraitImpls

### 6. Unsafe Code (CRITICAL) — 6 rules
- MinimizeUnsafeScope
- DocumentSafetyInvariants
- ModuleBoundarySafety
- FFIBoundaryTypes
- PreferBindgen
- NoUBEvenInUnsafe

### 7. API Design (HIGH) — 8 rules
- ConversionNaming
- ImplementFromNotInto
- BuilderForComplexConstruction
- TypesOverBooleans
- DebugAndDisplayForAll
- NonExhaustiveForEvolution
- DocumentPublicAPI
- MinimizePublicSurface

### 8. Testing (HIGH) — 7 rules
- UnitTestsInSameFile
- IntegrationTestsInTestsDir
- PropertyTestingWithProptest
- TraitBasedMocking
- DocTestsAsExamples
- TestErrorPaths
- SnapshotAndFuzzTesting

### 9. Memory & Lifetimes (HIGH) — 6 rules
- StackOverHeapDefault
- PinForAsyncAndSelfRef
- LifetimeParameterDesign
- RAIIResourceManagement
- ArenaForGraphStructures
- AvoidLeakingMemory

### 10. Project Structure (HIGH) — 7 rules
- WorkspaceForMultiCrate
- AdditiveFeatureFlags
- MinimalDefaultFeatures
- ModulePerFeature
- AvoidWildcardImports
- ReExportPublicDependencies
- SemverDiscipline

## Integration

This skill integrates with PAI's code generation and review workflows. When writing or reviewing Rust code, these patterns ensure safe, idiomatic, and performant code.

**Sources:** Rust API Guidelines, Effective Rust, The Rustonomicon, Tokio docs, Google Comprehensive Rust, Rust Design Patterns, The Rust Book, Clippy Lints Index

## Dimensional Loading

For agents that need focused subsets rather than the full rule set, read `../Dimensions/Rust/INDEX.md` for a routing table.

| Dimension | File | Rule Count | Load When |
|-----------|------|------------|-----------|
| Ownership & Borrowing | Ownership.md | 8 | Borrow checker issues, Clone abuse, Rc/Arc decisions |
| Error Handling | ErrorHandling.md | 7 | Result/Option, thiserror/anyhow, error propagation |
| Concurrency & Async | Concurrency.md | 8 | async/await, Send/Sync, tokio, channels, deadlocks |
| Performance | Performance.md | 8 | Allocations, iterators, benchmarking, profiling |
| Type System & Traits | TypeSystem.md | 8 | Traits, generics, newtype, typestate, derives |
| Unsafe Code | UnsafeCode.md | 6 | unsafe blocks, FFI, safety invariants, Miri |
| API Design | APIDesign.md | 8 | Naming, From/Into, builder, docs, visibility |
| Testing | Testing.md | 7 | Unit tests, property testing, mocking, fuzzing |
| Memory & Lifetimes | MemoryLifetimes.md | 6 | Pin/Unpin, RAII, arenas, stack vs heap |
| Project Structure | ProjectStructure.md | 7 | Workspaces, features, modules, semver |

**Default:** Load Ownership & Borrowing + Error Handling for any Rust task.

**Use the full workflow (this file) when:** comprehensive standards review for a complete crate or module.

**Use a dimension when:** focused context for a specific concern, multi-agent review, or constrained-context scenarios.
