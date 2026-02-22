### RS10.3 MinimalDefaultFeatures

**Impact: MEDIUM (Bloated defaults force unnecessary dependencies on all consumers)**

Default features should cover the common use case (roughly 80% of consumers) without pulling in heavy or optional dependencies. Consumers who specify `default-features = false` must still get a functional core crate that compiles and passes its own tests.

**Incorrect: Kitchen-sink defaults that penalize minimal consumers**

```rust
// Cargo.toml
[features]
default = ["tls-native", "compression", "tracing-subscriber", "cli", "serde"]
tls-native = ["native-tls"]
tls-rustls = ["rustls"]
compression = ["flate2", "brotli"]
tracing-subscriber = ["tracing-subscriber/fmt"]
cli = ["clap"]
serde = ["serde", "serde_json"]

// A library consumer who just wants HTTP types now
// depends on native-tls (C library), flate2, brotli, clap, etc.
```

**Correct: Lean defaults with opt-in extras**

```rust
// Cargo.toml
[features]
default = ["tls-rustls"]
tls-native = ["dep:native-tls"]
tls-rustls = ["dep:rustls"]
compression = ["dep:flate2", "dep:brotli"]
tracing = ["dep:tracing-subscriber"]
cli = ["dep:clap"]
serde = ["dep:serde", "dep:serde_json"]

// Core crate compiles with: default-features = false
// Most consumers get TLS out of the box with just the default
// Heavy extras are explicit opt-in

// Using dep: syntax to avoid implicit feature activation
[dependencies]
native-tls = { version = "0.2", optional = true }
rustls = { version = "0.23", optional = true }
flate2 = { version = "1.0", optional = true }
```

**When acceptable:**
- Application crates where there are no downstream consumers
- Crates where the entire feature set is lightweight and nearly all users need everything
