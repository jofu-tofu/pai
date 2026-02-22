### RS8.2 IntegrationTestsInTestsDir

**Impact: HIGH (Integration tests verify the public API as an external consumer would, catching interface regressions)**

Integration tests live in the `/tests/` directory and can only access your crate's public API. This enforces a clean separation: unit tests verify internal logic, integration tests verify that the published interface works correctly. Shared test utilities go in `/tests/common/mod.rs` to avoid Cargo treating them as standalone test files.

**Incorrect: Shared helpers as top-level test files or integration logic in unit tests**

```rust
// tests/helpers.rs  <-- Cargo treats this as its own test binary
pub fn setup_test_db() -> TestDb {
    TestDb::new(":memory:")
}

// src/lib.rs  <-- integration-level tests crammed into unit test module
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn full_workflow() {
        let db = Database::connect(":memory:");
        let user = create_user(&db, "alice");
        let order = place_order(&db, &user, vec![item("widget", 3)]);
        let receipt = checkout(&db, &order);
        assert!(receipt.is_ok());
    }
}
```

**Correct: Integration tests in /tests/ with shared helpers in common/mod.rs**

```rust
// tests/common/mod.rs  <-- shared helpers, not treated as a test binary
pub fn setup_test_db() -> TestDb {
    TestDb::new(":memory:")
}

pub fn seed_user(db: &TestDb, name: &str) -> User {
    db.insert_user(name).expect("seed user")
}

// tests/order_workflow.rs  <-- true integration test
mod common;

use my_crate::{create_user, place_order, checkout, item};

#[test]
fn full_order_workflow_produces_receipt() {
    let db = common::setup_test_db();
    let user = common::seed_user(&db, "alice");
    let order = place_order(&db, &user, vec![item("widget", 3)]);
    let receipt = checkout(&db, &order);
    assert!(receipt.is_ok());
    assert_eq!(receipt.unwrap().total(), 3 * item("widget", 1).price());
}
```

**When acceptable:**
- Small libraries with no public API surface beyond a few functions may not need a separate `/tests/` directory
- When the entire crate is `#[doc(hidden)]` or not intended for external consumption
