---
name: Design
description: Design document methodology for any scale. USE WHEN design doc, design brief, scoping document, product brief, architecture decision, RFC, technical design, design review, scope a feature, write a proposal, record a decision. Guides agents through problem-first, trade-off-visible design that scales from quick decisions to full architecture docs.
context: fork
---

## Customization

**Before executing, check for user customizations at:**
`$PAI_DIR/skills/PAI/USER/SKILLCUSTOMIZATIONS/Design/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.


## MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the Design skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **Design** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

# Design Skill

Writing is thinking, not documentation. A design document is a *thinking tool* that forces clarity before commitment. This skill guides agents through producing designs that make problems clear, trade-offs visible, and decisions recoverable — at any scale from a quick ADR to a full architecture document.

## The 4 Pillars

Every great design document achieves these four things. They serve as both the creation guide and the review checklist.

1. **Force Clarity on the Problem** — Articulate the problem before jumping to solutions. If you can't write a clear problem statement, you don't understand the problem yet.
2. **Make Trade-offs Visible** — Show what was rejected and why. The "why not" is as important as the "why."
3. **Create Feedback Loops** — Structured review before commitment catches blind spots and builds shared understanding.
4. **Serve as Organizational Memory** — Optimize for the person who wasn't in the room, including future you.

See `Principles.md` for the full research-backed framework (8 patterns from 11 methodologies).

## Scale Selector

**Default to the lightest appropriate scale.** The key anti-rigidity mechanism — small things should feel lightweight, not bureaucratic.

| Scale | When | Workflow | Output |
|-------|------|----------|--------|
| **Quick** | Bug fix, small UI change, single decision | RecordDecision | 1-page ADR |
| **Standard** | Feature, workflow, medium scope | CreateDesign (phases 1-4) | Design document |
| **Full** | Architecture, new system, multi-week initiative | CreateDesign (all 5 phases) | Full design + ADRs |

Assess scale from context and suggest — but the user can override. When in doubt, go lighter.

## Workflow Routing

Route to the appropriate workflow based on the request.

**When executing a workflow, output this notification directly:**

```
Running the **WorkflowName** workflow in the **Design** skill to ACTION...
```

  - Create a design document, scope a feature, write a proposal → `Workflows/CreateDesign.md`
  - Review or critique an existing design → `Workflows/ReviewDesign.md`
  - Record a decision, write an ADR, capture a decision → `Workflows/RecordDecision.md`

## Examples

### Example 1: Quick Decision
```
User: "We decided to use PostgreSQL instead of MongoDB for the user service.
       Record this decision."

→ Invokes RecordDecision workflow
→ Asks clarifying questions about context and alternatives
→ Produces a 1-page ADR with context, decision, consequences
```

### Example 2: Standard Feature Design
```
User: "I need to design the notification preferences page for our app"

→ Invokes CreateDesign workflow at Standard scale
→ Walks through: Understand problem → Explore alternatives → Define scope → Produce document
→ Outputs a structured design doc with goals, non-goals, approach, alternatives considered
```

### Example 3: Full Architecture Design
```
User: "We need to redesign our authentication system to support SSO"

→ Invokes CreateDesign workflow at Full scale
→ All 5 phases including stakeholder review planning
→ Outputs comprehensive design + individual ADRs for key decisions
```

## Anti-Patterns

What this skill explicitly avoids:

- **Template Worship** — Filling in sections for the sake of completeness. Empty sections should be omitted, not left blank. The template is a guide, not a checklist.
- **Scope Creep** — The design doc becoming the project. A design should clarify decisions, not replace implementation planning.
- **Over-Specification** — Boxing in implementers with premature detail. Leave room for implementation judgment.
- **Missing the "Why Not"** — Designs that show what was chosen but not what was rejected. Alternatives Considered is not optional.

---

**Attribution**: Methodology synthesized from Google Design Docs, Amazon Working Backwards, Shape Up, ADRs (Nygard), Rust RFCs, Stripe writing culture, Phil Calcado's Structured RFC, Squarespace "Yes, if", Klaviyo "Always Write Something", Design Thinking (Stanford d.school, NNGroup), and PRD best practices (Atlassian, Product School).
