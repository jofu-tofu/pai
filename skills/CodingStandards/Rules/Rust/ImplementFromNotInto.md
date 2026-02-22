### RS7.2 ImplementFromNotInto

**Impact: HIGH (Blanket Into implementation comes free; accepting impl Into in parameters enables ergonomic coercion)**

Always implement `From<T>` rather than `Into<T>`. The standard library provides a blanket `impl<T, U> Into<U> for T where U: From<T>`, so implementing `From` gives you `Into` for free. Implementing `Into` directly skips this blanket and also prevents callers from using `Type::from(value)` syntax. On the consumption side, accepting `impl Into<T>` in function parameters lets callers pass either `T` or any type that converts into `T` without explicit conversion at the call site.

**Incorrect: Implementing Into directly and requiring exact types in parameters**

```rust
pub struct UserId(u64);

// Wrong direction: implement Into instead of From
impl Into<UserId> for u64 {
    fn into(self) -> UserId {
        UserId(self)
    }
}

// Requires callers to convert manually
fn lookup_user(id: UserId) -> Option<String> {
    Some(format!("User {}", id.0))
}

fn main() {
    // Caller must write explicit conversion every time
    let user = lookup_user(42u64.into());
}
```

**Correct: Implement From, accept impl Into in parameters**

```rust
pub struct UserId(u64);

// From gives Into for free via blanket impl
impl From<u64> for UserId {
    fn from(val: u64) -> Self {
        UserId(val)
    }
}

// Accept impl Into<UserId> -- callers pass u64 directly
fn lookup_user(id: impl Into<UserId>) -> Option<String> {
    let id = id.into();
    Some(format!("User {}", id.0))
}

fn main() {
    let user = lookup_user(42u64);     // implicit conversion
    let explicit = UserId::from(42);    // From syntax also works
}
```

**When acceptable:**
- Implementing conversions for types from external crates where orphan rules prevent `From` (you own neither the source nor the target type)
- When the conversion is fallible -- use `TryFrom` instead of `From` in that case
