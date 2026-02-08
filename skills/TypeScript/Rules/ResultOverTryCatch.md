### 7.1 Result Types Over Try/Catch

**Impact: CRITICAL (Try/catch hides error cases from function signatures — callers don't know a function can fail until it does)**

A function that throws has an invisible failure mode. Callers must read the implementation to know what errors are possible. A `Result<T, E>` return type makes success and failure explicit in the signature — the compiler forces callers to handle both cases.

**Incorrect: Thrown errors are invisible in types**

```typescript
// Signature says it returns User — but it can throw
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Caller has no idea this can fail
const user = await getUser("123");
console.log(user.name);  // crashes if getUser threw
```

**Correct: Result type makes failure explicit**

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function getUser(id: string): Promise<Result<User>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      return { success: false, error: new Error(`HTTP ${res.status}`) };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

// Caller MUST handle both cases — compiler enforces it
const result = await getUser("123");
if (!result.success) {
  console.error(result.error.message);
  return;
}
console.log(result.data.name);  // TypeScript knows this is User
```

**When acceptable:**
- Truly exceptional conditions (out of memory, stack overflow) that callers can't reasonably handle
- Top-level error boundaries in frameworks (Express middleware, React error boundaries) that catch everything
- Library functions matching ecosystem conventions (e.g., `JSON.parse` throws — wrapping every stdlib call in Result is impractical)
