### TS2.4 Infer Over Explicit Type Arguments

**Impact: HIGH (Let TypeScript infer generic arguments from usage — explicit type arguments add noise and can lie)**

TypeScript's inference engine is powerful. When you call a generic function, the compiler infers type arguments from the values you pass. Explicit type arguments (`fn<string>(...)`) add visual noise and can be wrong if the value doesn't match — they're assertions in disguise.

**Incorrect: Explicit type arguments add noise and can lie**

```typescript
const names = ["Alice", "Bob", "Charlie"];

// Unnecessary — TypeScript infers string from the callback
const upper = names.map<string>((name) => name.toUpperCase());

// Dangerous — explicit type argument doesn't match actual data
const ids = [1, 2, 3];
const result = ids.reduce<string[]>((acc, id) => {
  acc.push(id);  // pushing number into string[] — no error with explicit type arg!
  return acc;
}, []);

// Redundant type parameter on function declaration
function identity<T>(value: T): T { return value; }
const x = identity<number>(42);  // TypeScript already infers number from 42
```

**Correct: Let inference work**

```typescript
const names = ["Alice", "Bob", "Charlie"];
const upper = names.map((name) => name.toUpperCase());  // inferred: string[]

const ids = [1, 2, 3];
const result = ids.reduce((acc, id) => {
  acc.push(id);
  return acc;
}, [] as number[]);  // seed value drives inference

const x = identity(42);  // inferred: number — clean and correct
```

**When acceptable:**
- Ambiguous inference: when TypeScript can't infer correctly from arguments alone (e.g., `createContext<Theme>()` with no default)
- Readability: when the inferred type is complex and explicit annotation helps readers
- Return type annotation on exported functions — explicit return types help API consumers and catch implementation drift
