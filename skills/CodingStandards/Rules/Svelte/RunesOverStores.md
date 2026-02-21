### 4.4 Prefer Runes Over Stores for New Code

**Impact: MEDIUM (simplifies reactive patterns and reduces boilerplate)**

For new Svelte 5 code, prefer runes (`$state`, `$derived`) over stores (`writable`, `derived`). Keep stores only for legacy Svelte 4 code or third-party libraries that require the store contract.

**Incorrect: reaching for stores in new Svelte 5 code**

```typescript
// new-feature.ts
import { writable, derived } from 'svelte/store';

export const count = writable(0);
export const doubled = derived(count, $c => $c * 2);
```

**Correct: runes in .svelte.ts for new code**

```typescript
// new-feature.svelte.ts
let count = $state(0);
let doubled = $derived(count * 2);

export function getCount() { return count; }
export function increment() { count++; }
export function getDoubled() { return doubled; }
```

**When stores are still appropriate:**
- Legacy Svelte 4 components not yet migrated
- Third-party libraries requiring store contracts
- Interop with non-Svelte code expecting subscribe/set interface
