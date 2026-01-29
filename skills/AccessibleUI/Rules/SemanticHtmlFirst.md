# Semantic HTML First

## Impact: CRITICAL

**Prevents 90% of accessibility issues by leveraging built-in browser functionality.**

Using native HTML elements before reaching for ARIA is the single most effective accessibility practice. Native elements provide keyboard support, focus management, and screen reader announcements automatically, while custom implementations require extensive manual work to achieve the same functionality.

## Why It Matters

Screen readers and assistive technologies are optimized for native HTML elements. When you use a `<button>`, users automatically get focusability, Enter/Space activation, proper role announcement, and form submission capability. A `<div>` with `role="button"` requires you to manually implement all of this, and missing even one piece breaks the experience for users.

---

## Rule: Use Native Interactive Elements

### Incorrect: Custom Button with ARIA

```html
<!-- HTML - Missing keyboard handling, focus styles -->
<div class="btn" role="button" tabindex="0" onclick="submit()">
  Submit
</div>
```

```tsx
// React - Incomplete implementation
const CustomButton = ({ onClick, children }) => (
  <div
    className="btn"
    role="button"
    tabIndex={0}
    onClick={onClick}
  >
    {children}
  </div>
);
```

**Problems:**
- No Enter/Space key activation
- No form submission capability
- No disabled state communication
- Missing focus ring in many browsers

### Correct: Native Button Element

```html
<!-- HTML - Full functionality built-in -->
<button type="submit" class="btn">
  Submit
</button>
```

```tsx
// React - Complete accessibility by default
const Button = ({ onClick, children, disabled }) => (
  <button
    className="btn"
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);
```

---

## Rule: Use Native Form Controls

### Incorrect: Custom Checkbox

```html
<!-- HTML - Broken for keyboard and screen readers -->
<div class="checkbox" onclick="toggleCheck(this)">
  <span class="checkmark"></span>
  <span>I agree to terms</span>
</div>
```

```tsx
// React - Missing all checkbox semantics
const CustomCheckbox = ({ checked, onChange, label }) => (
  <div
    className={`checkbox ${checked ? 'checked' : ''}`}
    onClick={() => onChange(!checked)}
  >
    <span className="checkmark" />
    <span>{label}</span>
  </div>
);
```

### Correct: Native Checkbox with Label

```html
<!-- HTML - Full keyboard, label association, state -->
<label class="checkbox-wrapper">
  <input type="checkbox" name="terms" required />
  <span class="checkmark"></span>
  I agree to terms
</label>
```

```tsx
// React - Proper checkbox implementation
const Checkbox = ({ id, checked, onChange, label, required }) => (
  <label className="checkbox-wrapper" htmlFor={id}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      required={required}
    />
    <span className="checkmark" aria-hidden="true" />
    {label}
  </label>
);
```

---

## Rule: Use Links for Navigation

### Incorrect: Div as Link

```html
<!-- HTML - Not focusable, no link semantics -->
<div class="link" onclick="window.location='/about'">
  About Us
</div>
```

```tsx
// React - Missing link functionality
const FakeLink = ({ href, children }) => (
  <div
    className="link"
    onClick={() => window.location.href = href}
  >
    {children}
  </div>
);
```

**Problems:**
- Cannot right-click to open in new tab
- Not announced as link by screen readers
- No keyboard navigation without tabindex
- Browser history may not work correctly

### Correct: Native Anchor Element

```html
<!-- HTML - Full link functionality -->
<a href="/about">About Us</a>
```

```tsx
// React - Use Link component from your router
import { Link } from 'react-router-dom';

const NavLink = ({ to, children }) => (
  <Link to={to} className="nav-link">
    {children}
  </Link>
);
```

---

## Rule: Use Native Select for Dropdowns

### Incorrect: Custom Dropdown

```html
<!-- HTML - Requires extensive ARIA and keyboard handling -->
<div class="dropdown" aria-haspopup="listbox">
  <div class="dropdown-trigger" tabindex="0">Select option</div>
  <ul class="dropdown-menu" role="listbox">
    <li role="option">Option 1</li>
    <li role="option">Option 2</li>
  </ul>
</div>
```

### Correct: Native Select

```html
<!-- HTML - Complete functionality automatically -->
<label for="options">Choose an option:</label>
<select id="options" name="options">
  <option value="">Select option</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

```tsx
// React - Native select with proper labeling
const Select = ({ id, label, options, value, onChange }) => (
  <>
    <label htmlFor={id}>{label}</label>
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select option</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </>
);
```

---

## Testing Guidance

### Keyboard Testing
1. Tab to each interactive element - native elements receive focus automatically
2. Press Enter/Space on buttons - should activate without custom handlers
3. Navigate form controls - labels should be clickable, states should change

### Screen Reader Testing
- **Buttons:** Should announce "Submit, button" not just "Submit"
- **Checkboxes:** Should announce "I agree to terms, checkbox, not checked"
- **Links:** Should announce "About Us, link"
- **Selects:** Should announce options and selection state

### Automated Testing

```tsx
// Testing Library - Button
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button is keyboard accessible', async () => {
  const onClick = jest.fn();
  render(<button onClick={onClick}>Submit</button>);

  const button = screen.getByRole('button', { name: /submit/i });
  await userEvent.tab();
  expect(button).toHaveFocus();

  await userEvent.keyboard('{Enter}');
  expect(onClick).toHaveBeenCalled();
});
```

```javascript
// axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

test('form has no accessibility violations', async () => {
  const { container } = render(<MyForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## WCAG Success Criteria

- **4.1.2 Name, Role, Value (Level A):** Native elements automatically expose correct name, role, and value to assistive technologies
- **2.1.1 Keyboard (Level A):** Native elements are keyboard operable by default
- **1.3.1 Info and Relationships (Level A):** Native elements convey structural relationships programmatically

---

## The First Rule of ARIA

> "If you can use a native HTML element with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so."
> — W3C WAI-ARIA Authoring Practices
