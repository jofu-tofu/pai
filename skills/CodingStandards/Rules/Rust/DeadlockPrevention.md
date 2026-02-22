### RS3.8 DeadlockPrevention

**Impact: HIGH (Inconsistent lock ordering causes deadlocks that only manifest under specific scheduling conditions)**

Deadlock occurs when two tasks each hold a lock the other needs. This is a product of ordering: if task A locks X then Y, and task B locks Y then X, they can permanently block each other. The fix is a global lock ordering convention -- always acquire locks in the same order everywhere in the codebase. For read-heavy workloads, RwLock reduces contention by allowing concurrent readers, but the ordering discipline still applies to multiple RwLocks.

**Incorrect: Inconsistent lock ordering invites deadlock**

```rust
use std::sync::{Arc, Mutex};

struct Bank {
    accounts: Vec<Arc<Mutex<Account>>>,
}

impl Bank {
    // Task 1 calls transfer(a, b) -- locks a then b
    // Task 2 calls transfer(b, a) -- locks b then a
    // DEADLOCK: each holds what the other needs
    fn transfer(&self, from: usize, to: usize, amount: f64) {
        let mut from_acc = self.accounts[from].lock().unwrap();
        let mut to_acc = self.accounts[to].lock().unwrap();
        from_acc.balance -= amount;
        to_acc.balance += amount;
    }
}
```

**Correct: Consistent lock ordering by account ID**

```rust
use std::sync::{Arc, Mutex};

struct Bank {
    accounts: Vec<Arc<Mutex<Account>>>,
}

impl Bank {
    fn transfer(&self, from: usize, to: usize, amount: f64) {
        // Always lock the lower-indexed account first
        let (first, second) = if from < to {
            (from, to)
        } else {
            (to, from)
        };

        let mut first_guard = self.accounts[first].lock().unwrap();
        let mut second_guard = self.accounts[second].lock().unwrap();

        if from < to {
            first_guard.balance -= amount;
            second_guard.balance += amount;
        } else {
            second_guard.balance -= amount;
            first_guard.balance += amount;
        }
    }
}
```

**When acceptable:**
- Single-lock scenarios where only one mutex is ever held at a time (ordering is irrelevant)
- Using try_lock with fallback logic to detect and break potential deadlocks at runtime
- Lock-free data structures (atomics, crossbeam) that eliminate the deadlock class entirely
