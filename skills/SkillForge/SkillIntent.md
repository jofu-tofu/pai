# SkillIntent — SkillForge

> **For agents modifying this skill:** Read this document before making any changes. It captures the original design decisions, explicit out-of-scope boundaries, and constraints that updates must not contradict.

---

## First Principles

1. **Skills drift without anchors** — Every modification risks moving a skill away from its original purpose. Without a design anchor, successive updates optimize locally while drifting globally. SkillIntent is that anchor.

2. **User-workflow-first** — A skill's SKILL.md exists for the USER, not the system. Only workflows a user would naturally invoke belong in the routing table. Internal gates, validation steps, and auto-chained workflows are implementation — they exist to serve user workflows, not to be invoked directly.

3. **Signal density over completeness** — Every token in a skill file competes for agent attention. A 50-line SKILL.md with perfect signal beats a 250-line one with comprehensive coverage. The test: does an agent need this token to make the right decision?

4. **Self-application as proof** — A skill maintenance tool that can't maintain itself according to its own standards is broken. SkillForge must be the best example of what a well-maintained skill looks like.

5. **The WHY endures, the WHAT changes** — Design decisions, constraints, and philosophical principles survive refactors. Implementation details (step numbers, log formats, specific workflow file paths) are ephemeral. Anything that references a specific implementation step will break when that step changes.

6. **Philosophical criteria, operational verification** — Success criteria describe the IDEAL STATE at a philosophical level. How you verify that state is a separate concern that lives in validation tooling, not in the criteria themselves.

7. **Implementation history belongs in version control** — Evolution Notes that track WHAT changed (step rewrites, path fixes, gate additions) are a changelog — and git is the changelog. SkillIntent captures WHY decisions were made (in Design Decisions, Constraints, First Principles), not WHAT was changed. If a future agent needs to know what changed, `git log` on the file provides that. If they need to know WHY, Design Decisions and Constraints tell them. The absence of Evolution Notes is a design choice, not an oversight.

8. **Progressive disclosure correctness** — A skill is a layered information architecture. Each layer has a purpose and a load condition. Content at the wrong layer either wastes always-on context (too high) or becomes invisible when needed (too low). The layers: SKILL.md (Layer 0, always loaded — routing only), workflow files (Layer 1, loaded on trigger — procedures only), context files (Layer 2, loaded by Reference Material — reference only), SkillIntent.md (Layer 3, loaded before modifications — design anchor only). Architectural correctness means every piece of content lives at exactly the layer where it's needed — no duplication across layers, no reference material in procedures, no procedures in routing.

---

## Problem This Skill Solves

Skills in any agent skill system accumulate drift: descriptions go stale, workflows lose trigger coverage, structure becomes inconsistent with what actually works. Without a structured update process, agents modifying skills over-apply changes, miss constraint violations, or refactor based on local optimization rather than original purpose.

SkillForge provides a safe, auditable path for skill lifecycle management — from creating new skills from scratch to content edits to full structural refactors — with validation gates and explicit risk categorization at each step.

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Workflow-per-operation | One workflow per distinct update operation | Single mega-workflow | Smaller scope per invocation; clearer routing; easier to test each path independently |
| Read-only default | Analysis and report before any change; user confirms | Auto-apply on trigger | Skill updates are high-stakes; visibility required before action |
| Routing by trigger phrase | Agent reads SKILL.md routing table and matches to workflow | Structured command syntax | Natural language invocation; no user training required |
| Context files as reference material | Supporting documents loaded only by specific workflows | Embed all context in SKILL.md | Keeps the always-loaded surface minimal; context loads only when needed |
| Validation as a separate workflow | ValidateSkill is a standalone workflow, not a phase | Auto-validate after every change | Validation is expensive; should be explicit, not silent overhead |
| Platform-agnostic file structure | SKILL.md + Workflows/ + context files in plain markdown | Proprietary format or config files | Portable across any agent tool that can read markdown and follow instructions |
| No evolution changelog in SkillIntent | Design anchor captures WHY via principles, decisions, constraints | Evolution Notes tracking WHAT changed | Implementation history is git's job; WHY content belongs in Design Decisions and Constraints; changelogs degrade signal density |
| Workflow chaining made explicit | Centralized WorkflowChains.md + per-workflow Follow-Up sections | Disjoint workflows with no cascading | Natural follow-ups (e.g., ModifyContent → PromptQualityAudit) were invisible; explicit chains prevent missed cascades |

---

## Explicit Out-of-Scope

- **Deleting entire skills** — Destructive, irreversible. Outside normal workflow scope; requires explicit user confirmation if ever needed.
- **Runtime context management** — Content completeness is the author's concern; context window management is the runtime's concern. SkillForge imposes no token budgets.
- **Skill system administration** — Configuring routing infrastructure or modifying SkillSystem.md is outside SkillForge's scope.

---

## Success Criteria

Every skill exiting a SkillForge workflow satisfies these:

1. **SkillIntent exists with Problem, Constraints, and Success Criteria sections** — Target skill has a `SkillIntent.md` containing at minimum these three required sections. Existence alone is insufficient.
2. **Success Criteria contain 3+ distinct binary-testable philosophical states** — Target skill's `SkillIntent.md` has a `## Success Criteria` section with at least 3 criteria that describe ideal states, not implementation steps.
3. **Every context file reference resolves bidirectionally** — Two checks: (a) every file listed in reference sections physically exists on disk; (b) every non-internal file in the skill's root directory is referenced in a workflow or routing table.
4. **Every workflow is reachable from both routing table and chain map** — Every workflow file in `Workflows/` has entries in BOTH `WorkflowChains.md` AND the skill's `SKILL.md` routing table or is explicitly marked as an internal gate.
5. **Design intent is consulted before any skill modification begins** — Modification workflows structurally require reading `SkillIntent.md` before the first file edit, ensuring design decisions and constraints inform every change.
6. **Routing correctness is proactively verified after any routing change** — Routing verification happens through InvocationSim runs triggered by routing table changes, not by post-hoc checking.
7. **Every chain evaluation decision is auditable in session output** — Chain evaluations produce explicit inline log entries showing which chains fired and which were skipped, with condition evaluation visible.
8. **No medium or high-impact change is applied without explicit user confirmation** — Risk categorization gates prevent high-impact changes from being auto-applied. Unconditional confirmation types are defined in RiskFramework.md.
9. **Trigger phrase quality is verified after any routing-related modification** — When trigger phrases, USE WHEN clauses, or routing table entries change, prompt quality audit runs as a structural gate before the workflow reports completion.

---

## Constraints

These must remain true through any refactoring or content update:

1. **Self-application required** — SkillForge applies its own workflows to itself. Changes to SkillForge's files must route through ModifyContent or RefactorSkill (not direct edits) so that every gate fires on the skill itself.
2. **User-confirmed deletion** — Removing files or routing rows requires explicit user confirmation in every case.
3. **Atomic changes** — Multi-step changes either complete fully or roll back; no partial states.
4. **Validation as a gate** — Any workflow that modifies skill structure must offer or run ValidateSkill after changes.
5. **Skill-agnostic** — All workflows must work on any skill in the system, not just SkillForge itself.
6. **SkillIntent preservation** — When updating another skill, if that skill has a SkillIntent.md, changes must not contradict its stated out-of-scope or constraints.
7. **Success Criteria mandate** — When updating any skill, the target skill's SkillIntent.md must contain `## Success Criteria` before the update is considered complete.

---

## File Roles

| File | Is | Is Not |
|------|-----|--------|
| SKILL.md | Agent entry point. User-facing workflow routing + examples. | A comprehensive reference. Not for internal gates or implementation details. |
| SkillIntent.md | Design anchor. WHY decisions were made. Philosophical success criteria. | An implementation guide. Not for step numbers or log formats. |
| SkillSystem.md | Structural spec and validation checklist. HOW skills must be formatted and verified. | A skill philosophy document. Not for WHY decisions. |
| WorkflowChains.md | Chain relationships. WHEN workflows cascade. | A workflow reference. Not for what workflows DO. |
| RiskFramework.md | Risk categorization. HOW TO ASSESS change impact. | A workflow file. Not for step-by-step procedures. |
| PromptingStandards.md | Wording rules. HOW TO WRITE trigger phrases and descriptions. | A validation tool. Not for checking — for writing. |
