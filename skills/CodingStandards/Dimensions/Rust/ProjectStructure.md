# Project Structure -- Rust

> Structure Rust projects around Cargo workspaces, additive feature flags, and semver discipline so that crates compose safely across the ecosystem.

## Mental Model

Rust's project structure is inseparable from Cargo. Unlike ecosystems where project layout is a matter of convention, Cargo's workspace system, feature flags, and semver resolution are compiler-enforced mechanisms that directly affect whether code compiles, how large the binary is, and whether downstream consumers can use your crate at all.

The foundational unit is the **workspace**. Any project with two or more crates should use `[workspace]` and `[workspace.dependencies]` to share a single `Cargo.lock` and unified dependency versions. Without a workspace, each crate resolves dependencies independently, leading to version divergence where `serde 1.0.180` in one crate is a different type than `serde 1.0.193` in another -- even though they are semver-compatible. The workspace eliminates this class of bug entirely.

**Feature flags** are Cargo's mechanism for conditional compilation, and they carry a critical constraint: features must be additive. Cargo resolves features by taking the union of all features requested by all crates in the dependency tree. If crate A enables your `json` feature and crate B enables your `yaml` feature, both features are active simultaneously. If those features are mutually exclusive -- defining the same module, the same function, or toggling incompatible behavior -- compilation fails and the downstream consumer has no fix. Designing features to be additive from day one is not optional; it is a correctness requirement imposed by the resolver.

Default features deserve equal care. They determine what every consumer gets unless they explicitly opt out with `default-features = false`. Overly broad defaults force unnecessary dependencies (and compile time) on every consumer. Overly narrow defaults force every consumer to discover and enable the features they need. The sweet spot is the 80% use case: the set of features that most consumers need, with everything else available as explicit opt-in.

**Module organization** follows from Rust's visibility system. The `pub(crate)` modifier enables feature-based module layouts where each domain concept lives in its own subtree, exposes a narrow public API through `mod.rs`, and keeps implementation details invisible to sibling modules. This is a structural advantage over layer-based layouts (models/, handlers/, services/) where a single feature change touches files across the entire tree.

**Re-exporting public dependencies** is a semver obligation. When your public API returns or accepts types from a dependency, consumers are transitively coupled to that dependency's version. Without a `pub use` re-export, consumers must independently depend on the same crate at a compatible version -- and a major version bump in your dependency silently becomes a breaking change in yours.

**Semver discipline** ties everything together. The Rust ecosystem's dependency resolution assumes that semver is followed faithfully. A breaking change in a patch release can cascade through the dependency tree, breaking builds for crates that never directly depend on yours. Automated checking with `cargo-semver-checks` catches the most common accidental breakages: removed public items, changed signatures, tightened trait bounds.

## Consumer Guide

### When Reviewing Code

Check workspace setup first: if the repository contains more than one `Cargo.toml` with `[package]`, verify that a root `[workspace]` exists and that shared dependencies use `dep.workspace = true`. Look for duplicate dependency versions across crate `Cargo.toml` files -- these indicate missing `[workspace.dependencies]` entries. Examine feature flags for additivity: search for `#[cfg(feature = "...")]` blocks that define the same item name or module. Check that `cargo test --all-features` is in CI. Verify that public API types from dependencies are re-exported with `pub use`. Look for `use foo::*` outside of test modules and preludes.

### When Designing / Planning

Decide on workspace structure before writing code. Identify the crate boundaries: a library crate for the core logic, a binary crate for the CLI or server, and optionally a types crate if the data model is shared across multiple consumers. Plan feature flags as additive modules from the start -- retrofitting additivity onto mutually exclusive features requires API redesign. Identify which dependencies will appear in your public API and plan re-exports. If the crate will be published, establish a semver policy and CI gate before the first release.

### When Implementing

Use `[workspace.dependencies]` for every shared dependency. Use the `dep:` syntax in feature definitions to avoid implicit feature activation. Organize modules by feature domain, not technical layer. Mark internal types `pub(crate)`. Import symbols explicitly rather than with wildcards. Re-export any dependency type that appears in a public function signature, struct field, or trait bound. Add `cargo-semver-checks` to CI for any published crate.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [WorkspaceForMultiCrate](../../Rules/Rust/WorkspaceForMultiCrate.md) | HIGH | Use Cargo workspaces with shared dependencies for multi-crate projects |
| [AdditiveFeatureFlags](../../Rules/Rust/AdditiveFeatureFlags.md) | CRITICAL | Feature flags must be additive; test all combinations in CI |
| [MinimalDefaultFeatures](../../Rules/Rust/MinimalDefaultFeatures.md) | MEDIUM | Default features cover the 80% use case; core works without defaults |
| [ModulePerFeature](../../Rules/Rust/ModulePerFeature.md) | MEDIUM | Organize by feature domain, not technical layer; use pub(crate) internally |
| [AvoidWildcardImports](../../Rules/Rust/AvoidWildcardImports.md) | MEDIUM | No wildcard imports except in tests and curated preludes |
| [ReExportPublicDependencies](../../Rules/Rust/ReExportPublicDependencies.md) | HIGH | Re-export dependency types exposed in public API signatures |
| [SemverDiscipline](../../Rules/Rust/SemverDiscipline.md) | HIGH | Run cargo-semver-checks in CI; understand what constitutes a breaking change |

## Rule Interactions

**AdditiveFeatureFlags + MinimalDefaultFeatures**: These rules work together to define the feature surface. Additive flags ensure any combination compiles; minimal defaults ensure consumers are not burdened with unnecessary dependencies. A feature that is additive but included in defaults unnecessarily still increases compile time for every consumer.

**ReExportPublicDependencies + SemverDiscipline**: Re-exporting isolates consumers from dependency version changes, but it also means that bumping the re-exported dependency's major version is a breaking change in your crate. Semver checks catch this: if you upgrade `http` from 0.2 to 1.0 and re-export `StatusCode`, `cargo-semver-checks` will flag the type change.

**WorkspaceForMultiCrate + ModulePerFeature**: Workspace structure handles inter-crate organization while module-per-feature handles intra-crate organization. Together they ensure that both levels of the project hierarchy are organized around domain concepts rather than technical layers.

**AvoidWildcardImports + ModulePerFeature**: Feature-based modules with narrow `pub(crate)` exports make explicit imports natural -- there are fewer symbols to import, and each one maps directly to a domain concept.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Mutually exclusive feature flags in a library crate**: Two features that define the same symbol or toggle incompatible behavior. Downstream crates cannot resolve this conflict because Cargo takes the union of all requested features.
- **Shipping breaking changes in patch releases**: Removing public items, changing function signatures, or tightening trait bounds in a patch or minor release. Silent build failures cascade through the dependency tree.

### HIGH

- **Missing workspace for multi-crate projects**: Each crate resolves dependencies independently, leading to duplicate compilation, version conflicts, and type incompatibility across crate boundaries.
- **Public API exposing dependency types without re-export**: Consumers must find and match the exact dependency version, and any major version bump silently breaks their code.
- **No CI testing of `--all-features`**: Feature combinations that fail to compile are only discovered when a downstream consumer happens to activate the right combination.

### MEDIUM

- **Wildcard imports in production code**: Name collisions surface as cryptic "ambiguous import" errors, and readers lose the ability to trace where symbols originate.
- **Layer-based module organization**: Adding a feature requires touching files in every layer directory, increasing the scope and risk of every change.
- **Kitchen-sink default features**: Every consumer pays the compile-time and binary-size cost of dependencies they do not use.

## Does Not Cover

- **Build script (`build.rs`) best practices** -- code generation, linking C libraries, and build-time configuration are separate concerns.
- **Cross-compilation and target-specific configuration** -- `#[cfg(target_os)]` and `.cargo/config.toml` target settings are outside this dimension.
- **Dependency auditing and supply chain security** -- `cargo-audit`, `cargo-vet`, and `cargo-deny` address security, not structural organization.
- **Benchmarking and profiling setup** -- covered by the Performance dimension.

## Sources

- Cargo Book: Workspaces (`[workspace]`, `[workspace.dependencies]`)
- Cargo Book: Features (additivity requirement, `dep:` syntax, default features)
- Cargo Book: SemVer Compatibility
- Effective Rust, Item 21: Understand semver
- Effective Rust, Item 23: Avoid wildcard imports
- Effective Rust, Item 24: Re-export dependencies whose types appear in your public API
- Effective Rust, Item 26: Be wary of feature creep
- The Rust Programming Language, Chapter 7: Managing Growing Projects with Packages, Crates, and Modules
- The Rust Programming Language, Chapter 14.3: Cargo Workspaces
- Rust API Guidelines, C-STABLE: Public dependencies of a stable crate are stable
