# Philosophy — Tailwind CSS

> Tailwind is a utility-first framework where styling lives in markup, abstractions are framework components not CSS classes, and premature extraction is the primary enemy of maintainability.

## Mental Model

Tailwind inverts the traditional CSS workflow. Instead of inventing semantic class names, writing CSS in external files, and linking them to markup, you compose small single-purpose utility classes directly on elements. This co-locates style with structure, eliminates naming overhead, and makes every change locally scoped. The consequence is that your CSS bundle only contains what you actually use, and deleting an element deletes its styles with it.

The philosophy has three pillars. First, utilities are the primary API. Every styling decision should be expressible as a utility class applied in markup. Custom CSS is the escape hatch, not the default. Second, when utility combinations repeat, the correct abstraction is a framework component (React, Vue, Svelte), not a CSS class built with `@apply`. Components encapsulate both structure and style, whereas CSS classes only encapsulate style. A `<Card>` component captures the div structure, the padding, the shadow, and the rounded corners as a single reusable unit. An `.card` CSS class captures only the visual properties, leaving the markup to be duplicated or diverge. Third, abstraction should be deferred until genuine repetition exists. Building a component after seeing the same pattern once is premature; building it after three occurrences is informed by real usage.

The `@apply` directive exists for a narrow use case: overriding third-party library styles where you cannot control the markup. In v4, the Tailwind team actively discourages `@apply` for your own code. Every `@apply` usage re-introduces the problems Tailwind was designed to solve: naming things, coupled changes, and growing CSS bundles.

Variant systems like Class Variance Authority (CVA) extend the philosophy to component variants. Instead of manual string concatenation or conditional class logic, CVA provides a declarative, type-safe way to define variant combinations. This keeps the utility-first approach intact while managing the complexity of multi-variant components. The key principle is that variant definitions should be declarative lookup structures, not imperative string-building code.

Finally, Tailwind utilities belong only in UI-level components (Button, Card, Input). Domain-level components (CheckoutForm, UserProfile) should compose UI components without reaching for raw utilities. This separation enforces design system consistency and prevents visual duplication across the codebase.

## Consumer Guide

### When Reviewing Code

Check whether new CSS files or `@apply` blocks have been introduced. If so, determine whether the styling could have been achieved with utility classes in markup or by extracting a framework component. Look for string concatenation patterns in variant logic that should be replaced with CVA or a lookup map. Verify that domain components compose UI components rather than applying Tailwind utilities directly. Flag any component extraction that serves only one call site — single-use components are premature abstractions.

### When Designing / Planning

Plan the component hierarchy with a clear boundary between UI primitives and domain composites. UI primitives own their Tailwind utilities and expose a variant API (via CVA or props). Domain components compose those primitives. When designing a new visual pattern, default to inline utilities. Only propose a shared component when the pattern will appear in three or more distinct locations. If a third-party library requires style overrides, plan for a thin CSS override layer using `@apply` and document why.

### When Implementing

Start every element with utility classes in markup. Resist the urge to create a CSS file. When a utility combination appears a third time, extract a framework component. Use CVA for components with multiple variant axes (size, color, state). Combine CVA with `clsx` and `tailwind-merge` for conditional and overridable classes. Keep `@apply` strictly limited to third-party style overrides. In domain components, import and compose UI primitives instead of writing raw utilities.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [UtilityFirstApproach](../../Rules/Tailwind/UtilityFirstApproach.md) | CRITICAL | Style with utility classes in markup, not custom CSS files |
| [AvoidApplyOveruse](../../Rules/Tailwind/AvoidApplyOveruse.md) | CRITICAL | Limit @apply to third-party style overrides only |
| [ExtractComponentsNotClasses](../../Rules/Tailwind/ExtractComponentsNotClasses.md) | CRITICAL | Extract framework components, not CSS classes with @apply |
| [AvoidPrematureAbstraction](../../Rules/Tailwind/AvoidPrematureAbstraction.md) | HIGH | Build with utilities first, extract only after 3+ repetitions |
| [TypeSafeVariantSystem](../../Rules/Tailwind/TypeSafeVariantSystem.md) | HIGH | Use CVA or typed lookup maps for component variants |
| [SeparateDomainFromUI](../../Rules/Tailwind/SeparateDomainFromUI.md) | HIGH | Apply Tailwind only in UI components, not domain components |

## Rule Interactions

- **UtilityFirstApproach + AvoidApplyOveruse** reinforce each other: if you follow utility-first, `@apply` becomes unnecessary for your own code. Violating one causes violations of the other.
- **ExtractComponentsNotClasses + AvoidPrematureAbstraction** create a deliberate tension: extract components (not classes), but only when repetition justifies it. The threshold is three occurrences.
- **TypeSafeVariantSystem + SeparateDomainFromUI** work together at the component boundary: CVA defines the variant API that domain components consume without touching raw utilities.
- **AvoidApplyOveruse + ExtractComponentsNotClasses** share the same root cause: reaching for CSS abstractions instead of component abstractions. Fix one and you typically fix both.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **CSS-first development**: Creating `.component-name` classes in external stylesheets as the default workflow. This abandons Tailwind's core value proposition and grows the CSS bundle unboundedly.
- **@apply as component styling**: Using `@apply` to build reusable button, card, or form styles. This re-introduces naming overhead, coupled changes, and bundle bloat. Extract a framework component instead.

### HIGH

- **Premature component extraction**: Creating a `<Badge>` component when only one badge exists in the entire application. The component adds indirection without providing reuse value. Wait for three occurrences.
- **String concatenation variants**: Building variant logic with `if/else` chains and string concatenation instead of a declarative variant system. Error-prone, hard to type-check, and impossible to statically analyze.
- **Domain components with raw utilities**: A `<CheckoutForm>` that directly applies `rounded-lg bg-white p-6 shadow` instead of composing a `<Card>` component. Visual duplication becomes invisible and design consistency erodes.

### MEDIUM

- **Over-componentization**: Extracting every two-class combination into a component. The overhead of component files, imports, and props exceeds the cost of a few repeated utility strings.

## Examples

**Correct philosophy applied end-to-end:**

```jsx
// UI component: owns Tailwind utilities, exposes variant API
import { cva } from "class-variance-authority";

const button = cva("rounded font-medium transition-colors", {
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

function Button({ variant, size, className, children }) {
  return <button className={button({ variant, size, className })}>{children}</button>;
}

// Domain component: composes UI components, no raw utilities
function CheckoutForm() {
  return (
    <Card>
      <Input placeholder="Card number" />
      <Button variant="primary">Pay</Button>
    </Card>
  );
}
```

**Anti-pattern: @apply-based reuse**

```css
/* This defeats Tailwind's purpose */
.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300;
}
```

## Does Not Cover

- Class ordering and sorting conventions (see ClassOrganization dimension)
- Responsive breakpoint strategy (see ResponsiveDesign dimension)
- Dark mode and theming token architecture (see Theming dimension)
- Accessibility utilities like sr-only and focus-visible (see Accessibility dimension)
- Build configuration and content paths (see Accessibility dimension, build safety rules)

## Sources

- Tailwind CSS official documentation: "Utility-First Fundamentals"
- Adam Wathan, "CSS Utility Classes and Separation of Concerns"
- CVA (Class Variance Authority) documentation
- Tailwind v4 release notes on @apply deprecation guidance
