### TW5.9 Include All File Types That Reference Tailwind Classes in Content Config

**Impact: CRITICAL (missing paths cause used classes to be stripped in production)**

In v3, configure the `content` array to include all files that reference Tailwind classes — HTML, JSX, TSX, Vue, Svelte, and JS files that dynamically toggle classes. In v4, auto-detection handles most cases, but use `@source` for non-standard paths.

**Incorrect: content config misses JSX/TSX files**

```js
// tailwind.config.js (v3)
content: ['./src/**/*.html']
// Misses .jsx, .tsx, .vue, .svelte files
```

**Correct: include all file types that use Tailwind**

```js
// tailwind.config.js (v3)
content: ['./src/**/*.{html,js,jsx,ts,tsx,vue,svelte}']
```
```css
/* v4: auto-detects, but add non-standard paths if needed */
@import "tailwindcss";
@source "../content/**/*.md";
```
