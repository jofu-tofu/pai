# Ownership & Borrowing -- Rust

> Every value has exactly one owner; every reference has a provable lifetime. Design APIs that express ownership intent through the type system rather than working around it.

## Mental Model

Ownership is Rust's defining feature and its primary source of both safety and confusion. The ownership system enforces three rules at compile time: every value has exactly one owner, when the owner goes out of scope the value is dropped, and you can have either one mutable reference or any number of shared references -- but not both simultaneously. These rules eliminate data races, use-after-free, and double-free bugs without a garbage collector. The cost is that developers must think about who owns data and how long borrows last, decisions that other languages defer to runtime.

The fundamental design question in Rust is not "how do I make this compile" but "who should own this data." When the answer is clear, the code compiles naturally. When the answer is unclear, developers reach for escape hatches -- `.clone()`, `Rc<T>`, `RefCell<T>`, raw pointers -- that silence the compiler but leave the ownership question unresolved. This dimension exists to ensure that ownership decisions are made intentionally and expressed through the type system, not papered over with runtime mechanisms.

Borrowing is the mechanism that makes ownership practical. Without borrowing, every function call would require transferring ownership and returning it -- an ergonomic nightmare. References (`&T` and `&mut T`) allow functions to access data without taking ownership, and the borrow checker ensures these references never outlive the data they point to. The hierarchy of access is clear: prefer `&T` (shared, immutable) over `&mut T` (exclusive, mutable) over owned `T` (full control). Each step up the hierarchy increases the caller's burden and narrows the set of valid call sites.

Smart pointers (`Box<T>`, `Rc<T>`, `Arc<T>`) and interior mutability (`Cell<T>`, `RefCell<T>`) are legitimate tools, but each one trades a compile-time guarantee for runtime flexibility. `Rc<T>` replaces the single-owner rule with reference counting and the possibility of reference cycles. `RefCell<T>` replaces the compile-time borrow check with a runtime check that panics on violation. `Arc<T>` adds atomic operations to every clone and drop. These costs are acceptable when the problem genuinely requires shared ownership or interior mutation, but they should never be the first tool reached for. The hierarchy is: `&T` first, then `Box<T>`, then `Rc<T>`, then `Arc<T>`, and interior mutability only with documented justification.

## Consumer Guide

### When Reviewing Code

Look for these signals that ownership is being handled poorly: `.clone()` calls that exist only to satisfy the borrow checker (especially inside loops or on `String` / `Vec` types), functions that accept `&Vec<T>` or `&String` instead of `&[T]` or `&str`, `Rc<T>` or `Arc<T>` used in single-threaded contexts where a reference would suffice, `RefCell<T>` without a comment explaining why `&mut self` is not viable, and self-referential struct attempts using raw pointers or excessive `Pin` gymnastics. Each of these patterns indicates an ownership design decision that was deferred rather than made. Ask: "who should own this data?" and verify the code's answer matches the architecture's intent.

### When Designing / Planning

Map out data ownership before writing code. For each major data structure, decide: who creates it, who needs read access, who needs write access, and when it should be destroyed. If multiple components need access, determine whether they can share a borrow from a single owner (the common case) or whether they genuinely need shared ownership (the `Rc`/`Arc` case). Design function signatures to take the weakest reference that satisfies the requirement: `&str` over `&String`, `&[T]` over `&Vec<T>`, `&T` over `T` when the function only reads. For constructors and builders that store the data, use `impl Into<String>` to give callers control over allocation.

### When Implementing

Start every function parameter as a reference (`&T` or `&str`). Escalate to owned types only when the function must store the data beyond the call or send it to another thread. Use `Cow<'a, T>` when a function sometimes needs to allocate and sometimes can return the input unchanged. Avoid self-referential structs entirely -- use index-based designs or arena allocation instead. When interior mutability is genuinely needed (shared observers, lazy initialization, thread-safe mutation), add a comment explaining why the compile-time borrow check is insufficient. Treat every `.clone()` as a decision point: either justify it or restructure to eliminate it.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [PreferBorrowOverClone](../../Rules/Rust/PreferBorrowOverClone.md) | CRITICAL | Use references instead of cloning to satisfy the borrow checker |
| [UseSlicesOverVecs](../../Rules/Rust/UseSlicesOverVecs.md) | HIGH | Accept &[T] and &str instead of &Vec<T> and &String |
| [SmartPointerHierarchy](../../Rules/Rust/SmartPointerHierarchy.md) | HIGH | Start with &T, escalate to Box/Rc/Arc only when required |
| [InteriorMutabilityJustification](../../Rules/Rust/InteriorMutabilityJustification.md) | HIGH | Cell/RefCell require documented justification for bypassing compile-time checks |
| [AvoidSelfReferentialStructs](../../Rules/Rust/AvoidSelfReferentialStructs.md) | HIGH | Use arenas or index-based designs instead of self-referential types |
| [CowForConditionalOwnership](../../Rules/Rust/CowForConditionalOwnership.md) | MEDIUM | Use Cow<'a, T> when a function may or may not need to allocate |
| [LifetimeElisionAwareness](../../Rules/Rust/LifetimeElisionAwareness.md) | MEDIUM | Annotate lifetimes explicitly when elision obscures the borrowing contract |
| [MoveSemanticsByDefault](../../Rules/Rust/MoveSemanticsByDefault.md) | MEDIUM | Take ownership by default in APIs; use impl Into<T> for flexible conversion |

## Rule Interactions

**PreferBorrowOverClone + UseSlicesOverVecs**: These rules reinforce the same principle from different angles. Accepting slices instead of container references makes it easier for callers to pass borrows without cloning. When a function takes `&[T]` instead of `&Vec<T>`, the caller does not need to clone data into a Vec just to satisfy the signature.

**PreferBorrowOverClone + MoveSemanticsByDefault**: These rules create a tension that must be resolved per-function. If the function will store the data, MoveSemanticsByDefault says take ownership (avoiding a hidden clone). If the function only reads, PreferBorrowOverClone says take a reference. The deciding question is: does this function need the data to outlive the call?

**SmartPointerHierarchy + InteriorMutabilityJustification**: Interior mutability types are most commonly found inside `Rc<T>` or `Arc<T>` containers. When reviewing `Rc<RefCell<T>>` or `Arc<Mutex<T>>`, both rules apply: verify that shared ownership is genuinely needed (SmartPointerHierarchy) and that the interior mutability has documented justification (InteriorMutabilityJustification).

**AvoidSelfReferentialStructs + LifetimeElisionAwareness**: Self-referential structs often arise when developers try to store a reference alongside the data it borrows from. Understanding lifetime elision and explicit annotation helps developers recognize why the compiler rejects these patterns and guides them toward index-based alternatives.

**CowForConditionalOwnership + PreferBorrowOverClone**: `Cow` is the bridge between borrowing and owning. When PreferBorrowOverClone pushes toward references but the function sometimes must allocate, `Cow` provides the optimal solution without forcing the caller to always clone.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Gratuitous `.clone()` in hot paths**: Cloning strings, vectors, or complex structs inside loops to satisfy the borrow checker. Each iteration allocates and copies data that could be borrowed. This is the single most common performance bug in Rust codebases.
- **`.clone()` as the default response to borrow checker errors**: When a developer's first instinct is to add `.clone()` whenever the compiler complains, the ownership model is not being used -- it is being silenced. The resulting code has the syntax of Rust but the allocation profile of a garbage-collected language.

### HIGH

- **`Rc<RefCell<T>>` without documented justification**: This pattern completely opts out of compile-time borrow checking. It has legitimate uses (shared mutable state in single-threaded event loops, tree structures with mutable nodes), but without a comment explaining why, reviewers cannot verify the design decision.
- **`Arc<T>` in single-threaded code**: Atomic reference counting has measurable overhead compared to `Rc<T>` (which itself has overhead compared to references). Using `Arc` when the data never crosses a thread boundary wastes CPU cycles on atomic operations.
- **Self-referential structs with raw pointers**: Using `*const T` or `*mut T` to create self-referential structures introduces undefined behavior risk that the borrow checker was designed to prevent. The resulting `unsafe` blocks are difficult to audit and easy to break during refactoring.
- **Accepting `&String` or `&Vec<T>` in public API signatures**: Forces callers to allocate containers they may not need and signals unfamiliarity with Rust's deref coercion system.

### MEDIUM

- **Missing lifetime annotations on multi-reference functions**: When a function accepts two or more reference parameters and returns a reference, relying on elision can produce incorrect lifetime relationships that only manifest as confusing compiler errors at the call site.
- **Always returning `String` when `Cow<str>` would avoid allocation**: Functions that sometimes transform input and sometimes return it unchanged allocate unnecessarily when they always return `String`.
- **Taking `&str` for a constructor that stores the value**: The constructor will call `.to_owned()` internally, hiding the allocation from the caller. `impl Into<String>` communicates the ownership transfer and lets callers who have a `String` avoid the clone.

## Does Not Cover

- **Unsafe code and raw pointer manipulation** -- this dimension covers safe ownership patterns; `unsafe` blocks, raw pointer arithmetic, and FFI pointer contracts are a separate concern.
- **Concurrency primitives beyond Arc** -- `Mutex`, `RwLock`, channels, and atomics are synchronization tools that build on top of ownership but form their own dimension.
- **Allocator-aware programming** -- custom allocators, `GlobalAlloc`, and allocation-free (`#[no_std]`) patterns are performance concerns beyond ownership modeling.
- **Drop order and destructor semantics** -- while related to ownership, explicit `Drop` implementations and drop order guarantees are a distinct topic.
- **Lifetime variance and subtyping** -- covariance, contravariance, and invariance of lifetime parameters are advanced type-system topics covered in the Rustonomicon.

## Sources

- *Effective Rust* by David Drysdale -- Item 15 (avoid unnecessary clones), Item 8 (smart pointer hierarchy), Item 5 (move semantics and Into conversions)
- *Rust API Guidelines* -- C-GENERIC (accept generic types over concrete containers), C-CALLER-CONTROL (let the caller decide allocation)
- *The Rustonomicon* -- interior mutability, variance, and lifetime mechanics
- *Rust Design Patterns* -- Clone anti-pattern, Cow idiom, borrowed vs. owned type selection
- *The Rust Programming Language* (The Rust Book) -- Chapter 4 (ownership), Chapter 10 (lifetimes), Chapter 15 (smart pointers), Chapter 15.5 (interior mutability)
- Cloudflare Engineering Blog -- "Pin, Unpin, and why Rust needs them" (self-referential struct motivation)
- Clippy lint documentation -- `ptr_arg` lint (prefer slices over container references)

## See Also

- **RS9 Memory & Lifetimes** -- covers lifetime mechanics in depth, including lifetime variance, higher-ranked trait bounds (`for<'a>`), and `'static` lifetime semantics. The LifetimeElisionAwareness rule (RS1.7) in this dimension addresses when to annotate lifetimes for clarity; RS9 covers the full lifetime system including complex multi-lifetime structs, lifetime bounds on trait implementations, and the interaction between lifetimes and async/await. If a review finding involves lifetime annotations beyond simple function signatures, escalate to the RS9 dimension.
