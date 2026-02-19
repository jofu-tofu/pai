# SkillIntent - PresentationForge

> **For agents modifying this skill:** Read this before making any changes. It captures
> the design intent, boundaries, and constraints that updates must preserve.

---

## First Principles

1. **Message Before Medium**: Content structure is the primary asset; file format is a delivery choice.
2. **Format Is a Constraint**: HTML and PPT satisfy different delivery environments; both are first-class.
3. **Clarity Beats Ornament**: Visual style exists to improve understanding and persuasion.
4. **Verified Claims Only**: Presentation trust depends on source quality, not rhetorical polish.
5. **Repurposing Is Transformative**: Conversions require rebuilding intent, not blind visual copying.

---

## Problem This Skill Solves

Presentation requests often mix content strategy, research, and output-format execution. Without a dedicated skill, users get inconsistent deck quality, weak format selection, and brittle conversions between lightweight HTML decks and professional PPT deliverables.

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Output model | Two first-class targets: HTML and PPT | Single universal output path | User workflows require both lightweight and formal delivery modes |
| Planning layer | Build a format-neutral brief before rendering | Directly author slides in target format first | Keeps narrative stable across formats and improves conversion quality |
| Tooling strategy | Multi-tool matrix with explicit trade-offs | One mandated tool for all cases | Different contexts need different strengths (speed, fidelity, template safety) |
| Quality gate | Shared checklist plus format-specific checks | A single generic "looks good" review | Prevents regressions hidden by format differences |
| Conversion policy | Preserve meaning first; document fidelity risk | Promise lossless HTML<->PPT conversion | Lossless conversion is not realistic for many deck features |

---

## Explicit Out-of-Scope

- Full graphic design service work beyond presentation engineering workflows.
- Vendor-specific proprietary template packs not provided by the user.
- Guaranteed pixel-identical round-trip conversion between HTML and PPT.
- Deep due-diligence or background-check research workflows (delegate to dedicated research skills).
- Real-time collaborative editing conflict resolution across multiple simultaneous users.

---

## Success Criteria

- [ ] A `Presentation Brief` artifact exists before any format renderer runs.
- [ ] Every creation run records one chosen output format: `HTML` or `PPT`.
- [ ] `ToolingLandscape.md` contains at least one verified official source URL for each active tool path.
- [ ] `ReviewPresentation` emits an explicit `PASS` or `FAIL` outcome.
- [ ] `RepurposePresentation` outputs a `Fidelity Risk Log`.

---

## Constraints

1. Preserve both HTML and PPT workflows as peer capabilities.
2. Keep trigger phrases natural-language and non-overlapping.
3. Keep format-selection logic explicit and user-auditable.
4. Do not claim conversion behavior that has not been validated.
5. Prefer minimal dependency paths for lightweight HTML delivery.
