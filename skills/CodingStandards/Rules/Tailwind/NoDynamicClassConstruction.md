### TW5.6 Never Construct Class Names with String Interpolation

**Impact: CRITICAL (dynamically constructed classes are silently purged in production)**

Tailwind scans source files as plain text for complete class strings. It cannot parse string interpolation, concatenation, or template literals. Dynamically constructed class names will not be included in the CSS output. Always use complete, unbroken class strings in lookup maps.

**Incorrect: Tailwind cannot detect these classes**

```jsx
<div className={`bg-${color}-500 text-${size}`}>
<div className={"bg-" + color + "-500"}>
```

**Correct: complete class strings in a lookup map**

```jsx
const colorMap = {
  blue: "bg-blue-500 text-white",
  red: "bg-red-500 text-white",
  green: "bg-green-500 text-white",
};
<div className={colorMap[color]}>
```
