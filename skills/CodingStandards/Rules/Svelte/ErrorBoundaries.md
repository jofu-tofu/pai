### 8.3 Use svelte:boundary for Error Recovery

**Impact: MEDIUM (prevents child errors from crashing entire page)**

Wrap error-prone components with `<svelte:boundary>` to catch errors locally and show a fallback UI instead of crashing the entire page.

**Incorrect: unhandled error crashes page**

```svelte
<!-- If UserProfile throws, the entire page crashes -->
<main>
  <UserProfile userId={id} />
  <RecentActivity />
</main>
```

**Correct: boundary catches error with fallback**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  function handleError(error: Error) {
    console.error('Component error:', error);
  }
</script>

<main>
  <svelte:boundary onerror={handleError}>
    <UserProfile userId={id} />
    {#snippet failed(error)}
      <div class="error-card">
        <p>Failed to load profile</p>
        <button onclick={() => location.reload()}>Retry</button>
      </div>
    {/snippet}
  </svelte:boundary>
  <RecentActivity />
</main>
```
