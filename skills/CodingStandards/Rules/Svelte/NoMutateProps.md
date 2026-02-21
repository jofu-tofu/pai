### 2.4 Never Mutate Prop Objects Directly

**Impact: HIGH (prevents unexpected parent state mutations)**

Props flow down, events flow up. Mutating a prop object directly changes the parent's data without the parent knowing, breaking unidirectional data flow.

**Incorrect: mutating prop object directly**

```svelte
<script lang="ts">
  interface Props { user: { name: string; age: number }; }
  let { user } = $props<Props>();

  function incrementAge() {
    user.age++; // Mutates parent's data!
  }
</script>
```

**Correct: emit callback to parent**

```svelte
<script lang="ts">
  interface Props {
    user: { name: string; age: number };
    onchange?: (user: { name: string; age: number }) => void;
  }
  let { user, onchange } = $props<Props>();

  function incrementAge() {
    onchange?.({ ...user, age: user.age + 1 });
  }
</script>
```
