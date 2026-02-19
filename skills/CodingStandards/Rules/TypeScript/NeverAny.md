### 2.1 Never Use Any

**Impact: CRITICAL (Any disables type checking and spreads virally — one `any` infects every value it touches)**

`any` is a type-checking escape hatch that turns TypeScript back into JavaScript. It's not "flexible" — it's invisible. Values typed as `any` pass through every check silently, and `any` propagates: a function returning `any` makes its callers untyped too. Use `unknown` when you genuinely don't know the type.

**Incorrect: Any disables the type system**

```typescript
function parseConfig(raw: any): any {
  return raw.settings.theme;     // no error if raw is null
}

const config = parseConfig(null); // config is any
config.nonexistent.deep.access;   // no error — crashes at runtime

// any spreads to everything it touches
const theme = config.theme;       // theme is any
const upper = theme.toUpperCase(); // any — no safety
```

**Correct: Use unknown and narrow**

```typescript
function parseConfig(raw: unknown): AppConfig {
  if (!isRecord(raw) || !isRecord(raw.settings)) {
    throw new Error("Invalid config structure");
  }
  return raw.settings as AppConfig; // validated before assertion
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
```

**When acceptable:**
- Inside generic function implementations where the type parameter constrains the public API (Matt Pocock's "any in generics" pattern)
- Typing third-party libraries with no `@types` package — isolate in a `.d.ts` file
- `JSON.parse()` return — but immediately validate with Zod (see Rule 8.1)
