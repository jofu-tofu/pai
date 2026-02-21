### 7.3 Extract Repeated Arbitrary Values into Theme Tokens

**Impact: HIGH (arbitrary values bypass the design system and increase CSS output)**

Arbitrary values (`p-[13px]`, `w-[237px]`) are an escape hatch, not a primary tool. Each unique arbitrary value generates a unique CSS class. If an arbitrary value appears in more than one file, extract it to a theme token.

**Incorrect: same arbitrary values in multiple files**

```html
<!-- ComponentA.tsx -->
<div class="w-[340px] p-[13px]">
<!-- ComponentB.tsx -->
<div class="max-w-[340px] p-[13px]">
```

**Correct: extract to theme tokens**

```css
@theme {
  --width-card: 340px;
  --spacing-card: 0.8125rem;
}
```
```html
<div class="w-card p-card">
```
