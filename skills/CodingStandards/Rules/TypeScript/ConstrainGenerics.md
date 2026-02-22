### TS2.3 Constrain Generics

**Impact: HIGH (Unconstrained generics accept anything — constraints make generic functions actually useful by limiting input to valid types)**

A generic function `<T>` with no constraint is barely better than `any` — it accepts everything and knows nothing. Use `extends` to constrain generics to types that have the properties your function actually needs. This gives you autocomplete inside the function and type errors at the call site.

**Incorrect: Unconstrained generic knows nothing about T**

```typescript
function getProperty<T>(obj: T, key: string): unknown {
  return (obj as any)[key];  // forced to use any — T has no known shape
}

function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };  // works but callers get no useful constraints
}

// Accepts nonsense
getProperty(42, "name");          // no error — T is number
getProperty(null, "anything");    // no error — T is null
```

**Correct: Constraints give the compiler useful information**

```typescript
function getProperty<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];  // fully typed — no assertions needed
}

function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

// Now enforced at call sites
getProperty({ name: "Alice", age: 30 }, "name");  // returns string
getProperty({ name: "Alice" }, "email");           // compile error — "email" not in keyof
```

**When acceptable:**
- Identity functions: `<T>(x: T) => T` — the constraint IS the return type relationship
- Container types like `Array<T>`, `Promise<T>` — the container doesn't need to know what T is
