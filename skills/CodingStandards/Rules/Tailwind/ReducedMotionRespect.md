### TW5.3 Provide motion-reduce: Alternatives for All Animations

**Impact: HIGH (users with vestibular disorders experience discomfort from animations)**

Use `motion-reduce:` variant to disable or simplify animations for users who have enabled "prefer reduced motion" in OS settings. Apply to all transitions and animations.

**Incorrect: animation with no reduced-motion alternative**

```html
<div class="transition-transform duration-300 hover:scale-105">
```

**Correct: motion-reduce variant disables the animation**

```html
<div class="transition-transform duration-300 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100">
```
