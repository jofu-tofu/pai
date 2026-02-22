### SV5.5 Avoid Non-Deterministic Values During SSR

**Impact: HIGH (prevents hydration mismatch between server and client)**

Non-deterministic values (`Date.now()`, `Math.random()`, browser APIs) produce different results on server vs client, causing hydration mismatches. Initialize them only after mount.

**Incorrect: Date.now() during SSR — different on server and client**

```svelte
<script lang="ts">
  // Runs on server AND client — produces different values
  let timestamp = $state(Date.now());
  let randomId = $state(Math.random().toString(36));
</script>

<span>{timestamp}</span>
```

**Correct: set non-deterministic values after mount**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let timestamp = $state(0);
  let randomId = $state('');

  onMount(() => {
    timestamp = Date.now();
    randomId = Math.random().toString(36);
  });
</script>

{#if timestamp}
  <span>{timestamp}</span>
{/if}
```
