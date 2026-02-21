# Svelte Workflow

> **Trigger:** File signals: `.svelte`, `.svelte.ts`, `svelte.config.*`, `+page.svelte`, `+layout.svelte`, `+page.server.ts`, `+layout.server.ts`, `+server.ts`, `hooks.server.ts`

> **Version scope:** These rules target **Svelte 5** (runes: $state, $derived, $effect, $props) and **SvelteKit 2+**. Svelte 4 patterns (reactive statements `$:`, `export let`, named slots) are treated as legacy. Rules reference the Svelte 5 migration guide where relevant.

## Purpose

Apply Svelte 5 and SvelteKit coding standards covering runes & reactivity, component architecture, TypeScript integration, state management, data loading, forms, performance, and error handling across 36 rules in 8 priority categories.

## Reference Material

- `../Rules/Svelte/` — 36 individual rule files across 8 categories

## Quick Decision Tree

**Start here when writing/reviewing Svelte code:**

1. **Using $effect for computed values?** → Category 1: Runes & Reactivity (CRITICAL)
2. **Component props, slots, or context?** → Category 2: Component Architecture (HIGH)
3. **TypeScript types for components?** → Category 3: TypeScript Integration (HIGH)
4. **Shared/global state patterns?** → Category 4: State Management (HIGH)
5. **Loading data or handling forms?** → Category 5: SvelteKit Data & Forms (HIGH)
6. **Route organization or hooks?** → Category 6: SvelteKit Architecture (MEDIUM)
7. **Bundle size or rendering perf?** → Category 7: Performance (HIGH)
8. **Error handling or SSR issues?** → Category 8: Error Handling & SSR (MEDIUM)

**For detailed implementation:** Read the specific rule file from `../Rules/Svelte/` folder.

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern |
|----------|----------|--------|-------------|
| 1 | Runes & Reactivity | CRITICAL | $derived over $effect, cleanup, narrow deps |
| 2 | State Management | CRITICAL | Runes in .svelte.ts, no raw $state export |
| 3 | SvelteKit Data & Forms | HIGH | Server load, form actions, parallel fetch |
| 4 | Component Architecture | HIGH | Snippets, typed props, context, callbacks |
| 5 | TypeScript Integration | HIGH | Generics, HTML attributes, named interfaces |
| 6 | SvelteKit Architecture | HIGH | Route groups, layout data, hooks, env safety |
| 7 | Performance | HIGH | Dynamic imports, event delegation |
| 8 | Error Handling & SSR | MEDIUM | error(), SSR-safe values, boundaries |

## Top 10 High-Impact Rules

These provide the largest code quality gains:

1. **DerivedOverEffect** — Use $derived for computations, not $effect
2. **EffectCleanup** — Return cleanup functions from $effect
3. **RunesInSvelteTs** — Use runes in .svelte.ts for shared state
4. **NoExportRawState** — Never export raw $state — use accessors or classes
5. **SeparateServerClientState** — Keep server data and client state separate
6. **TypedProps** — Type props with $props() and interface
7. **SnippetsOverSlots** — Use snippets instead of slots
8. **FormActionsOverFetch** — Use form actions for progressive enhancement
9. **ParallelLoading** — Fetch data in parallel with Promise.all
10. **NoDeterministicSSR** — Avoid non-deterministic values during SSR

## Examples

**Example 1: Derived over Effect**
```svelte
<!-- Problem: $effect for computed value -->
<script lang="ts">
  let count = $state(0);
  let doubled = $state(0);
  $effect(() => { doubled = count * 2; });
</script>

<!-- Solution: DerivedOverEffect rule -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

**Example 2: Typed Props**
```svelte
<!-- Problem: Svelte 4 export let pattern -->
<script lang="ts">
  export let title: string;
  export let count: number = 0;
</script>

<!-- Solution: TypedProps rule -->
<script lang="ts">
  interface Props { title: string; count?: number; }
  const { title, count = 0 } = $props<Props>();
</script>
```

**Example 3: Shared State**
```typescript
// Problem: writable store in Svelte 5
import { writable } from 'svelte/store';
export const user = writable(null);

// Solution: RunesInSvelteTs rule
// appState.svelte.ts
let user = $state(null);
export function getUser() { return user; }
export function setUser(u) { user = u; }
```

## How to Use Rules

**Pattern:** When applying a rule, read its specific file from `../Rules/Svelte/` folder.

```
Decision tree identifies: Category 1 (Runes & Reactivity)
Quick ref shows: DerivedOverEffect rule
Action: Read ../Rules/Svelte/DerivedOverEffect.md
Result: Complete code examples and implementation guidance
```

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `derived-over-effect` → `../Rules/Svelte/DerivedOverEffect.md`
- `typed-props` → `../Rules/Svelte/TypedProps.md`
- `form-actions-over-fetch` → `../Rules/Svelte/FormActionsOverFetch.md`

## Complete Rule Index

### 1. Runes & Reactivity (CRITICAL)
- DerivedOverEffect
- EffectCleanup
- DerivedByForComplex
- UntrackExplicit
- NoStateInEffect
- NoStateForConstants
- NarrowReactiveDeps

### 2. Component Architecture (HIGH)
- SnippetsOverSlots
- TypedProps
- TypeSafeContext
- NoMutateProps
- CallbacksOverBind

### 3. TypeScript Integration (HIGH)
- GenericSnippets
- HtmlAttributes
- PropsDestructureType
- ArrowMethodsInClasses

### 4. State Management (HIGH)
- RunesInSvelteTs
- NoExportRawState
- StateClasses
- RunesOverStores

### 5. SvelteKit Data & Forms (HIGH)
- ServerLoadForSecrets
- ParallelLoading
- FormActionsOverFetch
- ValidateServerSide
- LeanLoadFunctions
- SeparateServerClientState

### 6. SvelteKit Architecture (MEDIUM)
- RouteGroups
- LayoutDataForShared
- ServerHooks
- EnvVarSafety

### 7. Performance (HIGH)
- DynamicImports
- OnclickOverOnClick
- EventDelegation

### 8. Error Handling & SSR (MEDIUM)
- ExpectedVsUnexpected
- NoDeterministicSSR
- ErrorBoundaries

## Integration

This skill integrates with PAI's code generation and review workflows. When writing or reviewing Svelte/SvelteKit code, these patterns ensure reactive, type-safe, and performant applications.

**Sources:** Svelte 5 official docs, SvelteKit docs, Joy of Code, Captain Codeman, Mainmatter, Frontend Masters, Cursor Directory
