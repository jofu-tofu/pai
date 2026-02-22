### SV3.4 Use Arrow Functions for Class Methods in $state

**Impact: MEDIUM (prevents this-binding bugs when passing methods as callbacks)**

When using classes with `$state` fields, use arrow functions for methods to ensure `this` is preserved when methods are passed as callbacks.

**Incorrect: regular method loses `this` as callback**

```typescript
// state.svelte.ts
class TodoState {
  todos = $state<string[]>([]);

  add(text: string) {
    this.todos.push(text); // `this` is undefined when called as callback
  }
}
```

**Correct: arrow function preserves `this`**

```typescript
// state.svelte.ts
class TodoState {
  todos = $state<string[]>([]);

  add = (text: string) => {
    this.todos.push(text); // Arrow function captures `this`
  };
}
```
