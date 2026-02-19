## Audit Report: epic-design
Date: 2026-02-19

### Summary
Overall: FAIL
Phases completed: 8/8 (SkillIntent missing — Step 1 produced CRITICAL finding, Steps 2b-8 still executed)

### Phase Results
| Phase | Result | Key Findings |
|---|---|---|
| First Principles (SkillForge) | FAIL | CRITICAL: No SkillIntent.md exists. SKILL.md violates progressive disclosure — contains pillar descriptions, success metrics, version history that belong in context files. Content duplicated between SKILL.md and EpicPrinciples.md. |
| Structure (WorkflowDecompose) | FAIL | Missing: SkillIntent.md, Tools/ directory. Directory name `epic-design` uses kebab-case instead of required TitleCase `EpicDesign`. YAML name field also kebab-case. |
| Compliance (ValidateSkill) | FAIL | No `## Workflow Routing` table with standard format. No "read its file and follow the steps within it" instruction. No `## Examples` section in standard format. Missing `## Reference Material` in workflow files. |
| Health (StressTest) | WARN | Domain content is strong and well-evidenced (real Guideline Sections failure data). But structural issues (no routing table, missing directories) undermine agent discoverability. |
| Routing (InvocationSim) | FAIL | No formal routing table exists. EstimateProject workflow has zero routing entries — not listed in Usage section. Only 2/3 workflows are discoverable. Dead route: EstimateProject.md unreachable via SKILL.md. |
| Content (ContentAudit) | WARN | Pillar descriptions duplicated between SKILL.md (Layer 0) and EpicPrinciples.md (Layer 2). Success Metrics repeated in 3 files. ScopingPhilosophy.md references non-existent "DecomposeDesign" workflow. EstimationGuide.md is 686 lines — comprehensive but high token cost. |
| Triggers (PromptQualityAudit) | WARN | YAML description USE WHEN clause is well-formed and intent-based. But absence of per-workflow trigger phrases in a routing table means agent cannot route to specific workflows — only to the skill as a whole. |

### Success Criteria Evaluation
No SkillIntent.md exists → No Success Criteria defined → **Cannot evaluate**
This is a CRITICAL gap. The skill has no design anchor, no explicit out-of-scope, no constraints, and no philosophical success criteria.

### Detailed Findings

#### CRITICAL Findings (must fix)

1. **No SkillIntent.md** — The skill has no design anchor document. Without it, future modifications risk drifting from original purpose. The 5 Epic Pillars, the Guideline Sections failure patterns, and the "proactive validation" philosophy are embedded in SKILL.md prose but not captured as formal First Principles, Design Decisions, or Constraints.

2. **No `## Workflow Routing` table** — SKILL.md uses a "Core Files" list and "Usage" section with bash `cat` commands instead of the standard routing table format. An agent reading SKILL.md cannot determine which workflow to invoke for a given user request. The critical instruction "read its file and follow the steps within it" is absent.

3. **Directory naming: `epic-design` (kebab-case)** — SkillSystem.md mandates TitleCase for all skill directories. Should be `EpicDesign`. YAML `name:` field also uses `epic-design` instead of `EpicDesign`.

#### HIGH Findings (should fix)

4. **No `Tools/` directory** — SkillSystem.md requires `Tools/` directory MUST always be present, even if empty.

5. **EstimateProject workflow unreachable** — Not listed in the Usage section or any routing mechanism. A user saying "estimate this project" or "size this feature" would not be routed to EstimateProject.md.

6. **Progressive disclosure violations** — SKILL.md (Layer 0) contains:
   - Detailed pillar descriptions (30 lines) that duplicate EpicPrinciples.md
   - Success Metrics section with baseline percentages
   - Version History with detailed changelog
   - Usage section with bash commands
   These belong in context files (Layer 2) or workflow files (Layer 1), not the always-loaded routing surface.

#### MEDIUM Findings (consider fixing)

7. **Content duplication** — Pillar descriptions in SKILL.md repeat content from EpicPrinciples.md. Success Metrics appear in SKILL.md, CreateEpicDesign.md, and ReviewEpicDesign.md.

8. **Missing `## Reference Material` sections** — Workflow files reference context files inline but don't use the standard `## Reference Material` section format required by SkillSystem.md. This means other workflows (like WorkflowDecompose) cannot infer what context a workflow requires.

9. **Phantom workflow reference** — ScopingPhilosophy.md references "DecomposeDesign" workflow in its Integration Points table, but no `Workflows/DecomposeDesign.md` exists.

10. **`## Examples` section format** — SKILL.md has usage examples but not in the standard format (`## Examples` with concrete user request → workflow invocation → output patterns).

### Actionable Next Steps

1. **Run CreateSkillIntent** on epic-design — Generate SkillIntent.md with First Principles (the 5 Epic Pillars as design philosophy), Problem This Skill Solves, Design Decisions, Explicit Out-of-Scope, Success Criteria (3+ binary-testable), and Constraints. CRITICAL priority.
2. **Run ImproveSkill** to restructure SKILL.md — Replace current content with standard `## Workflow Routing` table and `## Examples` section. Move pillar descriptions, success metrics, and version history to context files or remove duplication.
3. **Create `Tools/` directory** — `mkdir skills/epic-design/Tools` (even if empty).
4. **Add EstimateProject to routing** — Include in the new Workflow Routing table with trigger phrases like "estimate project", "size feature", "effort estimation".
5. **Add `## Reference Material` sections** to all 3 workflow files — List context file dependencies in standard format.
6. **Fix or remove phantom reference** — Either create DecomposeDesign.md workflow or update ScopingPhilosophy.md to remove the reference.
7. **Consider renaming** `epic-design/` → `EpicDesign/` to comply with TitleCase convention. Note: This is a destructive change that affects any existing references and git history. Recommend doing this as a separate, deliberate operation.

### Chain Decision Log
```
Chain ImproveSkill: condition [true — audit found multiple FAIL results] — [offering to user]
```
