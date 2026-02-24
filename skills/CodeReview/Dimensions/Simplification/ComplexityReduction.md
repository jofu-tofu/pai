---
id: S4
name: Complexity Reduction
category: Simplification
baseline: true
---

# Complexity Reduction Review

> Evaluate cognitive load and control flow complexity by measuring how much mental state a reader must maintain to trace execution through a function.

## Mental Model

Code is readable top-to-bottom when the reader never needs to hold a conditional branch open in their head while scanning the next block. Every additional nesting level, branching condition, or boolean flag forces the reader to push state onto a mental stack — the deeper that stack grows, the more likely they are to misread, miss edge cases, or introduce bugs during modification. The goal of this dimension is to find functions where the cognitive stack overflows normal working memory and flag them for restructuring before that complexity compounds.

## Detection Heuristics (ordered by severity)

### CRITICAL
- Nesting depth >5 levels — creates unreadable arrow-shaped code — found when indentation exceeds 5 levels in any function
- Cognitive complexity score >25 per function — SonarSource metric — found via counting flow breaks + nesting increments
- Switch-on-type with >7 cases and no polymorphic alternative — rigid, grows with every new type

### HIGH
- Nesting depth >3 levels — refactorable via guard clauses and early returns
- Cognitive complexity score >15 per function — above maintainability threshold
- Boolean parameter explosion (>2 boolean params) — creates 2^n behavior paths
- Arrow-shaped code pattern — deeply nested if/else creating visual arrow, fix with guard clauses

### MEDIUM
- Ternary chains (nested ternaries >1 level deep) — harder to read than if/else
- Complex boolean expressions (>3 conditions in single expression) — extract to named variables
- Cyclomatic complexity >10 per function — NIST threshold for mandatory refactoring

## Severity Calibration

CRITICAL = function is effectively unreadable without tracing through line by line. Immediate refactoring needed.
HIGH = function requires significant mental effort to understand. Should be refactored in this PR.
MEDIUM = function is readable but has unnecessary cognitive overhead. Flag for future cleanup.

## Language-Specific Notes

- **TypeScript/React:** Watch for nested JSX conditional rendering (`{condition && (condition2 && <Component />)}`). Extract to early returns or separate components. `useEffect` dependency arrays with >5 dependencies signal excessive complexity in the effect.
- **Python:** List comprehensions nested >2 deep. Multiple context managers stacked. Complex decorator chains.
- **Svelte:** Deeply nested `{#if}` blocks in templates. Reactive statements (`$:`) with complex dependency chains. Multiple `{#each}` with nested `{#if}` conditions.

## Good vs. Bad Examples

### Bad (before)

```typescript
function processOrder(order: Order, user: User) {
  if (order.items.length > 0) {
    if (user.isVerified) {
      if (order.total > 0) {
        if (user.balance >= order.total) {
          // actual logic buried 4 levels deep
        }
      }
    }
  }
}
```

### Good (after)

```typescript
function processOrder(order: Order, user: User) {
  if (order.items.length === 0) return;
  if (!user.isVerified) return;
  if (order.total <= 0) return;
  if (user.balance < order.total) return;
  // actual logic at top level
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

Sources: SonarSource Cognitive Complexity whitepaper, McCabe Cyclomatic Complexity (NIST), Fowler's Simplifying Conditional Expressions, Atwood's Flattening Arrow Code.
