---
name: React
description: React and Next.js guidelines for component architecture and performance optimization. USE WHEN writing React components OR reviewing React code OR refactoring Next.js code OR designing component APIs OR optimizing performance OR eliminating waterfalls OR reducing bundle size OR working with Server Components OR building compound components OR refactoring boolean prop proliferation. Contains 65 rules across 9 categories.
---

# React

Component architecture and performance optimization for React and Next.js. **65 rules across 9 categories, organized by workflow intent.**

## Quick Decision Tree

**Start here — what are you doing?**

### Building or designing components?
→ **Category 0: Component Architecture & Composition** (HIGH)
  - Compound components, state lifting, explicit variants, React 19 APIs
  - Read: `Rules/ArchitectureAvoidBooleanProps.md`, `Rules/ArchitectureCompoundComponents.md`, `Rules/StateContextInterface.md`

### Optimizing existing code?
1. **See sequential awaits?** → Category 1: Eliminating Waterfalls (CRITICAL)
2. **Slow imports or large bundle?** → Category 2: Bundle Size (CRITICAL)
3. **Server Component issues?** → Category 3: Server-Side Performance (HIGH)
4. **Client data fetching problems?** → Category 4: Client-Side Data (MEDIUM-HIGH)
5. **Excessive re-renders?** → Category 5: Re-render Optimization (MEDIUM)
6. **Rendering performance lag?** → Category 6: Rendering Performance (MEDIUM)
7. **JavaScript bottlenecks?** → Category 7: JavaScript Performance (LOW-MEDIUM)
8. **Edge cases or initialization?** → Category 8: Advanced Patterns (LOW)

**For detailed implementation:** Read the specific rule file from `Rules/` folder (see Complete Rule Index below).

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern | Rules |
|----------|----------|--------|-------------|-------|
| 0 | Architecture & Composition | HIGH | Compound components, providers, variants | 8 |
| 1 | Eliminating Waterfalls | CRITICAL | Promise.all(), defer await, Suspense | 5 |
| 2 | Bundle Size | CRITICAL | Direct imports, dynamic loading | 5 |
| 3 | Server-Side | HIGH | React.cache(), minimal serialization | 7 |
| 4 | Client-Side Data | MEDIUM-HIGH | SWR, event deduplication | 4 |
| 5 | Re-render | MEDIUM | useMemo, derived state | 12 |
| 6 | Rendering | MEDIUM | Suspense, hydration | 9 |
| 7 | JavaScript | LOW-MEDIUM | Loops, data structures | 12 |
| 8 | Advanced | LOW | useRef patterns | 3 |

## Top 10 High-Impact Rules

These provide the largest performance gains:

1. **async-parallel** - Promise.all() for independent ops (2-10× improvement)
2. **bundle-barrel-imports** - Direct imports (200-800ms savings, 40% faster cold starts)
3. **architecture-avoid-boolean-props** - Composition over boolean props (prevents exponential complexity)
4. **async-defer-await** - Move await to usage point (avoids blocking)
5. **bundle-dynamic-imports** - next/dynamic for heavy components
6. **architecture-compound-components** - Shared context, composable pieces
7. **server-serialization** - Minimize RSC boundary data
8. **async-suspense-boundaries** - Stream content with Suspense
9. **server-parallel-fetching** - Parallel component data fetching
10. **state-context-interface** - Generic interfaces for dependency injection

## Examples

**Example 1: Waterfall → Parallel (2× faster)**
```typescript
// Problem: Sequential awaits
const user = await fetchUser()
const posts = await fetchPosts()

// Solution: async-parallel rule
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()])
```

**Example 2: Barrel Import → Direct (40% faster)**
```typescript
// Problem: 1,583 modules loaded
import { Check, X } from 'lucide-react'

// Solution: bundle-barrel-imports rule
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
```

**Example 3: Boolean Props → Composition**
```tsx
// Problem: Boolean prop proliferation
<Composer isThread isEditing={false} channelId='abc' showAttachments />

// Solution: architecture-avoid-boolean-props rule
<ThreadComposer channelId="abc" />
```

**Example 4: RSC Over-serialization → Minimal**
```typescript
// Problem: Entire user object serialized
<ClientComponent user={user} />

// Solution: server-serialization rule
<ClientComponent user={{ id: user.id, name: user.name, avatar: user.avatar }} />
```

## Reference Documentation

**All 65 rules are sharded into individual files in `Rules/` folder for efficient loading.**

### How to Use Rules

**Pattern:** When applying a rule, read its specific file from Rules/ folder.

```
Decision tree identifies: Category 0 (Architecture)
Quick ref shows: architecture-compound-components rule
Action: Read Rules/ArchitectureCompoundComponents.md
Result: Complete code examples and implementation guidance
```

### What's in Each Rule File

Each rule file (`Rules/RuleName.md`) includes:
- Why it matters (explanation + impact level)
- Incorrect code example with explanation
- Correct code example with explanation
- Impact metrics and benchmarks
- Additional context and references

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `async-parallel` → `Rules/AsyncParallel.md`
- `architecture-compound-components` → `Rules/ArchitectureCompoundComponents.md`
- `state-context-interface` → `Rules/StateContextInterface.md`

### Optional: Complete Reference

`AGENTS.md` (~107KB) contains all rules in one document for comprehensive reading, but prefer loading individual rule files for efficiency.

## Complete Rule Index

### 0. Architecture & Composition (HIGH)
- architecture-avoid-boolean-props
- architecture-compound-components
- state-decouple-implementation
- state-context-interface
- state-lift-state
- patterns-explicit-variants
- patterns-children-over-render-props
- react19-no-forwardref

### 1. Eliminating Waterfalls (CRITICAL)
- async-defer-await
- async-parallel
- async-dependencies
- async-api-routes
- async-suspense-boundaries

### 2. Bundle Size Optimization (CRITICAL)
- bundle-barrel-imports
- bundle-dynamic-imports
- bundle-defer-third-party
- bundle-conditional
- bundle-preload

### 3. Server-Side Performance (HIGH)
- server-auth-actions
- server-cache-react
- server-cache-lru
- server-dedup-props
- server-serialization
- server-parallel-fetching
- server-after-nonblocking

### 4. Client-Side Data Fetching (MEDIUM-HIGH)
- client-swr-dedup
- client-event-listeners
- client-passive-event-listeners
- client-localstorage-schema

### 5. Re-render Optimization (MEDIUM)
- rerender-defer-reads
- rerender-memo
- rerender-memo-with-default-value
- rerender-dependencies
- rerender-derived-state
- rerender-derived-state-no-effect
- rerender-functional-setstate
- rerender-lazy-state-init
- rerender-simple-expression-in-memo
- rerender-move-effect-to-event
- rerender-transitions
- rerender-use-ref-transient-values

### 6. Rendering Performance (MEDIUM)
- rendering-animate-svg-wrapper
- rendering-content-visibility
- rendering-hoist-jsx
- rendering-svg-precision
- rendering-hydration-no-flicker
- rendering-hydration-suppress-warning
- rendering-activity
- rendering-conditional-render
- rendering-usetransition-loading

### 7. JavaScript Performance (LOW-MEDIUM)
- js-batch-dom-css
- js-index-maps
- js-cache-property-access
- js-cache-function-results
- js-cache-storage
- js-combine-iterations
- js-length-check-first
- js-early-exit
- js-hoist-regexp
- js-min-max-loop
- js-set-map-lookups
- js-tosorted-immutable

### 8. Advanced Patterns (LOW)
- advanced-event-handler-refs
- advanced-init-once
- advanced-use-latest

## Integration

This skill integrates with PAI's code generation and review workflows. When writing or refactoring React/Next.js code, these patterns ensure optimal component architecture and performance.

**Sources:**
- Vercel Engineering — React Best Practices (January 2026), MIT
- Vercel Engineering — React Composition Patterns (January 2026), MIT
- Repository: github.com/vercel-labs/agent-skills
