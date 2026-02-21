### 3.1 Use Generics for Type-Safe Reusable Components

**Impact: HIGH (enables full type inference for consumers)**

Use `generics` attribute on the script tag to create components that accept typed snippet parameters, preserving type safety across generic list/grid/table components.

**Incorrect: any[] loses type information**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    items: any[];
    row: Snippet<[any]>;
  }
  const { items, row } = $props<Props>();
</script>

{#each items as item}
  {@render row(item)}
{/each}
```

**Correct: generics preserve type inference**

```svelte
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  interface Props {
    items: T[];
    row: Snippet<[T]>;
  }
  const { items, row } = $props<Props>();
</script>

{#each items as item}
  {@render row(item)}
{/each}
```
