# Unsafe Code -- Rust

> Treat `unsafe` as an escape hatch with a proof obligation, not a free-for-all that disables the borrow checker.

## Mental Model

Rust's safety guarantees rest on a contract: the compiler statically proves that your code cannot cause undefined behavior. The `unsafe` keyword does not break this contract -- it transfers the proof obligation from the compiler to the programmer. Every `unsafe` block is a claim: "I, the author, have manually verified that this code upholds all of Rust's safety invariants." If that claim is wrong, the entire program's safety collapses, because the optimizer assumes UB cannot happen and will transform code accordingly.

This means `unsafe` is not a permission to "do whatever C can do." It is a scoped assertion that you have completed a soundness proof for a specific operation. The proof has four components: (1) the operation itself is correct (no aliasing violations, no dangling pointers, no data races), (2) the invariants it depends on are documented, (3) those invariants are protected by module privacy so that safe code cannot violate them, and (4) the unsafe surface is as small as possible so the proof is auditable.

The module boundary is the critical architectural concept. A sound unsafe abstraction exposes a safe public API and uses `pub(crate)` or private fields to prevent external code from breaking internal invariants. If a field that unsafe code depends on is `pub`, any consumer can introduce undefined behavior without ever writing `unsafe` themselves. This is called a "soundness hole" and it is the most common structural error in unsafe Rust.

FFI (Foreign Function Interface) is where unsafe is most frequently required and most frequently wrong. C has no concept of Rust's ownership, borrowing, or `repr(Rust)` layout. Every value crossing the FFI boundary must use `repr(C)` for structs, `CString`/`CStr` for strings, and `Copy` types for by-value arguments. Bindgen eliminates the largest class of FFI bugs -- manual transcription errors -- by generating bindings directly from C headers.

Finally, undefined behavior is never acceptable, even inside `unsafe`. The `unsafe` keyword lifts compile-time checks, not the rules themselves. Data races, invalid references, aliasing violations, and reads of uninitialized memory are UB regardless of context. `cargo miri test` is the primary tool for detecting UB at runtime and should be part of every project's CI that uses unsafe code.

## Consumer Guide

### When Reviewing Code

Look for these signals: `unsafe` blocks without `// SAFETY:` comments, `unsafe fn` without a `# Safety` doc section, public fields on types whose methods contain unsafe operations, `extern "C"` blocks without `repr(C)` on shared structs, `String` or `&str` passed across FFI boundaries instead of `CString`/`CStr`, and hand-written FFI declarations for libraries that ship headers. Flag any `unsafe` block that spans more than the minimum necessary operation. Check that `cargo miri test` is in the CI pipeline for any crate that contains `unsafe`.

### When Designing / Planning

Identify which operations truly require unsafe: raw pointer manipulation, FFI calls, inline assembly, and certain concurrency primitives. Design the module structure so that unsafe operations live behind safe public APIs. Plan the invariant documentation strategy alongside the implementation -- the `// SAFETY:` comments are not afterthoughts, they are part of the design. For FFI-heavy projects, set up bindgen in `build.rs` before writing any Rust wrappers. Decide whether to use `cargo miri test` in CI or as a periodic audit tool.

### When Implementing

Write the safe API first, then introduce the minimal unsafe block inside it. Write the `// SAFETY:` comment before writing the unsafe code -- if you cannot articulate why the operation is sound, you are not ready to write it. Keep fields that unsafe depends on private. Use `repr(C)` on every struct that crosses FFI. Use `CString::new()` for owned strings going to C and `CStr::from_ptr()` for borrowed strings coming from C. Run `cargo miri test` after every change to unsafe code. Enable Clippy's `undocumented_unsafe_blocks` lint.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [MinimizeUnsafeScope](../../Rules/Rust/MinimizeUnsafeScope.md) | CRITICAL | Smallest possible unsafe blocks; safe public API wrapper |
| [DocumentSafetyInvariants](../../Rules/Rust/DocumentSafetyInvariants.md) | CRITICAL | SAFETY comment on every unsafe block; doc preconditions on unsafe fn |
| [ModuleBoundarySafety](../../Rules/Rust/ModuleBoundarySafety.md) | HIGH | Module privacy protects invariants that unsafe code relies on |
| [FFIBoundaryTypes](../../Rules/Rust/FFIBoundaryTypes.md) | CRITICAL | Only Copy types by value across FFI; CString/CStr for strings; repr(C) |
| [PreferBindgen](../../Rules/Rust/PreferBindgen.md) | MEDIUM | Auto-generate FFI bindings from C headers instead of hand-writing extern blocks |
| [NoUBEvenInUnsafe](../../Rules/Rust/NoUBEvenInUnsafe.md) | CRITICAL | No data races, invalid refs, or aliasing violations; validate with cargo miri test |

## Rule Interactions

**MinimizeUnsafeScope + DocumentSafetyInvariants**: These two rules are complementary. Minimizing the scope makes the SAFETY comment tractable -- a three-line unsafe block has a simple proof. A function-wide unsafe block requires reasoning about every line, making the SAFETY comment either impossibly long or dangerously incomplete.

**ModuleBoundarySafety + MinimizeUnsafeScope**: The module boundary is what makes the safe public API possible. Private fields protect the invariants; the safe methods enforce them; the minimal unsafe block inside those methods relies on them. Remove privacy and the safe API is an illusion.

**FFIBoundaryTypes + PreferBindgen**: Bindgen automatically generates `repr(C)` structs and correct type mappings, eliminating the manual transcription errors that FFIBoundaryTypes guards against. Using bindgen is the mechanical enforcement of the FFI type rules.

**NoUBEvenInUnsafe + DocumentSafetyInvariants**: The SAFETY comment is the human-readable proof that UB does not occur. If the comment cannot explain why the operation is sound, the code likely contains UB. Miri is the machine-verifiable counterpart to the human-written proof.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Function-level `unsafe fn` when only one line needs it**: Forces every caller into an unsafe block, spreading the proof obligation across the entire codebase instead of containing it at the source.
- **Bare `unsafe` block with no SAFETY comment**: An unverifiable claim of soundness. During refactoring, no one can tell whether the invariants still hold because no one recorded what they were.
- **`&mut` aliasing through raw pointers**: Creating two `&mut` references to the same memory via pointer casts is instant UB. The optimizer assumes exclusive access and will miscompile the code.
- **Passing `&str` or `String` across FFI**: Rust strings are not null-terminated. C functions expecting `char*` will read past the end of the buffer.
- **Struct without `repr(C)` in FFI**: Rust's default layout may reorder fields, pad differently, or change between compiler versions. The C side will read garbage.

### HIGH

- **Public fields on types with unsafe methods**: Allows safe code to break invariants that unsafe code depends on, creating soundness holes that do not require `unsafe` to exploit.
- **Hand-maintained `extern "C"` blocks for large C libraries**: Every library update risks silent ABI mismatches. Bindgen eliminates this class of bugs entirely.

### MEDIUM

- **No `cargo miri test` in CI for crates with unsafe**: Miri catches UB that no amount of testing or review can reliably find (aliasing violations, provenance errors). Running it periodically is good; running it in CI is better.
- **Overly broad `#[allow(unsafe_code)]`**: Disabling the lint at the crate level hides new unsafe additions. Allow it only on the specific modules that need it.

## Does Not Cover

- **Cryptographic safety** -- constant-time operations, side-channel resistance, and key management are security concerns beyond the scope of general unsafe hygiene.
- **`no_std` and embedded-specific patterns** -- bare-metal register access, linker scripts, and interrupt handlers have additional constraints not addressed here.
- **Formal verification tools** (Kani, Creusot) -- these are complementary to Miri and SAFETY comments but require their own methodology.
- **Async runtime internals** -- custom executors and wakers involve unsafe patterns that deserve a dedicated treatment.

## Sources

- The Rustonomicon (RBOOK), Chapter 20.1: Meet Safe and Unsafe
- Nomicon (NOM): unsafe, FFI, and soundness sections
- Effective Rust (ER), Item 16: Minimize unsafe, Item 34: FFI types, Item 35: bindgen
- Clippy lint: `undocumented_unsafe_blocks`
- Miri documentation and `cargo miri test` usage
- Rust Reference: behavior considered undefined
