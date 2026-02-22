### SV2.3 Use Symbol Keys and Typed Helpers for Context

**Impact: HIGH (prevents key collisions and provides type safety)**

Use `Symbol` keys with typed wrapper functions for `setContext` / `getContext` instead of raw string keys. This prevents collisions and gives consumers full type inference.

**Incorrect: string key — no type safety, collision risk**

```svelte
<script lang="ts">
  import { setContext } from 'svelte';

  setContext('modal', { open: false, toggle: () => {} });
</script>

<!-- Consumer has no type info -->
<script lang="ts">
  import { getContext } from 'svelte';

  const modal = getContext('modal'); // any
</script>
```

**Correct: Symbol key with typed helpers**

```svelte
<!-- context.ts -->
<script context="module" lang="ts">
  import { setContext, getContext } from 'svelte';

  interface ModalContext { open: boolean; toggle: () => void; }

  const KEY = Symbol('modal');

  export function setModalContext(ctx: ModalContext) {
    setContext(KEY, ctx);
  }

  export function getModalContext(): ModalContext {
    return getContext<ModalContext>(KEY);
  }
</script>
```
