# SkillIntent — Design

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. **Problem Before Solution** — Articulate the problem before jumping to solutions. Writing is the thinking tool, not the documentation step.
2. **Trade-offs Over Choices** — Show what was rejected and why. The "why not" is as important as the "why."
3. **Density Over Verbosity** — Use the minimum words needed to convey the full meaning. Prose requires justification; tables and lists are the default.
4. **Scale-Appropriate Ceremony** — Small things should feel lightweight. Default to the lightest appropriate scale.
5. **Standalone Operation** — This skill operates independently with no coupling to other skills.

## Problem This Skill Solves

Without this skill, design work suffers from four failure modes:
- **Fuzzy problem definitions** — Teams jump to solutions without articulating what problem they're solving
- **Invisible trade-offs** — Decisions look arbitrary because rejected alternatives aren't captured
- **Lost rationale** — Six months later, nobody knows why a decision was made
- **AI verbosity** — Agent-generated output uses prose where tables work, banned AI vocabulary, and excessive word count, requiring manual cleanup

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|----------|----------------|----------------------|-----|
| Scale selector | 3 tiers (Quick/Standard/Full) | Single format, 5 tiers | Matches real decision sizes without over-granularity |
| Output quality rules | Standalone `OutputQuality.md` | Reference ClarityEngine's Philosophy.md | No coupling between skills — Design must be self-contained |
| Template format hints | Reference file with hardened load wording | Inline HTML comments per section | Avoids duplication since ReviewDesign also needs the rules |
| Density stance | Strong density-first (prose requires justification) | Balanced or light touch | Verbose prose is the #1 iteration trigger from user feedback |
| Self-validation | Shared `ValidateOutput.md` mini-workflow | Step within CreateDesign only | Reusable across CreateDesign, RecordDecision, ReviewDesign |
| Content boundary | Principles.md = what to include; OutputQuality.md = how to render | Single merged file | Keeps existing Principles.md scope clean, avoids double-duty |

## Explicit Out-of-Scope

- **Document rendering** — Visual formatting, PDF/DOCX conversion, presentation layout (ClarityEngine's domain)
- **Code review** — Reviewing implementation against a design (CodeReview's domain)
- **ClarityEngine coupling** — No imports, references, or dependencies on ClarityEngine files
- **Implementation planning** — The design clarifies decisions; it does not replace project planning

## Success Criteria

1. CreateDesign output passes all 4 ValidateOutput checks without manual intervention
2. Every template section uses the correct format per OutputQuality.md's Section Format Guide
3. Users do not need to ask "put this in table format" after receiving a design artifact
4. ReviewDesign catches rendering quality issues as a review dimension

## Constraints

- `OutputQuality.md` is standalone — no references to ClarityEngine files
- `ValidateOutput.md` is advisory and fix-before-delivery — not a blocking gate
- `Principles.md` covers content (what to include); `OutputQuality.md` covers rendering (how to format) — no overlap
- The output template is a guide, not a checklist — empty sections are omitted, not left blank
