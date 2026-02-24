---
id: S2
name: Coupling & Rigidity
category: Simplification
baseline: false
---

# Coupling & Rigidity Review

> Evaluates method-level and class-level interdependence that creates fragile connections, and structural patterns that make code disproportionately expensive to modify safely.

## Mental Model

Coupling and change resistance are two sides of maintainability. Coupling at the method/class level means one unit reaches deeply into another's internals, treating foreign data or behavior as its own. This is distinct from module-level dependency health — coupling analysis focuses on how individual functions and classes interact, not how modules depend on each other at an architectural scale. High coupling means changes ripple unpredictably: modifying one class's internals silently breaks another class that relied on those internals directly. Change resistance compounds this: code can be well-written and still resist change if a single logical modification requires touching many files (shotgun surgery) or if one file changes for many unrelated reasons (divergent change). The goal is localizing change impact so that one logical decision maps to one location in the code and one unit does not reach into another's internals.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Feature envy** — a method accesses data/methods from another object more than 3 times while accessing its own data fewer than 2 times — the method belongs in the other class.
- **Shotgun surgery** — a single logical change requires modifying >5 files that are not in the same module — found by examining how changes propagate through the commit history or by tracing a representative change scenario through the codebase.
- **Inappropriate intimacy** — two classes that access each other's private/internal members directly, bypassing the public API — found when Class A reaches into Class B's internals AND vice versa.
- **Divergent change** — one file modified in 3+ commits for unrelated reasons within the review range — the file has multiple responsibilities and is serving as an informal catch-all.

### HIGH

- **Message chains >3 hops** (`a.getB().getC().getD()`) — fragile chain breaks if any intermediate object changes.
- **Parallel modification patterns** — two files that always change together (>3 times in recent history) but are not in the same module — signals hidden coupling that should be made explicit or collapsed.
- **Middle man** — class that delegates >80% of its methods to another single class with no added logic — the class adds indirection without value.
- **Rigid configuration** — behavior controlled by hardcoded values scattered across >3 files instead of centralized in a single configuration source.
- **Import density** — a file imports >50% of its sibling modules (same directory) — signals it is a coupling hotspot.
- **No seams for testing** — code with no dependency injection points, making it impossible to substitute collaborators without the full runtime being present.

### MEDIUM

- **Law of Demeter violations** — method calls on objects obtained from other objects (not direct collaborators).
- **Modification amplification** — adding a new variant (enum value, type, route, role) requires changes in >3 locations (definition, handler, tests, UI, etc.) with no mechanism to enforce completeness.
- **Temporal coupling** — functions that must be called in a specific order with no enforcement mechanism.
- **Fragile base class** — base class changes that ripple to all subclasses without compile-time safety, relying on runtime discovery of breakage.
- **Hidden coupling via shared mutable state** — two functions modify the same external variable.
- **Cross-cutting concerns mixed into business logic** — logging, auth checks, and validation repeated inline instead of handled by middleware, decorators, or aspect-oriented patterns.

## Severity Calibration

- **CRITICAL** — the coupling creates active maintenance hazards where changing one unit WILL break another, or the change pattern means every future modification of this kind will be high-risk and high-effort. Refactor now before further development compounds the problem.
- **HIGH** — the coupling is a design smell that will cause pain during the next modification, or the resistance pattern will cause pain within 2-3 more modifications. Address in this PR.
- **MEDIUM** — mild coupling or friction that does not yet cause problems but signals design drift. Note for future refactoring and track in technical debt backlog.

## Language-Specific Notes

- **TypeScript/React:** Props drilling through >3 component layers instead of context/state management. Components importing from >5 different feature directories. Hooks that access >3 different stores/contexts. Adding a new page/route requires updating >4 files (router config, nav component, sidebar, permissions, types). State managed in a single global store with no slicing — every state change potentially re-renders everything regardless of relevance.
- **Python:** Functions that accept an object only to access one attribute (pass the attribute directly). Circular imports resolved via late imports. Monolithic `settings.py` where unrelated configurations live side by side. URL patterns defined far from their handlers. Model changes requiring manual migration steps beyond what auto-generation covers.
- **Svelte:** Components with >5 exported props that are just passed through to children (prop drilling). Stores accessed directly in >4 components instead of through a facade. Adding a new page requires changes in >3 files beyond the page component itself. Shared state in a single `writable` store that multiple unrelated components read and write without any scoping or facade layer.

## Good vs. Bad Examples

### Bad — Feature Envy

```typescript
// Feature envy — this method belongs in PricingService
function formatInvoice(invoice: Invoice) {
  const subtotal = invoice.pricing.getSubtotal();
  const tax = invoice.pricing.calculateTax(subtotal);
  const discount = invoice.pricing.applyDiscount(subtotal);
  const total = invoice.pricing.computeTotal(subtotal, tax, discount);
  return { total, tax, discount };
}
```

### Good — Feature Envy Fixed

```typescript
function formatInvoice(invoice: Invoice) {
  const summary = invoice.pricing.getSummary();
  return summary;
}
```

### Bad — Shotgun Surgery

```typescript
// Adding a new user role requires changes in 6 files:
// 1. types/roles.ts — add enum value
// 2. auth/permissions.ts — add permission mapping
// 3. components/RoleSelect.tsx — add to dropdown
// 4. api/middleware.ts — add to allowed list
// 5. db/seeds.ts — add seed data
// 6. tests/auth.test.ts — add test case
```

### Good — Centralized Configuration

```typescript
// Role definition is centralized — adding a role means editing 1 file:
// roles/config.ts defines role + permissions + UI label + seed data
// All consumers read from the config, no separate mapping needed
const roles = defineRoles({
  admin: { permissions: ['*'], label: 'Administrator' },
  editor: { permissions: ['read', 'write'], label: 'Editor' },
});
```

## Output Format

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH / MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences describing the coupling or change resistance and its concrete risk]
- **Recommendation:** [specific fix — name the refactoring pattern, the abstraction to introduce, or the centralization needed; not vague]

---

Sources: Mantyla "Couplers" and "Change Preventers" taxonomies, Fowler's Feature Envy/Inappropriate Intimacy/Shotgun Surgery/Divergent Change, Martin's Stable Dependencies Principle and Package Cohesion Principles, Law of Demeter.
