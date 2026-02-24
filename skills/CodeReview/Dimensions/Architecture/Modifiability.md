---
id: A2
name: Modifiability & Extensibility
category: Architecture
baseline: false
---

# Modifiability & Extensibility Review

> Evaluates the cost of future change — whether the architecture makes it easy to add new behavior without modifying existing code.

## Mental Model

Modifiability is about the Open/Closed Principle at the architecture level: systems should be open for extension, closed for modification. Poor modifiability manifests as switch statements that grow with every new type, if/else chains that accumulate cases, and hardcoded behavior that should be configurable. Good modifiability provides extension points: plugin interfaces, strategy patterns, configuration-driven behavior.

## Detection Heuristics (ordered by severity)

### CRITICAL

- **Switch/if-else chain on type discriminator with >7 cases and no polymorphic alternative** — every new type requires modifying this switch — found by counting cases in switch statements or if/else if chains.
- **Hardcoded behavior list that has grown >5 times** (visible in git history) — evidence the code should use a registry or plugin pattern instead.

### HIGH

- **Missing extension point** — new behavior added by modifying existing function internals rather than implementing an interface or adding a configuration entry — violates Open/Closed Principle.
- **Rigid hierarchy** — inheritance depth >3 levels where leaf classes override >50% of parent methods — the hierarchy constrains rather than enables.
- **Sealed/final classes or methods at API boundaries** — prevents consumers from extending behavior.

### MEDIUM

- **Configuration buried in code** — magic numbers, feature flags, or behavioral parameters hardcoded instead of externalized to config files/env vars.
- **Missing strategy/plugin pattern** — function with >3 conditional branches selecting behavior that could be injected.
- **Violation of Liskov Substitution** — subclass that throws on a parent method or changes its contract.

## Severity Calibration

- **CRITICAL** = adding the NEXT new case/type/variant will require modifying core logic and risks breaking existing behavior. Restructure now.
- **HIGH** = the design is workable today but will resist the next feature addition. Address while the code is already being changed.
- **MEDIUM** = minor rigidity that doesn't block current work. Flag for design improvement.

## Language-Specific Notes

- **TypeScript/React:** Component props that use string union types and switch internally — each new variant modifies the component. Render functions with >5 conditional branches based on props. Lack of compound component patterns where they'd reduce prop explosion.
- **Python:** Functions with >4 keyword arguments controlling behavior branches. Class-based views with deeply overridden method chains. Missing Protocol/ABC definitions at boundaries.
- **Svelte:** Components that handle >4 display modes via if/else blocks in the template. Missing slot-based composition patterns where children components would reduce branching.

## Good vs. Bad Examples

### Bad (before)

```typescript
function renderNotification(type: string, data: any) {
  switch (type) {
    case 'email': return renderEmail(data);
    case 'sms': return renderSMS(data);
    case 'push': return renderPush(data);
    case 'slack': return renderSlack(data);
    case 'webhook': return renderWebhook(data);
    // Adding a new channel means editing this switch
  }
}
```

### Good (after)

```typescript
const renderers: Record<string, NotificationRenderer> = {
  email: renderEmail,
  sms: renderSMS,
  push: renderPush,
  slack: renderSlack,
  webhook: renderWebhook,
};
function renderNotification(type: string, data: NotificationData) {
  const renderer = renderers[type];
  if (!renderer) throw new UnknownChannelError(type);
  return renderer(data);
}
// Adding a new channel: just add to the registry
```

## Output Format

For each finding in this dimension, report:

- **Severity:** [CRITICAL / HIGH / MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences describing the rigidity and its concrete risk]
- **Recommendation:** [specific fix — name the pattern, symbol, or refactor required; not vague]

---

Sources: ISO 25010 Modifiability, ATAM Modifiability scenarios (SEI/CMU), Martin's Open/Closed Principle from Clean Architecture (2017), Liskov Substitution Principle.
