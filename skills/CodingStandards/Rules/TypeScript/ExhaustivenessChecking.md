### 3.2 Exhaustiveness Checking

**Impact: HIGH (Compiler catches unhandled union cases — adding a new variant immediately shows every switch/if that needs updating)**

When you switch over a discriminated union, assign the default case to `never`. If a new variant is added to the union, every switch statement that doesn't handle it becomes a compile error. This turns the compiler into your changelog reviewer.

**Incorrect: Default case silently swallows new variants**

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    default:
      return 0;  // if "triangle" is added, silently returns 0
  }
}
```

**Correct: Never type catches missing cases**

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default:
      return assertNever(shape);  // compile error if any case is missed
  }
}
```

**When acceptable:**
- Intentional catch-all for extensible union types (e.g., plugin systems where you can't know all variants)
- Logging/telemetry where you want to handle unknown values gracefully at runtime
