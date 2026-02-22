### TW2.8 Use Flex for One-Dimensional, Grid for Two-Dimensional Layouts

**Impact: MEDIUM (wrong layout model adds complexity for no benefit)**

Use flexbox (`flex`) for one-dimensional layouts: nav bars, button groups, centering. Use CSS grid (`grid`) for two-dimensional layouts: card grids, page layouts, form layouts. Do not force grid behavior with flex or vice versa.

**Incorrect: flex with manual widths to simulate a grid**

```html
<div class="flex flex-wrap">
  <div class="w-1/3 p-2">Card</div>
  <div class="w-1/3 p-2">Card</div>
  <div class="w-1/3 p-2">Card</div>
</div>
```

**Correct: grid for actual grid layouts**

```html
<div class="grid grid-cols-3 gap-4">
  <div>Card</div>
  <div>Card</div>
  <div>Card</div>
</div>
```
