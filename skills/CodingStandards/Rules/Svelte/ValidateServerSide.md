### 5.4 Validate Form Data Server-Side with fail()

**Impact: HIGH (prevents invalid data and provides structured error responses)**

Always validate form data in server actions and return structured errors via `fail()`. This ensures validation works even without client-side JavaScript.

**Incorrect: no validation or unstructured errors**

```typescript
// +page.server.ts
export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const text = data.get('text') as string;
    await db.todo.create({ data: { text } }); // No validation!
  },
};
```

**Correct: server-side validation with structured errors**

```typescript
// +page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const text = data.get('text')?.toString().trim();

    if (!text) {
      return fail(400, { error: 'Text is required', field: 'text' });
    }
    if (text.length > 200) {
      return fail(400, { error: 'Text must be under 200 characters', field: 'text' });
    }

    await db.todo.create({ data: { text } });
    return { success: true };
  },
} satisfies Actions;
```
