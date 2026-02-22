### SV1.8 Use Runes in .svelte.ts for Shared State

**Impact: CRITICAL (replaces writable stores with fine-grained reactivity)**

Use runes (`$state`, `$derived`) in `.svelte.ts` files for shared reactive state. This replaces the Svelte 4 `writable`/`derived` store pattern with simpler, more performant code.

**Incorrect: Svelte 4 writable store pattern**

```typescript
// stores.ts
import { writable, derived } from 'svelte/store';

export const user = writable<User | null>(null);
export const isLoggedIn = derived(user, $u => $u !== null);
```

**Correct: runes in .svelte.ts**

```typescript
// appState.svelte.ts
let user = $state<User | null>(null);

export function getUser() { return user; }
export function setUser(u: User | null) { user = u; }
export function isLoggedIn() { return user !== null; }
```
