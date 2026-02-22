### RS3.7 AsyncTraitConsiderations

**Impact: MEDIUM (The async-trait crate introduces hidden heap allocations and obscures error messages)**

Since Rust 1.75, async fn is supported natively in traits. The async-trait crate, which was necessary before this stabilization, works by desugaring every async method into a `Pin<Box<dyn Future + Send>>` -- a heap allocation per call that also erases the concrete future type. This makes error messages harder to read, prevents the compiler from optimizing across await points, and adds a performance tax on every invocation. Native async fn in traits avoids all of these costs.

**Incorrect: async-trait macro when native is available**

```rust
use async_trait::async_trait;

#[async_trait]
trait DataStore {
    // Desugars to: fn get(&self, key: &str)
    //   -> Pin<Box<dyn Future<Output = Option<Vec<u8>>> + Send + '_>>
    async fn get(&self, key: &str) -> Option<Vec<u8>>;
    async fn set(&self, key: &str, value: Vec<u8>) -> Result<(), StoreError>;
}

#[async_trait]
impl DataStore for RedisStore {
    async fn get(&self, key: &str) -> Option<Vec<u8>> {
        self.client.get(key).await.ok()
    }
    async fn set(&self, key: &str, value: Vec<u8>) -> Result<(), StoreError> {
        self.client.set(key, value).await.map_err(StoreError::from)
    }
}
```

**Correct: Native async fn in trait (Rust 1.75+)**

```rust
trait DataStore {
    // Zero-cost: compiler generates an opaque future type per impl
    async fn get(&self, key: &str) -> Option<Vec<u8>>;
    async fn set(&self, key: &str, value: Vec<u8>) -> Result<(), StoreError>;
}

impl DataStore for RedisStore {
    async fn get(&self, key: &str) -> Option<Vec<u8>> {
        self.client.get(key).await.ok()
    }
    async fn set(&self, key: &str, value: Vec<u8>) -> Result<(), StoreError> {
        self.client.set(key, value).await.map_err(StoreError::from)
    }
}
```

**When acceptable:**
- Targeting Rust editions before 1.75 where native async fn in traits is not available
- The trait must be object-safe (dyn Trait) -- native async fn in traits does not support dynamic dispatch without the trait_variant crate or manual desugaring
- Libraries that must support a wide range of Rust compiler versions where async-trait provides compatibility
