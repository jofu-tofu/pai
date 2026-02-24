# Placement Validity Review

> Evaluates whether code was placed where it belongs by responsibility, or where it landed due to gravitational pull from existing structure.

## Mental Model

Good code in the wrong place is worse than bad code in the right place — it's harder to detect and erodes architecture silently. Developers gravitate to proximity: the file already open, the module already imported. This "nearest file" syndrome means code accumulates where it's convenient rather than where it belongs. The test: if a new developer needed this functionality, would they look here first?

Assume the placement is wrong until proven right. Before evaluating HOW code is written, evaluate WHERE it was placed. The burden of proof is on the code to demonstrate it belongs here, not on the reviewer to prove it doesn't.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Module-level Feature Envy** — code imports more from foreign modules than its own, reaching across boundaries because it was placed on the wrong side (GRASP Information Expert violation). Check: import count from other modules exceeds imports from the current module.
- **Nearest File Syndrome** — new functionality added to an existing file by proximity rather than responsibility. The new code shares no conceptual relationship with the file's existing purpose — it solves a different problem that happens to need one function from this file.

### HIGH

- **Discovery Violation** — a new developer would not look here for this functionality. The file/module name doesn't hint at the capability, and no re-export or index file bridges the gap. Principle of least surprise applies to code placement, not just API design.
- **Fragile Placement** — code would need to move if the module it depends on most were refactored. The primary dependency is on a specific module's internal structure rather than on a stable interface — placement is coupled to current structure, not to responsibility.

### MEDIUM (analysis only — informs review but not reported in output)

- **Anchoring Signal** — no alternative placement was considered or documented. No comment, PR description, or commit message indicates placement was a deliberate decision — the developer's first thought was their only thought.
- **Responsibility Split** — code duplicates responsibility already owned by another module. Similar function names or logic patterns exist in another module doing the same conceptual work — two modules now own the same concept incompletely.

## Severity Calibration

- **CRITICAL** — placement actively misleads developers and will cause bugs or duplication. Move the code before the wrong location becomes load-bearing.
- **HIGH** — placement is suboptimal but findable with extra navigation. Address in this PR if the move is clean; flag for follow-up otherwise.
- **MEDIUM** — placement smell indicating a default decision, not a designed one. Not reported.

## Language-Specific Notes

- **TypeScript/React:** Components placed in a feature directory but used across multiple features (should be in `shared/` or `components/`). Utility functions in component files that operate on data unrelated to the component. API call logic mixed into UI components instead of dedicated service modules.
- **Python:** Business logic in view/controller functions instead of domain/service layers. Database query logic scattered across modules instead of centralized in repositories. Configuration parsing mixed with application logic.
- **Svelte:** Store logic embedded in component files rather than dedicated store modules. Derived state calculations in components that belong in shared stores. Action handlers that perform work unrelated to the component's UI responsibility.

## Good vs. Bad Examples

### Bad (before)

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

### Good (after)

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

Sources: GRASP Information Expert principle (Larman), "A Philosophy of Software Design" (Ousterhout) — strategic vs tactical programming, Feature Envy code smell (Fowler), Principle of Least Surprise (RFC 1925).
