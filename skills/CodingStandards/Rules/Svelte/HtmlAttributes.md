### 3.2 Extend HTMLAttributes for Wrapper Components

**Impact: HIGH (inherits all native element attributes automatically)**

When building wrapper components around HTML elements, extend the appropriate `HTML*Attributes` type from `svelte/elements` to accept all native attributes.

**Incorrect: manually listing native attributes**

```svelte
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    type?: string;
    // Missing dozens of valid button attributes...
  }
  const { variant = 'primary', ...rest } = $props<Props>();
</script>

<button class={variant} {...rest}>
  <slot />
</button>
```

**Correct: extend HTMLButtonAttributes**

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary';
    children: Snippet;
  }
  const { variant = 'primary', children, ...attrs } = $props<Props>();
</script>

<button class={variant} {...attrs}>
  {@render children()}
</button>
```
