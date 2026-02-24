---
id: B3
name: Completeness of Case Handling
category: Behavioral
baseline: false
---

# Completeness of Case Handling Review

> Evaluate whether every branch point handles all possible values of its discriminant — catching silent gaps where unhandled cases produce wrong behavior instead of explicit errors.

## Mental Model

Every branch point is a claim: "these are all the possibilities." When the claim is false, the code silently does nothing or falls through to a wrong case. The danger is not crashes — it's silent wrong behavior. A switch without a default doesn't throw; it falls through and the subsequent code runs with uninitialized or stale state. An if/else-if chain without a final else leaves the variable unchanged, and downstream code assumes it was set. The reviewer must ask: "what value could reach this branch that isn't handled, and what happens then?"

**Overlap avoidance:** AssumptionAudit (D3) covers "missing error PATH" — no catch, no rollback, no failure handler. B3 covers "missing value CASE" — unhandled enum variant, status value, or discriminant. D3 is about error flow; B3 is about value domain completeness.

## Detection Heuristics (ordered by severity)

### CRITICAL
- **Missing enum/union variant** — switch/match handles fewer cases than defined variants, no exhaustive check. When a new variant is added to the enum, every switch that doesn't use exhaustiveness checking silently ignores it. Check: count the variants in the type definition, count the cases in the switch — do they match?
- **Swallowing default** — default/wildcard branch silently succeeds instead of rejecting unknown input. `default: break` or `_: pass` hides unhandled cases. The code should either handle every case explicitly or throw on unknown input. Check: does the default branch do meaningful work, or does it silently swallow?

### HIGH
- **Implicit else omission** — if/else-if chain with no final else, subsequent code uses state that was only conditionally set. The variable retains its previous value or is uninitialized. Check: trace what happens when none of the conditions match — is the subsequent state valid?
- **Fallthrough without intent** — switch case falls through to the next case without break/return/comment indicating intent. In C/JavaScript, fallthrough is the default behavior. Check: is the fallthrough intentional (documented) or accidental?
- **State transition gap** — state machine handles some but not all valid state values. The state machine has transitions for states A→B and B→C but not for the edge case A→C or the error state. Check: enumerate all valid states and verify each has a transition defined.

### MEDIUM
- **Null/undefined case not branched** — discriminant can be null/undefined but no branch handles it. TypeScript's strict null checks catch some of these, but not when the value comes from an external API or `JSON.parse`. Check: can the discriminant be null at runtime, and is there a branch for it?
- **String matching without normalization** — branching on string values without case or whitespace normalization. `status === "Active"` fails for `"active"` or `" Active "`. Check: is the string normalized before comparison, or are all possible forms handled?

## Severity Calibration

CRITICAL = missing case produces wrong behavior for inputs that will occur in production. The code silently does the wrong thing. Immediate fix required.
HIGH = missing case produces wrong behavior for edge cases or newly added values. The code works now but will break when the system evolves. Should be fixed in this PR.
MEDIUM = missing case is defensive — the value is unlikely but not impossible. Flag for robustness.

## Language-Specific Notes

- **TypeScript/React:** Use `satisfies` or exhaustive switch helpers (`assertNever`) to get compile-time exhaustiveness checking on discriminated unions. `switch` on string literals without `as const` loses exhaustiveness. React component props with union types — ensure all variants are rendered. `useReducer` action types should be exhaustively handled.
- **Python:** `match` statement (3.10+) does not require exhaustiveness — add a wildcard `case _:` that raises `ValueError` for unknown cases. Enum iteration with `for member in MyEnum` can reveal missing handlers. `if/elif` chains on string values are fragile — prefer dictionaries or match statements.
- **Svelte:** `{#if}/{:else if}` chains in templates should have `{:else}` blocks when the conditional sets visible UI state. Component props with union types — ensure all variants produce valid rendering. Store-derived values that depend on state enums must handle all states.

## Good vs. Bad Examples

### Bad (before)

```typescript
type Status = "pending" | "active" | "suspended" | "deleted";

function getStatusColor(status: Status): string {
  if (status === "pending") return "yellow";
  if (status === "active") return "green";
  if (status === "suspended") return "red";
  // "deleted" falls through — returns undefined
}

// Swallowing default
switch (action.type) {
  case "INCREMENT": return state + 1;
  case "DECREMENT": return state - 1;
  default: return state;  // silently ignores unknown actions
}
```

### Good (after)

```typescript
type Status = "pending" | "active" | "suspended" | "deleted";

function getStatusColor(status: Status): string {
  switch (status) {
    case "pending": return "yellow";
    case "active": return "green";
    case "suspended": return "red";
    case "deleted": return "gray";
    default: {
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${status}`);
    }
  }
}

// Explicit rejection of unknown actions
switch (action.type) {
  case "INCREMENT": return state + 1;
  case "DECREMENT": return state - 1;
  default:
    throw new Error(`Unknown action type: ${action.type}`);
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

Sources: Beizer (1990) Ch. 23 Functional Case Completeness, CWE-670 (Always-Incorrect Control Flow), IBM ODC "Checking" defect type with "Missing" qualifier, Clippy `never_loop`, SonarQube S2583 (unreachable code).
