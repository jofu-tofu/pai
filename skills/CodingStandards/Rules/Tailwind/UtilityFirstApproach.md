### TW1.1 Style with Utility Classes, Not Custom CSS Files

**Impact: CRITICAL (utility-first is the core Tailwind paradigm)**

Style elements directly in markup using utility classes. Do not default to writing custom CSS in external stylesheets. Utilities are the primary API of Tailwind — they co-locate style with structure, eliminate naming overhead, and make changes isolated.

**Incorrect: custom CSS class in external stylesheet**

```css
/* styles.css */
.card-header {
  padding: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
}
```
```html
<div class="card-header">Title</div>
```

**Correct: utility classes directly in markup**

```html
<div class="p-4 text-xl font-bold text-gray-900">Title</div>
```
