# SkillIntent - DesignReview

> **For agents modifying this skill:** Read this before making any changes. It captures the design anchor for design-review output quality.

---

## First Principles

1. **Signal over volume** - The report should optimize for decisions, not document length.
2. **Structure before opinion** - Enumerate objective topology and contracts before subjective critique.
3. **Visualize what is structural** - If relationships are graph-like, render them as diagrams.
4. **Scope must be explicit** - Every review declares inclusion and exclusion boundaries.

---

## Problem This Skill Solves

Skill reviews often become long prose with unclear scope and no stable structure map. This skill provides a consistent, high-signal, visual-first design review format.

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Single user-facing entry | `Review` orchestrates all internal stages | Multiple user-facing entry workflows | Reduces routing ambiguity and keeps report shape consistent |
| Thin orchestrator pattern | `Review.md` delegates each stage to separate agents | Single-agent all-in-one review | Enforces process boundaries and prevents stage skipping |
| Dimension-agent fanout | Orchestrator launches one agent per selected dimension file | Hardcoded checks in orchestrator prose | Keeps rubric modular and guarantees dimension-specific analysis |
| Weighted rubric | 8 dimensions with fixed weights totaling 100 | Unweighted checklist | Enables prioritization and clearer tradeoff decisions |
| Mermaid-first visuals | Require execution and structure diagrams | Prose-only reports | Faster comprehension for topology and pipeline flow |
| Template output | Standardized report template | Free-form narrative | Improves digestibility and cross-review comparability |

---

## Explicit Out-of-Scope

- Full code-quality review inside target source files (handled by CodeReview).
- Auto-editing target skills without user request.
- Compliance/legal auditing.

---

## Success Criteria

- [ ] Every report includes explicit scope (included and excluded artifacts).
- [ ] Every report includes at least two Mermaid diagrams when reviewing structure.
- [ ] Every recommendation includes owner, artifact, and expected outcome.
- [ ] Every report with external artifacts includes a `Design Metadata Links` section and in-design summaries for critical linked items.
- [ ] Dimension scoring is present for all eight dimensions.

---

## Constraints

1. Keep recommendations artifact-specific, not generic advice.
2. Preserve weighted dimension IDs and names unless explicitly refactored.
3. Use evidence from concrete files and sections in the target skill.
4. Keep `Review.md` as a thin orchestrator that does not inline stage logic.
5. Launch dimension reviewers from `Dimensions/**/*.md` selected via `dimensions.json`.
