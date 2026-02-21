### 1.1 Use $derived Over $effect for Computations

**Impact: CRITICAL (prevents unnecessary subscriptions and potential infinite loops)**

Use `$derived` for pure computations instead of `$effect`. This is the most common Svelte 5 anti-pattern — using `$effect` to synchronize derived state creates extra subscriptions and risks infinite update loops.

**Incorrect: using $effect to sync derived state**

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $state(0);

  // Anti-pattern: $effect for pure computation
  $effect(() => {
    doubled = count * 2;
  });
</script>

<p>{doubled}</p>
```

**Correct: $derived for pure computations**

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<p>{doubled}</p>
```
