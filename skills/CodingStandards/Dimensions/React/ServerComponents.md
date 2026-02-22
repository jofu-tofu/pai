# Server Components — React

> React Server Components shift computation to the server, but only deliver their promise when authentication, caching, and serialization boundaries are handled with deliberate care.

## Mental Model

React Server Components (RSC) represent a fundamental architectural shift: components that execute exclusively on the server, sending only their rendered output to the client. This eliminates client-side JavaScript for those components entirely — no hydration, no bundle cost, direct database access. But this power comes with a sharp boundary: the server/client divide is a serialization wall. Every prop passed from a Server Component to a Client Component must be serializable to JSON and embedded in the HTML response.

The 5 primary rules in this dimension address the three failure modes of RSC adoption. The first failure mode is security: Server Actions (functions with `"use server"`) are exposed as public HTTP endpoints, yet developers often treat them like private functions. `ServerAuthActions` exists because a single unauthenticated Server Action can expose the entire database. The second failure mode is performance: without request-scoped caching (`ServerCacheReact`) or cross-request caching (`ServerCacheLru`), server components re-execute expensive queries on every render, negating the performance benefits of server-side execution. The third failure mode is data bloat: `ServerSerialization` and `ServerDedupProps` prevent the common mistake of passing entire database objects across the boundary when only a few fields are needed, inflating page weight and breaking the streaming model.

The two cross-referenced rules from DataFetching (`ServerParallelFetching`, `ServerAfterNonblocking`) extend the server-side story by ensuring that multiple server components fetch data concurrently and that non-critical work (analytics, logging) does not block the response stream.

When these rules work together, RSC delivers on its architectural promise: zero-bundle server logic, minimal serialization overhead, secure mutations, and efficient caching.

## Consumer Guide

### When Reviewing Code

Scan for these violations in priority order:

1. **Unauthenticated Server Actions** (CRITICAL) — Any function with `"use server"` that does not call `verifySession()` or equivalent auth check inside the function body. Middleware-only auth is insufficient because Server Actions are directly callable endpoints.
2. **Over-serialization at RSC boundaries** (HIGH) — A Server Component passing a full database entity (e.g., `user` with 50 fields) to a Client Component that uses 3 fields. Look for `<ClientComponent user={user} />` patterns.
3. **Missing React.cache() on repeated server queries** (HIGH) — The same database query or auth check called from multiple server components in one request without `React.cache()` wrapping. Each call hits the database independently.
4. **Duplicate props across sibling Client Components** (MEDIUM) — Two Client Components receiving the same large object. The data is serialized twice in the RSC payload.
5. **Non-serializable props at the boundary** (MEDIUM) — Attempting to pass functions, Dates, Maps, Sets, or class instances from Server to Client Components. These fail silently or cause hydration mismatches.

### When Designing / Planning

Before adding Server Components to a feature:

- **Draw the server/client boundary explicitly.** List which components are Server Components and which are Client Components. Every prop crossing the boundary will be serialized — design the interface to be minimal.
- **Identify all mutations.** Each Server Action needs its own auth + authz + validation chain. Plan these before implementation, not after.
- **Map data access patterns.** If multiple components need the same data, wrap the fetcher in `React.cache()` for request-scoped dedup, or use an LRU cache for data that is stable across requests (configuration, feature flags).
- **Decide what stays on the server.** Sensitive logic (pricing calculations, authorization checks, API keys) should never reach Client Components. RSC makes this natural — but only if the boundary is correctly placed.

### When Implementing

Apply rules in this sequence:

1. **Secure all Server Actions first** — Before any other work, add authentication and authorization checks to every `"use server"` function (ServerAuthActions). Add input validation with Zod or similar. This is a security requirement, not an optimization.
2. **Wrap shared queries in React.cache()** — Any async function called from multiple server components should be wrapped in `React.cache()` (ServerCacheReact). Pay attention to argument types — only primitive args or same-reference objects produce cache hits.
3. **Add LRU caching for stable data** — Configuration, feature flags, and other cross-request stable data should use an LRU cache (ServerCacheLru) rather than re-fetching on every request.
4. **Minimize serialization** — At every Server-to-Client boundary, pass only the fields the Client Component actually uses (ServerSerialization). Destructure on the server side.
5. **Deduplicate shared props** — When sibling Client Components need the same data, extract it into a shared Server Component parent or use context (ServerDedupProps).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [ServerAuthActions](../../Rules/React/ServerAuthActions.md) | CRITICAL | Authenticate and authorize inside every Server Action — they are public endpoints |
| [ServerCacheReact](../../Rules/React/ServerCacheReact.md) | MEDIUM | Wrap server queries in React.cache() for per-request deduplication |
| [ServerCacheLru](../../Rules/React/ServerCacheLru.md) | MEDIUM | Use LRU cache for cross-request stable data (config, feature flags) |
| [ServerDedupProps](../../Rules/React/ServerDedupProps.md) | MEDIUM | Avoid serializing the same data to multiple Client Components |
| [ServerSerialization](../../Rules/React/ServerSerialization.md) | HIGH | Pass only needed fields across the RSC boundary to minimize payload |

### Cross-Referenced Rules (from other dimensions)

| Rule | Primary Dimension | Why Relevant Here |
|------|-------------------|-------------------|
| [ServerParallelFetching](../../Rules/React/ServerParallelFetching.md) | DataFetching | Parallel data fetching across server components prevents RSC waterfalls |
| [ServerAfterNonblocking](../../Rules/React/ServerAfterNonblocking.md) | DataFetching | next/after defers non-critical server work to avoid blocking the response stream |

## Rule Interactions

- **ServerAuthActions + ServerCacheReact** interact directly. Auth checks (`getCurrentUser()`) are the most commonly deduplicated server-side call. Wrapping the auth check in `React.cache()` means that 5 Server Components calling `getCurrentUser()` only hit the auth system once per request. But the cache must be applied to the right function — caching the Server Action itself would cache across users, which is a security vulnerability.
- **ServerSerialization + ServerDedupProps** are complementary strategies for payload reduction. Serialization minimizes per-component data; dedup eliminates redundancy across components. Apply Serialization first (reduce what is sent), then DedupProps (eliminate duplicates of what remains).
- **ServerCacheReact + ServerCacheLru** address different cache scopes. React.cache() is request-scoped — it deduplicates within a single server render. LRU cache is process-scoped — it caches across requests. Use React.cache() for user-specific data (auth, user preferences); use LRU for shared data (site config, feature flags). Nesting them (LRU inside React.cache()) provides both layers.
- **ServerParallelFetching (cross-ref) + ServerCacheReact** work together: parallel fetching ensures multiple server components start their queries simultaneously, while React.cache() ensures that overlapping queries (e.g., two components both needing the current user) do not result in duplicate database calls.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Unauthenticated Server Action**: A `"use server"` function that deletes, updates, or reads sensitive data without checking the session. This is a security vulnerability — Server Actions are HTTP POST endpoints that anyone can call with the right payload. Every mutation must verify identity and permissions.
- **Cached auth across users**: Wrapping a Server Action in a process-level cache (LRU) that returns the same user's data for all requests. `React.cache()` (request-scoped) is correct for auth; LRU cache is not.

### HIGH
- **Full entity serialization**: `<ClientProfile user={user} />` where `user` contains 50 database fields, timestamps, relations, and internal IDs, but the Client Component only renders `name` and `avatar`. Every extra field increases page weight and is visible in the HTML source.
- **Missing React.cache() on auth**: Five Server Components each independently calling `await auth()`, resulting in 5 authentication round-trips per request instead of 1.

### MEDIUM
- **Duplicate prop serialization**: Two sibling Client Components both receiving `comments: Comment[]` (100 items), serialized twice in the RSC payload. Solution: lift the shared data to a parent Server Component and pass it through a single Client Component wrapper or context.
- **Passing Dates across RSC boundary**: `<ClientComponent createdAt={new Date()} />` — Date objects are not serializable. The component silently receives a string or null. Pass ISO strings explicitly.

## Examples

### Example 1: Secure Server Action with Cached Auth (AuthActions + CacheReact)

```tsx
// BEFORE: No auth + redundant auth calls across components
'use server'
export async function deletePost(postId: string) {
  await db.post.delete({ where: { id: postId } })  // Anyone can delete any post!
}

// Elsewhere, 3 server components each call:
const user = await auth()  // 3 separate auth round-trips

// AFTER: Auth inside action + cached auth helper
import { cache } from 'react'
import { verifySession } from '@/lib/auth'

// Cached: called by multiple server components, runs once per request
export const getCurrentUser = cache(async () => {
  const session = await verifySession()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
})

'use server'
export async function deletePost(postId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const post = await db.post.findUnique({ where: { id: postId } })
  if (post?.authorId !== user.id && user.role !== 'admin') {
    throw new Error('Forbidden')
  }

  await db.post.delete({ where: { id: postId } })
}
```

### Example 2: Minimal Serialization + Dedup (Serialization + DedupProps)

```tsx
// BEFORE: Full user object serialized twice
async function ProfilePage() {
  const user = await getUser()  // 50 fields
  return (
    <>
      <ClientHeader user={user} />    {/* uses name, avatar */}
      <ClientSidebar user={user} />   {/* uses name, role */}
    </>
  )
}

// AFTER: Minimal fields, single serialization via shared wrapper
async function ProfilePage() {
  const user = await getUser()
  const profileData = {
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  }
  return <ProfileLayout profile={profileData} />
}

'use client'
function ProfileLayout({ profile }: { profile: ProfileData }) {
  return (
    <>
      <Header name={profile.name} avatar={profile.avatar} />
      <Sidebar name={profile.name} role={profile.role} />
    </>
  )
}
```

Serialized data drops from ~4KB (2 x 50 fields) to ~200 bytes (3 fields, once).

### Example 3: Layered Caching (CacheReact + CacheLru + ParallelFetching)

```tsx
// Request-scoped cache for user-specific data
const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user ?? null
})

// Process-scoped LRU for shared stable data
const featureFlagCache = new LRUCache<string, FeatureFlags>({ max: 100, ttl: 60_000 })

async function getFeatureFlags(): Promise<FeatureFlags> {
  const cached = featureFlagCache.get('flags')
  if (cached) return cached
  const flags = await fetchFlags()
  featureFlagCache.set('flags', flags)
  return flags
}

// Server components fetch in parallel — no waterfall
async function DashboardPage() {
  // Both kick off simultaneously via parallel server component rendering
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />    {/* calls getCurrentUser() */}
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <DashboardContent />   {/* calls getCurrentUser() + getFeatureFlags() */}
      </Suspense>
    </>
  )
}
// getCurrentUser() runs once (React.cache dedup)
// getFeatureFlags() may not even hit the network (LRU cache)
```

## Does Not Cover

- **Client-side data fetching patterns** — See DataFetching (R2) for SWR, event listeners, and client-side caching.
- **Component composition within Server Components** — See Architecture (R1) for compound components and context patterns.
- **Bundle size of client-side code at RSC boundaries** — See BundleSize (R5) for dynamic imports and code splitting.
- **Hydration and re-render optimization** — See RenderingPerf (R4) for hydration mismatch prevention and rendering performance.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- React Documentation — Server Components, React.cache(), Server Actions Security
- Next.js Documentation — Server Actions and Mutations, Caching, Authentication
