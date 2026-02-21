### 8.1 Use group/group-hover: for Styling Children Based on Parent State

**Impact: HIGH (eliminates JavaScript class toggling for parent-child interactions)**

Use `group` on a parent and `group-hover:`, `group-focus:`, etc. on children to style child elements based on parent state. This is pure CSS — no JavaScript needed for hover/focus propagation.

**Incorrect: JavaScript event handlers to toggle child classes**

```html
<div onmouseenter="..." onmouseleave="...">
  <span id="child">Show on hover</span>
</div>
```

**Correct: group modifier for CSS-only parent-child state**

```html
<div class="group cursor-pointer rounded p-4">
  <span class="text-gray-500 group-hover:text-blue-500 group-hover:underline">
    Show on hover
  </span>
</div>
```
