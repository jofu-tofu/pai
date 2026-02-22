# JavaScript Performance — React

> Framework-level optimization means nothing if the raw JavaScript underneath is doing O(n^2) work, thrashing the DOM, or recomputing values that could be cached — JavaScript performance is the foundation that all other optimizations rest on.

## Mental Model

The 15 rules in this dimension operate below the React abstraction layer. While React manages the virtual DOM, component lifecycle, and rendering pipeline, the actual work inside components — iterating arrays, looking up data, manipulating the DOM, computing derived values — runs as plain JavaScript. Inefficient JavaScript inside a perfectly optimized React component still produces a slow application.

These rules cluster into four concern areas. The first is **data structure selection** (3 rules): choosing the right data structure eliminates algorithmic complexity. `JsIndexMaps` replaces O(n) repeated `.find()` calls with O(1) Map lookups. `JsSetMapLookups` uses Set for membership tests instead of Array.includes(). `JsTosortedImmutable` uses immutable sort to avoid mutating shared arrays in a framework built on immutability.

The second concern is **iteration efficiency** (4 rules): reducing the number of passes over data and short-circuiting early. `JsCombineIterations` merges multiple `.filter().map().reduce()` chains into a single pass. `JsLengthCheckFirst` adds a length guard before expensive array operations. `JsEarlyExit` returns from functions as soon as the result is known. `JsMinMaxLoop` avoids spreading large arrays into `Math.max()` which can overflow the call stack.

The third concern is **caching and memoization** (3 rules): avoiding redundant computation. `JsCachePropertyAccess` caches deeply nested property lookups. `JsCacheFunctionResults` caches expensive function results across calls. `JsCacheStorage` caches repeated localStorage/sessionStorage access to avoid synchronous I/O in hot paths.

The fourth concern is **DOM and event patterns** (2 rules + 3 advanced): `JsBatchDomCss` batches DOM reads and writes to prevent layout thrashing. `JsHoistRegexp` moves regular expression compilation outside hot loops. The advanced rules (`AdvancedEventHandlerRefs`, `AdvancedInitOnce`, `AdvancedUseLatest`) address React-specific JavaScript patterns: stable callback references, one-time initialization without effects, and always-current values without re-renders.

Individually, each rule provides a modest improvement. Together, they compound — a component that uses Map lookups, combines iterations, caches property access, and batches DOM operations can be 5-10x faster than one that uses naive patterns throughout.

## Consumer Guide

### When Reviewing Code

Scan for these patterns in descending impact order:

1. **Repeated .find() in loops** (HIGH) — Any pattern where `.find()` is called inside `.map()` or `.forEach()` on a second array. This is O(n*m) where an index Map makes it O(n+m). Common in data joining operations.
2. **Layout thrashing** (HIGH) — Interleaved DOM reads and writes: `el.offsetHeight; el.style.height = '100px'; el2.offsetHeight; el2.style.height = '200px';`. Each read forces the browser to recalculate layout. Batch all reads, then all writes.
3. **Multiple array passes** (MEDIUM) — `.filter().map()` or `.filter().reduce()` chains that could be a single `.reduce()`. Each pass allocates an intermediate array and iterates the full collection.
4. **Spread into Math.max/min** (MEDIUM) — `Math.max(...largeArray)` throws a stack overflow for arrays over ~100K elements because each element becomes a function argument.
5. **RegExp inside loops** (MEDIUM) — `new RegExp(pattern)` or regex literal inside a hot loop, recompiling the regex on every iteration.
6. **Deep property access in tight loops** (LOW) — `items[i].user.profile.settings.theme` accessed repeatedly without caching the intermediate reference.

### When Designing / Planning

Before implementing data-heavy features:

- **Estimate the data size.** For collections under 100 items, naive patterns are fine. For 1,000+, data structure choice matters. For 10,000+, algorithmic complexity dominates.
- **Identify join operations.** Any place where two data sources are correlated by ID is a candidate for index Maps. Plan the Map construction upfront rather than retrofitting.
- **Plan DOM interaction batching.** If a feature reads measurements (dimensions, scroll position) and writes styles, ensure all reads happen before all writes within each frame.
- **Decide on caching strategy.** For expensive computations called with the same arguments (formatters, validators, parsers), plan a caching layer (memoization, LRU, or simple Map cache).

### When Implementing

Apply rules based on the code pattern you encounter:

1. **Data joining?** Build index Maps first (JsIndexMaps), use Set for membership checks (JsSetMapLookups).
2. **Multiple array passes?** Combine into single iteration (JsCombineIterations). Add length guard for optional processing (JsLengthCheckFirst). Return early when possible (JsEarlyExit).
3. **Repeated computation?** Cache function results (JsCacheFunctionResults). Cache property access chains (JsCachePropertyAccess). Cache storage reads (JsCacheStorage).
4. **DOM manipulation?** Batch reads then writes (JsBatchDomCss). Hoist regex out of loops (JsHoistRegexp). Use immutable sort (JsTosortedImmutable).
5. **React-specific patterns?** Stable event handlers via refs or useEffectEvent (AdvancedEventHandlerRefs). One-time initialization without useEffect (AdvancedInitOnce). Always-current value without re-render (AdvancedUseLatest).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [JsBatchDomCss](../../Rules/React/JsBatchDomCss.md) | HIGH | Batch DOM reads before writes to prevent layout thrashing |
| [JsIndexMaps](../../Rules/React/JsIndexMaps.md) | MEDIUM | Build Map index for repeated lookups instead of array .find() |
| [JsCachePropertyAccess](../../Rules/React/JsCachePropertyAccess.md) | LOW-MEDIUM | Cache deep property chains in local variables in tight loops |
| [JsCacheFunctionResults](../../Rules/React/JsCacheFunctionResults.md) | MEDIUM | Memoize expensive function calls with a cache layer |
| [JsCacheStorage](../../Rules/React/JsCacheStorage.md) | LOW-MEDIUM | Cache localStorage/sessionStorage reads to avoid synchronous I/O |
| [JsCombineIterations](../../Rules/React/JsCombineIterations.md) | MEDIUM | Merge chained .filter().map() into single-pass .reduce() |
| [JsLengthCheckFirst](../../Rules/React/JsLengthCheckFirst.md) | LOW | Guard expensive operations with array length check |
| [JsEarlyExit](../../Rules/React/JsEarlyExit.md) | LOW-MEDIUM | Return early from functions when result is determined |
| [JsHoistRegexp](../../Rules/React/JsHoistRegexp.md) | LOW-MEDIUM | Compile regex outside loops to avoid recompilation per iteration |
| [JsMinMaxLoop](../../Rules/React/JsMinMaxLoop.md) | MEDIUM | Use loop-based min/max for large arrays to avoid stack overflow |
| [JsSetMapLookups](../../Rules/React/JsSetMapLookups.md) | MEDIUM | Use Set for O(1) membership tests instead of Array.includes() |
| [JsTosortedImmutable](../../Rules/React/JsTosortedImmutable.md) | LOW | Use toSorted() for immutable sort — avoids mutating shared arrays in React |
| [AdvancedEventHandlerRefs](../../Rules/React/AdvancedEventHandlerRefs.md) | LOW | Store event handlers in refs or useEffectEvent for stable subscriptions |
| [AdvancedInitOnce](../../Rules/React/AdvancedInitOnce.md) | LOW | Initialize values once without useEffect using ref or module-level patterns |
| [AdvancedUseLatest](../../Rules/React/AdvancedUseLatest.md) | LOW | Keep a ref to the latest value to read in callbacks without re-render deps |

## Rule Interactions

- **JsIndexMaps + JsSetMapLookups + JsCombineIterations** form the data processing triad. When processing a list that requires joining with another list (IndexMaps), filtering by membership in a set (SetMapLookups), and transforming the result (CombineIterations), applying all three can reduce a 3-pass O(n*m) operation to a single-pass O(n+m) operation. The Map and Set should be constructed once before the main iteration.
- **JsCachePropertyAccess + JsCacheFunctionResults + JsCacheStorage** are all caching strategies at different levels. PropertyAccess caches object traversal within a single function scope. FunctionResults caches computation across multiple function calls. CacheStorage caches I/O across multiple render cycles. When a function reads from storage, traverses a deep object, and computes an expensive result, all three rules apply in sequence.
- **JsBatchDomCss + JsHoistRegexp** address hot-path optimization from different angles. BatchDomCss prevents the browser from recalculating layout between interleaved reads and writes. HoistRegexp prevents the engine from recompiling regex patterns. Both become critical in tight loops — a loop that reads DOM dimensions and applies regex per iteration will be dramatically slower than one that batches reads, hoists regex, and writes in a final pass.
- **AdvancedEventHandlerRefs + AdvancedUseLatest** both solve the stale closure problem but for different use cases. EventHandlerRefs creates a stable function reference for event subscriptions. UseLatest creates a stable reference to a changing value for reading in callbacks. When building a custom hook that subscribes to events and needs the latest props, both patterns apply together.
- **AdvancedInitOnce + JsCacheStorage** interact for initialization patterns. InitOnce ensures a value is computed once (e.g., reading and parsing a config from localStorage). CacheStorage prevents repeated reads of the same key. Combined, they ensure that expensive initialization from storage happens exactly once per component lifecycle.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **O(n^2) data join in render path**: `orders.map(o => ({ ...o, user: users.find(u => u.id === o.userId) }))` with 1,000 orders and 1,000 users: 1,000,000 comparisons per render. Build a Map first: 2,000 operations total. This is the single highest-impact JavaScript optimization in data-heavy React components.
- **Layout thrashing in animation frame**: Reading `offsetHeight`, writing `style.height`, reading `offsetWidth`, writing `style.width` in a `requestAnimationFrame` callback. Each read after a write forces a synchronous reflow. With 20 elements, this creates 20 forced reflows per frame — visible stuttering at 60fps.

### HIGH
- **Math.max(...hugeArray) stack overflow**: `Math.max(...array)` where array has 200,000 elements. This pushes 200K arguments onto the call stack, exceeding the maximum. Use a loop or `reduce()` instead. This is a production crash, not just a performance issue.
- **Multiple array passes for single transformation**: `items.filter(predicate).map(transform).reduce(accumulate)` creates 2 intermediate arrays and iterates 3 times. A single `reduce()` does the same work in one pass with zero intermediate allocations.

### MEDIUM
- **Regex compilation inside .map()**: `items.map(item => item.name.match(new RegExp(pattern)))` recompiles the regex for every item. Hoist `const re = new RegExp(pattern)` before the loop.
- **Repeated localStorage.getItem in render**: `const theme = localStorage.getItem('theme')` called on every render. localStorage is synchronous I/O and can take 1-5ms per call. Cache in a module-level variable or ref.
- **Array.includes() for set membership**: `blockedIds.includes(id)` in a loop over 10,000 items where `blockedIds` has 500 entries: 5,000,000 comparisons. `new Set(blockedIds).has(id)`: 10,000 lookups.

## Examples

### Example 1: Data Processing Pipeline (IndexMaps + SetMapLookups + CombineIterations + EarlyExit)

```tsx
// BEFORE: 3 passes, O(n*m) joins, no early exit — 1.2M ops for 1K items
function OrderDashboard({ orders, users, blockedUserIds }: Props) {
  const activeOrders = orders.filter(o => !blockedUserIds.includes(o.userId))
  const enrichedOrders = activeOrders.map(o => ({
    ...o,
    user: users.find(u => u.id === o.userId)
  }))
  const totalRevenue = enrichedOrders.reduce((sum, o) => sum + o.amount, 0)

  return <Dashboard orders={enrichedOrders} revenue={totalRevenue} />
}

// AFTER: 1 pass, O(n+m) with Map + Set — 3K ops for 1K items
function OrderDashboard({ orders, users, blockedUserIds }: Props) {
  const userById = useMemo(() => new Map(users.map(u => [u.id, u])), [users])
  const blocked = useMemo(() => new Set(blockedUserIds), [blockedUserIds])

  const { enrichedOrders, totalRevenue } = useMemo(() => {
    if (!orders.length) return { enrichedOrders: [], totalRevenue: 0 }

    let totalRevenue = 0
    const enrichedOrders: EnrichedOrder[] = []

    for (const order of orders) {
      if (blocked.has(order.userId)) continue  // O(1) lookup, early skip
      const user = userById.get(order.userId)   // O(1) lookup
      enrichedOrders.push({ ...order, user })
      totalRevenue += order.amount
    }

    return { enrichedOrders, totalRevenue }
  }, [orders, userById, blocked])

  return <Dashboard orders={enrichedOrders} revenue={totalRevenue} />
}
```

Four rules interact: IndexMaps for user lookup, SetMapLookups for blocked check, CombineIterations for single-pass processing, EarlyExit via `continue` to skip blocked orders immediately.

### Example 2: DOM Batching with Cached Access (BatchDomCss + CachePropertyAccess + HoistRegexp)

```tsx
// BEFORE: Layout thrashing + recompiled regex + deep access per item
function highlightMatches(items: HTMLElement[], query: string) {
  items.forEach(item => {
    const height = item.offsetHeight                    // read (forces layout)
    item.style.height = `${height}px`                   // write
    const text = item.querySelector('.text')?.textContent
    if (text?.match(new RegExp(query, 'i'))) {          // regex recompiled
      item.querySelector('.badge')?.style.display = 'block'  // write
    }
  })
}

// AFTER: Batched reads/writes + hoisted regex + cached access
function highlightMatches(items: HTMLElement[], query: string) {
  const pattern = new RegExp(query, 'i')  // compile once

  // Phase 1: batch all reads
  const measurements = items.map(item => ({
    el: item,
    height: item.offsetHeight,
    text: item.querySelector('.text')?.textContent ?? '',
    badge: item.querySelector('.badge') as HTMLElement | null,
  }))

  // Phase 2: batch all writes (no forced reflows)
  for (const { el, height, text, badge } of measurements) {
    el.style.height = `${height}px`
    if (badge && pattern.test(text)) {
      badge.style.display = 'block'
    }
  }
}
```

BatchDomCss separates reads from writes. HoistRegexp compiles the pattern once. CachePropertyAccess stores querySelector results in the measurements array.

### Example 3: Stable Callbacks with Latest Values (EventHandlerRefs + UseLatest + InitOnce)

```tsx
// BEFORE: Effect re-subscribes on every callback change + repeated init
function useWebSocket(url: string, onMessage: (msg: Message) => void) {
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(url)  // reconnects when onMessage changes!
    socket.addEventListener('message', (e) => onMessage(JSON.parse(e.data)))
    setWs(socket)
    return () => socket.close()
  }, [url, onMessage])  // onMessage in deps = reconnect on every render

  return ws
}

// AFTER: Stable subscription + latest callback + init once
function useWebSocket(url: string, onMessage: (msg: Message) => void) {
  const onMessageEvent = useEffectEvent(onMessage)  // always latest, stable ref
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(url)
    wsRef.current = socket

    socket.addEventListener('message', (e) => {
      onMessageEvent(JSON.parse(e.data))  // calls latest onMessage
    })

    return () => socket.close()
  }, [url])  // only reconnects when URL changes

  return wsRef.current
}
```

EventHandlerRefs (via useEffectEvent) provides a stable reference. UseLatest ensures the callback always calls the latest version. The effect dependency array is minimal, preventing unnecessary reconnections.

## Does Not Cover

- **React rendering optimization** — See RenderingPerf (R4) for memoization, derived state, and re-render prevention.
- **Network and data fetching performance** — See DataFetching (R2) for waterfall elimination and caching.
- **Bundle size of JavaScript** — See BundleSize (R5) for import optimization and code splitting.
- **Component architecture** — See Architecture (R1) for composition patterns that reduce overall code complexity.
- **Server-side JavaScript execution** — See ServerComponents (R3) for server-side caching and deduplication.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- V8 Blog — Optimizing JavaScript Execution
- Web.dev — Avoid Layout Thrashing, Rendering Performance
