# Svelte Dimensions

Structured knowledge lenses for Svelte 5 and SvelteKit. Each dimension groups related rules with deep context for a specific concern.

## Dimensions

| ID | Dimension | File | Load When |
|----|-----------|------|-----------|
| SV1 | Reactivity | Reactivity.md | Runes, $state, $derived, $effect, state management, stores migration |
| SV2 | Architecture | Architecture.md | Component design, props, context, slots, SvelteKit routing, hooks |
| SV3 | Type System | TypeSystem.md | TypeScript integration, generic snippets, HTML attributes, typed props |
| SV4 | Data & Forms | DataForms.md | SvelteKit data loading, form actions, server/client state separation |
| SV5 | Performance & SSR | PerformanceSSR.md | Dynamic imports, event handling, error boundaries, SSR safety |

## Default

Load **Reactivity (SV1)** for any Svelte task. Add task-specific dimensions on top.
