### 1.3 Use $derived.by for Multi-Line Derivations

**Impact: HIGH (improves readability of complex derived computations)**

Use `$derived.by(() => {...})` when derived values need intermediate variables or complex logic that doesn't fit in a single expression.

**Incorrect: long unreadable $derived expression**

```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let search = $state('');

  // Hard to read — filter + sort + slice in one expression
  let results = $derived(items.filter(i => i.name.includes(search)).sort((a, b) => a.date - b.date).slice(0, 10));
</script>
```

**Correct: $derived.by with intermediate variables**

```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  let search = $state('');

  let results = $derived.by(() => {
    const filtered = items.filter(i => i.name.includes(search));
    const sorted = filtered.sort((a, b) => a.date - b.date);
    return sorted.slice(0, 10);
  });
</script>
```
