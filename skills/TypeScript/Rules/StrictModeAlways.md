### 1.1 Strict Mode Always

**Impact: CRITICAL (Catches entire classes of bugs — null errors, implicit any, unsafe binds — at compile time instead of production)**

TypeScript without `strict: true` is JavaScript with extra syntax. Strict mode enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and other flags that make the type system actually useful. Enabling it on an existing codebase surfaces real bugs.

**Incorrect: Permissive compiler misses real bugs**

```typescript
// tsconfig.json — "strict" not enabled
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext"
    // strict defaults to false — silent bugs everywhere
  }
}

// This compiles without error but crashes at runtime
function getUser(id) {           // id is implicitly 'any'
  return users.find(u => u.id === id);
}
const name = getUser(1).name;    // potential null dereference — no warning
```

**Correct: Strict mode catches bugs at compile time**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true
  }
}

// Compiler now requires explicit types and null handling
function getUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}
const user = getUser(1);
const name = user?.name ?? "Unknown";  // forced to handle undefined
```

**When acceptable:**
- Gradual migration: use `// @ts-expect-error` with explanatory comments on specific lines, never `// @ts-ignore`
- Third-party type conflicts: isolate in a `.d.ts` file with targeted overrides
- Never acceptable to leave `strict: false` in a new project
