### 5.2 Use Semantic Color Names Instead of Raw Palette Colors

**Impact: HIGH (raw palette colors allow inconsistent usage across a codebase)**

Replace Tailwind's default palette (`blue-500`, `gray-200`) with project-specific semantic names (`primary`, `surface`, `on-surface`). Semantic tokens enforce design system consistency and make theming/rebranding trivial.

**Incorrect: raw palette colors scattered throughout**

```html
<button class="bg-blue-500 hover:bg-blue-600 text-white">Save</button>
<a class="text-blue-600 hover:text-blue-700">Link</a>
```

**Correct: semantic tokens via theme config**

```css
/* Tailwind v4 */
@theme {
  --color-primary: oklch(0.55 0.24 262);
  --color-primary-hover: oklch(0.48 0.24 262);
}
```
```html
<button class="bg-primary hover:bg-primary-hover text-white">Save</button>
```
