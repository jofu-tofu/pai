### 8.1 Use error() for Expected Errors

**Impact: HIGH (provides proper HTTP status codes and error page rendering)**

Use SvelteKit's `error()` helper for expected errors (404, 403, etc.) — it sets the correct HTTP status and renders the nearest `+error.svelte`. Throw regular errors only for unexpected failures.

**Incorrect: generic throw — no status code control**

```typescript
// +page.server.ts
export async function load({ params }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  if (!post) {
    throw new Error('Not found'); // 500 status, generic error page
  }
  return { post };
}
```

**Correct: error() with status code**

```typescript
// +page.server.ts
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  if (!post) {
    throw error(404, 'Post not found'); // 404 status, +error.svelte
  }
  return { post };
}
```
