### TW1.4 Build with Utilities First, Extract Only When Duplicated

**Impact: HIGH (premature abstraction creates rigid, hard-to-change code)**

Build everything with utilities first. Only extract components when you see the same pattern repeated 3+ times. Premature abstraction creates components that are hard to modify because they serve imagined future needs rather than actual current patterns.

**Incorrect: extracting a Badge component used exactly once**

```jsx
// Created before any duplication exists
function Badge({ children }) { /* ... */ }
// Used in exactly one place
```

**Correct: use utilities inline until genuine repetition emerges**

```html
<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
  Active
</span>
<!-- When this pattern appears 3+ times, THEN extract a <Badge> component -->
```
