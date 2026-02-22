### SV2.1 Use Snippets Instead of Slots

**Impact: HIGH (more readable, type-safe, and composable than slots)**

Svelte 5 replaces slots with snippets (`{#snippet}` + `{@render}`). Snippets are first-class values, fully typed, and can be passed as props.

**Incorrect: Svelte 4 slot pattern — no type safety**

```svelte
<!-- Parent -->
<Card>
  <span slot="header">Title</span>
  <p>Body content</p>
</Card>

<!-- Card.svelte -->
<div class="card">
  <slot name="header" />
  <slot />
</div>
```

**Correct: Svelte 5 snippets — typed and composable**

```svelte
<!-- Parent -->
<Card>
  {#snippet header()}
    <span>Title</span>
  {/snippet}
  <p>Body content</p>
</Card>

<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props { header?: Snippet; children: Snippet; }
  const { header, children } = $props();
</script>

<div class="card">
  {#if header}{@render header()}{/if}
  {@render children()}
</div>
```
