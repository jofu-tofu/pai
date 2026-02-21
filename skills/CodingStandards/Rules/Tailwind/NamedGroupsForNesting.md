### 8.2 Use Named Groups When Nesting Multiple Group Contexts

**Impact: HIGH (unnamed nested groups cause ambiguous targeting)**

When group contexts are nested, use named groups (`group/card`, `group/item`) so inner children can target the correct ancestor. Without naming, `group-hover:` targets the nearest `group` parent, which may not be intended.

**Incorrect: ambiguous unnamed nested groups**

```html
<div class="group">
  <div class="group">
    <span class="group-hover:text-red-500">
      <!-- Targets inner group, but was outer intended? -->
    </span>
  </div>
</div>
```

**Correct: named groups for explicit targeting**

```html
<div class="group/card">
  <div class="group/item">
    <span class="group-hover/card:text-red-500 group-hover/item:underline">
      Explicitly targets both ancestors
    </span>
  </div>
</div>
```
