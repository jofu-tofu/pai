### RS5.1 NewtypeForSemantics

**Impact: HIGH (Prevents accidental mixing of semantically distinct values that share a primitive type)**

When two parameters have the same primitive type but different meanings, nothing stops you from swapping them at the call site. The compiler sees two `u64` values and is satisfied. A newtype wrapper -- `struct UserId(u64)` -- makes each meaning a distinct type, turning argument-order bugs into compile errors at zero runtime cost.

**Incorrect: Bare primitives allow silent misuse**

```rust
// Two u64 params with different meanings -- easy to swap
fn transfer(from_account: u64, to_account: u64, amount_cents: u64) {
    println!("Transfer {amount_cents} from {from_account} to {to_account}");
}

fn main() {
    let alice_id: u64 = 1001;
    let bob_id: u64 = 2002;
    let amount: u64 = 500;

    // Oops: arguments swapped, but compiles fine
    transfer(bob_id, alice_id, amount);
    // Worse: amount passed as an account ID -- still compiles
    transfer(amount, alice_id, bob_id);
}
```

**Correct: Newtypes make misuse a compile error**

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct AccountId(u64);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct Cents(u64);

fn transfer(from: AccountId, to: AccountId, amount: Cents) {
    println!("Transfer {:?} from {:?} to {:?}", amount, from, to);
}

fn main() {
    let alice = AccountId(1001);
    let bob = AccountId(2002);
    let amount = Cents(500);

    transfer(alice, bob, amount); // correct -- types guide the call
    // transfer(amount, alice, bob); // compile error: expected AccountId, found Cents
}
```

**When acceptable:**
- Internal helper functions where only one value of that type exists and confusion is impossible
- Performance-sensitive FFI boundaries where the newtype wrapper would require constant unwrapping
- Throwaway scripts or prototypes where the type safety overhead is not justified
