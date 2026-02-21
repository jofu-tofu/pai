### 5.1 Use +page.server.ts for Secrets and Databases

**Impact: HIGH (prevents secrets from leaking to client bundle)**

Use `+page.server.ts` (not `+page.ts`) for load functions that access secrets, databases, or private APIs. Server-only load functions never reach the browser.

**Incorrect: database query in universal load — leaks to client**

```typescript
// +page.ts — this code ships to the browser!
import { db } from '$lib/database';

export async function load() {
  const users = await db.query('SELECT * FROM users');
  return { users };
}
```

**Correct: server-only load function**

```typescript
// +page.server.ts — never reaches the browser
import { db } from '$lib/database';

export async function load() {
  const users = await db.query('SELECT * FROM users');
  return { users };
}
```
