### RS10.7 SemverDiscipline

**Impact: HIGH (Undetected breaking changes in patch releases corrupt downstream dependency trees)**

Rust's ecosystem depends on semver for safe dependency resolution. A breaking change released as a patch or minor version can cause compilation failures across the entire dependency tree. Use `cargo-semver-checks` in CI to catch accidental breaking changes before they ship.

**Incorrect: No automated semver verification**

```rust
// Cargo.toml
[package]
name = "my-lib"
version = "1.2.3"

// src/lib.rs -- v1.2.3 -> v1.2.4 (patch release)
// Removed a public function (BREAKING!)
// pub fn parse(input: &str) -> Result<Data, Error> { ... }  // deleted

// Changed a public struct field type (BREAKING!)
pub struct Config {
    pub timeout: u64,  // was Duration in v1.2.3
}

// CI: only runs cargo test
// Breaking changes ship undetected as a patch release
```

**Correct: Semver-checks enforced in CI**

```rust
// .github/workflows/ci.yml (or equivalent CI config)
// jobs:
//   semver:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - uses: obi1kenobi/cargo-semver-checks-action@v2
//
//   test:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v4
//       - run: cargo test --all-features

// Common breaking changes cargo-semver-checks catches:
// - Removing or renaming public items
// - Changing function signatures
// - Adding required fields to public structs
// - Tightening trait bounds
// - Removing trait implementations
// - Changing types in public API

// Release checklist:
// 1. cargo semver-checks (passes for minor/patch)
// 2. cargo test --all-features
// 3. Update CHANGELOG.md
// 4. cargo publish
```

**When acceptable:**
- Pre-1.0 crates (`0.x.y`) where the API is explicitly unstable and consumers expect breakage
- Internal crates in a workspace that are never published to crates.io
