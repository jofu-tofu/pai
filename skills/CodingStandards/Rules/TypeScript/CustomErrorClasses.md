### 7.2 Custom Error Classes

**Impact: HIGH (Generic Error messages force string parsing — custom Error subclasses enable typed catch blocks and discriminated error handling)**

When everything throws `new Error("something went wrong")`, error handling becomes string matching. Custom Error subclasses carry structured data, enable `instanceof` checks, and make error handling as type-safe as the rest of your code.

**Incorrect: Generic errors with string messages**

```typescript
async function transferFunds(from: string, to: string, amount: number) {
  const account = await getAccount(from);
  if (!account) throw new Error("Account not found");
  if (account.balance < amount) throw new Error("Insufficient funds");
  if (amount <= 0) throw new Error("Invalid amount");
  // ...
}

// Caller must parse strings to determine error type
try {
  await transferFunds(from, to, amount);
} catch (e) {
  if (e.message.includes("not found")) { /* ... */ }      // fragile
  else if (e.message.includes("Insufficient")) { /* ... */ } // breaks on typo
}
```

**Correct: Typed error subclasses**

```typescript
class NotFoundError extends Error {
  constructor(public readonly entity: string, public readonly id: string) {
    super(`${entity} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

class InsufficientFundsError extends Error {
  constructor(public readonly balance: number, public readonly required: number) {
    super(`Insufficient funds: have ${balance}, need ${required}`);
    this.name = "InsufficientFundsError";
  }
}

class ValidationError extends Error {
  constructor(public readonly field: string, public readonly reason: string) {
    super(`Validation failed: ${field} — ${reason}`);
    this.name = "ValidationError";
  }
}

// Caller uses instanceof — typed and refactor-safe
try {
  await transferFunds(from, to, amount);
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log(`Missing ${e.entity}: ${e.id}`);  // structured access
  } else if (e instanceof InsufficientFundsError) {
    console.log(`Need ${e.required - e.balance} more`);
  }
}
```

**When acceptable:**
- Simple scripts where a plain `Error` with a descriptive message is sufficient
- When using Result types (Rule 7.1) — the error branch of a Result can be a simple type instead of an Error subclass
