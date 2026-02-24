---
id: A5
name: Design Intent Clarity
category: Architecture
baseline: true
---

# Design Intent Clarity Review

> Evaluates whether the code communicates its own architecture — whether a reader can understand the design without external documentation.

## Mental Model

Design intent clarity is about self-documenting architecture. The code should make its structure, boundaries, and contracts obvious through naming, organization, and explicit interfaces — not through comments or external docs. When intent is unclear, developers make incorrect assumptions about how to extend or modify the system, leading to architectural erosion.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Implicit contracts** — function behavior depends on calling order or external state with no enforcement mechanism and no documentation (e.g., must call `init()` before `process()`, but nothing prevents calling `process()` first)
- **Hidden side effects** — function name suggests a pure query (`getName`, `calculateTotal`) but modifies state, writes to disk, or makes network calls — found when a "get/calculate/check/is" function contains mutations

### HIGH

- **Separation of concerns violation** — business logic mixed with infrastructure code in the same function (e.g., validation logic interleaved with database queries and HTTP response formatting in >1 function)
- **Missing domain model boundaries** — domain concepts represented as primitives (`userId` as `string`, money as `number`) instead of typed domain objects — >3 domain concepts as primitives in the same module
- **Clever-over-obvious code** — bitwise operations, single-letter variables, overly terse ternary chains, or regex without explanation used where a readable alternative exists — prioritizes brevity over comprehension

### MEDIUM

- **Ambiguous naming** — function or variable name doesn't convey its purpose (e.g., `process()`, `handle()`, `data`, `result`, `temp`, `manager`) — >3 vague names in the same file
- **Missing type narrowing** — discriminated unions or type guards that aren't exhaustive, leaving possible states unhandled
- **Inconsistent abstraction levels** — one function in a module operates at high level (orchestration) while mixing in low-level details (string manipulation, byte operations)

## Severity Calibration

- **CRITICAL** — the unclear design intent will cause the next developer to introduce bugs or architectural violations because they can't understand the intended contract. Fix now.
- **HIGH** — the code works but a new team member would need significant context to understand how to modify it correctly. Address in this PR.
- **MEDIUM** — readability issue that adds friction without causing errors. Flag for improvement.

## Language-Specific Notes

- **TypeScript/React:** Components with >5 `useEffect` hooks where the relationship between effects is unclear. Event handlers that modify state in non-obvious ways (`onClick` that also triggers navigation AND analytics AND validation). Missing JSDoc on exported functions with >3 parameters.
- **Python:** Functions with `**kwargs` that accept arbitrary arguments with no type hints or docstring. Metaclass usage without clear documentation of what the metaclass does. Dunder methods with non-standard behavior.
- **Svelte:** Reactive statements (`$:`) that trigger non-obvious cascading updates. Component lifecycle callbacks (`onMount`, `onDestroy`) with side effects not evident from the component's props or name. Context API usage without clear documentation of what's provided.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Hidden side effect: "get" function modifies state
function getNextId() {
  globalCounter++;           // side effect hidden in a "getter"
  logAccess(globalCounter);  // another hidden side effect
  return globalCounter;
}
```

### Good (after)

```typescript
// Name communicates the side effect
function allocateNextId(): number {
  globalCounter++;
  logAccess(globalCounter);
  return globalCounter;
}
```

## Output Format

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH / MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences]
- **Recommendation:** [specific fix, not vague]

---

Sources: Google Code Review Design + Complexity dimensions, Martin's Clean Code (Meaningful Names, Functions), "A Philosophy of Software Design" (Ousterhout) — deep vs shallow modules.
