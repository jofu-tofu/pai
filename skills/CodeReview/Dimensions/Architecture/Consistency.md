# Consistency & Conventions Review

> Evaluates whether new code follows the patterns, naming conventions, and structural decisions already established in the codebase.

## Mental Model

Consistency is about PATTERN ADHERENCE, not style preferences. A codebase should read as if one mind wrote it. Inconsistency forces developers to learn multiple conventions for the same concept, increases cognitive overhead when navigating between modules, and signals that the codebase lacks shared standards. The question is: "does this new code follow the patterns already established HERE?"

## Detection Heuristics (ordered by severity)

### CRITICAL

- **API surface inconsistency** — endpoints in the same API return different response shapes (e.g., some wrap in `{data}`, others return bare objects) — breaks consumer expectations across >2 endpoints
- **Error handling divergence** — different error patterns used within the same module (try/catch in some functions, Result types in others, thrown strings vs Error objects) — inconsistency in >3 functions within one module

### HIGH

- **Naming pattern drift** — new code uses different naming convention than existing code in the same module (camelCase vs. snake_case, verb-first vs. noun-first for functions, plural vs. singular for collections)
- **File organization violation** — new file placed in a directory that doesn't match the established organizational pattern (e.g., a utility placed in `components/`, a component placed in `utils/`)
- **State management inconsistency** — new feature uses a different state management approach than existing features in the same app (e.g., Redux in one feature, Zustand in another, local state in a third)

### MEDIUM

- **Import style mixing** — default imports and named imports used interchangeably for the same module across different files
- **Comment style divergence** — JSDoc in some files, inline comments in others, no comments in a third — within the same feature
- **Test structure inconsistency** — different `describe`/`it` nesting patterns, assertion libraries, or mock approaches within the same test directory

## Severity Calibration

- **CRITICAL** — the inconsistency breaks contracts or causes runtime errors for consumers. Must be fixed before merge.
- **HIGH** — the inconsistency creates cognitive load when navigating the codebase. Address in this PR.
- **MEDIUM** — style-level inconsistency that doesn't affect behavior. Flag but don't block.

## Language-Specific Notes

- **TypeScript/React:** Component naming (PascalCase files vs. kebab-case). Hook naming convention (`useX`). Props interface naming (`{ComponentName}Props`). Event handler naming (`onX` vs. `handleX`). Check the 3 nearest siblings for the established pattern.
- **Python:** Function naming (snake_case). Class naming (PascalCase). Module-level constant naming (UPPER_SNAKE). Docstring format (Google vs. NumPy vs. reStructuredText).
- **Svelte:** Component file naming convention. Store naming and location patterns. Event dispatcher naming vs. callback prop naming.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Existing codebase uses: getUser(), getProducts(), getOrders()
// New code introduces inconsistent naming:
function fetchPaymentHistory() { }  // fetch vs. get
function payment_refund() { }       // snake_case vs. camelCase
```

### Good (after)

```typescript
// Follows established naming convention:
function getPaymentHistory() { }
function getPaymentRefund() { }
```

## Output Format

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH / MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences describing the inconsistency and its concrete risk]
- **Recommendation:** [specific fix — reference the established pattern and where it is used, not vague]

---

Sources: Google Code Review Consistency dimension; arc42 quality model (#reliable); Ousterhout, "A Philosophy of Software Design" — consistency reduces cognitive load.
