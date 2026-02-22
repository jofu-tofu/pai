### TW5.5 Verify WCAG AA Contrast Ratios for Text Colors

**Impact: CRITICAL (Tailwind defaults do NOT guarantee contrast compliance)**

Ensure text meets WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for large text. Tailwind's default palette does not guarantee compliance — for example, `text-gray-400` (#9ca3af) on white has only ~2.9:1 ratio, failing WCAG AA. Verify both light and dark mode.

**Incorrect: gray-400 on white fails WCAG AA (2.9:1 ratio)**

```html
<p class="bg-white text-gray-400">Low contrast text</p>
```

**Correct: gray-600 on white passes WCAG AA (7.0:1 ratio)**

```html
<p class="bg-white text-gray-600">Readable text</p>
```
