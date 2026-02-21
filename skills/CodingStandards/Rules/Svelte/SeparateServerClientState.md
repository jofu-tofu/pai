### 5.6 Separate Server Data from Client State

**Impact: CRITICAL (prevents hydration mismatches and state desync)**

Keep server data (from load functions) as read-only derived values and client state (filters, UI toggles) as separate `$state` variables. Never copy server data into `$state`.

**Incorrect: copying server data to $state — hydration mismatch**

```svelte
<script lang="ts">
  import { page } from '$app/stores';

  // Copies server data to client state — desyncs on navigation
  let items = $state($page.data.items);
  let filter = $state('all');
</script>
```

**Correct: $derived for server data, $state for client-only**

```svelte
<script lang="ts">
  import { page } from '$app/stores';

  // Server data stays reactive and read-only
  let serverItems = $derived($page.data.items);
  // Client-only UI state
  let filter = $state('all');
  // Combine in a derived value
  let visibleItems = $derived.by(() => {
    if (filter === 'all') return serverItems;
    return serverItems.filter(i => i.status === filter);
  });
</script>
```
