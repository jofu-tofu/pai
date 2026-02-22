# Dispensability Scan Review

> Identifies code that need not exist — dead code, thin wrappers, speculative generality, and duplication.

## Mental Model

The best code is code you don't have to maintain. Dispensable code adds cognitive load, increases surface area for bugs, and slows navigation through the codebase — a reader must parse each line to determine whether it matters before concluding it does not. Every line should justify its existence: if it can be removed without behavioral change, it should be.

## Detection Heuristics (ordered by severity)

### CRITICAL

- Dead code — functions, methods, or classes that are never called from any reachable execution path — identified via unused exports, unreferenced private methods, or symbols that only reference each other but are never invoked from an entry point
- Commented-out code blocks >5 lines — version control exists for this purpose; commented code is noise, not a backup, and silently rots as surrounding code evolves
- Duplicate logic blocks >10 lines appearing in 2+ locations — the logic has already proven itself worth abstracting at this size; extract to a named shared function

### HIGH

- Speculative generality — abstractions (interfaces, base classes, generic type parameters) with exactly 1 concrete implementation and no documented plan for a second — premature abstraction adds indirection without delivering polymorphism value
- Lazy or thin class — class with fewer than 3 methods that only delegates to another class or wraps a single primitive value — the indirection cost exceeds any benefit; consider inlining the class at its call sites
- Duplicate logic blocks 3–10 lines appearing in 3+ locations — the 3-occurrence threshold: once is fine, twice is a coincidence, three times is a pattern worth extracting

### MEDIUM

- Data class — class containing only getters and setters with no behavior — evaluate whether the missing behavior belongs here, or whether the class should be a plain record/struct type in the language's idiom
- Oddball solution — the same problem solved 2 different ways in the same codebase (e.g., date formatting done with both `moment` and `dayjs`, or HTTP calls made with both `fetch` and `axios` without isolation) — pick one and eliminate the other
- Unused function parameters — parameters accepted in the function signature but never referenced anywhere in the function body
- Unused imports — imported modules or symbols that are never referenced in the file

## Severity Calibration

CRITICAL = the dispensable code actively misleads readers or creates maintenance burden — a developer reading dead code must reason about it before concluding it is unreachable, and duplicate logic means fixes applied in one location silently leave the other broken. Remove now.

HIGH = the dispensable code adds unnecessary indirection or duplication that complicates understanding without delivering value. Address in this PR.

MEDIUM = a minor cleanliness issue with low immediate risk. Flag with a comment but do not block the review.

## Language-Specific Notes

- **TypeScript/React:** Unused React imports that predate the automatic JSX transform. Components defined and exported but never rendered by any parent. Type definitions or interfaces exported from a module but never imported elsewhere in the codebase. Utility functions inside a shared `utils` file that have exactly 1 consumer — move them to that consumer or delete them.
- **Python:** Functions decorated with `@staticmethod` or `@classmethod` that are never called. Import statements at the top of the file for modules whose only usage appears in commented-out code. Abstract base classes (`ABC`) with a single concrete subclass and no `isinstance` checks that justify the abstraction.
- **Svelte:** Component props declared with `export let` that are never passed by any parent component. Variables declared in `<script>` that are never referenced in the template or in reactive statements. CSS classes defined in the component `<style>` block that are not applied to any element in the template.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Speculative generality — 1 implementation exists, no second is planned
interface DataProcessor<T> {
  process(data: T): T;
}

class UserProcessor implements DataProcessor<User> {
  process(data: User): User {
    return data;
  }
}

// Only ever instantiated as: new UserProcessor().process(user)
```

### Good (after)

```typescript
function processUser(user: User): User {
  return user;
}
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

Sources: Mäntylä "Dispensables" taxonomy, Jerzyk's extended catalog (Oddball Solution), Fowler's refactoring catalog, ESLint `no-unused-vars`, TypeScript `noUnusedLocals`.
