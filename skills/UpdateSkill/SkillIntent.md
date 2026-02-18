# SkillIntent — UpdateSkill

> **For agents modifying this skill:** Read this document before making any changes. It captures the original design decisions, constraints, and explicit out-of-scope boundaries that updates must not contradict.

---

## Problem This Skill Solves

Skills in any agent skill system accumulate drift: descriptions go stale, workflows lose trigger coverage, structure becomes inconsistent with what actually works. Without a structured update process, agents modifying skills over-apply changes, miss constraint violations, or refactor based on local optimization rather than original purpose.

UpdateSkill provides a safe, auditable path for skill evolution — from quick content edits to full structural refactors — with validation gates and explicit risk categorization at each step.

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

---

## Explicit Out-of-Scope

- **Creating new skills** — that belongs to CreateSkill. UpdateSkill only operates on existing skills.
- **Deleting entire skills** — deletion of a full skill is a destructive, irreversible action that UpdateSkill does not perform without explicit user confirmation AND is outside normal workflow scope.
- **Runtime context management** — UpdateSkill does not impose token budgets or loading constraints on skills. Content completeness is the author's job; context window management is the user's and runtime's job.
- **Skill system administration** — adding skill directories, configuring routing infrastructure, or modifying the skill system spec (SKILLSYSTEM.md) is outside UpdateSkill's scope.

---

## Constraints

These must remain true through any refactoring or content update:

1. **Never auto-delete** — No workflow removes files or routing rows without explicit user confirmation
2. **Atomic changes** — Multi-step changes either complete fully or roll back; no partial states
3. **Validation as a gate** — Any workflow that modifies skill structure must offer or run ValidateSkill after changes
4. **Skill-agnostic** — All workflows must work on any skill in the system, not just UpdateSkill itself
5. **SkillIntent preservation** — When updating another skill, if that skill has a SkillIntent.md, changes must not contradict its stated out-of-scope or constraints

---

## Evolution Notes

| Version | Change | Rationale |
|---|---|---|
| Initial | 5 workflows: ModifyContent, ManageWorkflows, RefactorSkill, ValidateSkill, Retrospective | Core CRUD + validation + improvement loop |
| Added | StressTest, WorkflowDecompose | Operational health checking and structure analysis were missing; skills had no self-diagnostic path |
| Added | InvocationSim | Trigger coverage testing was absent; skills could have dead routes with no way to detect them |
| Added | PromptQualityAudit + PromptingStandards.md | Trigger phrase quality was unvalidated; PromptingStandards extracted as shared reference |
| Removed | TokenBudgets.md | Token budget constraints are the user's/runtime's concern, not the skill's. Content completeness should not be limited by line counts. |
| Added | InvocationSim Layer 2 | Single-layer sim only tested skill-level routing; workflow-level internal branching was unverifiable for depth-heavy skills |
| Added | SkillIntent.md convention | Updates lacked an anchor for design intent; without knowing the "why", successive updates could drift the skill off-mission |
| Added | WorkflowChains.md + Follow-Up sections | Workflows were disjoint/mutually exclusive; natural chaining relationships (e.g., ModifyContent → PromptQualityAudit) were invisible. Centralized chain map + per-workflow Follow-Up sections make chains explicit and cascading. |
