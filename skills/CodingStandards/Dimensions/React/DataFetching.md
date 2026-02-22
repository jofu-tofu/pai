# Data Fetching — React

> Every millisecond spent waiting for data that could have been fetched in parallel is a millisecond of user-visible delay that compounds across every page load.

## Mental Model

Data fetching is the primary bottleneck in most React applications. The rules in this dimension address a single core problem: the request waterfall. A waterfall occurs whenever an async operation waits for a previous one to complete before it can start, even when the two operations are independent. In server-rendered Next.js applications, waterfalls are doubly expensive because they block the response stream — the user sees nothing until the slowest sequential chain completes.

The 11 primary rules in this dimension form three layers of defense against waterfalls. The first layer is structural: `AsyncParallel` and `AsyncDeferAwait` ensure that independent operations run concurrently and that promises are created early but awaited late. The second layer is boundary-based: `AsyncSuspenseBoundaries` and `AsyncApiRoutes` structure the component tree so that slow data does not block fast content. The third layer is client-side: `ClientSwrDedup` prevents redundant network requests, `ClientEventListeners` and `ClientPassiveEventListeners` ensure that event-driven data fetching does not create jank, and `ClientLocalstorageSchema` prevents client-side state corruption that causes unnecessary refetches.

The server-side rules (`ServerParallelFetching`, `ServerAfterNonblocking`) extend this same anti-waterfall philosophy to the server rendering pipeline. `AsyncDependencies` handles the edge case where operations genuinely depend on each other, providing patterns for minimizing the sequential portion.

Together, these rules ensure that data reaches the user as fast as the network allows — no faster, but critically, no slower.

## Consumer Guide

### When Reviewing Code

Scan for these violations in priority order:

1. **Sequential awaits on independent data** (CRITICAL) — Look for consecutive `await` statements where the second call does not use the result of the first. This is the most common and highest-impact violation. `const user = await getUser(); const posts = await getPosts();` — if posts do not need the user, this is a waterfall.
2. **Missing Suspense boundaries** (CRITICAL) — A page component that awaits multiple data sources before rendering anything. Without Suspense, the entire page blocks on the slowest query.
3. **Barrel fetch functions** (HIGH) — A single `getData()` function that fetches everything a page needs sequentially inside it, hiding the waterfall from the component level.
4. **SWR/React Query without dedup** (MEDIUM) — Multiple components independently fetching the same resource without a shared cache key.
5. **Non-passive event listeners** (MEDIUM) — Scroll or touch listeners without `{ passive: true }`, which block the browser's compositor thread.
6. **Unvalidated localStorage reads** (LOW) — Reading client-side cached data without schema validation, risking stale or corrupted state after deployments.

### When Designing / Planning

Before implementing data fetching for a page or feature:

- **Map the data dependency graph.** Draw which data depends on which. Independent branches should be `Promise.all()`'d. Dependent chains should be minimized to the true dependency (e.g., fetch user ID first, then fetch user-specific data).
- **Decide where each fetch lives.** Server Components can fetch directly. Client components need SWR/React Query with deduplication. API routes consolidate multiple backend calls.
- **Plan Suspense boundaries.** Each independent data source should have its own Suspense boundary so fast content streams immediately while slow content loads.
- **Consider the API route consolidation pattern.** If a client component needs 3+ backend calls, consolidate them into a single API route that runs them in parallel server-side, eliminating client-side roundtrips.

### When Implementing

Apply rules in this sequence:

1. **Identify independence** — For every pair of async calls, ask: "Does the second need the result of the first?" If no, parallelize with `Promise.all()` (AsyncParallel).
2. **Defer awaits** — Create promises early, await them at the point of use (AsyncDeferAwait). This naturally enables parallelism even when the code reads sequentially.
3. **Wrap with Suspense** — Each independent data source gets its own Suspense boundary (AsyncSuspenseBoundaries). Place boundaries as close to the data source as possible.
4. **Deduplicate client fetches** — Use SWR or React Query with stable cache keys (ClientSwrDedup). Never fetch the same resource from two components independently.
5. **Optimize event handlers** — Add `{ passive: true }` to scroll/touch listeners (ClientPassiveEventListeners). Use proper cleanup in event subscriptions (ClientEventListeners).
6. **Validate client storage** — Schema-validate localStorage reads (ClientLocalstorageSchema) to handle format changes across deployments.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [AsyncDeferAwait](../../Rules/React/AsyncDeferAwait.md) | CRITICAL | Move await to usage point; create promise early to enable parallelism |
| [AsyncParallel](../../Rules/React/AsyncParallel.md) | CRITICAL | Promise.all() for independent operations — 2-10x improvement |
| [AsyncDependencies](../../Rules/React/AsyncDependencies.md) | HIGH | Minimize sequential chains to true data dependencies only |
| [AsyncApiRoutes](../../Rules/React/AsyncApiRoutes.md) | HIGH | Consolidate multiple backend calls into a single API route |
| [AsyncSuspenseBoundaries](../../Rules/React/AsyncSuspenseBoundaries.md) | CRITICAL | Stream content with Suspense boundaries around independent data |
| [ClientSwrDedup](../../Rules/React/ClientSwrDedup.md) | MEDIUM-HIGH | Deduplicate client-side fetches with SWR/React Query cache keys |
| [ClientEventListeners](../../Rules/React/ClientEventListeners.md) | MEDIUM | Proper setup/teardown for event-driven data subscriptions |
| [ClientPassiveEventListeners](../../Rules/React/ClientPassiveEventListeners.md) | MEDIUM | Use passive: true on scroll/touch listeners to prevent jank |
| [ClientLocalstorageSchema](../../Rules/React/ClientLocalstorageSchema.md) | LOW-MEDIUM | Schema-validate localStorage reads to prevent stale state bugs |
| [ServerParallelFetching](../../Rules/React/ServerParallelFetching.md) | HIGH | Parallel data fetching across server components |
| [ServerAfterNonblocking](../../Rules/React/ServerAfterNonblocking.md) | HIGH | Run non-critical server work after response using next/after |

### Cross-Referenced Rules (from other dimensions)

| Rule | Primary Dimension | Why Relevant Here |
|------|-------------------|-------------------|
| [RerenderDeferReads](../../Rules/React/RerenderDeferReads.md) | RenderingPerf | Deferred state reads prevent unnecessary re-fetches triggered by re-renders |
| [RerenderTransitions](../../Rules/React/RerenderTransitions.md) | RenderingPerf | Transitions prevent fetch-triggered re-renders from blocking UI |
| [RenderingHydrationNoFlicker](../../Rules/React/RenderingHydrationNoFlicker.md) | RenderingPerf | Hydration strategy affects when client-side fetches initialize |
| [RenderingHydrationSuppressWarning](../../Rules/React/RenderingHydrationSuppressWarning.md) | RenderingPerf | Mismatched server/client data causes hydration warnings |
| [RenderingUsetransitionLoading](../../Rules/React/RenderingUsetransitionLoading.md) | RenderingPerf | Loading states during data transitions |

## Rule Interactions

- **AsyncDeferAwait + AsyncParallel** are the foundational pair. DeferAwait naturally enables parallelism: by creating promises at the top of a function and awaiting them where results are needed, independent fetches overlap automatically. When reviewing code, check for DeferAwait first — applying it often reveals AsyncParallel opportunities.
- **AsyncSuspenseBoundaries + ServerParallelFetching** work together in Next.js App Router. Parallel fetching ensures the server starts all data requests simultaneously; Suspense boundaries ensure the response streams as each resolves independently. Without Suspense, parallel fetching still blocks on the slowest query before sending any HTML.
- **AsyncApiRoutes + ClientSwrDedup** address the same problem from opposite ends. API routes consolidate server-side; SWR deduplicates client-side. For a page with many data needs, use API routes to reduce roundtrips, then SWR to cache and deduplicate across component remounts.
- **ClientEventListeners + ClientPassiveEventListeners + RerenderTransitions** (cross-ref) form the event-driven data update chain. Passive listeners prevent scroll jank; proper cleanup prevents memory leaks; transitions prevent re-renders from blocking the main thread during data updates.
- **ServerAfterNonblocking + AsyncDependencies** interact when server actions need to perform follow-up work (analytics, cache warming) after the primary data operation. Use `after()` for truly non-blocking side effects; use AsyncDependencies patterns when the follow-up genuinely depends on the primary result.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Hidden waterfall in utility function**: A `getPageData()` function that internally does `const user = await getUser(); const settings = await getSettings(user.id); const posts = await getPosts();` — where `getPosts` does not actually need `settings`. The waterfall is invisible at the call site, making it persist across refactors.
- **No Suspense on slow queries**: An entire page blocks rendering because one component awaits a 3-second database query without a Suspense boundary. All other content — navigation, sidebar, cached data — waits unnecessarily.

### HIGH
- **Client-side fetch cascade**: Component A fetches user, passes userId to Component B, which fetches posts, passes postIds to Component C, which fetches comments. Each component renders and fetches sequentially. Solution: consolidate into a single API route or use parallel server component fetching.
- **Redundant SWR calls**: Three components on the same page each call `useSWR('/api/user')` with slightly different options, causing three network requests instead of one. Missing shared configuration or inconsistent cache keys.

### MEDIUM
- **Non-passive scroll listener causing fetch jank**: A scroll-based infinite loader using `addEventListener('scroll', handler)` without `{ passive: true }`, causing frame drops during rapid scrolling because the browser cannot optimize scroll handling.
- **Unversioned localStorage cache**: Client reads `JSON.parse(localStorage.getItem('settings'))` without validating the shape, causing crashes when the settings schema changes in a deployment.

## Examples

### Example 1: Waterfall Elimination (DeferAwait + Parallel + SuspenseBoundaries)

```tsx
// BEFORE: 3 sequential awaits, no streaming — total: 900ms
async function DashboardPage() {
  const user = await getUser()           // 200ms
  const stats = await getStats()          // 400ms (independent!)
  const notifications = await getNotifs() // 300ms (independent!)
  return <Dashboard user={user} stats={stats} notifications={notifications} />
}

// AFTER: parallel fetches + Suspense streaming — total: 400ms
async function DashboardPage() {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader />  {/* fetches user internally */}
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsPanel />  {/* fetches stats internally */}
      </Suspense>
      <Suspense fallback={<NotifSkeleton />}>
        <NotificationFeed />  {/* fetches notifications internally */}
      </Suspense>
    </>
  )
}
```

Each component fetches its own data. Suspense boundaries let fast components render immediately. Total time = slowest single query (400ms), not the sum (900ms).

### Example 2: API Route Consolidation + SWR Dedup (ApiRoutes + SwrDedup + PassiveEventListeners)

```tsx
// BEFORE: 3 client-side roundtrips + non-passive scroll
function ActivityFeed() {
  const { data: user } = useSWR('/api/user')
  const { data: feed } = useSWR('/api/feed')
  const { data: suggestions } = useSWR('/api/suggestions')

  useEffect(() => {
    const handler = () => loadMore()
    window.addEventListener('scroll', handler) // blocks compositor
    return () => window.removeEventListener('scroll', handler)
  }, [])
}

// AFTER: single API route + passive scroll + transition
function ActivityFeed() {
  const { data } = useSWR('/api/activity-bundle')
  // Server-side: API route runs all 3 fetches in Promise.all()

  useEffect(() => {
    const handler = () => {
      startTransition(() => loadMore())
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}

// API route consolidates server-side
export async function GET() {
  const [user, feed, suggestions] = await Promise.all([
    getUser(), getFeed(), getSuggestions()
  ])
  return Response.json({ user, feed, suggestions })
}
```

### Example 3: Server Parallel Fetching + After (ServerParallelFetching + ServerAfterNonblocking + AsyncDependencies)

```tsx
// BEFORE: sequential server work blocks response
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  await trackPageView(params.id)        // 150ms wasted — user waits for analytics
  const related = await getRelated(product.categoryId) // genuine dependency
  return <ProductDetail product={product} related={related} />
}

// AFTER: parallel where possible, after() for non-blocking, chain only true deps
import { after } from 'next/server'

async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  // Non-blocking: analytics after response
  after(() => trackPageView(params.id))

  // True dependency: related needs categoryId from product
  const related = await getRelated(product.categoryId)

  return <ProductDetail product={product} related={related} />
}
```

## Does Not Cover

- **Component architecture decisions** — See Architecture (R1) for composition patterns, prop design, and context interfaces.
- **Server Component boundaries** — See ServerComponents (R3) for RSC-specific caching, serialization, and auth patterns.
- **Re-render optimization** — See RenderingPerf (R4) for memoization, derived state, and hydration.
- **Bundle size of data-fetching libraries** — See BundleSize (R5) for import optimization.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- React Documentation — Suspense, use(), Server Components
- Next.js Documentation — Data Fetching, API Routes, next/after
