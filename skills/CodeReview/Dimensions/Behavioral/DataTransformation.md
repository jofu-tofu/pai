---
id: B4
name: Data Transformation Errors
category: Behavioral
baseline: false
---

# Data Transformation Error Review

> Evaluate whether data flowing through parse, map, filter, convert, and serialize steps preserves its meaning and precision — catching silent corruption that produces wrong results with no errors.

## Mental Model

Data flows through transformations — parse, map, filter, convert, serialize — and at each step, invariants can be silently violated. The code "works" because tests use data that happens to survive intact (a float-to-int cast is fine for 3.0 but destroys 3.7). The reviewer must trace data through the entire pipeline and ask at each step: "what valid input would this step corrupt?"

## Detection Heuristics (ordered by severity)

### CRITICAL
- **Lossy type conversion** — narrower range or precision, silent truncation. Float-to-int drops decimals. 64-bit to 32-bit overflows. Datetime-to-date drops time. `BigInt` to `Number` loses precision above 2^53. Check: does the target type hold every value the source type can produce?
- **Serialization/deserialization asymmetry** — field name mismatch, type mismatch, or nesting difference between serialize and deserialize. JSON.stringify drops `undefined` values and `Map`/`Set`. API response field is `user_name` but code reads `userName`. Check: round-trip the data through serialize/deserialize — does it come back identical?

### HIGH
- **Map/transform field mismatch** — mapping copies N-1 of N fields, or maps to the wrong target field. Often from adding a new field to the source type but not updating the mapping function. Check: count fields in source and target — do they match?
- **Accumulator initialization error** — `reduce()` with wrong initial value. Sum starting at 1 instead of 0. Product starting at 0 instead of 1. Min/max starting at 0 instead of Infinity/-Infinity. Check: does the initial value act as the identity element for the operation?
- **Unit/scale mismatch** — milliseconds where seconds expected, cents where dollars expected, zero-based index where one-based API expects. The conversion factor is missing or inverted. Check: do both sides of the interface agree on units?
- **Copy-paste variable substitution error** — duplicated block where one variable name wasn't updated. Two parallel transformations where the second still references the first's source variable. Check: in duplicated blocks, has every variable reference been updated?

### MEDIUM
- **Silent collection flattening/nesting** — `flatMap` where `map` was intended, or vice versa. `Array.from()` on a nested structure unexpectedly flattens. The output has the wrong depth. Check: does the output collection have the expected nesting structure?
- **Timezone/locale stripping** — transformation drops timezone info, and consuming code assumes it's present. `new Date(isoString)` in JavaScript parses in local timezone if no offset specified. `toISOString()` always returns UTC. Check: is timezone preserved through the transformation, and does the consumer know which timezone it's in?

## Severity Calibration

CRITICAL = data corruption affects most real-world inputs. Users see wrong values, financial calculations are incorrect, or data is permanently lost. Immediate fix required.
HIGH = data corruption affects specific input shapes or edge values. The system produces subtly wrong results that may not be immediately noticed. Should be fixed in this PR.
MEDIUM = data corruption is possible but requires unusual inputs or is quickly caught by downstream validation. Flag for defensive improvement.

## Language-Specific Notes

- **TypeScript/React:** `JSON.parse()` returns `any` — the type system provides no safety on deserialized data. Use Zod, io-ts, or similar for runtime validation. `Number()` silently returns `NaN` for non-numeric strings. `Date` constructor with string argument varies by engine. React state updates with spread operator `{...obj}` are shallow — nested objects share references.
- **Python:** `int()` truncates floats toward zero (`int(-2.7)` is `-2`, not `-3`). `json.loads()` returns `dict`/`list` — no type safety. `datetime.strftime` and `strptime` format strings must match exactly. `pandas` `astype(int)` on a column with `NaN` raises; use `Int64` nullable type. Dictionary `.update()` is shallow merge.
- **Svelte:** Store-derived values with `$derived` (Svelte 5) or `$:` (Svelte 4) re-compute on dependency changes — ensure transformations in derived values are idempotent. Component props that accept objects — mutations to the prop object affect the parent's state. `{#each}` with keyed items — ensure the key is stable through data transformations.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Lossy conversion: price in cents to dollars loses precision
function formatPrice(cents: number): string {
  const dollars = Math.floor(cents / 100);  // $1.99 becomes $1
  return `$${dollars}`;
}

// Accumulator initialization: min of empty array returns Infinity
function findCheapest(prices: number[]): number {
  return prices.reduce((min, p) => Math.min(min, p), 0);
  // Initial value 0 means any positive price "loses" to 0
}

// Serialization asymmetry
const user = { name: "Alice", createdAt: new Date() };
const json = JSON.stringify(user);
const restored = JSON.parse(json);
// restored.createdAt is a string, not a Date — .getTime() will throw
```

### Good (after)

```typescript
// Preserves precision
function formatPrice(cents: number): string {
  const dollars = (cents / 100).toFixed(2);
  return `$${dollars}`;
}

// Correct identity element for min
function findCheapest(prices: number[]): number | undefined {
  if (prices.length === 0) return undefined;
  return prices.reduce((min, p) => Math.min(min, p), Infinity);
}

// Explicit date revival
const restored = JSON.parse(json, (key, value) => {
  if (key === "createdAt") return new Date(value);
  return value;
});
```

## Output Format

For each finding in this dimension, report:
- **Severity:** [CRITICAL/HIGH/MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences]
- **Recommendation:** [specific fix, not vague]

---

Sources: CWE-682 (Incorrect Calculation), CWE-190 (Integer Overflow), CWE-1339 (Insufficient Precision or Accuracy of a Real Number), IBM ODC "Assignment" defect type, Beizer (1990) Ch. 4 Data Errors, Google Error Prone time/date patterns.
