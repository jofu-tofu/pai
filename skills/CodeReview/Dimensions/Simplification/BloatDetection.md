# Bloat Detection Review

> Evaluates whether code units have grown beyond maintainable size thresholds.

## Mental Model

Bloat is the simplest smell to detect and the most common failure mode in aging codebases. Large units accumulate responsibilities over time as features are added to whatever file is already open. The fix is almost always decomposition — Extract Method, Extract Class, Introduce Parameter Object — not rewriting.

## Detection Heuristics (ordered by severity)

### CRITICAL

- Method/function body >60 lines (excluding comments and blank lines) — nearly impossible to hold in working memory — found by counting executable lines only
- Class/module >500 lines — accumulating too many responsibilities — count total lines including all declarations
- Parameter list >7 parameters — signal that the function does too many things or that a parameter object is needed

### HIGH

- Method/function body >30 lines — exceeds comfortable single-screen reading — refactor via Extract Method
- Class/module >300 lines — approaching responsibility overload, especially if methods cover unrelated concerns
- Parameter list >4 parameters — consider Introduce Parameter Object or builder pattern
- Data clumps — same group of 3+ parameters appearing together in multiple function signatures across the codebase

### MEDIUM

- Primitive obsession — using primitives (string, number) instead of domain types for concepts like email, userId, currency, or date ranges
- Method/function body >20 lines with low cohesion (operations on unrelated data or concerns)
- Constructor with >5 assignments — class may have too many dependencies and should be split or use dependency injection

## Severity Calibration

CRITICAL = the unit is so large it actively impedes understanding and safe modification. Reviewers cannot reason about edge cases or side effects without significant effort. Must be addressed before merge.

HIGH = the unit is larger than necessary and should be decomposed. Should be addressed in this PR if the file is already being modified; otherwise file a follow-up ticket.

MEDIUM = the unit shows early signs of bloat. Flag with a note but do not block the PR. Leave a comment so future authors are aware of the trajectory.

## Language-Specific Notes

- **TypeScript/React:** Components with >200 lines of JSX output. Hook functions with >30 lines of logic before the return statement. Props interfaces with >10 properties suggest the component does too much and should be split.
- **Python:** Functions with >40 lines (Python idiom favors shorter functions than other languages). Classes with >15 methods. `__init__` with >8 assignments signals too many dependencies.
- **Svelte:** Component files >300 lines total. `<script>` blocks >100 lines. Template sections with >150 lines of markup — extract child components.

## Good vs. Bad Examples

### Bad (before)

```typescript
function createUser(
  name: string, email: string, age: number,
  address: string, city: string, state: string,
  zip: string, phone: string
) {
  // 8 parameters — data clump + bloated signature
}
```

### Good (after)

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

## Output Format

For each finding in this dimension, report:

- **Severity:** [CRITICAL/HIGH/MEDIUM]
- **File:** [path]
- **Line:** [range, e.g. 42-118]
- **Heuristic:** [which specific heuristic from above was triggered, e.g. "Method body >60 lines"]
- **Issue:** [1-2 sentences describing what the bloat is and why it matters]
- **Recommendation:** [specific fix — name the refactoring pattern and where to apply it, not a vague suggestion]

---

Sources: Mäntylä "Bloaters" taxonomy, Fowler's refactoring catalog (Extract Method, Extract Class, Introduce Parameter Object), SonarQube default thresholds.
