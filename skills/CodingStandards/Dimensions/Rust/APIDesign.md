# API Design -- Rust

> Design APIs that are hard to misuse, communicate cost through naming, and can evolve across minor versions without breaking downstream code.

## Mental Model

Rust's API design philosophy emerges from two forces that do not exist in most languages: the ownership system and semver-as-contract. Every public function signature is a promise about who owns data, how long it lives, and whether it can be mutated. Unlike languages where API breakage is a social convention enforced by changelogs, Rust's type system makes breakage a compile error for every downstream consumer. This means every `pub` item is a commitment with teeth.

The ownership system gives Rust a unique naming convention for conversions. The `as_`/`to_`/`into_` prefix convention is not stylistic decoration -- it encodes cost and ownership transfer into the method name. `as_str()` tells the caller "this is a zero-cost view"; `to_string()` tells them "this allocates"; `into_inner()` tells them "this consumes me." Violating these conventions does not cause a compile error, but it causes something worse: callers write code under false assumptions about performance and ownership, and the bugs surface only under load.

The semver dimension is equally critical. Adding a variant to a public enum is a breaking change. Adding a field to a public struct (if constructible by downstream) is a breaking change. Making a private function public is easy; making a public function private requires a major version bump. This asymmetry means the correct default is maximum privacy: start private, promote to `pub(crate)`, and only reach `pub` when you have a genuine external consumer. The `#[non_exhaustive]` attribute is the escape valve for types that need to grow -- it forces downstream code to handle the unknown, preserving your ability to evolve.

The builder pattern connects these ideas. A constructor with six positional parameters is unreadable, fragile to reorder, and impossible to extend without breakage. A builder names each parameter at the call site, provides defaults for optional ones, and lets you add new options in minor versions. Combined with `impl Into<T>` on builder methods, it creates APIs that are simultaneously type-safe and ergonomic.

Finally, `Debug` and `Display` are not afterthoughts -- they are infrastructure. Without `Debug`, your types cannot appear in test assertions, log lines, or error chains. Without `Display` on error types, you cannot use the `?` operator in functions returning `Result`. These traits are the minimum interface tax for participating in the Rust ecosystem.

## Consumer Guide

### When Reviewing Code

Check conversion methods for correct prefix conventions: `as_` must be O(1) borrow-to-borrow, `to_` may allocate and borrows self, `into_` must consume self. Flag any `impl Into<T>` on a type -- it should be `impl From<T>` instead (the blanket impl provides `Into` for free). Look for constructors with more than three parameters, especially when multiple parameters share a type -- suggest a builder. Verify that all public types derive or implement `Debug`, and that error types implement `Display`. Check for public enums without `#[non_exhaustive]` that are likely to grow. Verify that public items have doc comments with `# Examples`, `# Errors`, and `# Panics` sections where applicable.

### When Designing / Planning

Sketch your public API surface first and ask: "What is the minimum set of types and functions a consumer needs?" Everything else stays private or `pub(crate)`. For types that will be constructed with configuration, plan a builder from the start. For enums that represent extensible categories (error variants, event types, database backends), apply `#[non_exhaustive]` in the initial design. When designing conversion traits, decide the cost category first (view, clone, or move) and name accordingly.

### When Implementing

Apply `#[derive(Debug)]` to every public struct and enum as the first line after the doc comment. Implement `Display` for any type that will appear in user-facing output or error messages. Use `impl Into<T>` in function parameters and `impl From<T>` on your types. Write doc comments before implementing the function body -- the act of describing the contract often reveals design issues. Run `cargo test --doc` to verify examples compile and pass. Use `#![warn(missing_docs)]` at the crate root to catch undocumented public items.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [ConversionNaming](../../Rules/Rust/ConversionNaming.md) | HIGH | Follow as_/to_/into_ conventions to communicate cost and ownership |
| [ImplementFromNotInto](../../Rules/Rust/ImplementFromNotInto.md) | HIGH | Implement From (blanket gives Into); accept impl Into in parameters |
| [BuilderForComplexConstruction](../../Rules/Rust/BuilderForComplexConstruction.md) | HIGH | Use builder pattern for types with 3+ configuration options |
| [TypesOverBooleans](../../Rules/Rust/TypesOverBooleans.md) | MEDIUM | Use enums instead of bool parameters to make call sites self-documenting |
| [DebugAndDisplayForAll](../../Rules/Rust/DebugAndDisplayForAll.md) | HIGH | Derive Debug on all public types; implement Display for user-facing types |
| [NonExhaustiveForEvolution](../../Rules/Rust/NonExhaustiveForEvolution.md) | MEDIUM | Use #[non_exhaustive] on public enums and structs that may grow |
| [DocumentPublicAPI](../../Rules/Rust/DocumentPublicAPI.md) | HIGH | Doc comments with examples, errors, panics; verified by cargo test --doc |
| [MinimizePublicSurface](../../Rules/Rust/MinimizePublicSurface.md) | MEDIUM | Start private; promote to pub(crate), then pub only when needed |

## Rule Interactions

**ConversionNaming + ImplementFromNotInto**: These rules work together to create a coherent conversion API. ConversionNaming governs the method-style conversions (`as_str()`, `to_string()`, `into_inner()`), while ImplementFromNotInto governs the trait-based conversions (`From<T>`, `Into<T>`). A type might offer both: `From<String>` for generic conversion contexts and `into_inner()` as a named method for explicit call sites.

**BuilderForComplexConstruction + ImplementFromNotInto**: Builders benefit from accepting `impl Into<T>` on their setter methods, allowing callers to pass `&str` where `String` is stored internally. This combination creates APIs that are both type-safe and ergonomic.

**NonExhaustiveForEvolution + MinimizePublicSurface**: Both rules serve semver safety from different angles. MinimizePublicSurface reduces the number of items that are part of the contract. NonExhaustiveForEvolution protects the items that must be public by ensuring they can grow without breakage. Apply both: make fewer things public, and protect the public things with `#[non_exhaustive]`.

**DebugAndDisplayForAll + DocumentPublicAPI**: Debug output and documentation are complementary windows into a type. Debug is the runtime representation (logging, assertions); documentation is the compile-time representation (IDE tooltips, rendered docs). Both must exist for a type to be a full citizen of the Rust ecosystem.

## Anti-Patterns (Severity Calibration)

### HIGH

- **`as_` method that allocates**: An `as_foo()` method that returns an owned `String` or `Vec` violates the zero-cost expectation. Callers will use it in loops without realizing they are allocating on every iteration. Rename to `to_foo()`.
- **Implementing `Into` directly instead of `From`**: Skips the blanket impl, prevents `Type::from()` syntax, and is flagged by `clippy::from_over_into`. Always implement `From`.
- **Public types without `Debug`**: Breaks `assert_eq!` in downstream tests, prevents `dbg!()` usage, and makes log output useless. There is almost never a reason to omit Debug.
- **Undocumented public function that returns `Result`**: Callers cannot know what errors to expect without reading the source. The `# Errors` section is the contract.

### MEDIUM

- **Constructor with 4+ positional parameters of the same type**: `new(u64, u64, u64, u64)` is an invitation for argument-swap bugs. Use a builder or a config struct.
- **Public enum without `#[non_exhaustive]` in a library**: Every new variant will be a semver-major change. Apply the attribute proactively unless the enum is provably closed.
- **Boolean parameters in public functions**: `process(true, false, true)` is unreadable. Use enums with named variants.

### LOW

- **Over-exposing internal modules via `pub mod`**: Adds items to the public surface that you did not intend to maintain. Use private modules with selective `pub use` re-exports.

## Examples

**Conversion trio showing consistent naming:**

```rust
pub struct Path {
    inner: String,
}

impl Path {
    // as_: O(1) borrow, no allocation
    pub fn as_str(&self) -> &str {
        &self.inner
    }

    // to_: allocates a new String, borrows self
    pub fn to_normalized(&self) -> String {
        self.inner.replace("\\", "/").to_lowercase()
    }

    // into_: consumes self, transfers ownership, no allocation
    pub fn into_string(self) -> String {
        self.inner
    }
}

// Trait-based conversion via From
impl From<String> for Path {
    fn from(s: String) -> Self {
        Self { inner: s }
    }
}

// Accept impl Into in parameters
fn join_paths(base: impl Into<Path>, child: &str) -> Path {
    let base = base.into();
    Path { inner: format!("{}/{}", base.as_str(), child) }
}
```

**Builder pattern with non_exhaustive and full documentation:**

```rust
/// Configuration for the retry policy.
///
/// Use [`RetryPolicyBuilder`] to construct instances.
///
/// # Examples
///
/// ```
/// let policy = RetryPolicyBuilder::new()
///     .max_attempts(5)
///     .base_delay_ms(100)
///     .build();
/// ```
#[non_exhaustive]
#[derive(Debug, Clone)]
pub struct RetryPolicy {
    pub max_attempts: u32,
    pub base_delay_ms: u64,
    pub backoff_factor: f64,
}

#[derive(Debug)]
pub struct RetryPolicyBuilder {
    max_attempts: u32,
    base_delay_ms: u64,
    backoff_factor: f64,
}

impl RetryPolicyBuilder {
    pub fn new() -> Self {
        Self { max_attempts: 3, base_delay_ms: 1000, backoff_factor: 2.0 }
    }
    pub fn max_attempts(mut self, n: u32) -> Self { self.max_attempts = n; self }
    pub fn base_delay_ms(mut self, ms: u64) -> Self { self.base_delay_ms = ms; self }
    pub fn backoff_factor(mut self, f: f64) -> Self { self.backoff_factor = f; self }

    pub fn build(self) -> RetryPolicy {
        RetryPolicy {
            max_attempts: self.max_attempts,
            base_delay_ms: self.base_delay_ms,
            backoff_factor: self.backoff_factor,
        }
    }
}
```

## Does Not Cover

- **Async API design** (async trait patterns, `Send + Sync` bounds on futures) -- covered by concurrency dimensions.
- **Error type hierarchy design** -- covered by RS3 Error Handling dimension.
- **Macro-based API generation** (proc macros, derive macros) -- a specialized topic beyond general API design.
- **C FFI API design** (`#[repr(C)]`, extern functions) -- FFI has its own conventions that sometimes conflict with idiomatic Rust API guidelines.
- **Unsafe API contracts** (safety invariants, `# Safety` doc sections) -- warrants its own dimension due to the distinct verification requirements.

## See Also

- **RS5 Type System**: The Type System dimension covers internal modeling (newtypes, phantom types, sealed traits) while API Design covers how those types are exposed to consumers. A well-designed internal type model (RS5) becomes a well-designed external API (RS7) through careful visibility control and conversion traits.

## Sources

- Rust API Guidelines (C-CONV, C-BUILDER, C-DEBUG, C-CUSTOM-TYPE, C-STRUCT-PRIVATE, C-CRATE-DOC)
- Effective Rust (Items 5, 7, 22, 27) -- conversion traits, builder pattern, visibility, documentation
- Rust Reference -- `#[non_exhaustive]` attribute semantics
