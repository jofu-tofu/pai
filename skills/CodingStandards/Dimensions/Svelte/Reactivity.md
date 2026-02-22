# Reactivity -- Svelte

> The reactivity dimension covers Svelte 5's runes system -- the foundational primitives ($state, $derived, $effect) that replace Svelte 4's compiler magic with explicit, fine-grained reactivity.

## Mental Model

Svelte 5 introduced runes as the core reactivity mechanism, replacing Svelte 4's implicit reactive declarations (`$:`) and store contracts (`writable`, `derived`) with explicit primitives. The mental model is a directed acyclic graph (DAG) of reactive dependencies: `$state` declares mutable leaf nodes, `$derived` declares computed nodes that auto-track their dependencies, and `$effect` is the escape hatch for side effects that bridge the reactive world to the imperative one (DOM mutations, network calls, timers).

The single most important principle in Svelte 5 reactivity is the hierarchy of primitives. `$derived` sits above `$effect` for any computation that produces a value. When you use `$effect` to compute a value and write it into a `$state` variable, you create a subscription-based synchronization loop -- the runtime must track the effect's dependencies, schedule the effect, run it, then propagate the state change, all of which `$derived` handles in a single pass with zero overhead. This is why DerivedOverEffect is the highest-impact rule in the entire Svelte coding standards.

Effects are reserved for imperative side effects: starting a timer, subscribing to an external event source, manipulating the DOM directly, or sending analytics. When you do use `$effect`, the cleanup pattern is critical -- every resource acquired in an effect must be released in the returned cleanup function, because effects re-run when dependencies change and run cleanup before each re-execution, as well as on component destruction.

Shared state in Svelte 5 lives in `.svelte.ts` files, where runes are available outside component boundaries. This replaces the entire Svelte 4 store ecosystem. The key constraint is that `$state` variables cannot be directly exported -- Svelte enforces reference stability at module boundaries, so you must expose state through accessor functions or class instances. Classes with `$state` fields are the idiomatic pattern for complex state models because they co-locate state, computed values (via getters), and mutations in a single encapsulated unit.

## Consumer Guide

### When Reviewing Code

Look for the most common anti-pattern first: `$effect` blocks that write to `$state` variables with computed values. Every such instance should be a `$derived` instead. Check that all `$effect` blocks either perform genuine side effects (DOM manipulation, network calls, timers) or have a comment explaining why `$derived` is insufficient. Verify that every `$effect` creating subscriptions, timers, or event listeners returns a cleanup function. Watch for `$state` used for values that never change after initialization -- these should be plain `const` declarations. In shared state files (`.svelte.ts`), verify that no `$state` is directly exported and that accessor patterns or classes are used. Flag any use of `writable` or `derived` from `svelte/store` in new Svelte 5 code.

### When Designing / Planning

Structure reactive state as a DAG: identify the leaf state (`$state`), the computed state (`$derived`), and the side effects (`$effect`). For shared state that multiple components need, plan a `.svelte.ts` module with either accessor functions (for simple state) or a class (for state with multiple fields and operations). Decide early whether state is component-local or shared -- this determines file placement. When planning complex derived computations that iterate over arrays, consider `$derived.by(() => ...)` for the multi-statement computation form.

### When Implementing

Start with `$state` for mutable values and `$derived` for anything computed. Only reach for `$effect` when you need to perform a side effect. When writing `$effect`, always consider what needs cleanup and return a cleanup function. For complex computations that cannot be expressed as a single expression, use `$derived.by(() => { ... })`. When you need to read reactive values without creating a dependency (e.g., in a logging effect that should not re-trigger when the logged value changes), wrap the read in `$effect.tracking()` checks or use `untrack()`. Keep reactive dependency surfaces narrow -- destructure only the fields you need before entering expensive computations so the effect or derived does not re-run on unrelated field changes.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [DerivedOverEffect](../../Rules/Svelte/DerivedOverEffect.md) | CRITICAL | Use $derived for computations, never $effect writing to $state |
| [EffectCleanup](../../Rules/Svelte/EffectCleanup.md) | CRITICAL | Return cleanup functions from $effect for timers, listeners, subscriptions |
| [DerivedByForComplex](../../Rules/Svelte/DerivedByForComplex.md) | HIGH | Use $derived.by() for multi-statement derived computations |
| [UntrackExplicit](../../Rules/Svelte/UntrackExplicit.md) | HIGH | Use untrack() to read reactive values without creating dependencies |
| [NoStateInEffect](../../Rules/Svelte/NoStateInEffect.md) | CRITICAL | Do not declare $state inside $effect -- state belongs at component/module scope |
| [NoStateForConstants](../../Rules/Svelte/NoStateForConstants.md) | MEDIUM | Use plain const for values that never change -- $state adds unnecessary overhead |
| [NarrowReactiveDeps](../../Rules/Svelte/NarrowReactiveDeps.md) | HIGH | Destructure objects before use in $derived/$effect to minimize re-execution |
| [RunesInSvelteTs](../../Rules/Svelte/RunesInSvelteTs.md) | CRITICAL | Use runes in .svelte.ts files for shared reactive state |
| [NoExportRawState](../../Rules/Svelte/NoExportRawState.md) | CRITICAL | Never export raw $state -- use accessor functions or classes |
| [StateClasses](../../Rules/Svelte/StateClasses.md) | HIGH | Use classes with $state fields for complex state models |
| [RunesOverStores](../../Rules/Svelte/RunesOverStores.md) | MEDIUM | Prefer runes over svelte/store for all new Svelte 5 code |

## Rule Interactions

- **DerivedOverEffect + NoStateInEffect**: Both address the same anti-pattern from different angles. DerivedOverEffect catches the computed-value case; NoStateInEffect catches the structural violation of declaring state inside effects.
- **RunesInSvelteTs + NoExportRawState + StateClasses**: These three form a progression for shared state. RunesInSvelteTs establishes the file convention, NoExportRawState enforces the export constraint, and StateClasses provides the idiomatic pattern for complex cases.
- **NarrowReactiveDeps + UntrackExplicit**: Both control dependency tracking scope. NarrowReactiveDeps reduces dependencies through destructuring; UntrackExplicit removes them entirely for specific reads.
- **RunesOverStores + RunesInSvelteTs**: RunesOverStores is the migration directive; RunesInSvelteTs is the implementation pattern. Together they define the path from Svelte 4 stores to Svelte 5 shared state.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Effect-driven computation**: Using `$effect` to write computed values into `$state`. Creates unnecessary subscription overhead, risks infinite loops, and obscures the reactive dependency graph. Always replace with `$derived`.
- **Missing effect cleanup**: An `$effect` that creates a timer, event listener, or subscription without returning a cleanup function. Causes memory leaks that compound on each dependency change and component remount.
- **Raw state export**: Directly exporting a `$state` variable from a `.svelte.ts` file. This is a compile error in Svelte 5 -- the compiler enforces reference stability at module boundaries.

### HIGH

- **Overly broad reactive dependencies**: Passing an entire object into `$derived` or `$effect` when only one field is used. Causes re-execution on any field change, degrading performance proportionally to the frequency of unrelated mutations.
- **Scattered accessor functions**: A `.svelte.ts` file with many individual `$state` variables and corresponding getter/setter pairs. Refactor to a class for cohesion.

### MEDIUM

- **$state for constants**: Using `$state` for a value assigned once and never mutated. Wastes the reactive proxy overhead and misleads readers about mutability intent.
- **Reaching for stores in new code**: Using `writable`/`derived` from `svelte/store` when building new features in a Svelte 5 codebase. Stores remain valid for legacy interop but add unnecessary abstraction for new code.

## Examples

**Reactive state class replacing stores:**

```typescript
// Svelte 4 (stores)
import { writable, derived } from 'svelte/store';
export const count = writable(0);
export const doubled = derived(count, $c => $c * 2);

// Svelte 5 (runes in .svelte.ts)
class Counter {
  count = $state(0);
  doubled = $derived(this.count * 2);

  increment = () => { this.count++; };
  reset = () => { this.count = 0; };
}
export const counter = new Counter();
```

**Effect with proper cleanup:**

```svelte
<script lang="ts">
  let { url } = $props<{ url: string }>();
  let data = $state<unknown>(null);

  $effect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { data = d; })
      .catch(() => {});
    return () => controller.abort();
  });
</script>
```

**Narrow dependency tracking:**

```svelte
<script lang="ts">
  let settings = $state({ theme: 'dark', fontSize: 14, locale: 'en' });

  // Bad: re-runs when any settings field changes
  let themeClass = $derived(settings.theme === 'dark' ? 'dark-mode' : 'light-mode');

  // Good: destructure first for clarity (same tracking in this case, but clearer intent)
  let { theme } = $derived({ theme: settings.theme });
</script>
```

## Does Not Cover

- **Component architecture** (props, snippets, context) -- see Architecture dimension (SV2).
- **TypeScript type definitions** for props and snippets -- see TypeSystem dimension (SV3).
- **SvelteKit data loading** patterns -- see DataForms dimension (SV4).
- **SSR hydration** issues with non-deterministic values -- see PerformanceSSR dimension (SV5).
- **Event handling syntax** (onclick vs on:click) -- see PerformanceSSR dimension (SV5).

## Sources

- Svelte 5 documentation: Runes (https://svelte.dev/docs/svelte/$state, $derived, $effect)
- Svelte 5 migration guide
- Joy of Code: Svelte 5 runes deep dive
- Captain Codeman: Svelte 5 state management patterns
