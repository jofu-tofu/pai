### TW3.2 Use Standard Breakpoints, Not Arbitrary min-[...] Values

**Impact: HIGH (ad-hoc breakpoints create visual inconsistency)**

Use Tailwind's default breakpoints consistently. Avoid `min-[840px]` or `max-[1100px]` — they create inconsistency and are harder to maintain. If your design system needs different breakpoints, redefine them in the Tailwind config globally.

**Incorrect: ad-hoc arbitrary breakpoints**

```html
<div class="min-[840px]:flex min-[1100px]:grid">
```

**Correct: standard breakpoints from config**

```html
<div class="md:flex lg:grid">
```
