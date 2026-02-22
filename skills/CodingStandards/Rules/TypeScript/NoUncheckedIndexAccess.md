### TS1.2 No Unchecked Index Access

**Impact: CRITICAL (Prevents undefined-at-runtime from array/object indexing that TypeScript normally assumes safe)**

By default, TypeScript treats `array[0]` as the element type, not `T | undefined`. This is a lie — the index may not exist. `noUncheckedIndexedAccess` forces you to handle the `undefined` case, catching a class of bugs that `strict: true` alone misses.

**Incorrect: Array indexing assumed safe**

```typescript
// tsconfig: noUncheckedIndexedAccess is NOT enabled
const users = ["Alice", "Bob"];
const third = users[2];         // TypeScript says: string
console.log(third.toUpperCase()); // Runtime: Cannot read properties of undefined

const config: Record<string, string> = { theme: "dark" };
const lang = config["language"]; // TypeScript says: string
console.log(lang.split("-"));    // Runtime: crash
```

**Correct: Index access returns T | undefined**

```typescript
// tsconfig: "noUncheckedIndexedAccess": true
const users = ["Alice", "Bob"];
const third = users[2];          // TypeScript says: string | undefined

if (third) {
  console.log(third.toUpperCase()); // safe — narrowed to string
}

const config: Record<string, string> = { theme: "dark" };
const lang = config["language"] ?? "en-US"; // explicit fallback
```

**When acceptable:**
- After a bounds check: `if (i < array.length)` followed by `array[i]` — but narrowing with `at()` or optional chaining is still preferred
- Tuple types with known length already have correct types at specific indices
