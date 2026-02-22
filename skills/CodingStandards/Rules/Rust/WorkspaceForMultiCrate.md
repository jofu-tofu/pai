### RS10.1 WorkspaceForMultiCrate

**Impact: HIGH (Prevents dependency version divergence and duplicated build artifacts across crates)**

Any project with two or more crates should use a Cargo workspace. Without one, each crate resolves dependencies independently, leading to version conflicts, duplicated compilation, and inconsistent dependency trees that only surface at integration time.

**Incorrect: Separate projects with independent Cargo.toml files**

```rust
// crate-a/Cargo.toml
[package]
name = "crate-a"
version = "0.1.0"

[dependencies]
serde = "1.0.193"
tokio = { version = "1.35", features = ["full"] }

// crate-b/Cargo.toml
[package]
name = "crate-b"
version = "0.1.0"

[dependencies]
serde = "1.0.180"  # different version than crate-a
tokio = { version = "1.35", features = ["rt"] }  # different features
crate-a = { path = "../crate-a" }
// Two different serde versions compiled, types are incompatible across crates
```

**Correct: Workspace with shared dependency definitions**

```rust
// Cargo.toml (workspace root)
[workspace]
members = ["crate-a", "crate-b"]

[workspace.dependencies]
serde = { version = "1.0.193", features = ["derive"] }
tokio = { version = "1.35", features = ["full"] }

// crate-a/Cargo.toml
[package]
name = "crate-a"
version = "0.1.0"

[dependencies]
serde = { workspace = true }
tokio = { workspace = true }

// crate-b/Cargo.toml
[package]
name = "crate-b"
version = "0.1.0"

[dependencies]
serde = { workspace = true }
tokio = { workspace = true }
crate-a = { path = "../crate-a" }
// Single version of each dependency, single Cargo.lock, shared build cache
```

**When acceptable:**
- Truly independent projects that share a repository but have no dependency relationship
- Prototyping a single-crate project that has not yet split into multiple crates
