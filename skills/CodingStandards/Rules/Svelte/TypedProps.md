### 2.2 Type Props with $props() and Interface

**Impact: HIGH (replaces export let with type-safe prop destructuring)**

Use `$props()` with a TypeScript interface to declare component props. This replaces Svelte 4's `export let` pattern with full type safety and default values.

**Incorrect: Svelte 4 export let pattern**

```svelte
<script lang="ts">
  export let title: string;
  export let count: number = 0;
  export let variant: 'primary' | 'secondary' = 'primary';
</script>
```

**Correct: Svelte 5 $props() with interface**

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
    variant?: 'primary' | 'secondary';
  }

  const { title, count = 0, variant = 'primary' } = $props<Props>();
</script>
```
