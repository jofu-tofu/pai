# Coupling Analysis Review

> Evaluates method-level and class-level interdependence that creates fragile connections between code units.

## Mental Model

Coupling at the method/class level means one unit reaches deeply into another's internals, treating foreign data or behavior as its own. This is distinct from module-level dependency health — coupling analysis focuses on how individual functions and classes interact, not how modules depend on each other at an architectural scale. High coupling means changes ripple unpredictably: modifying one class's internals silently breaks another class that relied on those internals directly.

## Detection Heuristics (ordered by severity)

### CRITICAL

- Feature envy — a method accesses data/methods from another object more than 3 times while accessing its own data fewer than 2 times — the method belongs in the other class
- Inappropriate intimacy — two classes that access each other's private/internal members directly, bypassing the public API — found when Class A reaches into Class B's internals AND vice versa

### HIGH

- Message chains >3 hops (`a.getB().getC().getD()`) — fragile chain breaks if any intermediate object changes
- Middle man — class that delegates >80% of its methods to another single class with no added logic — the class adds indirection without value
- Import density — a file imports >50% of its sibling modules (same directory) — signals it is a coupling hotspot

### MEDIUM

- Law of Demeter violations — method calls on objects obtained from other objects (not direct collaborators)
- Temporal coupling — functions that must be called in a specific order with no enforcement mechanism
- Hidden coupling via shared mutable state — two functions modify the same external variable

## Severity Calibration

CRITICAL = the coupling creates active maintenance hazards where changing one unit WILL break another. Refactor now.
HIGH = the coupling is a design smell that will cause pain during the next modification. Address in this PR.
MEDIUM = mild coupling that does not yet cause problems but signals design drift.

## Language-Specific Notes

- **TypeScript/React:** Props drilling through >3 component layers instead of context/state management. Components importing from >5 different feature directories. Hooks that access >3 different stores/contexts.
- **Python:** Functions that accept an object only to access one attribute (pass the attribute directly). Circular imports resolved via late imports.
- **Svelte:** Components with >5 exported props that are just passed through to children (prop drilling). Stores accessed directly in >4 components instead of through a facade.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Feature envy — this method belongs in PricingService
function formatInvoice(invoice: Invoice) {
  const subtotal = invoice.pricing.getSubtotal();
  const tax = invoice.pricing.calculateTax(subtotal);
  const discount = invoice.pricing.applyDiscount(subtotal);
  const total = invoice.pricing.computeTotal(subtotal, tax, discount);
  return { total, tax, discount };
}
```

### Good (after)

```typescript
function formatInvoice(invoice: Invoice) {
  const summary = invoice.pricing.getSummary();
  return summary;
}
```

## Output Format

For each finding in this dimension, report:

- Severity: [CRITICAL/HIGH/MEDIUM]
- File: [path]
- Line: [range]
- Heuristic: [which specific heuristic from above was triggered]
- Issue: [1-2 sentences]
- Recommendation: [specific fix, not vague]

---

Sources: Mantyla "Couplers" taxonomy, Fowler's Feature Envy/Inappropriate Intimacy, Martin's Stable Dependencies Principle, Law of Demeter.
