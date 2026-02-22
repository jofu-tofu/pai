### RS2.6 QuestionMarkOverMatch

**Impact: MEDIUM (Nested match arms on Result/Option obscure the happy path and inflate function length)**

The `?` operator extracts the success value and returns early on error in a single character, keeping the happy path linear and readable. Reserve `match` for cases where you need to inspect specific error variants or transform values. For Option/Result transformations, prefer combinators (`.map()`, `.and_then()`, `.ok_or()`) over match when the closure is short.

**Incorrect: Nested match obscures the happy path**

```rust
fn process_order(id: u64) -> Result<Receipt, OrderError> {
    let user = match db::get_user(id) {
        Ok(u) => u,
        Err(e) => return Err(OrderError::from(e)),
    };
    let cart = match db::get_cart(user.cart_id) {
        Ok(c) => c,
        Err(e) => return Err(OrderError::from(e)),
    };
    let total = match cart.compute_total() {
        Ok(t) => t,
        Err(e) => return Err(OrderError::from(e)),
    };
    Ok(Receipt::new(user, total))
}
```

**Correct: ? keeps the happy path linear**

```rust
fn process_order(id: u64) -> Result<Receipt, OrderError> {
    let user = db::get_user(id)?;
    let cart = db::get_cart(user.cart_id)?;
    let total = cart.compute_total()?;
    Ok(Receipt::new(user, total))
}

// Use combinators for Option/Result transforms:
fn find_user_email(id: u64) -> Result<String, AppError> {
    db::get_user(id)?
        .email                              // Option<String>
        .ok_or(AppError::NoEmail(id))       // convert None to error
}

// match is appropriate when handling specific variants:
fn handle_db_result(result: Result<User, DbError>) -> Response {
    match result {
        Ok(user) => Response::ok(user),
        Err(DbError::NotFound { .. }) => Response::not_found(),
        Err(DbError::ConnectionLost(_)) => Response::service_unavailable(),
        Err(e) => Response::internal_error(e),
    }
}
```

**When acceptable:**
- When specific error variants require different handling (routing, retry logic, fallback)
- When you need to transform both the Ok and Err sides in a single expression
- When the match arm performs side effects (logging, metrics) before propagating
