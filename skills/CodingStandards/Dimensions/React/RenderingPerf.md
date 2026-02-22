# Rendering & Performance — React

> Every unnecessary re-render is wasted CPU, and every hydration mismatch is a broken user experience — rendering performance is the tax your users pay for architectural decisions made at development time.

## Mental Model

React's rendering model is declarative: you describe the desired UI state, and React determines the minimal DOM operations needed. But "minimal" only holds when the component tree cooperates. The 21 rules in this dimension address the gap between React's theoretical efficiency and the practical reality of components that re-render too often, hydrate incorrectly, or miss opportunities to skip work entirely.

These rules form three conceptual layers. The first layer is **re-render prevention** (12 rules): avoiding renders that produce no visible change. This includes memoization (`RerenderMemo`, `RerenderMemoWithDefaultValue`), derived state elimination (`RerenderDerivedState`, `RerenderDerivedStateNoEffect`), deferred reads (`RerenderDeferReads`), and transitions (`RerenderTransitions`). The core insight is that preventing a render is always cheaper than optimizing one. Every component subscription (to context, searchParams, stores) is a re-render trigger — subscribe to less, render less.

The second layer is **rendering efficiency** (9 rules): making renders that do happen as cheap as possible. `RenderingHoistJsx` prevents re-creating JSX elements. `RenderingContentVisibility` uses CSS containment to skip off-screen layout calculations. `RenderingActivity` (React 19's experimental `<Activity>` component) preserves component state while hiding subtrees. `RenderingConditionalRender` and `RenderingAnimateSvgWrapper` avoid unnecessary DOM operations for conditional and animated content.

The third layer is **hydration correctness** (2 rules): ensuring server-rendered HTML matches client-rendered output. `RenderingHydrationNoFlicker` handles client-only data (localStorage, cookies) without visual flash. `RenderingHydrationSuppressWarning` handles intentional mismatches (timestamps, random values) cleanly. Hydration mismatches are uniquely costly because they force React to discard server-rendered DOM and re-render from scratch — negating all SSR benefits.

When applied together, these rules ensure that the component tree renders only when necessary, renders efficiently when it must, and hydrates without error or flicker.

## Consumer Guide

### When Reviewing Code

Scan for these violations in severity order:

1. **State in effects that derives from props** (HIGH) — `useEffect(() => setX(derive(props)), [props])` causes double renders. The first render uses stale state; the effect triggers a synchronous re-render with correct state. Both hit the DOM.
2. **Hydration mismatch with client-only data** (HIGH) — Components that read `localStorage`, `window.innerWidth`, or `Date.now()` during initial render without a hydration-safe pattern. These produce mismatches that force full re-render.
3. **Missing memo on expensive pure components** (MEDIUM) — Components receiving stable props that re-render because a parent re-renders. Check if React Compiler is enabled first — if it is, manual memo is unnecessary.
4. **Context subscriptions for callback-only data** (MEDIUM) — Components subscribed to `useSearchParams()` or similar dynamic state when they only read the value inside event handlers, not during render.
5. **Object/array literals in JSX** (MEDIUM) — `style={{ color: 'red' }}` or `options={[1, 2, 3]}` in render body creates new references every render, defeating memo on child components.
6. **Missing content-visibility on long lists** (LOW) — Long scrollable content without `content-visibility: auto`, forcing the browser to lay out off-screen elements.

### When Designing / Planning

Before implementing a feature with rendering concerns:

- **Map the re-render propagation path.** When state X changes, which components re-render? Trace from the state source through context providers and prop chains. Each unnecessary component in the path is a candidate for memo or restructuring.
- **Decide on derived vs. synced state.** If a value can be computed from props/state during render, it must be derived inline — never synced via useEffect. This eliminates an entire class of double-render bugs.
- **Plan hydration strategy for client-only data.** Themes, user preferences, auth state — anything from localStorage or cookies needs a hydration-safe pattern decided upfront, not patched after seeing console warnings.
- **Identify off-screen content.** Tabs, collapsed sections, below-fold content — these are candidates for `content-visibility: auto` or React 19's `<Activity>` component.

### When Implementing

Apply rules in this order of priority:

1. **Eliminate derived state in effects** — Replace all `useEffect(() => setState(derive(props)), [deps])` with inline computation or `useMemo` (RerenderDerivedState, RerenderDerivedStateNoEffect).
2. **Defer state reads** — If a state value is only used in event handlers, read it on-demand instead of subscribing (RerenderDeferReads).
3. **Use transitions for non-urgent updates** — Wrap `startTransition()` around state updates that drive expensive re-renders (RerenderTransitions).
4. **Memoize expensive pure components** — Apply `memo()` to components that receive stable props from frequently-updating parents (RerenderMemo). Provide sensible defaults to avoid breaking memo (RerenderMemoWithDefaultValue).
5. **Hoist static JSX** — Move JSX that does not depend on props/state outside the component body (RenderingHoistJsx).
6. **Handle hydration correctly** — Use synchronous scripts for client-only DOM updates (RenderingHydrationNoFlicker). Use `suppressHydrationWarning` only for intentional mismatches like timestamps (RenderingHydrationSuppressWarning).
7. **Apply CSS containment** — Add `content-visibility: auto` to off-screen sections (RenderingContentVisibility).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [RerenderDeferReads](../../Rules/React/RerenderDeferReads.md) | MEDIUM | Read dynamic state on-demand in callbacks instead of subscribing in render |
| [RerenderMemo](../../Rules/React/RerenderMemo.md) | MEDIUM | Extract expensive subtrees into memo'd components for early bailout |
| [RerenderMemoWithDefaultValue](../../Rules/React/RerenderMemoWithDefaultValue.md) | MEDIUM | Provide stable default values to prevent breaking memo comparisons |
| [RerenderDependencies](../../Rules/React/RerenderDependencies.md) | MEDIUM | Ensure hook dependency arrays contain only values that should trigger re-execution |
| [RerenderDerivedState](../../Rules/React/RerenderDerivedState.md) | HIGH | Compute derived values inline during render instead of storing in state |
| [RerenderDerivedStateNoEffect](../../Rules/React/RerenderDerivedStateNoEffect.md) | HIGH | Never sync props to state via useEffect — derive inline or use useMemo |
| [RerenderFunctionalSetstate](../../Rules/React/RerenderFunctionalSetstate.md) | MEDIUM | Use functional setState to avoid stale closures and unnecessary deps |
| [RerenderLazyStateInit](../../Rules/React/RerenderLazyStateInit.md) | MEDIUM | Pass initializer function to useState for expensive computations |
| [RerenderSimpleExpressionInMemo](../../Rules/React/RerenderSimpleExpressionInMemo.md) | LOW | Do not wrap trivial expressions in useMemo — the overhead exceeds the savings |
| [RerenderMoveEffectToEvent](../../Rules/React/RerenderMoveEffectToEvent.md) | MEDIUM | Move side-effect logic from useEffect to event handlers when possible |
| [RerenderTransitions](../../Rules/React/RerenderTransitions.md) | MEDIUM | Use startTransition for non-urgent updates to keep UI responsive |
| [RerenderUseRefTransientValues](../../Rules/React/RerenderUseRefTransientValues.md) | MEDIUM | Store transient values in refs to avoid triggering renders |
| [RenderingAnimateSvgWrapper](../../Rules/React/RenderingAnimateSvgWrapper.md) | LOW | Wrap animated SVGs to prevent re-rendering static parent content |
| [RenderingContentVisibility](../../Rules/React/RenderingContentVisibility.md) | MEDIUM | Use CSS content-visibility: auto to skip layout of off-screen content |
| [RenderingHoistJsx](../../Rules/React/RenderingHoistJsx.md) | MEDIUM | Hoist static JSX outside render to prevent recreation every render cycle |
| [RenderingSvgPrecision](../../Rules/React/RenderingSvgPrecision.md) | LOW | Reduce SVG coordinate precision to minimize DOM size |
| [RenderingHydrationNoFlicker](../../Rules/React/RenderingHydrationNoFlicker.md) | MEDIUM | Use synchronous scripts for client-only DOM updates to prevent flicker |
| [RenderingHydrationSuppressWarning](../../Rules/React/RenderingHydrationSuppressWarning.md) | LOW | Use suppressHydrationWarning only for intentional mismatches (timestamps, IDs) |
| [RenderingActivity](../../Rules/React/RenderingActivity.md) | MEDIUM | Use React 19 Activity component to preserve state of hidden subtrees |
| [RenderingConditionalRender](../../Rules/React/RenderingConditionalRender.md) | MEDIUM | Avoid mounting/unmounting components that toggle frequently — hide instead |
| [RenderingUsetransitionLoading](../../Rules/React/RenderingUsetransitionLoading.md) | MEDIUM | Show loading indicators during transitions using useTransition's isPending |

## Rule Interactions

- **RerenderDerivedState + RerenderDerivedStateNoEffect** are two sides of the same coin. DerivedState says: compute inline. DerivedStateNoEffect says: never use useEffect for this. When reviewing, finding a useEffect that calls setState with a value derived from props/state is a violation of both rules simultaneously. The fix is always the same: derive inline or use useMemo.
- **RerenderMemo + RerenderMemoWithDefaultValue + RenderingHoistJsx** form the memoization chain. Memo wraps the component; DefaultValue ensures default props do not create new references that break memo; HoistJsx ensures static children do not break the parent's memo. Applying Memo alone without the other two often produces no measurable improvement because new references from defaults or inline JSX defeat the shallow comparison.
- **RerenderDeferReads + RerenderTransitions + RerenderMoveEffectToEvent** are all strategies for reducing how often renders happen. DeferReads avoids subscribing to state that is only needed in callbacks. Transitions mark updates as non-urgent so React can batch them. MoveEffectToEvent moves logic out of the render cycle entirely. These three rules should be evaluated together when diagnosing a component that renders too often.
- **RenderingHydrationNoFlicker + RenderingHydrationSuppressWarning** handle opposite sides of the hydration problem. NoFlicker is for values that must be correct immediately (themes, auth). SuppressWarning is for values that are intentionally different between server and client (timestamps, random IDs). Using the wrong pattern causes either flicker (SuppressWarning where NoFlicker is needed) or suppressed real bugs (NoFlicker where SuppressWarning suffices).
- **RenderingActivity + RenderingConditionalRender + RenderingContentVisibility** address hidden content from different angles. Activity preserves React state of hidden subtrees (tabs). ConditionalRender avoids mount/unmount cycles for frequently toggled UI. ContentVisibility defers browser layout calculations for off-screen content. For a tabbed interface, combine Activity (state preservation) with ContentVisibility (layout optimization).

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Derived state in useEffect causing render loop**: `useEffect(() => { setFilteredItems(items.filter(predicate)) }, [items, predicate])` — every state change causes a double render. With large lists, this can cause visible jank on every keystroke. Replace with `const filteredItems = useMemo(() => items.filter(predicate), [items, predicate])`.
- **Hydration mismatch on auth state**: Reading `document.cookie` or `localStorage.getItem('token')` during initial server render, causing React to discard all server-rendered HTML and re-render the entire page client-side. This negates all SSR/streaming benefits.

### HIGH
- **Memo defeated by inline objects**: `<MemoizedList items={items} style={{ padding: 8 }} />` — the style object is a new reference every render, causing MemoizedList to re-render every time its parent renders. The `memo()` call provides zero benefit.
- **Entire context subscription for partial read**: A component consuming a large context object (`const { theme, user, settings, notifications } = useContext(AppContext)`) when it only uses `theme`. Any change to notifications triggers a re-render of this theme-only component.

### MEDIUM
- **Expensive initialization on every render**: `const [data] = useState(parseCSV(rawData))` — `parseCSV` runs on every render but its result is discarded after the first. Use `useState(() => parseCSV(rawData))` to initialize lazily.
- **Scroll position stored in state**: Using `useState` for scroll position or mouse coordinates, causing re-renders on every scroll frame. Use `useRef` for transient values that do not affect rendered output.
- **Missing content-visibility on large lists**: A 500-item list rendering all items in the DOM without virtualization or `content-visibility: auto`, causing the browser to calculate layout for off-screen items that the user cannot see.

## Examples

### Example 1: Derived State Elimination (DerivedState + DerivedStateNoEffect + Memo)

```tsx
// BEFORE: useEffect syncing props to state — double render on every filter change
function SearchResults({ query, items }: Props) {
  const [filtered, setFiltered] = useState(items)

  useEffect(() => {
    setFiltered(items.filter(item => item.name.includes(query)))
  }, [items, query])

  return <ResultList items={filtered} />
}

// AFTER: Inline derivation + memoized child — single render, no effect
const ResultList = memo(function ResultList({ items }: { items: Item[] }) {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
})

function SearchResults({ query, items }: Props) {
  const filtered = useMemo(
    () => items.filter(item => item.name.includes(query)),
    [items, query]
  )
  return <ResultList items={filtered} />
}
```

DerivedState eliminates the double render. Memo on ResultList prevents re-rendering when `filtered` produces the same array (e.g., when an unrelated parent state changes).

### Example 2: Hydration-Safe Theme with Transitions (HydrationNoFlicker + Transitions + DeferReads)

```tsx
// BEFORE: Theme flickers from light to dark after hydration
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'light')
  }, [])
  return <div className={theme}>{children}</div>
}

// AFTER: Synchronous script prevents flicker + transition for toggling
function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-root">{children}</div>
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          try {
            var theme = localStorage.getItem('theme') || 'light';
            document.getElementById('theme-root').className = theme;
          } catch(e) {}
        })();
      `}} />
    </>
  )
}

// Theme toggle uses transition — non-urgent, does not block typing
function ThemeToggle() {
  const handleToggle = () => {
    const next = document.getElementById('theme-root')?.className === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    startTransition(() => {
      document.getElementById('theme-root')!.className = next
    })
  }
  return <button onClick={handleToggle}>Toggle Theme</button>
}
```

### Example 3: Memoization Chain (Memo + MemoWithDefaultValue + HoistJsx + LazyStateInit)

```tsx
// BEFORE: Memo is defeated by default prop + inline JSX + eager init
function Dashboard({ config = {} }: { config?: DashboardConfig }) {
  const [data] = useState(parseExpensiveConfig(rawConfig)) // runs every render
  return (
    <MemoizedPanel config={config}> {/* {} is new ref every render */}
      <div style={{ padding: 16 }}> {/* inline object breaks memo */}
        <Chart data={data} />
      </div>
    </MemoizedPanel>
  )
}

// AFTER: Stable defaults + hoisted JSX + lazy init
const DEFAULT_CONFIG: DashboardConfig = {}
const chartContainerStyle = { padding: 16 }

function Dashboard({ config = DEFAULT_CONFIG }: { config?: DashboardConfig }) {
  const [data] = useState(() => parseExpensiveConfig(rawConfig)) // lazy
  return (
    <MemoizedPanel config={config}>
      <div style={chartContainerStyle}>
        <Chart data={data} />
      </div>
    </MemoizedPanel>
  )
}
```

Four rules interact: MemoWithDefaultValue provides `DEFAULT_CONFIG` so memo is not broken by `{}`. HoistJsx moves the style object outside render. LazyStateInit wraps the expensive parser in a function. Memo on the panel can now actually skip renders.

## Does Not Cover

- **Data fetching waterfalls** — See DataFetching (R2) for async patterns, Suspense boundaries, and SWR.
- **Component architecture decisions** — See Architecture (R1) for composition patterns that reduce re-render surface area.
- **Server Component caching** — See ServerComponents (R3) for server-side caching and serialization.
- **Bundle size from rendering libraries** — See BundleSize (R5) for import optimization.
- **Raw JavaScript performance** — See JavaScriptPerf (R6) for loop optimization, data structures, and DOM batching.

## Sources

- Vercel Engineering — React Best Practices (January 2026), MIT
- React Documentation — useMemo, memo, useTransition, Suspense, Activity
- Web.dev — content-visibility, CSS Containment
