### TW1.6 Use Tailwind Only in UI Components, Not Domain Components

**Impact: HIGH (prevents duplication and enforces design system consistency)**

Apply Tailwind utilities only in reusable UI-level components (Button, Card, Input). Domain-level components (CheckoutForm, UserProfile) should compose UI components, never reaching for raw Tailwind utilities. This prevents duplicate styling and ensures visual consistency.

**Incorrect: domain component using raw Tailwind utilities**

```jsx
function CheckoutForm() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <input className="w-full rounded border px-3 py-2" />
      <button className="rounded bg-blue-500 px-4 py-2 text-white">Pay</button>
    </div>
  );
}
```

**Correct: domain component composes UI components**

```jsx
function CheckoutForm() {
  return (
    <Card>
      <Input placeholder="Card number" />
      <Button variant="primary">Pay</Button>
    </Card>
  );
}
```
