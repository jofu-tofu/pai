### RS5.5 SealedTraitsForExtensibility

**Impact: MEDIUM (Sealed traits let library authors add methods without breaking downstream crates)**

A sealed trait is one that external crates cannot implement. This is achieved by requiring a private supertrait that lives in a private module. Because no external type can implement the private supertrait, the library author retains the freedom to add new required methods, change default implementations, or refine the trait's contract without causing a semver-breaking change. Without sealing, adding any required method to a public trait is a breaking change.

**Incorrect: Public trait that anyone can implement -- adding methods breaks users**

```rust
// Any crate can implement this trait
pub trait Backend {
    fn read(&self, key: &str) -> Option<Vec<u8>>;
    fn write(&self, key: &str, value: &[u8]);
    // Adding this method later breaks every external implementor:
    // fn delete(&self, key: &str);
}
```

**Correct: Sealed trait preserves freedom to evolve**

```rust
// Private module with private supertrait
mod private {
    pub trait Sealed {}
}

// Public trait requires the private supertrait
pub trait Backend: private::Sealed {
    fn read(&self, key: &str) -> Option<Vec<u8>>;
    fn write(&self, key: &str, value: &[u8]);
    // Safe to add later -- no external implementors exist
    fn delete(&self, key: &str);
}

// Only types in this crate can implement Sealed
pub struct FileBackend;

impl private::Sealed for FileBackend {}

impl Backend for FileBackend {
    fn read(&self, key: &str) -> Option<Vec<u8>> { todo!() }
    fn write(&self, key: &str, value: &[u8]) { todo!() }
    fn delete(&self, key: &str) { todo!() }
}

// External crates can USE Backend but cannot IMPLEMENT it
```

**When acceptable:**
- The trait is intentionally designed as an extension point for downstream crates (e.g., serialization frameworks)
- The trait is application-internal where semver compatibility is not a concern
- The trait is unlikely to gain new methods and sealing adds complexity without benefit
