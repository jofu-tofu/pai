# Theming — Tailwind CSS

> A well-architected theming system defines colors once, switches them at a single point, and generates utility classes for every design token that needs one.

## Mental Model

Theming in Tailwind operates across three concerns: dark mode strategy, color token architecture, and the mechanism for defining tokens that generate utility classes. Getting these right means a theme switch (light to dark, brand A to brand B) changes one variable or toggles one class. Getting them wrong means scattering `dark:` prefixes across every element in the application or maintaining parallel color definitions that inevitably drift.

The dark mode strategy choice is foundational. Tailwind offers two approaches: `media` (follows the operating system preference via `prefers-color-scheme`) and `selector` (toggled via a CSS class or data attribute on the document root). The `media` strategy is zero-configuration but provides no user control. The `selector` strategy requires a toggle mechanism in JavaScript but enables user preference overrides, theme persistence, and multi-theme support. In v3.4.1+, `selector` replaces the older `class` strategy with more flexibility, supporting custom selectors like `[data-theme="dark"]`. The critical mistake is choosing `media` and then trying to add JavaScript toggle support, which silently fails because `media` ignores class changes entirely.

Semantic color tokens replace raw palette references (`blue-500`, `gray-200`) with project-specific names (`primary`, `surface`, `on-surface`). Without semantic tokens, the same blue shade gets referenced by its palette name in hundreds of locations. When the brand color changes, every instance must be found and updated. Semantic tokens centralize the mapping: `primary` maps to `blue-500` in one place, and changing that single mapping updates the entire application. This also enforces design system consistency because developers reach for `bg-primary` rather than guessing between `bg-blue-500` and `bg-blue-600`.

CSS custom properties reduce dark mode repetition by defining light and dark values at the root level rather than on every element. Instead of writing `bg-white dark:bg-gray-900 text-gray-900 dark:text-white` on every container, define `--color-bg` and `--color-text` properties that toggle between light and dark values at the `:root` and `.dark` selectors. Every element that references these properties automatically adapts when the theme changes.

In Tailwind v4, the `@theme` directive is the correct way to define design tokens that should generate utility classes. `@theme` both defines a CSS custom property and registers it with Tailwind's utility generation system. A `--color-brand` defined in `@theme` generates `bg-brand`, `text-brand`, `border-brand`, and all other color utilities. The same variable defined in `:root` creates only a CSS custom property with no utility generation. Use `@theme` for values that need utilities (colors, spacing, fonts) and `:root` for values that do not (transition durations, z-index layers, animation timing).

## Consumer Guide

### When Reviewing Code

Check whether the project uses `media` or `selector` for dark mode and verify the choice matches the requirements (user toggle needed implies `selector`). Look for raw palette colors (`bg-blue-500`) that should be semantic tokens (`bg-primary`). Count `dark:` prefixes on elements; if most elements have them, the project likely needs CSS custom properties to reduce repetition. In v4 projects, verify that design tokens are defined with `@theme` rather than `:root` when utility classes are needed. Check that `@theme` is not used for values that do not need utilities, as this pollutes the utility namespace.

### When Designing / Planning

Decide the dark mode strategy before writing any themed code: `selector` for user-controlled toggle, `media` for OS-preference-only. Define a semantic color vocabulary that maps to your design system (primary, secondary, surface, on-surface, error, warning). Plan the custom property architecture so that light/dark values are defined once at the root level. In v4 projects, categorize each design token as needing or not needing utility generation to determine `@theme` vs `:root` placement.

### When Implementing

Configure `darkMode: 'selector'` in Tailwind config (or the v4 CSS equivalent) if the project needs a toggle. Define semantic color tokens in the theme configuration, mapping names like `primary` and `surface` to actual color values. Use CSS custom properties for light/dark value pairs, toggling at `.dark` or `[data-theme="dark"]` scope. In v4, use `@theme` for every token that should produce utility classes. Reference semantic names in markup (`bg-primary`, `text-surface`) instead of raw palette names. Test both light and dark modes visually and verify contrast ratios in both themes.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [DarkModeStrategyChoice](../../Rules/Tailwind/DarkModeStrategyChoice.md) | CRITICAL | Choose media (OS-only) vs selector (user toggle) deliberately |
| [SemanticColorTokens](../../Rules/Tailwind/SemanticColorTokens.md) | HIGH | Use semantic names (primary, surface) instead of raw palette colors |
| [DarkModeCustomProperties](../../Rules/Tailwind/DarkModeCustomProperties.md) | HIGH | Use CSS custom properties to reduce dark: repetition |
| [ThemeOverRootForTokens](../../Rules/Tailwind/ThemeOverRootForTokens.md) | HIGH | In v4, use @theme for tokens that need utility classes |

## Rule Interactions

- **DarkModeStrategyChoice + DarkModeCustomProperties** form a pipeline: the strategy choice determines how dark mode is activated (media query vs class/selector), and custom properties determine how color values switch when that activation occurs.
- **SemanticColorTokens + DarkModeCustomProperties** are complementary: semantic tokens provide meaningful names, and custom properties provide the mechanism for those names to resolve to different values in light vs dark mode. Together they eliminate both raw palette references and per-element `dark:` prefixes.
- **SemanticColorTokens + ThemeOverRootForTokens** in v4 are tightly coupled: semantic tokens defined in `@theme` automatically generate utility classes, while the same tokens in `:root` do not. Using `:root` for color tokens in v4 means `bg-primary` will not work.
- **DarkModeStrategyChoice** has a one-way dependency: switching from `media` to `selector` later requires adding toggle code and may require refactoring existing dark mode implementations. Choose correctly up front.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Wrong strategy for requirements**: Using `darkMode: 'media'` (or the default) when the application needs a user-controlled dark mode toggle. Adding `document.documentElement.classList.add('dark')` has no effect with the media strategy. Users cannot switch themes, and the bug is completely silent.

### HIGH

- **Raw palette proliferation**: Using `bg-blue-500` in 200 places instead of `bg-primary`. A brand color change requires finding and updating every instance. Inconsistencies between `blue-500` and `blue-600` appear because different developers pick slightly different shades.
- **Per-element dark: duplication**: Writing `bg-white dark:bg-gray-900 text-gray-900 dark:text-white` on every container element. The light and dark palettes are defined implicitly across hundreds of elements rather than explicitly in one place. Changing a dark mode color requires a global search-and-replace.
- **:root instead of @theme in v4**: Defining `--color-brand: #3b82f6` in `:root` and expecting `bg-brand` to work. In v4, only `@theme` generates utility classes from custom properties. The variable exists but no utility is generated.

### MEDIUM

- **Over-scoped @theme**: Defining transition durations, z-index values, and animation timings in `@theme` when they do not need utility classes. This clutters the utility namespace with unnecessary classes like `z-modal` or `duration-fast` that may never be used in markup.
- **Inconsistent token naming**: Mixing naming conventions like `primary`, `brand-blue`, `main-color`, and `accent` without a clear system. Semantic tokens only work when the naming vocabulary is consistent and documented.

## Examples

**Complete theming architecture (v4):**

```css
/* Define semantic tokens that generate utilities */
@theme {
  --color-primary: oklch(0.55 0.24 262);
  --color-primary-hover: oklch(0.48 0.24 262);
  --color-surface: #ffffff;
  --color-on-surface: #111827;
  --color-muted: #6b7280;
}

/* Override for dark mode (does not need @theme, already registered) */
.dark {
  --color-surface: #111827;
  --color-on-surface: #f9fafb;
  --color-muted: #9ca3af;
}

/* Values that do NOT need utilities stay in :root */
:root {
  --transition-speed: 200ms;
  --z-modal: 50;
}
```

```html
<!-- Markup uses semantic tokens, no raw colors, no dark: prefixes -->
<div class="bg-surface text-on-surface">
  <h1 class="text-xl font-bold">Dashboard</h1>
  <p class="text-muted">Welcome back</p>
  <button class="rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover">
    Action
  </button>
</div>
```

**Dark mode toggle with selector strategy:**

```js
// tailwind.config.js (v3)
module.exports = { darkMode: 'selector' };

// Toggle in application code
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme',
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
}
```

**Anti-pattern: media strategy with toggle attempt**

```js
// darkMode: 'media' (default) — toggle does NOTHING
document.documentElement.classList.add('dark'); // Silently ignored
```

## Does Not Cover

- Utility-first philosophy and when to use @apply (see Philosophy dimension)
- Responsive breakpoint design (see ResponsiveDesign dimension)
- Contrast ratio verification for themed colors (see Accessibility dimension)
- Class ordering when combining theme utilities with other utilities (see ClassOrganization dimension)

## Sources

- Tailwind CSS documentation: "Dark Mode"
- Tailwind CSS v4 documentation: "@theme"
- CSS Custom Properties specification (CSS Variables Module Level 1)
- oklch color space documentation for perceptually uniform theming
