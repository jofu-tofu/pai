### TW1.2 Limit @apply to Third-Party Style Overrides Only

**Impact: CRITICAL (breaks utility-first paradigm and increases CSS bundle size)**

The `@apply` directive re-introduces the problems Tailwind solves: naming things, coupled changes, growing CSS bundles. The Tailwind team actively discourages `@apply` in v4. Use it only to override third-party library styles where you cannot control the markup. For your own code, extract framework components instead.

**Incorrect: @apply for reusable button style**

```css
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
```

**Correct: utility classes in markup, or extract a component**

```html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Save
</button>
```
