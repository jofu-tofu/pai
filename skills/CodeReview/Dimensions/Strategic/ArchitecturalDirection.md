---
id: D1
name: Architectural Direction
category: Strategic
baseline: false
---

# Architectural Direction Review

> Evaluates whether code was placed where it belongs by responsibility and whether changes move the codebase toward a better architecture or cement the current one.

## Mental Model

Architectural direction encompasses both placement and trajectory. Good code in the wrong place is worse than bad code in the right place — it's harder to detect and erodes architecture silently. Developers gravitate to proximity: the file already open, the module already imported. This "nearest file" syndrome means code accumulates where it's convenient rather than where it belongs. The test: if a new developer needed this functionality, would they look here first? Assume the placement is wrong until proven right.

Beyond placement, every change either creates leverage or adds weight. Strategic changes make the next change easier — opening extension points, clarifying boundaries. Tactical changes solve only the immediate problem and make the next change harder by narrowing the solution space. The trajectory question: if you redesigned this system from scratch, where would this code live? Every gap between that ideal and the current placement is tech debt being created now. Evaluate as the architect returning in 6 months. The most dangerous changes work perfectly today while silently constraining tomorrow.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Module-level Feature Envy** — code imports more from foreign modules than its own, reaching across boundaries because it was placed on the wrong side (GRASP Information Expert violation). Check: import count from other modules exceeds imports from the current module.
- **Silent Convention Break** — change introduces a new pattern contradicting an existing architectural decision without documenting why. A new approach to something the codebase already handles (new state management alongside existing, new API convention, new error handling) with no ADR or PR description explaining the divergence.
- **Nearest File Syndrome** — new functionality added to an existing file by proximity rather than responsibility. The new code shares no conceptual relationship with the file's existing purpose — it solves a different problem that happens to need one function from this file.

### HIGH

- **Discovery Violation** — a new developer would not look here for this functionality. The file/module name doesn't hint at the capability, and no re-export or index file bridges the gap. Principle of least surprise applies to code placement, not just API design.
- **Tactical Fix** — change solves only this specific instance, not the class of problems. Hardcoded values, special-case conditionals, or copy-paste with minor modifications instead of a generalizable solution — creates a maintenance multiplier requiring N similar changes for N future cases.
- **Fragile Placement** — code would need to move if the module it depends on most were refactored. The primary dependency is on a specific module's internal structure rather than on a stable interface — placement is coupled to current structure, not to responsibility.
- **Future-Hostile Change** — change makes the next likely change harder. New tight coupling between previously independent modules, removal of extension-enabling interfaces, or introduction of data shape assumptions that constrain future evolution.
- **Prescriptive-Descriptive Gap** — if redesigned from scratch, this code would live in a fundamentally different structure. The code's logical domain doesn't match its physical location, and the mismatch is structural, not just naming — an artifact of historical decisions.
- **Responsibility Split** — code duplicates responsibility already owned by another module. Similar function names or logic patterns exist in another module doing the same conceptual work — two modules now own the same concept incompletely.

### MEDIUM (analysis only — informs review but not reported in output)

- **Anchoring Signal** — no alternative placement was considered or documented. No comment, PR description, or commit message indicates placement was a deliberate decision — the developer's first thought was their only thought.
- **Missed Strategic Opportunity** — change touches code adjacent to known debt and doesn't address it. The faster path was chosen over the strategic one — a missed chance to improve trajectory.
- **Tactical Tornado Signal** — high velocity, low structural consideration. Large change touching many files with no architectural coherence — each file modified in isolation rather than as part of a design. No tests, no docs.

## Severity Calibration

- **CRITICAL** — placement actively misleads developers and will cause bugs or duplication, or the change actively degrades architecture by breaking conventions that will be copied as precedent. Move the code or fix the convention break before merge.
- **HIGH** — placement is suboptimal but findable with extra navigation, or the change is tactically correct but strategically costly. Address in this PR if the move is clean; flag with a concrete improvement plan otherwise.
- **MEDIUM** — placement smell or missed opportunity indicating a default decision, not a designed one. Not reported.

## Language-Specific Notes

- **TypeScript/React:** Components placed in a feature directory but used across multiple features (should be in `shared/` or `components/`). Utility functions in component files that operate on data unrelated to the component. API call logic mixed into UI components instead of dedicated service modules. New state management pattern alongside existing one (Redux + Zustand + Context all coexisting). New API fetching approach (fetch + axios + react-query all present). Component patterns that don't match the established component architecture (class component in a hooks codebase).
- **Python:** Business logic in view/controller functions instead of domain/service layers. Database query logic scattered across modules instead of centralized in repositories. Configuration parsing mixed with application logic. New ORM usage pattern alongside existing one. New configuration approach (env vars + config files + hardcoded). New testing pattern that contradicts the established test architecture (pytest fixtures vs unittest setup).
- **Svelte:** Store logic embedded in component files rather than dedicated store modules. Derived state calculations in components that belong in shared stores. Action handlers that perform work unrelated to the component's UI responsibility. Mixing Svelte 4 and Svelte 5 patterns without a migration plan. New store patterns alongside established ones. Component composition approach that contradicts existing patterns (slots vs props for the same type of composition).

## Good vs. Bad Examples

### Bad — Nearest File Syndrome

```typescript
// File: src/components/UserProfile.tsx
// UserProfile component... AND order history fetching?
export function UserProfile({ userId }) {
  const user = useUser(userId);
  // This fetches and transforms order data — belongs in an orders module
  const orders = useFetch(`/api/orders?user=${userId}`);
  const recentOrders = orders.filter(o => daysSince(o.date) < 30);
  const totalSpend = recentOrders.reduce((sum, o) => sum + o.total, 0);
  // ... renders user profile with order summary
}
```

### Good — Proper Placement

```typescript
// File: src/services/orders.ts — order logic lives with orders
export function getRecentOrders(userId: string, days = 30) {
  return fetchOrders(userId).then(orders =>
    orders.filter(o => daysSince(o.date) < days)
  );
}

// File: src/components/UserProfile.tsx — only UI concern
export function UserProfile({ userId }) {
  const user = useUser(userId);
  const recentOrders = useRecentOrders(userId);
  // ... renders user profile with order summary
}
```

### Bad — Tactical Fix

```typescript
// Tactical fix: hardcoded special case that will need N more copies
function getDiscount(user: User): number {
  if (user.plan === 'enterprise') return 0.20;
  if (user.plan === 'pro') return 0.10;
  if (user.plan === 'startup-special-2024') return 0.15; // <- new tactical fix
  return 0;
}
```

### Good — Strategic Solution

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

**Report all HIGH and CRITICAL findings.** MEDIUM-severity detections (Anchoring Signal, Missed Strategic Opportunity, Tactical Tornado Signal) inform the agent's analysis but are NOT included in the output.

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences]
- **Recommendation:** [specific fix, not vague]

---

Sources: GRASP Information Expert principle (Larman), "A Philosophy of Software Design" (Ousterhout) — strategic vs tactical programming, "Refactoring" (Fowler) — Feature Envy and code smells as trajectory signals, "Design Patterns" (GoF) — open/closed principle, "Clean Architecture" (Martin) — dependency direction and architectural boundaries, Principle of Least Surprise (RFC 1925).
