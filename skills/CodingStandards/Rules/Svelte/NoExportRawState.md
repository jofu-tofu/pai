### 4.2 Never Export Raw $state Variables

**Impact: CRITICAL (Svelte enforces reference stability — raw export won't compile)**

Svelte 5 prevents directly exporting `$state` bindings. Use accessor functions or a class to expose shared state.

**Incorrect: raw $state export — compile error**

```typescript
// state.svelte.ts
export let user = $state<User | null>(null); // ERROR: Cannot export $state
```

**Correct: accessor functions**

```typescript
// state.svelte.ts
let user = $state<User | null>(null);

export function getUser() { return user; }
export function setUser(u: User | null) { user = u; }
```

**Also correct: class with $state fields**

```typescript
// state.svelte.ts
class AppState {
  user = $state<User | null>(null);
  get isLoggedIn() { return this.user !== null; }
}

export const appState = new AppState();
```
