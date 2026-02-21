### 6.1 Use Route Groups for Layout Organization

**Impact: MEDIUM (organizes routes that share layouts without affecting URLs)**

Use route groups `(groupName)` to organize routes that share a layout or need to break out of a parent layout. Groups don't affect the URL path.

**Incorrect: duplicating layout logic across routes**

```
routes/
  login/+page.svelte     ← No shared auth layout
  register/+page.svelte  ← Duplicates auth layout
  dashboard/+page.svelte ← Different layout entirely
```

**Correct: route groups share layouts**

```
routes/
  (auth)/
    +layout.svelte       ← Shared auth layout (centered card)
    login/+page.svelte
    register/+page.svelte
  (app)/
    +layout.svelte       ← Shared app layout (sidebar + nav)
    dashboard/+page.svelte
    settings/+page.svelte
```
