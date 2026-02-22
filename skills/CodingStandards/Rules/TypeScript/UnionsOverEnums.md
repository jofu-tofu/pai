### TS2.1 Unions Over Enums

**Impact: HIGH (Enums generate runtime code, can't be tree-shaken, and have surprising numeric behavior)**

TypeScript enums are not erasable syntax — they emit JavaScript objects at runtime that increase bundle size and can't be tree-shaken. String literal unions with `as const` provide the same developer experience with zero runtime overhead, full type narrowing, and better composability.

**Incorrect: Enums generate runtime artifacts**

```typescript
// Emits a JavaScript object — can't be tree-shaken
enum Status {
  Pending = "PENDING",
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

// Numeric enums are worse — surprising bidirectional mapping
enum Direction {
  Up,    // 0
  Down,  // 1
}
const d: Direction = 99;  // no error — any number assignable
```

**Correct: String literal unions with as const**

```typescript
const STATUS = {
  Pending: "PENDING",
  Active: "ACTIVE",
  Inactive: "INACTIVE",
} as const;

type Status = (typeof STATUS)[keyof typeof STATUS];
// type Status = "PENDING" | "ACTIVE" | "INACTIVE"

// Or simpler — direct union type
type Direction = "up" | "down" | "left" | "right";

// Both provide full autocomplete, narrowing, and zero runtime cost
function handleStatus(status: Status) {
  if (status === "PENDING") { /* narrowed */ }
}
```

**When acceptable:**
- `const enum` in projects that don't use `--isolatedModules` (rare — most modern setups use isolated modules)
- Interop with APIs that expect numeric enum values — but consider a mapping object instead
