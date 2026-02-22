# Type System & Traits -- Rust

> Use Rust's type system as a design tool: encode invariants in types so that incorrect programs fail to compile rather than fail at runtime.

## Mental Model

Rust's type system is not just a bug-prevention mechanism -- it is a design language. Every struct, enum, trait bound, and generic parameter is a statement about what a program means and what it is allowed to do. The goal of this dimension is to shift correctness guarantees from runtime checks and documentation into the type system itself, where the compiler enforces them for free.

The foundational insight is **zero-cost abstraction at the type level**. Newtypes, phantom types, and typestate markers are all erased by the compiler -- they exist only during type checking and generate no runtime code. This means you can encode rich invariants (units of measurement, state machine transitions, semantic identity) without paying any performance cost. The only cost is a few lines of type definitions, and the payoff is that entire categories of bugs become impossible.

Traits are Rust's primary tool for abstraction. The choice between generics (static dispatch) and trait objects (dynamic dispatch) is a fundamental architecture decision. Generics produce specialized machine code for each concrete type -- the compiler can inline and optimize across the abstraction boundary, giving you the performance of hand-written specialized code with the expressiveness of polymorphism. Trait objects (`dyn Trait`) use vtable indirection, which costs a pointer dereference per call but enables heterogeneous collections and runtime polymorphism. The default should be generics; reach for `dyn Trait` when you need runtime flexibility or want to reduce binary size.

Associated types and generic parameters serve different purposes. An associated type says "there is exactly one natural choice of this type for each implementor" (e.g., `Iterator::Item`). A generic parameter says "this trait can be implemented multiple times for different type arguments" (e.g., `From<T>`). Choosing correctly eliminates ambiguity and reduces annotation noise.

Trait design has a forward-compatibility dimension that is unique to Rust's ecosystem. Because adding a required method to a trait is a breaking change for all implementors, library authors must think ahead. Sealed traits prevent external implementations, preserving the freedom to evolve the trait. Default method implementations let you add new methods without breaking existing code. These patterns are not optional niceties -- they are structural requirements for any public trait that will exist across semver boundaries.

Finally, the "derive what you can" principle recognizes that types in Rust are social contracts. A type that lacks `Debug` cannot appear in assert messages. A type that lacks `Clone` cannot be duplicated when ownership rules demand it. A type that lacks `PartialEq` cannot be compared in tests. Eagerly deriving common traits on public types is not boilerplate -- it is the minimum social contract that makes a type a good citizen in the ecosystem.

## Consumer Guide

### When Reviewing Code

Look for these signals: bare primitive types used for semantically distinct values (two `u64` parameters that mean different things), boolean flags tracking state that could be encoded in the type system, `dyn Trait` in performance-critical paths where generics would suffice, traits with many required methods that could have defaults, and public types missing `Debug`/`Clone`/`PartialEq` derives. Check for `PhantomData` usage without clear documentation of what invariant it encodes. Flag generic trait parameters that should be associated types (the telltale sign is turbofish annotations cluttering call sites).

### When Designing / Planning

Identify the domain invariants that should be compile-time guarantees. Map out state machines and ask whether typestate encoding is appropriate for the number of states. Decide trait boundaries early: which traits will be sealed (library-controlled implementation set) vs. open (user-extensible). Choose between associated types and generics based on whether the relationship is one-to-one or one-to-many. Plan the derive strategy for public types at the struct definition, not as an afterthought.

### When Implementing

Start every new domain concept by asking: "Should this be a newtype?" If two values of the same primitive type have different meanings, the answer is almost always yes. Use `PhantomData` for type-level tags that carry no data. Default to generics for trait bounds; switch to `dyn Trait` only when you need heterogeneous collections or plugin-style extensibility. Provide default implementations for trait methods where a sensible baseline exists. Derive `Debug, Clone, PartialEq, Eq, Hash, Default` on every public struct unless a specific trait is semantically inappropriate for the type.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [NewtypeForSemantics](../../Rules/Rust/NewtypeForSemantics.md) | HIGH | Wrap primitives in newtypes to prevent accidental mixing of semantically distinct values |
| [TypestatePattern](../../Rules/Rust/TypestatePattern.md) | MEDIUM | Encode state machines in generics so invalid transitions are compile errors |
| [AssociatedTypesOverGenerics](../../Rules/Rust/AssociatedTypesOverGenerics.md) | MEDIUM | Use associated types when a trait has one natural implementation per type |
| [TraitObjectsVsGenerics](../../Rules/Rust/TraitObjectsVsGenerics.md) | HIGH | Default to generics for performance; use dyn Trait for runtime polymorphism |
| [SealedTraitsForExtensibility](../../Rules/Rust/SealedTraitsForExtensibility.md) | MEDIUM | Seal public traits to preserve the ability to add methods across versions |
| [PhantomDataForTypeConstraints](../../Rules/Rust/PhantomDataForTypeConstraints.md) | MEDIUM | Use PhantomData for type parameters that encode invariants without storing data |
| [DefaultTraitImplementations](../../Rules/Rust/DefaultTraitImplementations.md) | MEDIUM | Provide default method implementations to reduce implementor burden |
| [EagerCommonTraitImpls](../../Rules/Rust/EagerCommonTraitImpls.md) | HIGH | Derive Debug, Clone, PartialEq, Eq, Hash, Default on public types |

## Rule Interactions

**NewtypeForSemantics + PhantomDataForTypeConstraints**: Newtypes wrap a concrete value to give it a distinct type. PhantomData goes further -- it attaches a type parameter that carries no data at all. Together they cover the spectrum from "this u64 means AccountId" (newtype) to "this struct is parameterized by a unit of measurement" (phantom).

**TypestatePattern + PhantomDataForTypeConstraints**: The typestate pattern relies on PhantomData to carry the state type parameter. Understanding phantom types is prerequisite to implementing typestate.

**TraitObjectsVsGenerics + AssociatedTypesOverGenerics**: The dispatch mechanism (static vs. dynamic) interacts with how trait type parameters are defined. Traits with associated types work naturally with both generics and trait objects. Traits with generic parameters can be used as trait objects only when the generic is specified (`dyn Trait<Concrete>`).

**SealedTraitsForExtensibility + DefaultTraitImplementations**: Both patterns address trait evolution. Sealing prevents external implementations so you can add required methods. Defaults let you add methods without breaking existing implementations. In practice, library traits often use both: sealed to control the implementation set, and defaults to minimize boilerplate.

**EagerCommonTraitImpls + NewtypeForSemantics**: Newtypes must manually derive common traits since they do not inherit them from the wrapped type. Forgetting to derive `Debug` or `Clone` on a newtype makes it less usable than the bare primitive it replaced.

## Anti-Patterns (Severity Calibration)

### HIGH

- **Primitive obsession**: Using `u64`, `String`, or `bool` for semantically distinct domain concepts. Two `u64` parameters in a function signature that mean "user ID" and "account ID" are a swap-bug waiting to happen.
- **Missing derives on public types**: A public struct without `Debug` cannot be printed in test assertions. A public struct without `Clone` forces users to restructure their ownership model. This is a usability defect.
- **`dyn Trait` in hot loops**: Virtual dispatch prevents inlining and auto-vectorization. In tight loops, the cost per iteration adds up. Use generics when the concrete type is known at compile time.

### MEDIUM

- **Turbofish everywhere**: If callers constantly need `::<Type>` annotations to disambiguate, the trait likely uses generic parameters where associated types would be cleaner.
- **Boolean state flags**: `is_connected: bool` fields that control which methods are valid. The compiler cannot help if you call `send()` when `is_connected` is false. Typestate makes this a compile error.
- **All-required trait methods**: A trait with 8 required methods when 6 could have defaults. Every implementor writes the same boilerplate for the methods that rarely vary.
- **Unsealed library traits**: A public trait in a library crate that anyone can implement. The first time you need to add a method, you face a semver-breaking change.

## Does Not Cover

- **Lifetime annotations and borrowing** -- covered by RS1 Ownership & Borrowing.
- **Error type design** (`thiserror`, `anyhow`, custom error enums) -- covered by RS2 Error Handling.
- **Macro-generated trait implementations** -- procedural macros are a separate concern from trait design.
- **Unsafe trait implementations** -- unsafe Rust is a distinct dimension with its own rules.
- **Async trait design** (`async_trait`, RPITIT) -- async patterns have unique constraints around object safety and pinning.

## See Also

- **RS7 API Design**: Trait surface area, naming conventions, and method signatures overlap with type system design. Rules in RS7 address how traits appear to consumers; rules here address how traits encode invariants.

## Sources

- Rust Design Patterns (RDP) -- Newtype pattern, Typestate pattern
- Rust API Guidelines (RAG) -- C-NEWTYPE, C-SEALED, C-COMMON-TRAITS
- Effective Rust (ER) -- Item 6 (newtypes), Item 10 (common traits), Item 12 (generics vs trait objects), Item 13 (default implementations)
- The Rust Programming Language (RBOOK) -- Ch 18.2 (trait objects), Ch 20.2 (associated types)
- Rust by Example (RBE) -- Phantom Types, Associated Types
- Cliffle -- Typestate pattern in Rust
