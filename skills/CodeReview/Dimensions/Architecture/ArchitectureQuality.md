---
id: A1
name: Architecture Quality
category: Architecture
baseline: false
---

# Architecture Quality Review

> Evaluates module boundaries, pattern consistency, and dependency health as three facets of architectural quality.

## Mental Model

**Architecture context:** You have access to the full `file_list` (all files in affected modules) and `module_map` (directory tree) from GatherContext — not just the diff. Use this broader view to evaluate boundary integrity, convention adherence, and dependency graphs across the entire affected module surface, not only changed files.

Architecture quality rests on three reinforcing pillars. First, **module boundaries**: a well-modularized system follows Parnas's Information Hiding — each module hides a design decision behind a stable interface, so consumers are shielded from implementation changes. Violations occur when internals leak across boundaries: a consumer that reaches into another module's private implementation is now coupled to that implementation, meaning any internal refactor becomes an externally visible breaking change. Second, **pattern consistency**: a codebase should read as if one mind wrote it. Inconsistency forces developers to learn multiple conventions for the same concept, increases cognitive overhead when navigating between modules, and signals that the codebase lacks shared standards. The question is: "does this new code follow the patterns already established HERE?" Third, **dependency health**: dependencies should flow in one direction — from unstable (frequently changing) to stable (rarely changing). Circular dependencies, import tangles, and depending on concrete implementations instead of abstractions all degrade the system's analyzability: when a module cannot be understood without simultaneously understanding another, the cognitive cost of every change multiplies.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **God module** — a single module/directory with >15 exported symbols AND >500 lines AND imports from >5 sibling modules. It knows too much and does too much; it is both a coupling magnet and a change amplifier.
- **API surface inconsistency** — endpoints in the same API return different response shapes (e.g., some wrap in `{data}`, others return bare objects) — breaks consumer expectations across >2 endpoints.
- **Circular dependency** — module A imports from B which imports from A (directly or transitively through 1 intermediate module) — creates compilation/bundling issues and makes both modules impossible to understand independently.
- **Internal types exported** — types or interfaces that represent implementation details (internal state, private helpers, intermediate representations) exposed in the module's public API (index.ts, `__init__.py`). Consumers will depend on them, making refactors impossible without breakage.
- **Error handling divergence** — different error patterns used within the same module (try/catch in some functions, Result types in others, thrown strings vs Error objects) — inconsistency in >3 functions within one module.
- **Depending on implementation internals** — importing from a deep path inside another module (e.g., `../../moduleB/src/internal/helper`) rather than the module's public entry point — couples the consumer to internals that have no stability contract.
- **Shared mutable state across module boundaries** — global variables, singletons, or module-scoped state mutated directly by consumers in other modules. Any module can corrupt shared state at any time, making bugs non-local and hard to isolate.

### HIGH

- **Boundary violation** — module A imports from module B's internal path (e.g., `import { helper } from '../moduleB/internal/utils'`) instead of from B's public API entry point. B can no longer refactor its internals without breaking A.
- **Naming pattern drift** — new code uses different naming convention than existing code in the same module (camelCase vs. snake_case, verb-first vs. noun-first for functions, plural vs. singular for collections).
- **Stable-Dependencies Principle violation** — a stable module (depended on by >3 other modules) importing from an unstable module (depended on by 0-1 others) — changes in the unstable module ripple to all stable module dependents.
- **Circular module dependency** — module A imports from B which imports from A. Detectable from the import graph across the affected `file_list`. Circular deps prevent independent deployment, testing, and reasoning about either module.
- **File organization violation** — new file placed in a directory that doesn't match the established organizational pattern (e.g., a utility placed in `components/`, a component placed in `utils/`).
- **Import fan-out >8** — a single file importing from >8 different modules/packages — the file depends on too many things and will break for too many reasons.
- **Re-export sprawl** — an index file that re-exports >20 symbols from internal files. The module's public surface is unbounded; everything internal is implicitly public, defeating encapsulation.
- **State management inconsistency** — new feature uses a different state management approach than existing features in the same app (e.g., Redux in one feature, Zustand in another, local state in a third).
- **Dependency on concrete implementation where abstraction exists** — importing a specific class instead of its interface/protocol when the abstraction is already defined and available in the codebase.

### MEDIUM

- **Missing barrel file** — module has >5 files but no index.ts / `__init__.py` defining its public API. Consumers import directly from internal files, making boundary enforcement impossible to enforce by convention.
- **Import style mixing** — default imports and named imports used interchangeably for the same module across different files.
- **Import fan-in concentration** — >5 files in the codebase import the same file — signals the imported file is a coupling magnet that should be especially stable and well-tested; any signature change is high-blast-radius.
- **Unclear module responsibility** — a module directory contains files serving >2 unrelated domains (e.g., auth logic and email templates in the same module). Violates single-responsibility at the module level; coupling between unrelated concerns becomes invisible.
- **Comment style divergence** — JSDoc in some files, inline comments in others, no comments in a third — within the same feature.
- **Layer violation** — import crosses an architectural layer boundary (e.g., UI importing directly from the database layer, skipping the service/domain layer).
- **Leaking implementation via return types** — a public function returns a type that is not exported from the module's public API. Consumers must import it from an internal path or use `any`, both of which create hidden coupling.
- **Test structure inconsistency** — different `describe`/`it` nesting patterns, assertion libraries, or mock approaches within the same test directory.
- **Unnecessary transitive dependency** — importing a module only to pass its exports to another module without using them directly — the intermediate module has taken on a dependency it does not need.

## Severity Calibration

- **CRITICAL** — the boundary violation, convention break, or dependency pattern prevents independent compilation, testing, or reasoning about modules, or breaks contracts causing runtime errors for consumers. Must be resolved before merge.
- **HIGH** — the boundary is weakened, the inconsistency creates cognitive load, or the dependency direction is wrong — will cause coupling problems as the codebase grows. Address in this PR.
- **MEDIUM** — minor boundary hygiene, style-level inconsistency, or dependency cleanliness issue. Flag for awareness; can be tracked as follow-up.

## Language-Specific Notes

- **TypeScript/React:** Check for components importing from sibling feature modules' internal paths. Look for barrel files (index.ts) that re-export everything indiscriminately vs. selective exports. Module boundaries are typically defined by top-level directories under `src/`. Verify that `index.ts` is the only import target used by consumers outside the module. Component naming (PascalCase files vs. kebab-case). Hook naming convention (`useX`). Props interface naming (`{ComponentName}Props`). Event handler naming (`onX` vs. `handleX`). Check the 3 nearest siblings for the established pattern. Barrel files (`index.ts`) can create hidden circular dependencies when two barrels reference each other. Dynamic imports obscure the static dependency graph. Path aliases hide actual depth — resolve before counting fan-out.
- **Python:** Check `__init__.py` for an explicit `__all__` definition — its absence means every name is implicitly public. Flag imports from `_private`-prefixed submodules of other packages. Package boundaries are defined by directories containing `__init__.py`. Function naming (snake_case). Class naming (PascalCase). Module-level constant naming (UPPER_SNAKE). Docstring format (Google vs. NumPy vs. reStructuredText). Late imports inside function bodies are still circular dependencies. `__init__.py` that imports all submodules creates implicit coupling with deceptively large fan-in.
- **Svelte:** Check for component imports crossing feature directory boundaries. Shared state modules (stores) accessed directly by >5 consumers should be wrapped in a facade rather than consumed raw, to allow internal store refactoring without consumer churn. Component file naming convention. Store naming and location patterns. Event dispatcher naming vs. callback prop naming. Store imports create implicit reactive dependency chains invisible to static analysis. Component imports crossing layout/feature boundaries violate expected dependency direction.

## Good vs. Bad Examples

### Bad — Boundary Violation

```typescript
// Consumer reaches into auth module's internals
import { hashPassword } from '../auth/internal/crypto';
import { TOKEN_SECRET } from '../auth/internal/constants';
```

### Good — Boundary Violation Fixed

```typescript
// Consumer uses auth module's public API
import { authenticateUser } from '../auth';
```

### Bad — Naming Inconsistency

```typescript
// Existing codebase uses: getUser(), getProducts(), getOrders()
// New code introduces inconsistent naming:
function fetchPaymentHistory() { }  // fetch vs. get
function payment_refund() { }       // snake_case vs. camelCase
```

### Good — Naming Consistency

```typescript
// Follows established naming convention:
function getPaymentHistory() { }
function getPaymentRefund() { }
```

### Bad — Circular Dependency

```typescript
// Circular dependency: auth imports from user, user imports from auth
// auth/service.ts
import { getUserById } from '../user/repository';

// user/model.ts
import { isAuthenticated } from '../auth/service';
```

### Good — Circular Dependency Broken

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
- **Issue:** [1-2 sentences describing the boundary violation, inconsistency, or dependency problem and its concrete risk]
- **Recommendation:** [specific fix — name the symbol, file, abstraction to introduce, import to remove, or refactor required; not vague]

---

Sources: Parnas, "On the Criteria To Be Used in Decomposing Systems into Modules" (1972); ISO 25010 Modularity and Analyzability sub-characteristics; God Module anti-pattern literature; Google Code Review Consistency dimension; arc42 quality model (#reliable); Ousterhout, "A Philosophy of Software Design" — consistency reduces cognitive load; Martin's Stable Dependencies Principle and Acyclic Dependencies Principle (Clean Architecture Ch. 14); Fowler on module dependency management.
