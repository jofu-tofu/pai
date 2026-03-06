# SkillIntent - ClarityEngine

> **For agents modifying this skill:** Read this before making any changes. It captures
> the design intent, boundaries, and constraints that updates must preserve.

---

## First Principles

1. **Comprehension Over Production**: AI output is cheap; human review time is the bottleneck. Optimize for the reader, not the writer.
2. **Philosophy Before Format**: The five comprehension principles drive all output; format (HTML, PPT) is a late rendering choice.
3. **Clarity Over Brevity**: Prefer omitting sections over writing vague content. Every sentence must add specific information.
4. **Skip-Friendly by Design**: Every section works independently. No sequential dependencies between sections.
5. **Extensible Adapters**: New formats add rendering instructions to FormatAdapters.md. They never add new philosophy.

---

## Problem This Skill Solves

Document creation requests produce output optimized for production speed, not human comprehension. Without a comprehension-first framework, documents suffer from expert gatekeeping, narrative dependence, compression damage, and confident vagueness. ClarityEngine provides a philosophy-driven layer that ensures all document output is optimized for the reader's ability to understand, decide, and act.

Additionally, Philosophy.md serves as a passive shared resource — any PAI skill producing human-facing output can reference it for comprehension principles without invoking the full ClarityEngine workflow.

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Architecture axis | Philosophy-first (principles drive output) | Format-first (HTML vs PPT as primary axis) | Format is a rendering choice, not a design driver. Philosophy-first ensures consistent comprehension quality across formats. |
| Workflow structure | Unified CreateDocument with late format selection | Three separate creation workflows (CreatePresentation, CreateHtml, CreatePpt) | One workflow with format as a late decision matches "Philosophy Before Format." |
| Rules handling | 54 rules distilled to 15 principle-mapped checkpoints | Keep rules as appendix; Remove entirely | Appendix creates two sources of truth. Removing loses testability. Distillation preserves testability under philosophical framing. |
| Comprehension layer scope | Passive shared resource (Philosophy.md) | Active convention with enforced Read instruction | Passive avoids coupling. Skills discover and opt in voluntarily. Escalation path exists if passive proves insufficient. |
| Format extensibility | Single FormatAdapters.md file | Separate adapter files per format | At 2 formats, separate files is premature. One file with clear sections keeps it simple. |

---

## Explicit Out-of-Scope

- Full graphic design service work beyond document engineering workflows.
- Vendor-specific proprietary template packs not provided by the user.
- Guaranteed pixel-identical round-trip conversion between HTML and PPT.
- Deep due-diligence or background-check research workflows (delegate to Research skill).
- Enforcing other skills to read Philosophy.md (passive resource, not mandate).

---

## Success Criteria

- [ ] A Document Brief exists before any rendering begins.
- [ ] Output passes the "pick any section at random" independence test.
- [ ] ReadabilityGate contract checkpoints are evaluated against the output.
- [ ] Format selection rationale documented when auto-selected.
- [ ] New formats can be added by modifying only FormatAdapters.md.
- [ ] Other skills can reference Philosophy.md without invoking the full workflow.

---

## Constraints

1. Philosophy.md must remain self-contained — no references to sibling ClarityEngine files.
2. Philosophy.md must stay under 200 lines.
3. Preserve both HTML and PPT workflows as peer capabilities.
4. Keep trigger phrases natural-language and non-overlapping.
5. All trigger phrases from PresentationForge must be preserved in ClarityEngine.
6. Prefer minimal dependency paths for lightweight HTML delivery.
