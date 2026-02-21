### 1.4 Use untrack() to Exclude Dependencies

**Impact: HIGH (prevents infinite loops from accidental dependency tracking)**

Use `untrack()` when you intentionally want to read a reactive variable inside `$effect` without subscribing to it. This prevents infinite loops where an effect modifies a value it also reads.

**Incorrect: infinite loop — effect tracks what it modifies**

```svelte
<script lang="ts">
  import { untrack } from 'svelte';

  let count = $state(0);
  let renderCount = $state(0);

  $effect(() => {
    console.log(count);
    renderCount++; // Tracked! Triggers re-run → infinite loop
  });
</script>
```

**Correct: untrack prevents subscription**

```svelte
<script lang="ts">
  import { untrack } from 'svelte';

  let count = $state(0);
  let renderCount = $state(0);

  $effect(() => {
    console.log(count);
    untrack(() => { renderCount++; }); // Not tracked
  });
</script>
```
