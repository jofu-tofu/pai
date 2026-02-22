### TW1.3 Extract Framework Components, Not CSS Classes

**Impact: CRITICAL (components encapsulate structure + style; CSS classes only encapsulate style)**

When utility combinations repeat, extract a reusable framework component (React, Vue, Svelte), NOT a CSS class with `@apply`. Components encapsulate both markup structure and styling, making changes safer and more maintainable.

**Incorrect: creating a CSS abstraction with @apply**

```css
.card {
  @apply rounded-lg shadow-md p-6 bg-white;
}
```

**Correct: extract a framework component**

```jsx
function Card({ children }) {
  return (
    <div className="rounded-lg shadow-md p-6 bg-white">
      {children}
    </div>
  );
}
```
