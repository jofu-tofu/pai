# UpdateSkill A1 Enhancement - Design Document

## Iteration 1 Design

### Analysis Phase Section

**Purpose:** Provide structured guidance for analyzing skills before proposing refactoring changes.

**Placement:** Insert as new Step 3, between "Identify Refactoring Goals" and "Plan Changes"

**Content:**

```markdown
### Step 3: Analyze Current State

Before proposing specific changes, conduct thorough analysis across four dimensions:

#### 3.1 Structural Issues

Examine the skill's organization and file structure:

- **File organization:** Are files in correct directories (Tools/, Workflows/)?
- **Naming consistency:** Do files follow TitleCase conventions?
- **Section ordering:** Does SKILL.md follow standard section order?
- **Duplicate content:** Is information repeated across multiple files?
- **Missing components:** Are required sections/files absent?

**Analysis checklist:**
- [ ] Directory structure matches SkillSystem.md requirements
- [ ] All files use TitleCase naming
- [ ] No duplicate workflow definitions
- [ ] Required sections present (Examples, Prerequisites, etc.)

#### 3.2 Usability Issues

Evaluate how easy it is to understand and use the skill:

- **Workflow routing:** Can users easily find the right workflow?
- **Examples clarity:** Are examples realistic and helpful?
- **Documentation completeness:** Are all features documented?
- **Discoverability:** Can users figure out what the skill does?
- **Onboarding friction:** What barriers exist for first-time users?

**Analysis checklist:**
- [ ] Routing table clearly maps triggers to workflows
- [ ] Each workflow has concrete examples
- [ ] USE WHEN clauses are specific and actionable
- [ ] Frontmatter description accurately reflects capabilities

#### 3.3 Compliance Issues

Check adherence to SkillSystem.md requirements:

- **Frontmatter validity:** YAML syntax correct, required fields present
- **TitleCase compliance:** Skill name, files, and workflows properly cased
- **USE WHEN clauses:** Present in frontmatter description
- **Routing table:** Properly formatted and complete
- **Tool documentation:** All tools documented with usage instructions

**Analysis checklist:**
- [ ] YAML frontmatter parses without errors
- [ ] Name follows TitleCase (no spaces, hyphens, underscores)
- [ ] Description includes "USE WHEN" clause
- [ ] Routing table uses correct markdown format
- [ ] Tools/ scripts have header comments with usage

#### 3.4 Trade-offs

Consider the broader implications of refactoring:

- **Breaking changes:** Will users need to update their workflows?
- **Backward compatibility:** Can we preserve existing behavior?
- **Complexity vs. simplicity:** Does the change add necessary complexity?
- **Maintenance burden:** Will this be harder to maintain long-term?
- **User impact:** Who is affected and how significantly?

**Trade-off framework:**
- **If renaming skill:** Impact on user commands, git history, documentation
- **If restructuring workflows:** Impact on existing users, routing changes
- **If adding sections:** Added complexity vs. improved clarity
- **If removing content:** Risk of losing valuable information vs. reduced noise
```

### Decision Framework Section

**Purpose:** Provide structure for documenting each proposed change.

**Placement:** Enhance existing Step 4 "Plan Changes" (renumbered from Step 3)

**Content:**

```markdown
### Step 4: Plan Changes with Decision Framework

For each proposed change, document using this framework:

#### Change Template

```
CHANGE #: [Title of change]

What changes:
  [Specific files, sections, or content being modified]

Why (root problem):
  [The underlying issue this addresses - not just symptoms]

Impact:
  - Who affected: [Users, tools, integrations, etc.]
  - What affected: [Commands, workflows, files, etc.]
  - Severity: [CRITICAL / HIGH / MEDIUM / LOW]

Risk level: [HIGH / MEDIUM / LOW]
  [Justification for risk assessment]

Rollback plan:
  [Specific steps to undo this change if it causes problems]

Dependencies:
  [Other changes that must happen before/after this one]
```

#### Example Usage

```
CHANGE 1: Rename skill from "DaemonManager" to "Daemon"

What changes:
  - Directory: skills/DaemonManager/ -> skills/Daemon/
  - Frontmatter: name: DaemonManager -> name: Daemon
  - All internal references to skill name

Why (root problem):
  Name violates TitleCase convention (should be single word, no compound)
  and doesn't match actual skill purpose (manages daemons, not a "manager" itself)

Impact:
  - Who affected: Users with /daemon-manager commands
  - What affected: Skill invocation commands, routing
  - Severity: HIGH (breaks existing commands)

Risk level: HIGH
  Directory rename affects git history and any external references.
  Users must update their usage patterns.

Rollback plan:
  1. Rename directory back to DaemonManager
  2. Revert frontmatter name field
  3. Update internal references back
  4. Verify with ValidateSkill.ts

Dependencies:
  - Must update all skills that reference Daemon skill
  - Must update any documentation mentioning DaemonManager
  - Should communicate to users before deployment
```

#### Presenting the Plan

Show users the complete plan with all changes documented:

```
REFACTORING PLAN: [SkillName]

Goal: [High-level objective]

Summary:
  - X breaking changes (HIGH risk)
  - Y structural improvements (MEDIUM risk)
  - Z minor cleanups (LOW risk)

CHANGE 1: [Title]
  What: [Brief what]
  Why: [Brief why]
  Impact: [Severity]
  Risk: [Level]

CHANGE 2: [Title]
  ...

Total files affected: X
Estimated rollback effort: [Quick / Moderate / Extensive]

Confirm to proceed? (yes/no)
```
```

### Integration Points

**Before Step 3 (now Step 4):**
- Current: "Plan Changes" shows basic change list
- Enhanced: Use Decision Framework for each change

**Step 5 "Execute Changes" remains mostly unchanged**
- Add reference: "Execute changes in dependency order per Decision Framework"

**Step 6 "Validate Result" could add:**
- Verify risk assessments were accurate
- Check if any rollback plans need activation

## Design Rationale

### Why separate Analysis step?

1. **Forces systematic thinking:** Users must analyze before planning
2. **Prevents premature solutions:** Analysis before decision-making
3. **Creates paper trail:** Documents the "why" behind changes
4. **Reusable framework:** Checklist approach for consistency

### Why enhance Plan Changes with Decision Framework?

1. **Risk awareness:** Forces consideration of failure modes
2. **Impact assessment:** Makes consequences explicit
3. **Better communication:** Users see full context of changes
4. **Rollback preparation:** Plans for failure upfront

### Improvements over A1 specification:

1. **Checklist format:** More actionable than paragraph descriptions
2. **Severity levels:** Added to Impact assessment (A1 didn't specify)
3. **Dependencies:** Added to Decision Framework (critical for complex refactors)
4. **Example usage:** Concrete example of Decision Framework in action
5. **Summary format:** Added rollback effort estimation

## Open Questions for Iteration 2:

1. Is the Analysis Phase too prescriptive? Could overwhelm for simple refactors.
2. Should we add a "skip analysis for trivial changes" clause?
3. Decision Framework template might be verbose - is there a more concise version?
4. Do we need different guidance for different refactoring types (rename vs restructure)?
