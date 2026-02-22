# Accessibility — Tailwind CSS

> Tailwind handles styling, not semantics; every accessibility requirement must be explicitly implemented because no utility class can substitute for correct HTML structure and ARIA attributes.

## Mental Model

Tailwind is a visual styling framework. It makes elements look right but does nothing to make them work right for assistive technologies, keyboard users, or people with motion sensitivities. This distinction is critical because the utility-first workflow can create a false sense of completeness: an icon button that looks perfect with `p-2 rounded` is invisible to screen readers unless the developer adds `aria-label` and `sr-only` text. Accessibility in Tailwind is a parallel concern that requires deliberate attention at every element.

The accessibility surface in Tailwind spans five areas. Screen reader support uses the `sr-only` utility to provide text that is visually hidden but announced by assistive technologies. Every icon-only button, decorative image, or visual indicator needs an `sr-only` companion or an `aria-label` attribute. The `sr-only` class applies a clip-based hiding technique that keeps the text in the accessibility tree without affecting visual layout.

Focus management requires using `focus-visible:` instead of `focus:` for keyboard focus indicators. The `focus:` variant triggers on any focus event, including mouse clicks, which shows distracting focus rings to mouse users. The `focus-visible:` variant only activates during keyboard navigation, providing proper accessibility without visual noise. This is the correct default for all interactive elements.

Motion sensitivity affects users with vestibular disorders who enable "prefer reduced motion" in their OS settings. The `motion-reduce:` variant allows disabling or simplifying animations and transitions for these users. Every `transition-*`, `animate-*`, and `hover:scale-*` utility should have a `motion-reduce:` counterpart that removes or subdues the motion.

Touch target sizing ensures interactive elements are large enough to tap accurately on mobile devices. WCAG 2.5.8 requires a minimum of 24x24px (Level AA) with 44x44px recommended (Level AAA). Tailwind's `min-h-11 min-w-11` (44px) provides the recommended size. Small icon buttons are the most common violators.

Contrast compliance ensures text is readable against its background. Tailwind's default palette does not guarantee WCAG AA compliance. For example, `text-gray-400` on white has only a 2.9:1 ratio, failing the 4.5:1 AA requirement for normal text. Developers must verify contrast ratios for every text-background combination, in both light and dark modes.

The build safety rules in this dimension protect accessibility at the toolchain level. Dynamic class construction (string interpolation, template literals) causes Tailwind's scanner to miss classes, which are then purged from the production CSS. If a purged class is `sr-only`, the screen reader text becomes visible. If a purged class is `focus-visible:ring-2`, the focus indicator disappears. Content configuration paths must include every file type that references Tailwind classes, or production builds silently strip used utilities. Safelisting should be minimal and targeted; over-safelisting bloats the CSS bundle. Arbitrary values (`p-[13px]`) should be limited and extracted to theme tokens when repeated, keeping the design system consistent and the CSS output manageable.

## Consumer Guide

### When Reviewing Code

Check every icon-only button and link for `sr-only` text or `aria-label`. Verify that `focus-visible:` is used instead of `focus:` on all interactive elements. Look for animations and transitions that lack `motion-reduce:` alternatives. Measure touch target sizes on icon buttons and small interactive elements; verify `min-h-11 min-w-11` or equivalent. Audit text-background color combinations against WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) in both light and dark modes. Check for dynamic class construction (template literals, string concatenation) that could cause class purging. Verify content configuration paths include all file types. Flag safelisted patterns that should be lookup maps instead.

### When Designing / Planning

Specify accessible labels for every icon-only control in the design. Define the focus indicator style as part of the design system (ring color, width, offset). Plan `motion-reduce` behavior for every animation: does it stop entirely, reduce to a simple fade, or just shorten duration? Set minimum touch target sizes in the component specification (44x44px recommended). Verify contrast ratios during the design phase using tools like the WebAIM contrast checker. Document which colors pass WCAG AA and which do not. Plan the content configuration to cover all template file locations. Establish a policy for arbitrary values: when are they acceptable, and when must they become theme tokens?

### When Implementing

Add `sr-only` spans or `aria-label` to every icon-only interactive element. Mark decorative icons with `aria-hidden="true"`. Use `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none` as the default focus indicator pattern. Add `motion-reduce:transition-none` or `motion-reduce:animate-none` to every element with transitions or animations. Set `min-h-11 min-w-11` on icon buttons and other small interactive targets. Use `text-gray-600` or darker on white backgrounds for body text (gray-400 fails WCAG AA). Never construct class names dynamically; use complete strings in lookup maps. Configure content paths to cover `*.{html,js,jsx,ts,tsx,vue,svelte}` at minimum. Safelist only truly external dynamic classes (CMS content, user-selected themes). Extract repeated arbitrary values into `@theme` tokens after the second occurrence.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [ScreenReaderOnlyUsage](../../Rules/Tailwind/ScreenReaderOnlyUsage.md) | CRITICAL | Always pair icon-only buttons with sr-only text |
| [FocusVisibleOverFocus](../../Rules/Tailwind/FocusVisibleOverFocus.md) | CRITICAL | Use focus-visible: instead of focus: for keyboard rings |
| [ReducedMotionRespect](../../Rules/Tailwind/ReducedMotionRespect.md) | HIGH | Provide motion-reduce: alternatives for all animations |
| [MinimumTouchTargetSize](../../Rules/Tailwind/MinimumTouchTargetSize.md) | CRITICAL | Interactive elements must meet 44x44px touch target minimum |
| [ContrastRatioCompliance](../../Rules/Tailwind/ContrastRatioCompliance.md) | CRITICAL | Verify WCAG AA contrast ratios for all text colors |
| [NoDynamicClassConstruction](../../Rules/Tailwind/NoDynamicClassConstruction.md) | CRITICAL | Never interpolate class names; use complete strings |
| [SafelistSparingly](../../Rules/Tailwind/SafelistSparingly.md) | HIGH | Only safelist genuinely dynamic external-source classes |
| [LimitArbitraryValues](../../Rules/Tailwind/LimitArbitraryValues.md) | HIGH | Extract repeated arbitrary values into theme tokens |
| [ContentConfigurationPaths](../../Rules/Tailwind/ContentConfigurationPaths.md) | CRITICAL | Include all file types that reference Tailwind classes |

## Rule Interactions

- **NoDynamicClassConstruction + ContentConfigurationPaths** are the two sides of build safety: dynamic construction prevents detection at the class level, and missing content paths prevent detection at the file level. Both result in silently purged CSS in production.
- **ScreenReaderOnlyUsage + NoDynamicClassConstruction** have a dangerous interaction: if `sr-only` is part of a dynamically constructed class string, it gets purged in production, making hidden text visible and breaking the layout.
- **FocusVisibleOverFocus + ContrastRatioCompliance** both affect visibility: focus rings must have sufficient contrast against the background, and the ring color choice intersects with the contrast compliance rules.
- **ReducedMotionRespect + MinimumTouchTargetSize** are independent accessibility axes: motion sensitivity and touch target sizing affect different user populations and do not interact technically, but both must be addressed for comprehensive accessibility.
- **SafelistSparingly + LimitArbitraryValues** both address design system hygiene: over-safelisting and arbitrary value proliferation both indicate that the design system has gaps. The fix is often the same: add proper theme tokens.
- **ContrastRatioCompliance** must be verified in both light and dark themes, connecting this dimension to the Theming dimension.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Icon button without accessible name**: A `<button class="p-2"><svg>...</svg></button>` with no `aria-label`, no `sr-only` text, and no visible label. Screen reader users cannot determine the button's purpose. This is a WCAG 4.1.2 failure.
- **Dynamic class construction**: Using `bg-${color}-500` in a template literal. Tailwind's scanner cannot detect the class, and it is purged from production CSS. If the purged class is accessibility-critical (like `sr-only`), the failure is both visual and functional.
- **Missing content paths**: A `*.vue` or `*.svelte` file type omitted from content configuration. Every Tailwind class in those files is stripped from production, potentially removing focus indicators, screen reader utilities, and layout classes.

### HIGH

- **focus: instead of focus-visible:**: Using `focus:ring-2` shows focus rings on every mouse click. Users perceive it as a bug and developers "fix" it by removing focus indicators entirely, creating a worse accessibility problem.
- **No motion-reduce alternative**: A hero section with `animate-bounce` and `transition-all` that continues animating regardless of OS reduced-motion preference. Users with vestibular disorders experience discomfort or nausea.
- **Low contrast text**: Using `text-gray-400` on `bg-white` for body text (2.9:1 ratio). Fails WCAG AA for normal text (requires 4.5:1). Affects users with low vision and anyone in bright ambient light.
- **Over-safelisting**: Safelisting `bg-(red|blue|green|yellow)-(100|200|300|400|500|600|700|800|900)` adds hundreds of unused classes to the CSS bundle. Use lookup maps in code instead.

### MEDIUM

- **Small touch targets**: An icon button at 32x32px that is usable on desktop but causes frequent mis-taps on mobile. Meets AA minimum (24px) but misses AAA recommendation (44px).
- **Repeated arbitrary values**: Using `p-[13px]` in five different components. Each generates a unique CSS class. Extract to a theme token for consistency and reduced CSS output.

## Examples

**Accessible icon button with all protections:**

```html
<button
  class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg
         p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
         motion-reduce:transition-none"
  aria-label="Delete item"
>
  <svg class="h-5 w-5" aria-hidden="true"><!-- trash icon --></svg>
  <span class="sr-only">Delete item</span>
</button>
```

**Safe dynamic class selection:**

```jsx
// Complete strings in lookup map — scanner detects all classes
const statusColors = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

<span className={statusColors[status]}>{message}</span>
```

**Content configuration covering all file types:**

```js
// tailwind.config.js (v3)
content: ['./src/**/*.{html,js,jsx,ts,tsx,vue,svelte}']
```

```css
/* v4: auto-detects, but add non-standard paths */
@import "tailwindcss";
@source "../content/**/*.md";
```

**Anti-pattern: dynamic class that purges sr-only**

```jsx
// DANGEROUS: if accessibilityClass is "sr-only", it gets purged
<span className={`${isHidden ? 'sr-only' : ''} text-sm`}>
  {label}
</span>

// SAFE: complete class strings
<span className={isHidden ? 'sr-only text-sm' : 'text-sm'}>
  {label}
</span>
```

## Does Not Cover

- Semantic HTML structure and ARIA attribute correctness (framework-level concern, not Tailwind-specific)
- Utility-first philosophy and component extraction patterns (see Philosophy dimension)
- Responsive layout and breakpoint design (see ResponsiveDesign dimension)
- Dark mode strategy and token architecture (see Theming dimension)
- Class ordering and conflict resolution (see ClassOrganization dimension)

## Sources

- WCAG 2.1 Success Criteria: 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast, 2.4.7 Focus Visible, 2.3.3 Animation from Interactions, 2.5.8 Target Size (Minimum)
- Tailwind CSS documentation: "Screen Readers", "Focus Visible", "Prefers Reduced Motion"
- WebAIM Contrast Checker
- Tailwind CSS documentation: "Content Configuration", "Safelist"
