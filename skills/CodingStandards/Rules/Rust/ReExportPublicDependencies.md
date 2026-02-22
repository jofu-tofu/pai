### RS10.6 ReExportPublicDependencies

**Impact: HIGH (Consumers forced to find and match exact dependency versions you use internally)**

When your public API exposes types from a dependency (in function signatures, trait bounds, or struct fields), you must re-export those types. Otherwise consumers must add the same dependency at a compatible version, and a semver-incompatible upgrade in your dependency becomes a silent breaking change for them.

**Incorrect: Public API leaks dependency types without re-export**

```rust
// my-http-client/src/lib.rs
use http::StatusCode;  // from the `http` crate

pub struct Response {
    pub status: StatusCode,  // consumers must depend on `http` crate directly
    pub body: Vec<u8>,
}

pub fn get(url: &str) -> Response { /* ... */ }

// Consumer's Cargo.toml must add:
//   http = "0.2"  # must match exact major version my-http-client uses
// If my-http-client upgrades to http 1.0, consumer's code silently breaks
// because http::StatusCode 0.2 != http::StatusCode 1.0
```

**Correct: Re-export dependency types used in public API**

```rust
// my-http-client/src/lib.rs
pub use http::StatusCode;  // re-exported: consumers use my_http_client::StatusCode

pub struct Response {
    pub status: StatusCode,
    pub body: Vec<u8>,
}

pub fn get(url: &str) -> Response { /* ... */ }

// Consumer code:
//   use my_http_client::{get, StatusCode};
//   let resp = get("https://example.com");
//   assert_eq!(resp.status, StatusCode::OK);
// No need to independently depend on `http` crate
// Version upgrades are handled by my-http-client's semver
```

**When acceptable:**
- Types from `std` which are always available and version-stable
- Internal (non-public) API boundaries within a workspace where version coupling is intentional
