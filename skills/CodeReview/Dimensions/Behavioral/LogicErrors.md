---
id: B2
name: Logic & Boolean Errors
category: Behavioral
baseline: true
---

# Logic & Boolean Error Review

> Evaluate whether boolean expressions, conditionals, and logical control flow produce the intended truth values for all input combinations — not just the common case.

## Mental Model

Boolean logic errors are invisible in testing because they produce the correct result for the common case — a wrong negation passes every happy-path test. The reviewer must evaluate each expression for the false case, the boundary case, and the negated case, because the danger is silent wrong answers for input subsets that tests don't cover.

## Detection Heuristics (ordered by severity)

### CRITICAL
- **Negation inversion / De Morgan violation** — `!` applied to compound expression without adjusting inner operators. `!(a && b)` is `!a || !b`, not `!a && !b`. Check: apply De Morgan's laws mentally and compare to the developer's intent from context.
- **Short-circuit side effect** — `&&`/`||` skips necessary mutation or validation. `isValid(x) && process(x)` silently skips processing when invalid instead of throwing. `a || doSomething()` never calls `doSomething` when `a` is truthy. Check: does the skipped branch have side effects that must always execute?

### HIGH
- **Operator precedence trap** — `a || b && c` without parentheses evaluates as `a || (b && c)`, not `(a || b) && c`. Most developers read left to right. Check: would adding explicit parentheses change the meaning?
- **Tautology or contradiction** — condition always true or always false. `x !== null || x !== undefined` is always true (tautology). `x === "a" && x === "b"` is always false (contradiction). Check: can both sides of the operator be simultaneously satisfied/unsatisfied?
- **Equality vs identity trap** — `==` vs `===`, structural vs reference equality. In JavaScript, `[] == false` is `true`. In Python, `is` checks identity, `==` checks value — `a is []` is always false. In Java, `==` on objects checks reference. Check: is the comparison checking the intended property (value vs identity)?
- **Condition covers wrong variable** — copy-paste error where the condition checks variable A but the body operates on variable B. Often from duplicating an if-block and changing the body but not the condition. Check: does each condition reference the same variable it guards?

### MEDIUM
- **Redundant condition** — condition already guaranteed by prior check or type system. `if (x !== null) { if (x !== null && x > 0) ... }` — inner null check is redundant. Not a bug, but obscures the actual logic and signals the developer may not understand the control flow.
- **Boolean coercion surprise** — non-boolean value in boolean context produces unexpected results. `if (count)` is false when `count === 0`, but zero may be a valid count. `if (name)` is false for empty string, which may be a valid name. Check: is the falsy value a legitimate domain value that should not be treated as false?

## Severity Calibration

CRITICAL = logic error produces wrong results for a common input pattern that tests may not cover. The expression evaluates to the wrong truth value. Immediate fix required.
HIGH = logic error produces wrong results for specific input combinations. The code works for most cases but has a logical gap. Should be fixed in this PR.
MEDIUM = logic issue does not produce wrong results but obscures intent or creates fragility. Flag for clarity improvement.

## Language-Specific Notes

- **TypeScript/React:** `==` performs type coercion (`0 == ""` is `true`, `null == undefined` is `true`). Use `===` unless coercion is intentional. Optional chaining `?.` returns `undefined` on null/undefined — chaining multiple `?.` can mask which part of the chain was null. `&&` in JSX conditionally renders — `{count && <Component />}` renders `0` when count is zero because `0` is falsy but renders as a React child.
- **Python:** `and`/`or` return operand values, not booleans — `[] or "default"` returns `"default"`, `[1] or "default"` returns `[1]`. `not` has lower precedence than `in` — `not x in y` works but `not x is y` can surprise. `is` vs `==` — never use `is` for value comparison (except `None`).
- **Svelte:** Reactive declarations (`$:`) re-evaluate when dependencies change — complex boolean logic in reactive statements can create subtle re-evaluation bugs. `{#if condition}` in templates uses JavaScript truthiness rules. Store values accessed with `$store` follow the same coercion rules as regular values.

## Good vs. Bad Examples

### Bad (before)

```typescript
// De Morgan violation: developer meant "neither admin nor moderator"
if (!user.isAdmin || !user.isModerator) {
  denyAccess();  // denies access if user is NOT admin OR NOT moderator
  // Actually denies access for admins who aren't moderators!
}

// Boolean coercion: 0 is a valid result count
const results = search(query);
if (results.length) {  // fine — length is never 0 as a "valid" state
  showResults(results);
}
// But elsewhere:
if (userAge) {  // WRONG: age 0 is falsy but could be valid for newborns
  processAge(userAge);
}
```

### Good (after)

```typescript
// Correct De Morgan: "not (admin or moderator)"
if (!user.isAdmin && !user.isModerator) {
  denyAccess();  // denies only when user is neither admin nor moderator
}

// Explicit comparison instead of coercion
if (userAge !== undefined && userAge !== null) {
  processAge(userAge);
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

Sources: CWE-697 (Incorrect Comparison), IBM ODC "Algorithm" defect type, Beizer (1990) Ch. 32 Processing Errors, Google Error Prone (EqualsWrongThing, SelfEquals, IdentityBinaryExpression), SpotBugs EQ_ALWAYS_TRUE/FALSE, Rust Clippy correctness category.
