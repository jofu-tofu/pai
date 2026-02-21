### 5.5 Return Only Above-the-Fold Data from Load

**Impact: HIGH (reduces serialization cost and improves time-to-interactive)**

Load functions should return only the data needed for initial render. Paginate large datasets and defer below-the-fold content.

**Incorrect: loading all data upfront**

```typescript
// +page.server.ts
export async function load() {
  const allPosts = await db.post.findMany(); // Could be 10,000 rows
  return { posts: allPosts };
}
```

**Correct: paginated initial load**

```typescript
// +page.server.ts
export async function load({ url }) {
  const page = Number(url.searchParams.get('page') ?? '1');
  const posts = await db.post.findMany({
    take: 20,
    skip: (page - 1) * 20,
    orderBy: { createdAt: 'desc' },
  });
  const total = await db.post.count();
  return { posts, total, page };
}
```
