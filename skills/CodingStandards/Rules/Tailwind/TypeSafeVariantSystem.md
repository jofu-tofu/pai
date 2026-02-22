### TW1.5 Use a Type-Safe Variant System for Component Variants

**Impact: HIGH (eliminates error-prone string concatenation for variants)**

Use a variant management library like Class Variance Authority (CVA) to define component variants declaratively. Combine with `clsx` and `tailwind-merge` for conditional and overridable classes. Alternatives include `tailwind-variants` and manual lookup maps — the key principle is type-safe, declarative variant definitions rather than string concatenation.

**Incorrect: manual string concatenation for variants**

```jsx
function Button({ variant, size }) {
  let classes = "px-4 py-2 rounded";
  if (variant === "primary") classes += " bg-blue-500 text-white";
  if (size === "sm") classes += " text-sm px-2 py-1";
  return <button className={classes}>...</button>;
}
```

**Correct: declarative variant definition with CVA**

```jsx
import { cva } from "class-variance-authority";

const button = cva("rounded font-medium", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    },
    size: {
      sm: "text-sm px-2 py-1",
      md: "text-base px-4 py-2",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

function Button({ variant, size, className }) {
  return <button className={button({ variant, size, className })}>...</button>;
}
```
