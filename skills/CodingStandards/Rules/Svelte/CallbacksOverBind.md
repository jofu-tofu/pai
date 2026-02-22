### SV2.5 Prefer Callbacks Over Excessive $bindable

**Impact: MEDIUM (makes data flow explicit and traceable)**

Two-way binding with `$bindable` is convenient but obscures data flow. Prefer explicit callbacks for complex components — save `bind:` for simple form inputs.

**Incorrect: $bindable hides data flow**

```svelte
<!-- Counter.svelte -->
<script lang="ts">
  interface Props { count: number; }
  let { count = $bindable(0) } = $props<Props>();
</script>

<button onclick={() => count++}>{count}</button>

<!-- Parent: implicit two-way sync -->
<Counter bind:count />
```

**Correct: explicit callback — data flow is visible**

```svelte
<!-- Counter.svelte -->
<script lang="ts">
  interface Props { count: number; onchange?: (n: number) => void; }
  let { count, onchange } = $props<Props>();
</script>

<button onclick={() => onchange?.(count + 1)}>{count}</button>

<!-- Parent: explicit one-way + callback -->
<Counter {count} onchange={(v) => count = v} />
```
