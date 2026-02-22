# Architecture -- Svelte

> The architecture dimension covers component design patterns and SvelteKit application structure -- how components communicate, how routes are organized, and how server-side infrastructure is configured.

## Mental Model

Svelte 5 component architecture is built on three communication primitives: props (parent-to-child data flow via `$props()`), snippets (parent-to-child template delegation via `{#snippet}` and `{@render}`), and context (ancestor-to-descendant dependency injection via `setContext`/`getContext`). Each serves a distinct purpose, and misusing one where another belongs creates coupling, reduces type safety, or breaks composability.

Props are the primary interface. In Svelte 5, `$props()` with a TypeScript interface replaces Svelte 4's `export let` declarations, providing full type safety with default values via destructuring. The key constraint is immutability: parent-owned props should not be mutated by children. Instead of two-way binding (which creates hidden data flow), children communicate upward through callback props -- functions passed as props that the child invokes with new values. This makes data flow explicit and unidirectional, which is critical for debugging and testing.

Snippets replace Svelte 4's slot mechanism entirely. Where slots were template placeholders with limited type safety, snippets are first-class values -- they can be typed with `Snippet<[ParamTypes]>`, passed as props, conditionally rendered, and composed. The `children` snippet is the implicit default (equivalent to the old default slot), and named snippets replace named slots with full type inference.

Context provides dependency injection for cross-cutting concerns (themes, auth, i18n) without prop drilling. The key rule is type safety: use a typed wrapper around `setContext`/`getContext` with a unique symbol key to prevent key collisions and ensure consumers get the correct type.

At the SvelteKit level, architecture decisions center on route organization (route groups for layout segmentation), data sharing (layout load functions for shared data), server hooks (centralized middleware for auth, logging, CORS), and environment variable safety (using `$env/static/private` vs `$env/static/public` to prevent secret leakage).

## Consumer Guide

### When Reviewing Code

Verify that components use `$props()` with an explicit TypeScript interface, not `export let`. Check that no component directly mutates a prop value -- mutations should flow through callback props. Look for `<slot>` or `<slot name="...">` syntax, which should be migrated to `{#snippet}` and `{@render}` in Svelte 5. For context usage, verify that `setContext`/`getContext` calls use typed wrapper functions with symbol keys, not raw string keys. In SvelteKit routes, check that data shared across sibling routes is loaded in `+layout.server.ts` rather than duplicated in each `+page.server.ts`. Verify that `hooks.server.ts` handles cross-cutting concerns (auth checks, request logging) rather than repeating them in individual load functions. Check that `$env/static/private` is never imported in client-side code.

### When Designing / Planning

Map out the component tree and identify communication patterns: which data flows down (props), which templates are delegated (snippets), which concerns are shared across deep subtrees (context). Plan route groups early -- they determine layout nesting and are expensive to restructure later. Identify shared data (user session, app config) that should live in layout load functions. Plan server hooks for middleware concerns (auth guards, rate limiting) rather than implementing them per-route.

### When Implementing

Define props with an interface and `$props()`, providing defaults via destructuring. For child-to-parent communication, accept callback functions as props (`onchange`, `onselect`) rather than using `bind:`. Replace any slot usage with snippets: define with `{#snippet name(params)}`, accept with `Snippet<[Types]>` in the props interface, render with `{@render name(args)}`. For context, create a typed module with `setMyContext` and `getMyContext` functions wrapping the raw API. In SvelteKit, use `(groupName)` directories to segment layouts, place shared data fetching in `+layout.server.ts`, and centralize auth/logging in `hooks.server.ts`. Always use `$env/static/private` for secrets and `$env/static/public` for client-safe values.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [SnippetsOverSlots](../../Rules/Svelte/SnippetsOverSlots.md) | HIGH | Use {#snippet} and {@render} instead of slots for type-safe template delegation |
| [TypedProps](../../Rules/Svelte/TypedProps.md) | HIGH | Type props with $props() and a TypeScript interface |
| [TypeSafeContext](../../Rules/Svelte/TypeSafeContext.md) | HIGH | Wrap setContext/getContext in typed functions with symbol keys |
| [NoMutateProps](../../Rules/Svelte/NoMutateProps.md) | HIGH | Never mutate props directly -- use callback props for upward communication |
| [CallbacksOverBind](../../Rules/Svelte/CallbacksOverBind.md) | HIGH | Prefer callback props over bind: for explicit data flow |
| [RouteGroups](../../Rules/Svelte/RouteGroups.md) | MEDIUM | Use (groupName) directories to segment layouts without affecting URLs |
| [LayoutDataForShared](../../Rules/Svelte/LayoutDataForShared.md) | MEDIUM | Load shared data in +layout.server.ts, not duplicated per page |
| [ServerHooks](../../Rules/Svelte/ServerHooks.md) | MEDIUM | Centralize auth, logging, and middleware in hooks.server.ts |
| [EnvVarSafety](../../Rules/Svelte/EnvVarSafety.md) | HIGH | Use $env/static/private for secrets; never import in client code |

## Rule Interactions

- **TypedProps + SnippetsOverSlots**: Snippets are declared as part of the props interface using the `Snippet` type. These two rules work together to define a fully typed component API surface.
- **NoMutateProps + CallbacksOverBind**: Both enforce unidirectional data flow. NoMutateProps prohibits the mutation; CallbacksOverBind provides the alternative pattern.
- **TypeSafeContext + TypedProps**: Context is the escape hatch when prop drilling becomes excessive. Type safety must be maintained in both paths.
- **LayoutDataForShared + ServerHooks**: Both address concerns that span multiple routes. Layout data handles shared fetching; hooks handle shared middleware. Together they prevent per-route duplication.
- **EnvVarSafety + ServerHooks**: Server hooks run exclusively on the server and are a natural place to use private env vars for auth token validation or API key checks.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Secret leakage via public env**: Importing `$env/static/private` in a file that runs on the client, or using `$env/dynamic/private` in universal load functions. Secrets will be bundled into the client JavaScript.
- **Mutating parent state via prop reference**: Directly modifying an object or array prop passed from a parent, creating invisible upward data flow that breaks unidirectional patterns and causes debugging nightmares.

### HIGH

- **Slot usage in Svelte 5**: Using `<slot>` or `<slot name="...">` instead of snippets. Slots lack type safety, cannot be conditionally passed, and are deprecated in the Svelte 5 component model.
- **Untyped context**: Using raw string keys with `setContext`/`getContext` without type wrappers. Consumers get `unknown` and must cast, losing type safety and risking runtime errors from key typos.
- **bind: for child-to-parent communication**: Using `bind:value` or `bind:this` when a callback prop would make data flow explicit. Bind creates hidden two-way coupling that is hard to trace in larger component trees.

### MEDIUM

- **Duplicated load data across routes**: Multiple `+page.server.ts` files fetching the same user/session data instead of sharing it via `+layout.server.ts`. Increases latency and creates inconsistency risk.
- **Missing route groups**: Multiple pages needing different layouts stuffed under the same route directory, forcing conditional layout logic instead of clean group separation.
- **Per-route auth checks**: Checking authentication in individual load functions instead of centralizing in `hooks.server.ts`. Creates security gaps when new routes forget the check.

## Examples

**Typed snippets replacing slots:**

```svelte
<!-- DataTable.svelte -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    header: Snippet;
    row: Snippet<[T]>;
    empty?: Snippet;
  }

  const { items, header, row, empty } = $props<Props>();
</script>

<table>
  <thead>{@render header()}</thead>
  <tbody>
    {#each items as item}
      {@render row(item)}
    {:else}
      {#if empty}{@render empty()}{/if}
    {/each}
  </tbody>
</table>
```

**Type-safe context pattern:**

```typescript
// context.ts
import { setContext, getContext } from 'svelte';

interface ThemeContext {
  mode: 'light' | 'dark';
  primary: string;
}

const THEME_KEY = Symbol('theme');

export function setThemeContext(theme: ThemeContext) {
  setContext(THEME_KEY, theme);
}

export function getThemeContext(): ThemeContext {
  return getContext<ThemeContext>(THEME_KEY);
}
```

**Callback props for upward communication:**

```svelte
<!-- Parent -->
<ColorPicker color={selectedColor} onchange={(c) => selectedColor = c} />

<!-- ColorPicker.svelte -->
<script lang="ts">
  interface Props {
    color: string;
    onchange: (color: string) => void;
  }
  const { color, onchange } = $props<Props>();
</script>

<input type="color" value={color} oninput={(e) => onchange(e.currentTarget.value)} />
```

## Does Not Cover

- **Reactive state management** ($state, $derived, $effect, shared state) -- see Reactivity dimension (SV1).
- **TypeScript generics** for reusable components -- see TypeSystem dimension (SV3).
- **Data loading patterns** (server load, parallel fetching, form actions) -- see DataForms dimension (SV4).
- **Performance optimization** (dynamic imports, event delegation) -- see PerformanceSSR dimension (SV5).
- **Error handling** ($error pages, error boundaries) -- see PerformanceSSR dimension (SV5).

## Sources

- Svelte 5 documentation: Components, Snippets, Context API
- SvelteKit documentation: Routing, Hooks, Modules
- Svelte 5 migration guide: Slots to Snippets, export let to $props
- Frontend Masters: Svelte 5 component patterns
