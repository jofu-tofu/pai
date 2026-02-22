### SV1.10 Use Classes for Complex State Models

**Impact: HIGH (encapsulates state, methods, and computed properties together)**

For state with multiple operations and computed values, use a class with `$state` fields. This keeps related logic together and provides a clean API.

**Incorrect: scattered state and functions**

```typescript
// state.svelte.ts
let todos = $state<Todo[]>([]);
let filter = $state<'all' | 'active' | 'done'>('all');

export function getTodos() { return todos; }
export function getFilter() { return filter; }
export function addTodo(text: string) { todos.push({ text, done: false }); }
export function toggleTodo(i: number) { todos[i].done = !todos[i].done; }
export function getFiltered() {
  if (filter === 'all') return todos;
  return todos.filter(t => filter === 'done' ? t.done : !t.done);
}
```

**Correct: class encapsulates everything**

```typescript
// state.svelte.ts
class TodoState {
  todos = $state<Todo[]>([]);
  filter = $state<'all' | 'active' | 'done'>('all');

  get filtered() {
    if (this.filter === 'all') return this.todos;
    return this.todos.filter(t =>
      this.filter === 'done' ? t.done : !t.done
    );
  }

  add = (text: string) => {
    this.todos.push({ text, done: false });
  };

  toggle = (i: number) => {
    this.todos[i].done = !this.todos[i].done;
  };
}

export const todoState = new TodoState();
```
