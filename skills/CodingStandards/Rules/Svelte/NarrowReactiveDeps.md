### 1.7 Narrow Reactive Dependencies with $derived

**Impact: HIGH (minimizes unnecessary re-renders)**

Extract specific derived values to narrow what triggers re-renders. Reading an entire object when you only need one property causes updates on every property change.

**Incorrect: component re-renders on any user property change**

```svelte
<script lang="ts">
  let user = $state({ name: 'Alice', email: 'a@b.com', age: 30 });

  // Reads entire user object — re-renders when name OR age change
  $effect(() => {
    sendAnalytics(user.email);
  });
</script>
```

**Correct: narrow to specific property**

```svelte
<script lang="ts">
  let user = $state({ name: 'Alice', email: 'a@b.com', age: 30 });
  let userEmail = $derived(user.email);

  // Only re-runs when email changes
  $effect(() => {
    sendAnalytics(userEmail);
  });
</script>
```
