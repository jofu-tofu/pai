### 4.1 Understand Mobile-First Breakpoint Behavior

**Impact: CRITICAL (misunderstanding breakpoints causes broken layouts)**

Tailwind uses min-width breakpoints. Unprefixed utilities apply to ALL screen sizes. `sm:` means "640px and above," NOT "small screens." Style mobile first with unprefixed utilities, then add overrides for larger screens with `sm:`, `md:`, `lg:`.

**Incorrect: wrong mental model — trying to target "small screens" with sm:**

```html
<!-- This makes it flex on mobile, block on 640px+ (backwards!) -->
<div class="flex sm:block">
```

**Correct: mobile-first — start with mobile layout, override upward**

```html
<div class="block sm:flex sm:items-center lg:justify-between">
```
