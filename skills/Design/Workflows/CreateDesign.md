# CreateDesign Workflow

**Purpose**: Walk through a structured design process that scales from standard feature designs to full architecture documents. Produces a concrete markdown design artifact.

**When to Use**:
- "Design doc", "write a design", "scope this feature", "proposal"
- Any request to produce a design document at Standard or Full scale
- If scale assessment yields Quick, redirect to `RecordDecision` workflow instead

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns. **Read before producing any output in Step 4.**
- **Design Principles:** `../Principles.md` — 9 research-backed content patterns.

---

## Process

### Step 1: Assess Scale

Before anything else, determine the appropriate scale for this design.

| Scale | Signals | Action |
|-------|---------|--------|
| **Quick** | Single decision, bug fix, small UI change | Redirect to `RecordDecision` workflow |
| **Standard** | Feature, workflow, medium scope, weeks of work | Phases 1-4 of this workflow |
| **Full** | Architecture, new system, multi-week initiative, multiple teams | All 5 phases |

**Default to the lightest appropriate scale.** If uncertain, ask the user. Over-scoping a design is a failure mode — it creates friction and discourages future documentation.

**Write**: "Scale assessment: [Quick/Standard/Full] because [reason]"

If Quick → stop here and invoke `RecordDecision` instead.

---

### Step 2: Understand (Problem-First)

The most important phase. Resist the urge to jump to solutions. The goal is to articulate the problem so clearly that the approach becomes obvious.

**Ask the user (use AskUserQuestion or conversational clarification):**

1. **What problem are we solving?** Not "what do we want to build" — what pain or gap exists?
2. **For whom?** Who experiences this problem? Who benefits from solving it?
3. **What's the current state?** What exists today? What happens if we do nothing?
4. **What's the appetite?** How much time/effort do we WANT to spend? (This is a constraint, not an estimate.)
5. **Who decides?** Who has final decision authority? Who needs to be consulted?
6. **Who will read this document?** A reviewer signing off, a peer giving feedback, an implementer, a future maintainer? If multiple audiences, what does each need?

The answer to question 6 shapes *how* the document is structured — not just what goes in it. A document for a reviewer should lead with the approach and trade-offs. A document for an implementer should lead with the technical details. A document for both needs explicit boundaries so each reader knows where to stop. (See Principles.md, Pattern 9.)

**Synthesize into a Problem Statement** using the Design Thinking POV format:

> **[WHO]** needs **[WHAT]** because **[WHY / INSIGHT]**

This single sentence should pass the "would a stranger understand this?" test.

**Output**: Problem statement + context summary

---

### Step 3: Explore (Diverge)

Generate and evaluate alternatives. The goal is NOT to find the right answer — it's to map the solution space so the eventual choice is informed.

**For each plausible approach:**
- What would we gain?
- What would we lose?
- What assumptions does it make?
- What's the biggest risk?

**Also identify:**
- **Rabbit holes** — specific areas of technical risk or complexity worth calling out explicitly, so implementers don't get pulled in
- **Non-goals** — things that are reasonably possible but deliberately excluded. State these explicitly with a brief rationale for each.
- **Prior art** — has this been solved before, internally or externally? What can we learn?

**Output**: Alternatives matrix + non-goals list + rabbit holes

---

### Step 4: Define (Converge)

Synthesize the exploration into a concrete design. This is where the actual artifact takes shape.

**Produce:**
- **Goals** — bullet list, specific, measurable where possible
- **Non-goals** — "Things we COULD do but are deliberately NOT doing" with brief rationale
- **Scope boundary** — what's in, what's out, what's deferred to later
- **User impact** — what changes for end users, if anything
- **Technical approach** — the actual design (level of detail appropriate to scale)
- **Alternatives considered** — the matrix from Step 3, refined
- **Risks and rabbit holes** — known risks, complexity traps, areas to timebox
- **Open questions** — unresolved items that need answers before or during implementation
- **Decision log** — key decisions made during the design process with rationale

**Output**: The design document using the template below.

**Before writing, read `../OutputQuality.md` and apply its Section Format Guide.** Default to maximum density — tables and bullets unless content has genuine causality requiring prose. Every format choice must match the data shape.

---

### Step 4.5: Validate Output Quality

Auto-chain the `ValidateOutput` workflow:
- `artifact`: the completed design document from Step 4
- `scale`: the assessed scale from Step 1

Fix any FAIL results before delivery.

---

### Step 5: Review (Full Scale Only)

Structure feedback using the "Yes, if" framing — objections are constructive contributions, not blockers.

**Process:**
1. Identify reviewers based on the decision authority established in Step 2
2. Present the design document
3. Collect feedback framed as "Yes, if [condition]" rather than "No, because [objection]"
4. Capture outstanding concerns and resolution path
5. Record final decisions with rationale in the decision log
6. Set a revisit date if the design has time-sensitive assumptions

**Output**: Updated design document with review feedback incorporated + decision log entries

---

## Output Template

The artifact this workflow produces. For Standard scale, use sections flexibly — skip what isn't relevant. The template is a guide, not a checklist.

```markdown
# Design: [Title]

**Date**: [date]  |  **Status**: Draft / In Review / Accepted  |  **Scale**: Standard / Full
**Author**: [name]  |  **Decider**: [name/role]

## Problem
[WHO needs WHAT because WHY — the POV statement]

## Current State
[What exists today, what's broken/missing]

## Appetite
[How much time/effort we want to spend — the constraint, not an estimate]

## Goals
- [Specific, measurable goals]

## Non-Goals
- [Things we COULD do but are deliberately NOT doing, with brief rationale]

## Approach
[The actual design — technical details, user flow, architecture, whatever is appropriate to the problem]

## Alternatives Considered
| Option | Pros | Cons | Why Not |
|--------|------|------|---------|
| [Alternative A] | ... | ... | ... |
| [Alternative B] | ... | ... | ... |
| [Do nothing] | ... | ... | ... |

## Risks & Rabbit Holes
- [Known technical risks or complexity traps to timebox or avoid]

## User Impact
[What changes for end users — or "No user-facing changes"]

## Open Questions
- [Unresolved items that need answers before/during implementation]

## Decision Log
| Decision | Rationale | Date |
|----------|-----------|------|
| [What we decided] | [Why, including what we traded away] | [When] |
```

---

## Scale Adaptations

### Standard Scale
- Skip Step 5 (Review) unless the user requests it
- Use the template flexibly — empty sections should be omitted, not left blank
- Appetite and Decision Log are still important even at this scale
- Aim for 1-3 pages total

### Full Scale
- All 5 steps including structured review
- Template used comprehensively
- Consider producing individual ADRs (via `RecordDecision`) for key decisions within the design
- No length limit, but respect the reader's time — be thorough, not verbose

---

## Integration Notes

- **From RecordDecision**: Quick-scale assessments redirect there instead
- **From ReviewDesign**: Existing designs can be evaluated against the 4 Pillars
- **To RecordDecision**: Full-scale designs may spawn individual ADRs for key decisions
- **Load `Principles.md`** when deeper grounding is needed on any specific pattern
