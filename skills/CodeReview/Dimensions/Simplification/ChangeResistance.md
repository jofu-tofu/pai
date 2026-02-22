# Change Resistance Review

> Identifies structural patterns that make code disproportionately expensive to modify safely.

## Mental Model

Change resistance is about the COST of modification, not the quality of the current code. Code can be well-written and still resist change if a single logical modification requires touching many files (shotgun surgery) or if one file changes for many unrelated reasons (divergent change). The goal is localizing change impact so that one logical decision maps to one location in the code.

## Detection Heuristics (ordered by severity)

### CRITICAL

- Shotgun surgery — a single logical change requires modifying >5 files that are not in the same module — found by examining how changes propagate through the commit history or by tracing a representative change scenario through the codebase
- Divergent change — one file modified in 3+ commits for unrelated reasons within the review range — the file has multiple responsibilities and is serving as an informal catch-all

### HIGH

- Parallel modification patterns — two files that always change together (>3 times in recent history) but are not in the same module — signals hidden coupling that should be made explicit or collapsed
- Rigid configuration — behavior controlled by hardcoded values scattered across >3 files instead of centralized in a single configuration source
- No seams for testing — code with no dependency injection points, making it impossible to substitute collaborators without the full runtime being present

### MEDIUM

- Modification amplification — adding a new variant (enum value, type, route, role) requires changes in >3 locations (definition, handler, tests, UI, etc.) with no mechanism to enforce completeness
- Fragile base class — base class changes that ripple to all subclasses without compile-time safety, relying on runtime discovery of breakage
- Cross-cutting concerns mixed into business logic — logging, auth checks, and validation repeated inline instead of handled by middleware, decorators, or aspect-oriented patterns

## Severity Calibration

CRITICAL = the change pattern means every future modification of this kind will be high-risk and high-effort. Restructure now before further development compounds the problem.
HIGH = the resistance pattern will cause pain within 2-3 more modifications. Address while the code is already being changed in this review.
MEDIUM = mild friction that does not yet block changes. Note for future refactoring and track in technical debt backlog.

## Language-Specific Notes

- **TypeScript/React:** Adding a new page/route requires updating >4 files (router config, nav component, sidebar, permissions, types). State managed in a single global store with no slicing — every state change potentially re-renders everything regardless of relevance.
- **Python:** Monolithic `settings.py` where unrelated configurations live side by side. URL patterns defined far from their handlers. Model changes requiring manual migration steps beyond what auto-generation covers.
- **Svelte:** Adding a new page requires changes in >3 files beyond the page component itself. Shared state in a single `writable` store that multiple unrelated components read and write without any scoping or facade layer.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Adding a new user role requires changes in 6 files:
// 1. types/roles.ts — add enum value
// 2. auth/permissions.ts — add permission mapping
// 3. components/RoleSelect.tsx — add to dropdown
// 4. api/middleware.ts — add to allowed list
// 5. db/seeds.ts — add seed data
// 6. tests/auth.test.ts — add test case
```

### Good (after)

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

- Severity: [CRITICAL/HIGH/MEDIUM]
- File: [path]
- Line: [range]
- Heuristic: [which specific heuristic from above was triggered]
- Issue: [1-2 sentences]
- Recommendation: [specific fix, not vague]

---

Sources: Mäntylä "Change Preventers" taxonomy, Fowler's Shotgun Surgery and Divergent Change, Martin's Package Cohesion Principles.
