# Tailwind CSS Workflow

> **Trigger:** File signals: `tailwind.config.*`, `@tailwind`, `@apply`, `@theme`, `@import "tailwindcss"`, `class="` with utility patterns, `.css` files with Tailwind directives

> **Version scope:** These rules target **Tailwind CSS v3.4+** and **v4**. Rules that are v4-specific are marked with **[v4]**. Migration/setup tasks are intentionally excluded as one-time operations, not ongoing coding standards.

## Purpose

Apply Tailwind CSS coding standards covering utility-first philosophy, class organization, component extraction, responsive design, dark mode & theming, accessibility, performance & build safety, and state modifiers & layout across 32 rules in 8 priority categories.

## Reference Material

- `../Dimensions/Tailwind/` — 32 rules inlined across 8 categories

## Quick Decision Tree

**Start here when writing/reviewing Tailwind CSS code:**

1. **Writing custom CSS instead of utilities?** → Category 1: Utility-First Philosophy (CRITICAL)
2. **Class ordering or conflicting classes?** → Category 2: Class Organization (HIGH)
3. **Extracting reusable patterns?** → Category 3: Component Extraction (HIGH)
4. **Responsive breakpoints or spacing?** → Category 4: Responsive Design (CRITICAL)
5. **Dark mode or theming setup?** → Category 5: Dark Mode & Theming (HIGH)
6. **Screen readers, focus, contrast?** → Category 6: Accessibility (CRITICAL)
7. **Dynamic classes or build config?** → Category 7: Performance & Build Safety (CRITICAL)
8. **Group/peer modifiers or layout?** → Category 8: State Modifiers & Layout (HIGH)

**For detailed implementation:** Read the relevant dimension file from `../Dimensions/Tailwind/` folder (rules are inlined).

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern |
|----------|----------|--------|-------------|
| 1 | Utility-First Philosophy | CRITICAL | Utilities in markup, no @apply, extract components |
| 2 | Responsive Design | CRITICAL | Mobile-first breakpoints, standard breakpoints, gap |
| 3 | Accessibility | CRITICAL | sr-only, focus-visible, reduced motion, touch targets |
| 4 | Performance & Build Safety | CRITICAL | No dynamic classes, content paths, limit arbitrary |
| 5 | Class Organization | HIGH | Prettier sorting, no conflicts, shorthand |
| 6 | Component Extraction | HIGH | CVA variants, domain vs UI separation |
| 7 | Dark Mode & Theming | HIGH | Selector strategy, semantic tokens, @theme |
| 8 | State Modifiers & Layout | HIGH | group/peer modifiers, flex vs grid, gap |

## Top 10 High-Impact Rules

These provide the largest code quality gains:

1. **NoDynamicClassConstruction** — Never interpolate class names; use complete strings
2. **UtilityFirstApproach** — Style with utility classes, not custom CSS files
3. **MobileFirstBreakpoints** — Unprefixed = all screens, sm: = 640px+
4. **ScreenReaderOnlyUsage** — Always pair icon-only buttons with sr-only text
5. **FocusVisibleOverFocus** — Use focus-visible: instead of focus: for keyboard rings
6. **ContentConfigurationPaths** — Include all file types that reference Tailwind classes
7. **AvoidApplyOveruse** — Limit @apply to third-party overrides only
8. **ExtractComponentsNotClasses** — Extract framework components, not CSS classes
9. **AutomaticClassSorting** — Use prettier-plugin-tailwindcss for consistent ordering
10. **ContrastRatioCompliance** — Verify WCAG AA contrast ratios for text colors

## Examples

**Example 1: Dynamic Class Names**
```jsx
// Problem: string interpolation — classes silently purged
<div className={`bg-${color}-500`}>

// Solution: NoDynamicClassConstruction rule
const colorMap = {
  blue: "bg-blue-500 text-white",
  red: "bg-red-500 text-white",
};
<div className={colorMap[color]}>
```

**Example 2: Mobile-First Responsive**
```html
<!-- Problem: wrong mental model for sm: -->
<div class="flex sm:block">

<!-- Solution: MobileFirstBreakpoints rule -->
<div class="block sm:flex sm:items-center lg:justify-between">
```

**Example 3: Accessible Icon Button**
```html
<!-- Problem: no accessible label -->
<button class="p-2">
  <svg><!-- icon --></svg>
</button>

<!-- Solution: ScreenReaderOnlyUsage rule -->
<button class="p-2" aria-label="Close dialog">
  <svg aria-hidden="true"><!-- icon --></svg>
  <span class="sr-only">Close dialog</span>
</button>
```

**Example 4: Component Variants**
```jsx
// Problem: manual string concatenation
let classes = "px-4 py-2 rounded";
if (variant === "primary") classes += " bg-blue-500";

// Solution: TypeSafeVariantSystem rule (CVA)
const button = cva("rounded font-medium", {
  variants: { variant: { primary: "bg-blue-500 text-white" } },
});
```

## How to Use Rules

**Pattern:** When applying a rule, find it in the relevant dimension file from `../Dimensions/Tailwind/` (rules are inlined).

```
Decision tree identifies: Category 7 (Performance & Build Safety)
Quick ref shows: NoDynamicClassConstruction rule
Action: Read ../Dimensions/Tailwind/NoDynamicClassConstruction.md (rule is inlined in the dimension file)
Result: Complete code examples and implementation guidance
```

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `no-dynamic-class-construction` → search in the relevant dimension file
- `mobile-first-breakpoints` → search in the relevant dimension file
- `screen-reader-only-usage` → search in the relevant dimension file

## Complete Rule Index

### 1. Utility-First Philosophy (CRITICAL)
- UtilityFirstApproach
- AvoidApplyOveruse
- ExtractComponentsNotClasses

### 2. Class Organization (HIGH)
- AutomaticClassSorting
- NoContradictingClasses
- UseShorthandUtilities
- ImportantUsageSparingly

### 3. Component Extraction (HIGH)
- AvoidPrematureAbstraction
- TypeSafeVariantSystem
- SeparateDomainFromUI

### 4. Responsive Design (CRITICAL)
- MobileFirstBreakpoints
- BreakpointConsistency
- ContainerQueryUsage
- ConsistentSpacingDirection

### 5. Dark Mode & Theming (HIGH)
- DarkModeStrategyChoice
- SemanticColorTokens
- DarkModeCustomProperties
- ThemeOverRootForTokens

### 6. Accessibility (CRITICAL)
- ScreenReaderOnlyUsage
- FocusVisibleOverFocus
- ReducedMotionRespect
- MinimumTouchTargetSize
- ContrastRatioCompliance

### 7. Performance & Build Safety (CRITICAL)
- NoDynamicClassConstruction
- SafelistSparingly
- LimitArbitraryValues
- ContentConfigurationPaths

### 8. State Modifiers & Layout (HIGH)
- GroupModifierForParentState
- NamedGroupsForNesting
- PeerModifierOrdering
- FlexVsGridSelection
- GapOverSpaceBetween

## Out of Scope

v4 migration tasks (CSS-first config setup, PostCSS plugin changes) are excluded — they are one-time setup, not ongoing coding standards.

## Integration

This skill integrates with PAI's code generation and review workflows. When writing or reviewing Tailwind CSS code, these patterns ensure consistent, accessible, and performant utility-first styling.

**Sources:** Tailwind official docs (v3/v4), prettier-plugin-tailwindcss, eslint-plugin-tailwindcss, Adam Wathan, Evil Martians, Atomic Object, Steve Kinney, CVA docs, WCAG 2.5.8

## Dimensional Loading

For agents that need focused subsets rather than the full rule set, read `../Dimensions/Tailwind/INDEX.md` for a routing table.

| Dimension | File | Rule Count | Load When |
|-----------|------|------------|-----------|
| Philosophy | Philosophy.md | 6 | Utility-first approach, component extraction, @apply decisions |
| Class Organization | ClassOrganization.md | 9 | Class ordering, conflicts, state modifiers, layout |
| Layout and Theming | LayoutAndTheming.md | 4 | Breakpoints, mobile-first, container queries, spacing |

| Accessibility | Accessibility.md | 9 | Screen readers, focus, motion, touch targets, build safety |

**Default:** Load Philosophy for any Tailwind task.

**Use the full workflow (this file) when:** comprehensive standards review for a complete styling pass.

**Use a dimension when:** focused context for a specific concern, multi-agent review, or constrained-context scenarios.
