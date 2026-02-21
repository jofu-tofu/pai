### 4.4 Pick One Spacing Direction Convention or Use Gap

**Impact: MEDIUM (mixing margin directions causes unpredictable spacing)**

Pick one margin direction convention (`mt-`/`ml-` or `mb-`/`mr-`) and stick with it. Better yet, use `space-y-*` on parent containers or `gap-*` on flex/grid parents to eliminate the problem entirely.

**Incorrect: inconsistent margin directions**

```html
<h2 class="mb-4">Title</h2>
<p class="mt-6">Content</p>
```

**Correct: consistent spacing via parent**

```html
<div class="space-y-4">
  <h2>Title</h2>
  <p>Content</p>
</div>
```
