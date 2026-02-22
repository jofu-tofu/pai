### TW4.1 Choose Media vs Selector Dark Mode Strategy Deliberately

**Impact: CRITICAL (wrong strategy prevents user-togglable dark mode)**

Choose between `media` (follows OS preference automatically) and `selector` (manual toggle via class or data attribute). Use `selector` if you need a user-controlled toggle. Use `media` only if you never need manual control. In v3.4.1+, `selector` replaces the older `class` strategy with more flexibility.

**Incorrect: using media strategy but trying to toggle with JS**

```js
// tailwind.config.js — darkMode: 'media' (default)
// This does NOTHING with media strategy:
document.documentElement.classList.add('dark');
```

**Correct: selector strategy for user-controlled toggle**

```js
// tailwind.config.js
darkMode: 'selector',
```
```js
// Toggle in JS
document.documentElement.classList.toggle('dark');
```
