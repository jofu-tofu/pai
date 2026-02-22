### RS1.8 MoveSemanticsByDefault

**Impact: MEDIUM (APIs that take ownership by default give callers maximum flexibility over allocation and lifetime management)**

Rust's default is move semantics: when a function takes a parameter by value, ownership transfers to the callee. This is the most flexible default for API design because callers who have owned data can pass it directly (zero-cost move), while callers who need to retain ownership can explicitly clone. Using `impl Into<String>` or `impl AsRef<T>` at API boundaries lets callers pass either owned or borrowed data, with conversion handled at the call site. This follows the Rust API Guidelines principle of caller-controlled allocation.

**Incorrect: Borrowing when the function will clone internally anyway**

```rust
// Takes a reference but immediately clones -- caller pays for the
// clone whether they needed the original or not
struct User {
    name: String,
    email: String,
}

impl User {
    fn new(name: &str, email: &str) -> Self {
        Self {
            name: name.to_owned(),   // hidden allocation
            email: email.to_owned(), // hidden allocation
        }
    }
}

// Caller who has an owned String must still pay for the clone
let name = get_name_from_db(); // returns String
let email = get_email_from_db(); // returns String
let user = User::new(&name, &email); // borrows then clones internally
// name and email are still alive but often unused after this point
```

**Correct: Take ownership or use Into for flexible conversion**

```rust
struct User {
    name: String,
    email: String,
}

impl User {
    // impl Into<String> accepts both &str and String
    fn new(name: impl Into<String>, email: impl Into<String>) -> Self {
        Self {
            name: name.into(),   // String passes through, &str allocates
            email: email.into(), // caller controls the cost
        }
    }
}

// Caller with owned data -- zero-cost move, no clone
let name = get_name_from_db();
let email = get_email_from_db();
let user = User::new(name, email); // moved, not cloned

// Caller with string literals -- single allocation each
let user = User::new("Alice", "alice@example.com");
```

**When acceptable:**
- The function only reads the data and does not store it -- accept `&T` or `&str` to avoid forcing the caller to give up ownership
- The function is called in a tight loop and the parameter is reused across iterations -- borrowing avoids repeated allocation
- Generic trait implementations where the trait signature dictates `&self` or `&T` parameters
