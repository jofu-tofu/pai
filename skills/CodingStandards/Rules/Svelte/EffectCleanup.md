### SV1.2 Return Cleanup Functions from $effect

**Impact: CRITICAL (prevents memory leaks from subscriptions, timers, event listeners)**

Always return a cleanup function from `$effect` when the effect creates subscriptions, timers, or event listeners. Without cleanup, these leak on component destroy or when dependencies change.

**Incorrect: no cleanup — timer leaks on component destroy**

```svelte
<script lang="ts">
  let elapsed = $state(0);

  $effect(() => {
    const timer = setInterval(() => {
      elapsed += 1;
    }, 1000);
    // Missing cleanup!
  });
</script>
```

**Correct: cleanup function prevents leak**

```svelte
<script lang="ts">
  let elapsed = $state(0);

  $effect(() => {
    const timer = setInterval(() => {
      elapsed += 1;
    }, 1000);
    return () => clearInterval(timer);
  });
</script>
```
