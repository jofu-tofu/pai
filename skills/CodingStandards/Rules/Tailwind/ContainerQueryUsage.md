### 4.3 Use Container Queries for Component-Level Responsive Design [v4]

**Impact: HIGH (makes components truly portable across layout contexts)**

Use `@container` queries for components that must adapt to their parent's width, not the viewport. Mark the parent with `@container` and use `@sm:`, `@md:` on children. This makes components work correctly whether placed in a full-width area or a narrow sidebar.

**Incorrect: viewport-based — breaks when component is in a sidebar**

```html
<div class="grid grid-cols-1 md:grid-cols-3">
  <div>Card</div>
```

**Correct: container-based — responds to actual available space**

```html
<div class="@container">
  <div class="grid grid-cols-1 @md:grid-cols-3">
    <div>Card</div>
```
