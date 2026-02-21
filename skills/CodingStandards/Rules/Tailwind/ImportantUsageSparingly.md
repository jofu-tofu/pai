### 2.4 Use the Important Modifier Only as a Last Resort

**Impact: MEDIUM (overusing ! creates specificity wars)**

Tailwind's `!` modifier (e.g., `!text-red-500`) maps to CSS `!important`. Use it only to override third-party styles you cannot control. In Tailwind v4, cascade layers handle specificity correctly, making `!important` even less necessary. If you find yourself using `!` on your own components, the real fix is restructuring your class application.

**Incorrect: ! modifier to fix self-inflicted specificity issue**

```html
<div class="text-blue-500 !text-red-500">
```

**Correct: remove the conflicting class instead**

```html
<div class="text-red-500">
```
