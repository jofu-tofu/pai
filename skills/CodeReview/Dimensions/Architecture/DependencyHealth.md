# Dependency Health Review

> Evaluates coupling direction, import tangles, and dependency weight to ensure the system remains analyzable and changeable.

## Mental Model

**Architecture context:** You have access to the full `file_list` (all files in affected modules) and `module_map` (directory tree) from GatherContext — not just the diff. Use this broader view to trace dependency graphs across the entire affected module surface, not only changed files. This is essential for detecting transitive cycles and fan-in concentration that are invisible from the diff alone.

Dependencies should flow in one direction — from unstable (frequently changing) to stable (rarely changing). Circular dependencies, import tangles, and depending on concrete implementations instead of abstractions all degrade the system's analyzability: when a module cannot be understood without simultaneously understanding another, the cognitive cost of every change multiplies.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Circular dependency** — module A imports from B which imports from A (directly or transitively through 1 intermediate module) — creates compilation/bundling issues and makes both modules impossible to understand independently.
- **Depending on implementation internals** — importing from a deep path inside another module (e.g., `../../moduleB/src/internal/helper`) rather than the module's public entry point — couples the consumer to internals that have no stability contract.

### HIGH

- **Stable-Dependencies Principle violation** — a stable module (depended on by >3 other modules) importing from an unstable module (depended on by 0-1 others) — changes in the unstable module ripple to all stable module dependents.
- **Import fan-out >8** — a single file importing from >8 different modules/packages — the file depends on too many things and will break for too many reasons.
- **Dependency on concrete implementation where abstraction exists** — importing a specific class instead of its interface/protocol when the abstraction is already defined and available in the codebase.

### MEDIUM

- **Import fan-in concentration** — >5 files in the codebase import the same file — signals the imported file is a coupling magnet that should be especially stable and well-tested; any signature change is high-blast-radius.
- **Layer violation** — import crosses an architectural layer boundary (e.g., UI importing directly from the database layer, skipping the service/domain layer).
- **Unnecessary transitive dependency** — importing a module only to pass its exports to another module without using them directly — the intermediate module has taken on a dependency it does not need.

## Severity Calibration

- **CRITICAL** — the dependency pattern prevents independent compilation, testing, or reasoning about either module. Must be resolved before merge.
- **HIGH** — the dependency direction is wrong or excessive and will amplify future change impact. Address in this PR.
- **MEDIUM** — dependency hygiene issue. Flag for awareness; can be tracked as follow-up.

## Language-Specific Notes

- **TypeScript/React:** Barrel files (`index.ts`) can create hidden circular dependencies when two barrels reference each other. Dynamic imports obscure the static dependency graph. Path aliases hide actual depth — resolve before counting fan-out.
- **Python:** Late imports inside function bodies are still circular dependencies. `__init__.py` that imports all submodules creates implicit coupling with deceptively large fan-in.
- **Svelte:** Store imports create implicit reactive dependency chains invisible to static analysis. Component imports crossing layout/feature boundaries violate expected dependency direction.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Circular dependency: auth imports from user, user imports from auth
// auth/service.ts
import { getUserById } from '../user/repository';

// user/model.ts
import { isAuthenticated } from '../auth/service';
```

### Good (after)

```typescript
// Break cycle with dependency inversion: introduce a shared interface
// shared/interfaces.ts
export interface UserLookup {
  getById(id: string): Promise<User>;
}

// auth/service.ts — depends on the abstraction, not the user module
import type { UserLookup } from '../shared/interfaces';

// user/repository.ts — implements the interface, no auth import needed
export const userLookup: UserLookup = { getById: async (id) => { /* ... */ } };
```

## Output Format

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH / MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences describing the dependency problem and its concrete risk]
- **Recommendation:** [specific fix — name the abstraction to introduce, the import to remove, or the layer boundary to respect; not vague]

---

Sources: Martin's Stable Dependencies Principle and Acyclic Dependencies Principle (Clean Architecture Ch. 14); ISO 25010 Analyzability sub-characteristic; Fowler on module dependency management.
