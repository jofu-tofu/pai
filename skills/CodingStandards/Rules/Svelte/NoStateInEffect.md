### 1.5 Don't Set $state in $effect When $derived Works

**Impact: HIGH (eliminates unnecessary reactive overhead)**

Effects are for side effects (DOM manipulation, API calls, logging) — not for synchronizing state. If an `$effect` sets a `$state` variable based on other state, it should almost always be `$derived` instead.

**Incorrect: $effect setting $state — should be $derived**

```svelte
<script lang="ts">
  let items = $state<string[]>([]);
  let count = $state(0);

  $effect(() => {
    count = items.length; // Synchronizing state — use $derived
  });
</script>
```

**Correct: $derived for computed values**

```svelte
<script lang="ts">
  let items = $state<string[]>([]);
  let count = $derived(items.length);
</script>
```
