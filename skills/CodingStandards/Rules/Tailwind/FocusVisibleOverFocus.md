### 6.2 Use focus-visible: Instead of focus: for Keyboard Focus Rings

**Impact: CRITICAL (focus: shows rings on mouse clicks too, annoying users)**

Use `focus-visible:` variant instead of `focus:`. `focus-visible` only shows focus indicators during keyboard navigation, not mouse clicks. This provides proper keyboard accessibility without visual noise for mouse users.

**Incorrect: focus ring appears on mouse click**

```html
<button class="focus:ring-2 focus:ring-blue-500">Click</button>
```

**Correct: focus ring only for keyboard navigation**

```html
<button class="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
  Click
</button>
```
