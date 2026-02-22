### TW4.4 In v4, Use @theme for Tokens That Need Utility Classes [v4]

**Impact: HIGH (only @theme generates corresponding utility classes)**

In Tailwind v4, `@theme` both defines CSS custom properties AND generates utility classes. Use `@theme` for design tokens that should be usable as utilities (colors, spacing, fonts). Use `:root` for values that don't need utilities (transition speeds, z-index layers).

**Incorrect: :root for values you want as utilities**

```css
:root { --brand-color: #3b82f6; }
/* No bg-brand-color or text-brand-color utility is generated */
```

**Correct: @theme for values that need utility classes**

```css
@theme {
  --color-brand: #3b82f6; /* Generates bg-brand, text-brand, border-brand, etc. */
}
:root {
  --transition-speed: 200ms; /* No utility needed */
}
```
