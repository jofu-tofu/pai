### SV3.3 Destructure $props() with Named Interface

**Impact: MEDIUM (provides clear prop contracts and reusable types)**

Always define a named `Props` interface and use it with `$props<Props>()`. This creates a clear contract and makes the type reusable for parent components.

**Incorrect: inline or ad-hoc prop typing**

```svelte
<script lang="ts">
  const { title, count = 0 } = $props<{ title: string; count?: number }>();
</script>
```

**Correct: named Props interface**

```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
  }

  const { title, count = 0 } = $props<Props>();
</script>
```
