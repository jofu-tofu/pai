### TW5.1 Always Pair Icon-Only Buttons with Screen Reader Text

**Impact: CRITICAL (icon-only buttons without labels are invisible to screen readers)**

Icon-only buttons and links MUST include screen-reader-accessible text using Tailwind's `sr-only` class. Tailwind handles styling, not semantics — you are responsible for semantic HTML and ARIA attributes.

**Incorrect: no accessible label**

```html
<button class="p-2">
  <svg><!-- close icon --></svg>
</button>
```

**Correct: sr-only text provides accessible label**

```html
<button class="p-2" aria-label="Close dialog">
  <svg aria-hidden="true"><!-- close icon --></svg>
  <span class="sr-only">Close dialog</span>
</button>
```
