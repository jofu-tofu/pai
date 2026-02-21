### 1.6 Don't Wrap Constants in $state

**Impact: MEDIUM (reduces unnecessary reactive overhead)**

Immutable values that never change don't need reactive tracking. Wrapping them in `$state` adds overhead for zero benefit.

**Incorrect: constant wrapped in $state**

```svelte
<script lang="ts">
  let API_BASE = $state('https://api.example.com');
  let MAX_RETRIES = $state(3);
</script>
```

**Correct: plain const for immutable values**

```svelte
<script lang="ts">
  const API_BASE = 'https://api.example.com';
  const MAX_RETRIES = 3;
</script>
```
