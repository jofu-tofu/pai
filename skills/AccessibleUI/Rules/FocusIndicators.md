# Focus Indicators

## Impact: CRITICAL (Keyboard Visibility)

Focus indicators are essential for keyboard users to understand where they are on a page. Without visible focus, users navigating with Tab, screen reader users, and those with motor disabilities cannot identify which element will receive their input. This affects approximately 2-3% of users who rely on keyboard navigation.

---

## Requirements Summary

| Requirement | Specification |
|-------------|---------------|
| Focus visibility | Must be visible on all interactive elements |
| Contrast ratio | 3:1 minimum against adjacent colors |
| Focus area | At least 2px thick or equivalent visual change |
| Never removed | Must provide alternative if removing default |

---

## Code Examples

### Basic Focus Styles

#### Incorrect - Removed Focus Without Replacement

```html
<style>
/* NEVER do this without providing an alternative */
*:focus {
  outline: none;
}

button:focus {
  outline: 0;
}

a:focus {
  outline: none;
  border: none;
}
</style>

<button class="btn">Click me</button>
<a href="/page">Link with no focus</a>
```

```tsx
// React component removing focus - INACCESSIBLE
const Button = ({ children }: ButtonProps) => (
  <button
    style={{ outline: 'none' }}
    className="no-focus"
  >
    {children}
  </button>
);
```

#### Correct - Custom Focus Styles

```html
<style>
/* Remove default but provide clear alternative */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px #0056b3;
}

/* High contrast focus ring */
a:focus {
  outline: 3px solid #0056b3;
  outline-offset: 2px;
}

/* Focus with sufficient contrast against background */
.dark-bg button:focus {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
}
</style>

<button>Accessible button</button>
<a href="/page">Accessible link</a>
```

```tsx
// React component with proper focus styles
const Button = ({ children, variant = 'primary' }: ButtonProps) => (
  <>
    <button className={`btn btn-${variant}`}>
      {children}
    </button>
    <style jsx>{`
      .btn:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.5);
      }

      .btn:focus-visible {
        outline: 3px solid #0056b3;
        outline-offset: 2px;
      }
    `}</style>
  </>
);
```

### Focus-Visible for Mouse/Keyboard Differentiation

#### Incorrect - Focus Ring on Mouse Click

```html
<style>
/* Shows focus ring on both mouse and keyboard */
button:focus {
  outline: 3px solid blue;
}
</style>
```

#### Correct - Focus-Visible Implementation

```html
<style>
/* Remove focus ring for mouse users */
button:focus {
  outline: none;
}

/* Show focus ring only for keyboard navigation */
button:focus-visible {
  outline: 3px solid #0056b3;
  outline-offset: 2px;
}

/* Fallback for browsers without focus-visible support */
@supports not selector(:focus-visible) {
  button:focus {
    outline: 3px solid #0056b3;
    outline-offset: 2px;
  }
}
</style>
```

```tsx
// React component using focus-visible
const InteractiveCard = ({ title, onClick }: CardProps) => (
  <>
    <button className="card" onClick={onClick}>
      <h3>{title}</h3>
    </button>
    <style jsx>{`
      .card {
        background: white;
        border: 1px solid #ccc;
        padding: 1rem;
        cursor: pointer;
      }

      .card:focus {
        outline: none;
      }

      .card:focus-visible {
        outline: 3px solid #0056b3;
        outline-offset: 2px;
        border-color: #0056b3;
      }

      .card:hover {
        border-color: #0056b3;
      }
    `}</style>
  </>
);
```

### Custom Focus Indicators

```tsx
// Multiple focus indicator styles
const FocusStyles = () => (
  <style jsx global>{`
    /* Style 1: Outline with offset */
    .focus-outline:focus-visible {
      outline: 3px solid #0056b3;
      outline-offset: 3px;
    }

    /* Style 2: Box shadow (works on rounded corners) */
    .focus-shadow:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px #0056b3;
    }

    /* Style 3: Double ring for high contrast */
    .focus-double:focus-visible {
      outline: 3px solid #ffffff;
      outline-offset: 2px;
      box-shadow: 0 0 0 6px #0056b3;
    }

    /* Style 4: Background change (use with text contrast) */
    .focus-bg:focus-visible {
      outline: none;
      background-color: #e3f2fd;
      border-color: #0056b3;
    }

    /* Style 5: Inset border (doesn't change layout) */
    .focus-inset:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 3px #0056b3;
    }
  `}</style>
);
```

### Dark Mode Focus Indicators

```tsx
// Focus indicators that work in dark mode
const DarkModeStyles = () => (
  <style jsx global>{`
    :root {
      --focus-color-light: #0056b3;
      --focus-color-dark: #6bb3ff;
    }

    @media (prefers-color-scheme: light) {
      .btn:focus-visible {
        outline: 3px solid var(--focus-color-light);
      }
    }

    @media (prefers-color-scheme: dark) {
      .btn:focus-visible {
        outline: 3px solid var(--focus-color-dark);
      }
    }
  `}</style>
);
```

---

## Focus Indicator Checklist

1. Every interactive element has visible focus
2. Focus indicator has 3:1 contrast against adjacent colors
3. Focus indicator is at least 2px in the smallest dimension
4. Custom styles provided when removing browser defaults
5. `:focus-visible` used to differentiate keyboard/mouse focus

---

## Testing Guidance

### Manual Testing (Keyboard)

1. **Tab through page**: Press Tab repeatedly, verify every interactive element shows focus
2. **Reverse navigation**: Press Shift+Tab to go backward
3. **Focus visibility**: Can you always see which element is focused?
4. **Contrast check**: Is focus visible against all backgrounds?

### Screen Reader Testing

1. **NVDA/JAWS**: Focus should track with screen reader cursor
2. **VoiceOver**: Check focus ring visibility on macOS/iOS

### Automated Testing

```tsx
// Testing Library - verify focus management
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button receives visible focus', async () => {
  const user = userEvent.setup();
  render(<Button>Click me</Button>);

  const button = screen.getByRole('button');
  await user.tab();

  expect(button).toHaveFocus();
  // Check computed styles for focus indicator
  expect(button).toHaveStyle('outline: 3px solid');
});

// axe-core focus testing
test('page has no focus indicator violations', async () => {
  const { container } = render(<MyPage />);
  const results = await axe(container, {
    rules: {
      'focus-visible': { enabled: true }
    }
  });
  expect(results).toHaveNoViolations();
});
```

### Browser DevTools

- **Chrome**: Elements panel > Computed > filter "outline" or "box-shadow"
- **Firefox**: Accessibility Inspector shows focus order
- **Edge**: DevTools > Accessibility > Focus order visualization

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible) | AA | Keyboard focus indicator is visible |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast) | AA | Focus indicator has 3:1 contrast |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum) | AA | Focused element not entirely hidden |
| [2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced) | AAA | Focused element fully visible |
| [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance) | AAA | Enhanced focus indicator requirements |
