### TW2.9 Prefer gap-* Over space-x-*/space-y-* for Flex and Grid Spacing

**Impact: MEDIUM (space-* breaks with wrapping and conditionally rendered children)**

Prefer `gap-*` over `space-x-*`/`space-y-*` for spacing flex and grid children. `gap` works correctly with wrapping, doesn't use margin hacks (`> * + *` selectors), and has no issues with conditionally rendered children.

**Incorrect: space-x breaks on wrap**

```html
<div class="flex flex-wrap space-x-4">
  <span>Tag 1</span>
  <span>Tag 2</span>
</div>
```

**Correct: gap works correctly with wrapping**

```html
<div class="flex flex-wrap gap-4">
  <span>Tag 1</span>
  <span>Tag 2</span>
</div>
```
