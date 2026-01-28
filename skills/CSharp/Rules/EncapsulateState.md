### 1.4 Encapsulate State

**Impact: CRITICAL (Exposed internals invite misuse)**

Public fields and settable properties expose internal state, allowing callers to put objects in invalid states. Encapsulation protects invariants and makes changes safe.

**Incorrect: Exposed internal state**

```csharp
public class BankAccount
{
    public decimal Balance;  // Public field - anyone can set
    public List<Transaction> Transactions;  // Mutable collection exposed

    public BankAccount()
    {
        Balance = 0;
        Transactions = new List<Transaction>();
    }
}

// Callers can corrupt state
var account = new BankAccount();
account.Balance = -1000;  // Invalid negative balance
account.Transactions.Clear();  // History destroyed
account.Transactions = null;  // Breaks future operations
```

**Correct: Encapsulated with controlled access**

```csharp
public class BankAccount
{
    private readonly List<Transaction> _transactions = [];

    public decimal Balance { get; private set; }

    public IReadOnlyList<Transaction> Transactions => _transactions;

    public void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));

        Balance += amount;
        _transactions.Add(new Transaction(TransactionType.Deposit, amount));
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));
        if (amount > Balance)
            throw new InvalidOperationException("Insufficient funds");

        Balance -= amount;
        _transactions.Add(new Transaction(TransactionType.Withdrawal, amount));
    }
}

// State changes only through controlled methods
var account = new BankAccount();
account.Deposit(100);  // Valid operation
// account.Balance = -1000;  // Won't compile - private set
// account.Transactions.Add(...);  // Won't compile - IReadOnlyList
```

**Guidelines:**
- Use `private set` or `init` for properties that shouldn't change externally
- Return `IReadOnlyList<T>` or `IReadOnlyCollection<T>` for collections
- Validate all inputs in mutation methods
