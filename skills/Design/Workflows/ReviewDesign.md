# ReviewDesign Workflow

**Purpose**: Evaluate an existing design document against the 4 Pillars of great design. Produce structured, constructive feedback using the "Yes, if" framing.

**When to Use**:
- "Review this design", "critique", "what's missing"
- Evaluating someone else's design document
- Self-review before sharing a design with stakeholders

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns.
- **Design Principles:** `../Principles.md` — 8 research-backed content patterns.

---

## Process

### Step 1: Read the Design Document

Read the full document. Understand it on its own terms before evaluating. Note the scale (Quick/Standard/Full) — calibrate expectations accordingly.

### Step 2: Evaluate Against the 4 Pillars

For each pillar, assess the document and note gaps:

#### Pillar 1: Problem Clarity
- Is the problem stated clearly without jumping to the solution?
- Do we know WHO experiences this problem?
- Is there a current-state description — what exists today?
- Would a stranger understand what problem this solves?

#### Pillar 2: Trade-off Visibility
- Are alternatives listed — including "do nothing"?
- For each rejected alternative, do we know WHY it was rejected?
- Are non-goals stated — things deliberately excluded?
- Are the costs of the chosen approach acknowledged, not just the benefits?

#### Pillar 3: Feedback Loop
- Has this been reviewed, or is it a first draft?
- Are there open questions that need answers?
- Is decision authority clear — who decides?
- Is there a path to resolution for outstanding concerns?

#### Pillar 4: Organizational Memory
- Would a new team member understand WHY these decisions were made?
- Is context captured — the forces at play, not just the conclusion?
- Are key decisions logged with rationale and date?
- Will this document still make sense in 6 months?

#### Rendering Quality (via OutputQuality.md)

Read `../OutputQuality.md` and evaluate:
- Does each section use the correct format for its data shape?
- Is the document dense? Can any paragraph be compressed to a sentence?
- Are there AI writing patterns? (banned vocabulary, structural patterns)
- Do headers tell the story by themselves? (layer-cake test)

### Step 3: Frame Feedback as "Yes, if..."

For each identified gap, reframe as a constructive contribution rather than a blocker:

**Instead of**: "This design doesn't consider scalability."
**Use**: "Yes, if we add a section on how this scales beyond 10k users."

**Instead of**: "The alternatives section is weak."
**Use**: "Yes, if we document why we chose X over Y — specifically the trade-off on [concern]."

**Instead of**: "Who decided this?"
**Use**: "Yes, if we clarify decision authority — who has final say on the API contract?"

The "Yes, if" frame assumes the design is moving forward and asks what it needs to be ready. This removes blocking dynamics and makes review collaborative.

### Step 4: Produce Structured Feedback

**Output using this format:**

```markdown
## Design Review: [Design Title]

**Reviewed by**: [name/agent]  |  **Date**: [date]

### Summary Assessment
[1-2 sentences: overall impression and readiness level]

### Pillar Assessment

| Pillar | Status | Key Gap |
|--------|--------|---------|
| Problem Clarity | Strong / Adequate / Needs Work | [Brief note] |
| Trade-off Visibility | Strong / Adequate / Needs Work | [Brief note] |
| Feedback Loop | Strong / Adequate / Needs Work | [Brief note] |
| Organizational Memory | Strong / Adequate / Needs Work | [Brief note] |
| Rendering Quality | Strong / Adequate / Needs Work | [Brief note] |

### Feedback (Yes, if...)

1. **Yes, if** [condition 1] — [why this matters]
2. **Yes, if** [condition 2] — [why this matters]
3. **Yes, if** [condition 3] — [why this matters]

### Strengths
- [What the design does well — reinforce good patterns]

### Questions for the Author
- [Clarifying questions that would strengthen the design]
```

---

## Calibration by Scale

- **Quick (ADR)**: Evaluate only Context and Alternatives. Don't penalize for missing sections that don't apply.
- **Standard**: All 4 pillars, but expectations are moderate. A Standard design doesn't need a review process section.
- **Full**: Comprehensive evaluation against all 4 pillars. Expect thorough alternatives, clear authority, and a review plan.

---

## Integration Notes

- **Load `Principles.md`** when you need the 8 patterns for deeper grounding during evaluation
- After review, the author may use `CreateDesign` to revise, or `RecordDecision` to capture individual decisions surfaced during review
