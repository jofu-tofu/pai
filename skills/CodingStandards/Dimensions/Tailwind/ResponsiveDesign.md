# Responsive Design — Tailwind CSS

> Tailwind's breakpoint system is mobile-first by definition; misunderstanding this causes layouts that work on desktop and break on every other screen size.

## Mental Model

Tailwind uses min-width media queries for all breakpoints. This means unprefixed utilities apply to every screen size, and breakpoint prefixes like `sm:`, `md:`, `lg:` add overrides that activate at that width and above. The prefix `sm:` does not mean "on small screens." It means "from 640px and above." This single misunderstanding is the most common source of responsive layout bugs in Tailwind projects.

The correct mental model is: design for mobile first with unprefixed utilities, then progressively add complexity for larger screens. A `block` element that becomes `flex` at medium breakpoints is written as `block md:flex`, not `flex md:block`. The mobile layout is the default; larger screens override it.

Breakpoint consistency is the second pillar. Tailwind ships with standard breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`). Arbitrary breakpoint values like `min-[840px]:flex` create visual inconsistency across the application because each arbitrary value is a one-off decision disconnected from the design system. If the standard breakpoints do not fit your design, redefine them globally in the Tailwind configuration rather than scattering ad-hoc values through markup.

Container queries, available in Tailwind v4, represent a paradigm shift for component-level responsiveness. Traditional media queries respond to the viewport width, but a component placed in a narrow sidebar behaves differently than the same component in a full-width area. Container queries let components respond to their parent container's width instead. Mark the parent with `@container` and use container-aware breakpoints (`@sm:`, `@md:`) on children. This makes components truly portable, working correctly regardless of their layout context.

Spacing consistency completes the responsive picture. Mixing margin directions (using `mb-4` on one element and `mt-6` on the next) creates unpredictable gaps because margins in the same direction stack rather than collapse. The solution is to pick one direction convention or, better yet, delegate spacing to the parent container using `gap` on flex/grid layouts or `space-y-*` for simple vertical stacks. Parent-owned spacing eliminates the direction ambiguity entirely.

## Consumer Guide

### When Reviewing Code

Verify the mobile-first mental model: unprefixed utilities should define the mobile layout, and breakpoint prefixes should only add overrides for larger screens. Flag any pattern where `sm:` is used to target "small screens" since this indicates a misunderstanding. Check for arbitrary breakpoint values (`min-[...]`, `max-[...]`) and verify they are justified or should use standard breakpoints. Look for components that use viewport breakpoints but live in variable-width containers; these are candidates for container queries. Check spacing for mixed margin directions on adjacent siblings.

### When Designing / Planning

Define the mobile layout first in every design. Specify which properties change at each breakpoint and document only the deltas, not the full state at each size. If components will appear in multiple layout contexts (sidebars, modals, full-width), plan for container queries from the start rather than retrofitting them later. Standardize on the default Tailwind breakpoints unless the design system explicitly requires custom values, in which case define them in configuration, not in markup. Choose a spacing strategy: parent-owned `gap` for flex/grid containers, consistent single-direction margins for edge cases.

### When Implementing

Write the mobile layout first using unprefixed utilities. Add `sm:`, `md:`, `lg:` overrides only where the layout changes. Read breakpoint prefixes as "from this width upward," never as "only at this size." Use standard breakpoints from the Tailwind configuration. If a component must adapt to its container rather than the viewport, add `@container` to the parent and use `@sm:`/`@md:` on children. For spacing between sibling elements, use `gap` on the flex/grid parent or `space-y-*` on a wrapper. If manual margins are necessary, pick one direction (`mt-` or `mb-`) and use it consistently across the project.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [MobileFirstBreakpoints](../../Rules/Tailwind/MobileFirstBreakpoints.md) | CRITICAL | Unprefixed = all screens; sm: = 640px+, not "small screens" |
| [BreakpointConsistency](../../Rules/Tailwind/BreakpointConsistency.md) | HIGH | Use standard breakpoints, not arbitrary min-[...] values |
| [ContainerQueryUsage](../../Rules/Tailwind/ContainerQueryUsage.md) | HIGH | Use @container queries for component-level responsive design [v4] |
| [ConsistentSpacingDirection](../../Rules/Tailwind/ConsistentSpacingDirection.md) | MEDIUM | Pick one margin direction or use gap/space-y on parents |

## Rule Interactions

- **MobileFirstBreakpoints + BreakpointConsistency** form the foundation: mobile-first ordering with standard breakpoints creates predictable, maintainable responsive code. Violating either makes the other harder to reason about.
- **MobileFirstBreakpoints + ContainerQueryUsage** address different scopes: media-query breakpoints handle page-level layout changes, while container queries handle component-level adaptation. A page might use `md:grid-cols-2` for the overall layout while individual cards inside use `@md:flex-row` based on their container.
- **ConsistentSpacingDirection + GapOverSpaceBetween** (from ClassOrganization) overlap: both address child spacing, with `gap` being the preferred solution in both dimensions. If you use `gap` consistently, spacing direction debates become irrelevant.
- **BreakpointConsistency + ContainerQueryUsage** can conflict in intent: if you find yourself wanting arbitrary viewport breakpoints because a component appears at different widths, the real solution is usually container queries.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Inverted breakpoint mental model**: Writing `flex sm:block` intending "flex on small, block on large." This produces the exact opposite: flex on all sizes, overridden to block at 640px+. The mobile experience is broken.
- **Desktop-first development**: Building the desktop layout first with unprefixed utilities, then trying to "fix" mobile with `sm:` and `md:` overrides. This inverts Tailwind's breakpoint model and creates increasingly complex override chains.

### HIGH

- **Arbitrary breakpoint proliferation**: Using `min-[600px]`, `min-[840px]`, `min-[1100px]` across different components. Each value is an isolated decision creating a fragmented responsive system with no consistency.
- **Viewport breakpoints on portable components**: A card component that uses `md:flex-row` but renders inside both a full-width area and a narrow sidebar. The sidebar instance breaks at the `md` breakpoint because the viewport is wide enough but the container is not. Use container queries instead.

### MEDIUM

- **Mixed margin directions**: Adjacent siblings using `mb-4` and `mt-6`, creating a 24px gap through margin stacking instead of the intended 16px or 24px. Use parent-owned spacing to eliminate this ambiguity.
- **Redundant breakpoint overrides**: Writing `text-base sm:text-base md:text-lg` where the `sm:text-base` is identical to the unprefixed value and adds no information. Each breakpoint override should change something.

## Examples

**Correct mobile-first responsive layout:**

```html
<!-- Mobile: stacked. md+: side by side. lg+: with extra spacing -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
  <div class="rounded-lg bg-white p-4 shadow">Card 1</div>
  <div class="rounded-lg bg-white p-4 shadow">Card 2</div>
  <div class="rounded-lg bg-white p-4 shadow">Card 3</div>
</div>
```

**Container query for portable component:**

```html
<!-- Component adapts to container width, not viewport -->
<div class="@container">
  <div class="flex flex-col gap-4 @md:flex-row @md:items-center">
    <img class="h-24 w-full rounded object-cover @md:h-16 @md:w-16" src="..." alt="..." />
    <div>
      <h3 class="font-semibold">Title</h3>
      <p class="text-sm text-gray-600">Description text</p>
    </div>
  </div>
</div>
```

**Parent-owned spacing:**

```html
<!-- Consistent spacing via parent, no margin direction issues -->
<div class="flex flex-col gap-6">
  <h2 class="text-2xl font-bold">Section Title</h2>
  <p class="text-gray-600">Introduction paragraph.</p>
  <div class="grid grid-cols-2 gap-4">
    <div>Item A</div>
    <div>Item B</div>
  </div>
</div>
```

**Anti-pattern: inverted mental model**

```html
<!-- WRONG: flex on all sizes, block from 640px+ (backwards) -->
<div class="flex sm:block">Content</div>

<!-- CORRECT: block on mobile, flex from 640px+ -->
<div class="block sm:flex sm:items-center">Content</div>
```

## Does Not Cover

- Utility-first philosophy and component extraction (see Philosophy dimension)
- Class sorting and conflict detection (see ClassOrganization dimension)
- Dark mode responsive considerations (see Theming dimension)
- Accessibility at different screen sizes like touch targets (see Accessibility dimension)

## Sources

- Tailwind CSS documentation: "Responsive Design"
- Tailwind CSS v4 documentation: "Container Queries"
- CSS Container Queries specification (CSS Containment Module Level 3)
- WCAG 1.4.10 Reflow (Level AA)
