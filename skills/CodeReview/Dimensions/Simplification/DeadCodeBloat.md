---
id: S1
name: Dead Code & Bloat
category: Simplification
baseline: false
---

# Dead Code & Bloat Review

> Identifies code that is oversized, unnecessary, or duplicated — bloated units that have outgrown maintainable thresholds and dispensable code that need not exist.

## Mental Model

Bloat is the simplest smell to detect and the most common failure mode in aging codebases. Large units accumulate responsibilities over time as features are added to whatever file is already open. The fix is almost always decomposition — Extract Method, Extract Class, Introduce Parameter Object — not rewriting. But beyond size, the best code is code you don't have to maintain at all. Dispensable code — dead functions, thin wrappers, speculative generality, and duplication — adds cognitive load, increases surface area for bugs, and slows navigation through the codebase. A reader must parse each line to determine whether it matters before concluding it does not. Every line should justify its existence: if it can be removed without behavioral change, it should be.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Method/function body >60 lines** (excluding comments and blank lines) — nearly impossible to hold in working memory — found by counting executable lines only.
- **Dead code** — functions, methods, or classes that are never called from any reachable execution path — identified via unused exports, unreferenced private methods, or symbols that only reference each other but are never invoked from an entry point.
- **Class/module >500 lines** — accumulating too many responsibilities — count total lines including all declarations.
- **Commented-out code blocks >5 lines** — version control exists for this purpose; commented code is noise, not a backup, and silently rots as surrounding code evolves.
- **Parameter list >7 parameters** — signal that the function does too many things or that a parameter object is needed.
- **Duplicate logic blocks >10 lines appearing in 2+ locations** — the logic has already proven itself worth abstracting at this size; extract to a named shared function.

### HIGH

- **Method/function body >30 lines** — exceeds comfortable single-screen reading — refactor via Extract Method.
- **Speculative generality** — abstractions (interfaces, base classes, generic type parameters) with exactly 1 concrete implementation and no documented plan for a second — premature abstraction adds indirection without delivering polymorphism value.
- **Class/module >300 lines** — approaching responsibility overload, especially if methods cover unrelated concerns.
- **Lazy or thin class** — class with fewer than 3 methods that only delegates to another class or wraps a single primitive value — the indirection cost exceeds any benefit; consider inlining the class at its call sites.
- **Parameter list >4 parameters** — consider Introduce Parameter Object or builder pattern.
- **Duplicate logic blocks 3-10 lines appearing in 3+ locations** — the 3-occurrence threshold: once is fine, twice is a coincidence, three times is a pattern worth extracting.
- **Data clumps** — same group of 3+ parameters appearing together in multiple function signatures across the codebase.

### MEDIUM

- **Primitive obsession** — using primitives (string, number) instead of domain types for concepts like email, userId, currency, or date ranges.
- **Data class** — class containing only getters and setters with no behavior — evaluate whether the missing behavior belongs here, or whether the class should be a plain record/struct type in the language's idiom.
- **Method/function body >20 lines with low cohesion** (operations on unrelated data or concerns).
- **Oddball solution** — the same problem solved 2 different ways in the same codebase (e.g., date formatting done with both `moment` and `dayjs`, or HTTP calls made with both `fetch` and `axios` without isolation) — pick one and eliminate the other.
- **Constructor with >5 assignments** — class may have too many dependencies and should be split or use dependency injection.
- **Unused function parameters** — parameters accepted in the function signature but never referenced anywhere in the function body.
- **Unused imports** — imported modules or symbols that are never referenced in the file.

## Severity Calibration

- **CRITICAL** — the unit is so large it actively impedes understanding and safe modification, or the dispensable code actively misleads readers or creates maintenance burden. Reviewers cannot reason about edge cases or side effects without significant effort; a developer reading dead code must reason about it before concluding it is unreachable, and duplicate logic means fixes applied in one location silently leave the other broken. Must be addressed before merge.
- **HIGH** — the unit is larger than necessary or the dispensable code adds unnecessary indirection or duplication that complicates understanding without delivering value. Should be addressed in this PR if the file is already being modified; otherwise file a follow-up ticket.
- **MEDIUM** — early signs of bloat or a minor cleanliness issue with low immediate risk. Flag with a note but do not block the PR. Leave a comment so future authors are aware of the trajectory.

## Language-Specific Notes

- **TypeScript/React:** Components with >200 lines of JSX output. Hook functions with >30 lines of logic before the return statement. Props interfaces with >10 properties suggest the component does too much and should be split. Unused React imports that predate the automatic JSX transform. Components defined and exported but never rendered by any parent. Type definitions or interfaces exported from a module but never imported elsewhere in the codebase. Utility functions inside a shared `utils` file that have exactly 1 consumer — move them to that consumer or delete them.
- **Python:** Functions with >40 lines (Python idiom favors shorter functions than other languages). Classes with >15 methods. `__init__` with >8 assignments signals too many dependencies. Functions decorated with `@staticmethod` or `@classmethod` that are never called. Import statements at the top of the file for modules whose only usage appears in commented-out code. Abstract base classes (`ABC`) with a single concrete subclass and no `isinstance` checks that justify the abstraction.
- **Svelte:** Component files >300 lines total. `<script>` blocks >100 lines. Template sections with >150 lines of markup — extract child components. Component props declared with `export let` that are never passed by any parent component. Variables declared in `<script>` that are never referenced in the template or in reactive statements. CSS classes defined in the component `<style>` block that are not applied to any element in the template.

## Good vs. Bad Examples

### Bad — Bloated Parameter List

```typescript
function createUser(
  name: string, email: string, age: number,
  address: string, city: string, state: string,
  zip: string, phone: string
) {
  // 8 parameters — data clump + bloated signature
}
```

### Good — Parameter Object

```typescript
interface CreateUserInput {
  name: string;
  email: string;
  age: number;
  address: Address;
  phone: string;
}

function createUser(input: CreateUserInput) { }
```

The `Address` type absorbs the street/city/state/zip clump. The parameter count drops from 8 to 5, and the Address fields can evolve independently.

### Bad — Speculative Generality

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

### Good — Direct Implementation

```typescript
function processUser(user: User): User {
  return user;
}
```

## Output Format

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH / MEDIUM]
- **File:** [path]
- **Line:** [range, e.g. 42-118]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences describing the bloat or dispensability and why it matters]
- **Recommendation:** [specific fix — name the refactoring pattern and where to apply it, not a vague suggestion]

---

Sources: Mantyla "Bloaters" and "Dispensables" taxonomies, Fowler's refactoring catalog (Extract Method, Extract Class, Introduce Parameter Object), SonarQube default thresholds, Jerzyk's extended catalog (Oddball Solution), ESLint `no-unused-vars`, TypeScript `noUnusedLocals`.
