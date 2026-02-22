### SV2.8 Use hooks.server.ts for Cross-Cutting Concerns

**Impact: HIGH (centralizes auth, logging, and request processing)**

Use `hooks.server.ts` for cross-cutting concerns like authentication guards, request logging, and locale detection instead of duplicating logic in every load function.

**Incorrect: auth check duplicated in every load function**

```typescript
// routes/dashboard/+page.server.ts
export async function load({ cookies }) {
  const session = cookies.get('session');
  if (!session) throw redirect(303, '/login');
  const user = await validateSession(session);
  // ... page-specific logic
}

// routes/settings/+page.server.ts
export async function load({ cookies }) {
  const session = cookies.get('session'); // Duplicated!
  if (!session) throw redirect(303, '/login');
  const user = await validateSession(session);
  // ... page-specific logic
}
```

**Correct: centralized in hooks.server.ts**

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');

  if (session) {
    event.locals.user = await validateSession(session);
  }

  if (event.url.pathname.startsWith('/app') && !event.locals.user) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};
```
