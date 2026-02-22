### SV4.2 Fetch Data in Parallel with Promise.all

**Impact: HIGH (reduces page load latency by eliminating waterfalls)**

Use `Promise.all` in load functions to fetch independent data sources in parallel instead of sequentially.

**Incorrect: sequential fetches — doubles latency**

```typescript
// +page.server.ts
export async function load({ fetch }) {
  const user = await fetch('/api/user').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());
  const comments = await fetch('/api/comments').then(r => r.json());
  return { user, posts, comments };
}
```

**Correct: parallel fetches — latency = slowest single request**

```typescript
// +page.server.ts
export async function load({ fetch }) {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json()),
  ]);
  return { user, posts, comments };
}
```
