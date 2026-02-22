# Modularity & Boundaries Review

> Evaluates whether modules are discrete, encapsulated units where changes to one have minimal impact on others.

## Mental Model

**Architecture context:** You have access to the full `file_list` (all files in affected modules) and `module_map` (directory tree) from GatherContext — not just the diff. Use this broader view to evaluate boundary integrity across the entire affected module surface, not only changed files.

A well-modularized system follows Parnas's Information Hiding — each module hides a design decision behind a stable interface, so consumers are shielded from implementation changes. Violations occur when internals leak across boundaries: a consumer that reaches into another module's private implementation is now coupled to that implementation, meaning any internal refactor becomes an externally visible breaking change.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **God module** — a single module/directory with >15 exported symbols AND >500 lines AND imports from >5 sibling modules. It knows too much and does too much; it is both a coupling magnet and a change amplifier.
- **Internal types exported** — types or interfaces that represent implementation details (internal state, private helpers, intermediate representations) exposed in the module's public API (index.ts, `__init__.py`). Consumers will depend on them, making refactors impossible without breakage.
- **Shared mutable state across module boundaries** — global variables, singletons, or module-scoped state mutated directly by consumers in other modules. Any module can corrupt shared state at any time, making bugs non-local and hard to isolate.

### HIGH

- **Boundary violation** — module A imports from module B's internal path (e.g., `import { helper } from '../moduleB/internal/utils'`) instead of from B's public API entry point. B can no longer refactor its internals without breaking A.
- **Circular module dependency** — module A imports from B which imports from A. Detectable from the import graph across the affected `file_list`. Circular deps prevent independent deployment, testing, and reasoning about either module.
- **Re-export sprawl** — an index file that re-exports >20 symbols from internal files. The module's public surface is unbounded; everything internal is implicitly public, defeating encapsulation.

### MEDIUM

- **Missing barrel file** — module has >5 files but no index.ts / `__init__.py` defining its public API. Consumers import directly from internal files, making boundary enforcement impossible to enforce by convention.
- **Unclear module responsibility** — a module directory contains files serving >2 unrelated domains (e.g., auth logic and email templates in the same module). Violates single-responsibility at the module level; coupling between unrelated concerns becomes invisible.
- **Leaking implementation via return types** — a public function returns a type that is not exported from the module's public API. Consumers must import it from an internal path or use `any`, both of which create hidden coupling.

## Severity Calibration

- **CRITICAL** — the boundary violation means changes to one module WILL cascade to others unpredictably. Must be fixed before merge.
- **HIGH** — the boundary is weakened and will cause coupling problems as the codebase grows. Address in this PR.
- **MEDIUM** — minor boundary hygiene issue. Flag for awareness; can be tracked as follow-up.

## Language-Specific Notes

- **TypeScript/React:** Check for components importing from sibling feature modules' internal paths. Look for barrel files (index.ts) that re-export everything indiscriminately vs. selective exports. Module boundaries are typically defined by top-level directories under `src/`. Verify that `index.ts` is the only import target used by consumers outside the module.
- **Python:** Check `__init__.py` for an explicit `__all__` definition — its absence means every name is implicitly public. Flag imports from `_private`-prefixed submodules of other packages. Package boundaries are defined by directories containing `__init__.py`.
- **Svelte:** Check for component imports crossing feature directory boundaries. Shared state modules (stores) accessed directly by >5 consumers should be wrapped in a facade rather than consumed raw, to allow internal store refactoring without consumer churn.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Consumer reaches into auth module's internals
import { hashPassword } from '../auth/internal/crypto';
import { TOKEN_SECRET } from '../auth/internal/constants';
```

### Good (after)

```typescript
// Consumer uses auth module's public API
import { authenticateUser } from '../auth';
```

## Output Format

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH / MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences describing the boundary violation and its concrete risk]
- **Recommendation:** [specific fix — name the symbol, file, or refactor required; not vague]

---

Sources: Parnas, "On the Criteria To Be Used in Decomposing Systems into Modules" (1972); ISO 25010 Modularity sub-characteristic; God Module anti-pattern literature.
