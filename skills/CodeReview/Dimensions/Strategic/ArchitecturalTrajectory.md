# Architectural Trajectory Review

> Evaluates whether a change moves the codebase toward a better architecture or cements the current one — strategic vs. tactical programming.

## Mental Model

Every change either creates leverage or adds weight. Strategic changes make the next change easier — opening extension points, clarifying boundaries. Tactical changes solve only the immediate problem and make the next change harder by narrowing the solution space. The trajectory question: if you redesigned this system from scratch, where would this code live? Every gap between that ideal and the current placement is tech debt being created now.

Evaluate as the architect returning in 6 months. The most dangerous changes work perfectly today while silently constraining tomorrow.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Silent Convention Break** — change introduces a new pattern contradicting an existing architectural decision without documenting why. A new approach to something the codebase already handles (new state management alongside existing, new API convention, new error handling) with no ADR or PR description explaining the divergence.

### HIGH

- **Tactical Fix** — change solves only this specific instance, not the class of problems. Hardcoded values, special-case conditionals, or copy-paste with minor modifications instead of a generalizable solution — creates a maintenance multiplier requiring N similar changes for N future cases.
- **Future-Hostile Change** — change makes the next likely change harder. New tight coupling between previously independent modules, removal of extension-enabling interfaces, or introduction of data shape assumptions that constrain future evolution.
- **Prescriptive-Descriptive Gap** — if redesigned from scratch, this code would live in a fundamentally different structure. The code's logical domain doesn't match its physical location, and the mismatch is structural, not just naming — an artifact of historical decisions.

### MEDIUM (analysis only — informs review but not reported in output)

- **Missed Strategic Opportunity** — change touches code adjacent to known debt and doesn't address it. The faster path was chosen over the strategic one — a missed chance to improve trajectory.
- **Tactical Tornado Signal** — high velocity, low structural consideration. Large change touching many files with no architectural coherence — each file modified in isolation rather than as part of a design. No tests, no docs.

## Severity Calibration

- **CRITICAL** — actively degrades architecture by breaking conventions. Will be copied as precedent. Fix now.
- **HIGH** — tactically correct but strategically costly — creates maintenance burden or constrains future evolution. Address in this PR or flag with a concrete improvement plan.
- **MEDIUM** — missed opportunity, not an active problem. Not reported.

## Language-Specific Notes

- **TypeScript/React:** New state management pattern alongside existing one (Redux + Zustand + Context all coexisting). New API fetching approach (fetch + axios + react-query all present). Component patterns that don't match the established component architecture (class component in a hooks codebase).
- **Python:** New ORM usage pattern alongside existing one. New configuration approach (env vars + config files + hardcoded). New testing pattern that contradicts the established test architecture (pytest fixtures vs unittest setup).
- **Svelte:** Mixing Svelte 4 and Svelte 5 patterns without a migration plan. New store patterns alongside established ones. Component composition approach that contradicts existing patterns (slots vs props for the same type of composition).

## Good vs. Bad Examples

### Bad (before)

```typescript
// Tactical fix: hardcoded special case that will need N more copies
function getDiscount(user: User): number {
  if (user.plan === 'enterprise') return 0.20;
  if (user.plan === 'pro') return 0.10;
  if (user.plan === 'startup-special-2024') return 0.15; // ← new tactical fix
  return 0;
}
```

### Good (after)

```typescript
// Strategic: discount is data-driven, new plans don't need code changes
const PLAN_DISCOUNTS: Record<string, number> = {
  enterprise: 0.20,
  pro: 0.10,
  'startup-special-2024': 0.15,
};

function getDiscount(user: User): number {
  return PLAN_DISCOUNTS[user.plan] ?? 0;
}
```

## Output Format

**Strategic dimensions report HIGH and CRITICAL findings only.** MEDIUM-severity detections inform the agent's analysis but are NOT included in the output. This prevents review fatigue — Strategic findings should be rare, high-signal, and worth acting on.

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences]
- **Recommendation:** [specific fix, not vague]

---

Sources: "A Philosophy of Software Design" (Ousterhout) — strategic vs tactical programming, "Refactoring" (Fowler) — code smells as trajectory signals, "Design Patterns" (GoF) — open/closed principle, "Clean Architecture" (Martin) — dependency direction and architectural boundaries.
