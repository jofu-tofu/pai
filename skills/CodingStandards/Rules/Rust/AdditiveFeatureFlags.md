### RS10.2 AdditiveFeatureFlags

**Impact: CRITICAL (Mutually exclusive features cause compilation failures in dependency trees)**

Cargo features must be additive: enabling any combination of features must compile and produce correct behavior. When a downstream crate enables features from two of its dependencies that transitively activate conflicting features in your crate, compilation fails or behavior silently changes. This is unfixable by the downstream consumer.

**Incorrect: Mutually exclusive features that break when combined**

```rust
// Cargo.toml
[features]
default = ["json"]
json = ["serde_json"]
yaml = ["serde_yaml"]

// src/lib.rs
#[cfg(feature = "json")]
mod serializer {
    pub fn serialize(data: &Data) -> String {
        serde_json::to_string(data).unwrap()
    }
}

#[cfg(feature = "yaml")]
mod serializer {  // ERROR: duplicate module when both features enabled
    pub fn serialize(data: &Data) -> String {
        serde_yaml::to_string(data).unwrap()
    }
}
// A dependency tree that activates both "json" and "yaml" fails to compile
```

**Correct: Additive features that compose safely**

```rust
// Cargo.toml
[features]
default = ["json"]
json = ["serde_json"]
yaml = ["serde_yaml"]

// src/lib.rs
#[cfg(feature = "json")]
pub mod json {
    pub fn serialize(data: &Data) -> String {
        serde_json::to_string(data).unwrap()
    }
}

#[cfg(feature = "yaml")]
pub mod yaml {
    pub fn serialize(data: &Data) -> String {
        serde_yaml::to_string(data).unwrap()
    }
}

// CI: test feature combinations
// cargo test --no-default-features
// cargo test --features json
// cargo test --features yaml
// cargo test --all-features
```

**When acceptable:**
- Binary crates (not libraries) where the author controls the full feature matrix
- Features gated behind `#[cfg(target_os = ...)]` where mutual exclusion is enforced by the platform
