### TW2.3 Prefer Shorthand Utilities to Reduce Class Count

**Impact: MEDIUM (cleaner markup, fewer classes to read)**

Use axis-based (`mx-`, `py-`) or all-sides (`p-`, `m-`) utilities when values are symmetric. The `eslint-plugin-tailwindcss/enforces-shorthand` rule catches this automatically.

**Incorrect: redundant per-side utilities**

```html
<div class="ml-2 mr-2 pt-4 pb-4">
```

**Correct: shorthand axis utilities**

```html
<div class="mx-2 py-4">
```
