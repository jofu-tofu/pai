### 5.3 Use Form Actions Over fetch for Mutations

**Impact: HIGH (enables progressive enhancement — works without JavaScript)**

Use SvelteKit form actions with `use:enhance` for data mutations. This pattern works without JavaScript enabled and provides automatic form state management.

**Incorrect: fetch-based mutation — breaks without JS**

```svelte
<script lang="ts">
  async function addTodo() {
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text: newTodo }),
    });
  }
</script>

<button onclick={addTodo}>Add</button>
```

**Correct: form action with progressive enhancement**

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<form method="POST" action="?/addTodo" use:enhance>
  <input name="text" required />
  <button type="submit">Add</button>
</form>
```

```typescript
// +page.server.ts
import type { Actions } from './$types';

export const actions = {
  addTodo: async ({ request }) => {
    const data = await request.formData();
    const text = data.get('text') as string;
    await db.todo.create({ data: { text } });
  },
} satisfies Actions;
```
