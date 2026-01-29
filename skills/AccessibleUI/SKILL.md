---
name: AccessibleUI
description: Web accessibility and inclusive design guidelines for WCAG 2.2 AA compliance. USE WHEN writing UI components OR reviewing accessibility OR fixing a11y issues OR implementing WCAG OR using ARIA OR keyboard navigation OR screen reader support OR color contrast OR focus management OR accessible forms OR modal accessibility OR touch targets. Contains 23 rules across 7 priority categories for framework-agnostic accessibility patterns.
---

# AccessibleUI

Accessibility and inclusive design guide for web interfaces. **23 rules across 7 categories, prioritized by impact.** Framework-agnostic patterns that work with React, Vue, Angular, or vanilla HTML/CSS/JS.

## When to Apply This Skill

**Automatic triggers:**
- Writing UI components (forms, modals, navigation)
- Code review for accessibility compliance
- Fixing accessibility issues or audit findings
- Implementing ARIA patterns or keyboard navigation
- Color contrast or focus indicator work

## Quick Decision Tree

**Start here when addressing accessibility:**

1. **Using divs for buttons/links?** → Category 1: Semantic Structure (CRITICAL)
2. **Focus not moving correctly?** → Category 2: Keyboard Navigation (CRITICAL)
3. **Contrast or visibility issues?** → Category 3: Visual Accessibility (HIGH)
4. **Form or interactive problems?** → Category 4: Interactive Components (HIGH)
5. **Images or content issues?** → Category 5: Content Accessibility (MEDIUM-HIGH)
6. **Animation concerns?** → Category 6: Motion and Timing (MEDIUM)
7. **AI/agent interface patterns?** → Category 7: AI/Agent Interfaces (LOW-MEDIUM)

**For detailed implementation:** Read the specific rule file from `Rules/` folder.

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern |
|----------|----------|--------|-------------|
| 1 | Semantic Structure | CRITICAL | Native HTML > ARIA |
| 2 | Keyboard Navigation | CRITICAL | Focus management, Tab/Arrow |
| 3 | Visual Accessibility | HIGH | 4.5:1 contrast, visible focus |
| 4 | Interactive Components | HIGH | Labels, modals, touch targets |
| 5 | Content Accessibility | MEDIUM-HIGH | Alt text, readable typography |
| 6 | Motion and Timing | MEDIUM | Reduced motion, timeouts |
| 7 | AI/Agent Interfaces | LOW-MEDIUM | Transparency, user control |

## Top 10 High-Impact Rules

These prevent the most common accessibility failures:

1. **SemanticHtmlFirst** - Use `<button>` not `<div role="button">` (prevents 90% of ARIA issues)
2. **FocusManagement** - Move focus to new content; restore on close
3. **ContrastRatios** - 4.5:1 for text, 3:1 for UI components
4. **AccessibleForms** - Labels, error messages via aria-describedby
5. **KeyboardPatterns** - Tab/Arrow/Enter/Escape conventions
6. **FocusIndicators** - Visible focus with 3:1 contrast
7. **AlternativeText** - Meaningful alt text; empty for decorative
8. **LandmarkRegions** - main, nav, header, footer on every page
9. **ModalAccessibility** - Focus trap, Escape to close, return focus
10. **HeadingHierarchy** - Sequential h1→h2→h3, single h1 per page

## Examples

**Example 1: Semantic HTML (80% of wins)**
```html
<!-- Problem: Custom div button -->
<div onclick="submit()" class="btn">Submit</div>

<!-- Solution: SemanticHtmlFirst rule -->
<button type="submit">Submit</button>
```

**Example 2: Focus Management (Modal)**
```tsx
// Problem: Focus stays on trigger
<button onClick={() => setOpen(true)}>Open</button>
<Modal isOpen={open} />

// Solution: FocusManagement rule
<button ref={triggerRef} onClick={() => setOpen(true)}>Open</button>
<Modal isOpen={open} onClose={() => {
  setOpen(false);
  triggerRef.current?.focus(); // Restore focus
}} />
```

**Example 3: Color Independence**
```html
<!-- Problem: Color-only error indication -->
<input style="border-color: red" />

<!-- Solution: ColorIndependence rule -->
<input aria-invalid="true" aria-describedby="error-msg" />
<span id="error-msg">Email format invalid</span>
```

## Reference Documentation

**All 23 rules are sharded into individual files in `Rules/` folder for efficient loading.**

### How to Use Rules

**Pattern:** When applying a rule, read its specific file from Rules/ folder.

```
Decision tree identifies: Category 1 (Semantic Structure)
Quick ref shows: SemanticHtmlFirst rule
Action: Read Rules/SemanticHtmlFirst.md
Result: Complete code examples and WCAG references
```

### What's in Each Rule File

Each rule file (`Rules/RuleName.md`) includes:
- Why it matters (explanation + impact level)
- Multiple code examples (Incorrect/Correct patterns)
- Testing guidance (keyboard, screen reader, automated)
- WCAG success criteria references

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `semantic-html-first` → `Rules/SemanticHtmlFirst.md`
- `focus-management` → `Rules/FocusManagement.md`
- `contrast-ratios` → `Rules/ContrastRatios.md`

## Complete Rule Index

### 1. Semantic Structure (CRITICAL)
- SemanticHtmlFirst
- LandmarkRegions
- HeadingHierarchy
- ListStructure

### 2. Keyboard Navigation (CRITICAL)
- FocusManagement
- KeyboardPatterns
- TabOrder
- SkipLinks

### 3. Visual Accessibility (HIGH)
- ContrastRatios
- FocusIndicators
- ColorIndependence
- ResponsiveText

### 4. Interactive Components (HIGH)
- AccessibleForms
- ButtonVsLink
- ModalAccessibility
- TouchTargets

### 5. Content Accessibility (MEDIUM-HIGH)
- AlternativeText
- ReadableTypography
- PlainLanguage

### 6. Motion and Timing (MEDIUM)
- ReducedMotion
- TimeoutAccessibility

### 7. AI/Agent Interfaces (LOW-MEDIUM)
- AgentTransparency
- UserControl

## Integration

This skill integrates with PAI's code generation and review workflows. When writing or reviewing UI code, these patterns ensure WCAG 2.2 AA compliance across any framework.

**Standard:** WCAG 2.2 Level AA
**Testing Tools:** axe-core, WAVE, Lighthouse Accessibility
**Screen Readers:** NVDA, VoiceOver, JAWS
