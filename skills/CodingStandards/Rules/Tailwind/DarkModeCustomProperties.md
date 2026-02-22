### TW4.3 Use CSS Custom Properties to Reduce dark: Repetition

**Impact: HIGH (reduces dark: variants from every element to a single definition)**

Define light/dark color values as CSS custom properties and reference them via Tailwind config. This avoids duplicating `dark:` on every element and enables multi-theme support beyond just light/dark.

**Incorrect: dark: prefix on every single element**

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <p class="text-gray-600 dark:text-gray-300">Body</p>
  <span class="text-gray-500 dark:text-gray-400">Muted</span>
</div>
```

**Correct: CSS custom properties toggled once at root**

```css
:root { --color-bg: #ffffff; --color-text: #111827; --color-muted: #4b5563; }
.dark { --color-bg: #111827; --color-text: #ffffff; --color-muted: #d1d5db; }
```
```html
<div class="bg-[var(--color-bg)] text-[var(--color-text)]">
  <p class="text-[var(--color-muted)]">Body</p>
</div>
```
