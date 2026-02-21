### 2.2 Never Apply Conflicting Utility Classes

**Impact: HIGH (contradicting classes produce unpredictable results)**

Never apply two utilities that set the same CSS property to different values on the same element. The winning class depends on CSS source order, not class attribute order, making the result unpredictable. The `eslint-plugin-tailwindcss/no-contradicting-classname` rule catches this automatically.

**Incorrect: conflicting padding values**

```html
<div class="p-3 p-4 text-sm text-lg">
```

**Correct: single value per property**

```html
<div class="p-4 text-lg">
```
