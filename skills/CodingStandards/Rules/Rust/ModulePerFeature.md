### RS10.4 ModulePerFeature

**Impact: MEDIUM (Layer-based organization scatters related logic and increases coupling)**

Organize modules by feature or domain concept, not by technical layer. A change to a feature should touch files in one module subtree, not scatter across `models/`, `handlers/`, `services/`, and `repositories/`. Use `pub(crate)` for internal types to keep the public surface minimal.

**Incorrect: Layer-based organization**

```rust
// src/
//   models/
//     user.rs
//     order.rs
//   handlers/
//     user_handler.rs
//     order_handler.rs
//   services/
//     user_service.rs
//     order_service.rs
//   repositories/
//     user_repo.rs
//     order_repo.rs

// Adding "order cancellation" touches 4 directories
// user_handler.rs imports from models, services, repositories
// Every layer depends on every other layer's types
```

**Correct: Feature-based organization**

```rust
// src/
//   user/
//     mod.rs        // pub struct User, pub fn endpoints()
//     auth.rs       // pub(crate) fn verify_credentials()
//     storage.rs    // pub(crate) fn save_user()
//   order/
//     mod.rs        // pub struct Order, pub fn endpoints()
//     fulfillment.rs // pub(crate) fn fulfill()
//     storage.rs    // pub(crate) fn save_order()
//   shared/
//     db.rs         // pub(crate) connection pool
//     error.rs      // pub error types

// src/order/mod.rs
pub struct Order { /* ... */ }

pub fn endpoints() -> Router {
    Router::new()
        .route("/orders", post(create))
        .route("/orders/:id/cancel", post(cancel))
}

// Internal implementation hidden from other modules
pub(crate) use storage::save_order;

// Adding "order cancellation" only touches src/order/
```

**When acceptable:**
- Very small crates (under ~500 lines) where a flat module structure is clearer
- Framework-mandated layouts (some ORMs expect a specific directory structure)
