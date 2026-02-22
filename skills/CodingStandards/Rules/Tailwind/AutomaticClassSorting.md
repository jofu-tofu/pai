### TW2.1 Use Prettier Plugin for Consistent Class Ordering

**Impact: HIGH (eliminates class ordering debates and merge conflicts)**

Install `prettier-plugin-tailwindcss` to automatically sort utility classes in a consistent order. The plugin follows the box model: layout/positioning → box model → borders → backgrounds → typography → decorative. The order is intentionally not customizable (same philosophy as Prettier itself).

**Incorrect: random/inconsistent class ordering**

```html
<div class="text-white rounded-lg flex bg-blue-500 p-4 items-center shadow-md">
```

**Correct: sorted by Prettier plugin**

```html
<div class="flex items-center rounded-lg bg-blue-500 p-4 text-white shadow-md">
```
