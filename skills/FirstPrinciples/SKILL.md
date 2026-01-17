---
name: FirstPrinciples
description: Reasoning from fundamental truths rather than analogies. USE WHEN challenge assumptions, fundamental analysis, first principles thinking, OR need to rebuild from basics. Deconstructs problems to irreducible facts, challenges inherited constraints, rebuilds solutions optimally.
---

# FirstPrinciples - Fundamental Truth Reasoning

**Invoke when:** Deconstructing problems, challenging assumptions, rebuilding from fundamentals, escaping local maxima, or applying physics-based reasoning.

---

## Overview

The FirstPrinciples skill implements systematic reasoning from fundamental truths rather than analogy. It shifts thinking from "How did we solve similar problems?" to "What are the actual fundamental truths here?"

**Core Insight:** Only hard constraints (physics/reality) are truly immutable. Soft constraints (policy/choice) and assumptions (unvalidated beliefs) should be challenged.

---

## The 3-Step Framework

### 1. Deconstruct
Break problems into constituent parts and identify fundamental truths.
- What is this actually made of?
- What are the irreducible components?
- What are the raw materials/inputs?

### 2. Challenge
Classify each constraint as hard, soft, or assumption.
- **Hard**: Physics/math/reality - cannot change
- **Soft**: Policy/choice - can be modified
- **Assumption**: Unvalidated belief - may be false

### 3. Reconstruct
Build optimal solutions using only hard constraints and fundamental truths.
- What would we build knowing only the irreducible facts?
- What becomes possible when we remove false constraints?

---

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Deconstruct** | "break down to fundamentals", "what is this really" | `Workflows/Deconstruct.md` |
| **Challenge** | "challenge assumptions", "classify constraints" | `Workflows/Challenge.md` |
| **Reconstruct** | "rebuild from scratch", "optimal solution" | `Workflows/Reconstruct.md` |

---

## When to Use

**Use FirstPrinciples when:**
- Inherited assumptions may be limiting solutions
- "We can't do X" is stated without evidence
- Stuck on a problem and need to rebuild from basics
- Evaluating whether constraints are real or assumed
- Architects questioning unstated constraints
- Security professionals identifying actual vs assumed boundaries
- Engineers needing to escape conventional approaches

---

## Constraint Classification

Understanding constraint types is critical:

| Type | Definition | Example | Changeable? |
|------|------------|---------|-------------|
| **HARD** | Physics/math/reality | Speed of light, thermodynamics | NO |
| **SOFT** | Policy/choice/convention | "We use AWS", budget limits | YES |
| **ASSUMPTION** | Unvalidated belief | "Users won't accept that" | TEST IT |

---

## Integration with Algorithm

FirstPrinciples integrates with THE ALGORITHM skill:
- **analysis.first_principles** capability (STANDARD+ effort)
- Used in THINK phase to challenge assumptions
- Complements Council (collaborative debate) and RedTeam (adversarial analysis)

---

## Examples

**Example 1: Cost optimization**
```
User: "Our cloud bill is $10k/month and we can't reduce it"
→ Deconstruct: What are we actually paying for?
→ Challenge: Is each service necessary? What's truly immutable?
→ Reconstruct: Build solution from actual requirements only
→ Result: Identify $7k in non-fundamental costs
```

**Example 2: Architecture decision**
```
User: "We need microservices for scale"
→ Deconstruct: What's the actual requirement? (Independent deployment)
→ Challenge: Is microservices a hard constraint or convention?
→ Reconstruct: Modular monolith achieves function with less complexity
→ Result: Simpler solution that meets actual needs
```

**Example 3: Security assessment**
```
User: "We're secure because we have a firewall"
→ Deconstruct: What does the firewall actually protect?
→ Challenge: Is firewall sufficient or just assumed?
→ Reconstruct: What would comprehensive defense look like?
→ Result: Identify gaps in security model
```

---

## Output Format

FirstPrinciples analyses include:

```markdown
## [Analysis Subject]

### Fundamental Truths (Irreducible)
- [Hard constraint 1]
- [Hard constraint 2]

### Constraint Classification
| Constraint | Type | Reason | Changeable |
|------------|------|--------|------------|
| [X] | HARD/SOFT/ASSUMPTION | [Why] | [Yes/No] |

### Reconstruction Proposal
- Function to optimize: [Outcome]
- Proposed solution: [Approach from fundamentals]
- What changes: [Difference from current]
- What's eliminated: [Non-fundamental complexity]
```

---

## Key Principle

**"If we knew nothing about how this is currently done, and only knew the fundamental truths, what would we build?"**

This is about optimizing function (what you're trying to accomplish) rather than form (how it's traditionally done).
