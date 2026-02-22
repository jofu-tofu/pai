### TW5.7 Only Safelist Classes That Are Genuinely Dynamic from External Sources

**Impact: HIGH (over-safelisting bloats CSS bundle and defeats tree-shaking)**

The safelist forces Tailwind to generate classes even if they aren't detected in source files. Use it only for truly dynamic classes from CMS content or user-selected themes. Prefer lookup maps in code over safelisting.

**Incorrect: safelisting hundreds of classes "just in case"**

```js
safelist: [
  { pattern: /bg-(red|blue|green|yellow)-(100|200|300|400|500|600|700|800|900)/ },
]
```

**Correct: safelist only what's genuinely dynamic**

```js
safelist: ['bg-brand-primary', 'bg-brand-secondary']
// And prefer lookup maps in source code over safelisting
```
