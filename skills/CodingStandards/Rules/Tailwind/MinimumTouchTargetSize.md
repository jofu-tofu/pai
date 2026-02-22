### TW5.4 Interactive Elements Must Meet Minimum 44x44px Touch Target

**Impact: CRITICAL (small touch targets cause mis-taps on mobile devices)**

Interactive elements must meet WCAG 2.5.8 minimum target size of 24x24px (Level AA), with 44x44px recommended (Level AAA). Use `min-h-11 min-w-11` (44px in Tailwind's default scale) to expand small icons into adequate touch targets.

**Incorrect: tiny touch target**

```html
<button class="p-1">
  <svg class="h-4 w-4"><!-- icon --></svg>
</button>
```

**Correct: minimum 44x44px touch target**

```html
<button class="inline-flex min-h-11 min-w-11 items-center justify-center p-2">
  <svg class="h-5 w-5" aria-hidden="true"><!-- icon --></svg>
  <span class="sr-only">Delete item</span>
</button>
```
