# Retrospective Workflow

> **Trigger:** "retrospective on skill", "analyze skill performance", "improve skill based on session", "review skill usage"

## Reference Material

- **Risk Framework:** `../RiskFramework.md`
- **Authoritative Spec:** `../SkillSystem.md`
- **Target skill's SkillIntent.md** (if present) — Read before proposing improvements; recommendations must align with the skill's original purpose and must not contradict its constraints.
- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Analyze the current session to identify skills that were invoked, evaluate their performance, and suggest improvements to the skill based on observed usage patterns, gaps, or issues encountered during execution.

## Context & Motivation

Skills improve through real-world usage feedback. When a skill requires multiple iterations, fails to match user intent, or lacks coverage for common use cases, that signals improvement opportunities. This workflow captures session insights while they are fresh, translating observed friction into concrete skill enhancements that benefit future users.

## Prerequisites

- A completed session where at least one skill was invoked
- Target skill exists in `$PAI_DIR/skills/`
- Read `../SkillSystem.md` for structure requirements

## Workflow Steps

### Step 1: Session Analysis

**Analyze the conversation history to extract:**

1. **User's original request** - What did the user ask for?
2. **Skill invocation** - Which skill(s) were triggered?
3. **Actions taken** - What workflows/steps were executed?
4. **User feedback** - Were there corrections, clarifications, or issues raised?
5. **Outcomes** - Was the task completed successfully? Were there gaps?

**Key questions to answer:**
- Did the skill's trigger phrases match the user's intent?
- Were the workflow steps clear and adequate?
- Were there missing capabilities or edge cases?
- Did the skill require multiple iterations to complete the task?
- Were there any error conditions not handled?

### Step 2: Identify Target Skill

```
If user specifies skill name explicitly:
  -> Use specified skill
Else:
  -> Analyze session to identify primary skill(s) invoked
  -> Present findings and ask user to confirm target skill
```

Verify skill location:
```bash
$PAI_DIR/skills/[SkillName]/SKILL.md
```

### Step 3: Read Current Skill Structure

```
Load and analyze:
- SKILL.md (frontmatter, routing table, examples)
- All workflow files in Workflows/ directory
- Any related tool files in Tools/ directory
```

Document current capabilities:
- Existing workflows and their triggers
- Current description and USE WHEN clause
- Example use cases

### Step 4: Identify Improvement Opportunities

**Categories to evaluate:**

1. **Trigger Phrase Gaps**
   - Are there missing trigger phrases based on how the user invoked the skill?
   - Should additional USE WHEN clauses be added?

2. **Workflow Enhancements**
   - Should existing workflow steps be clarified or expanded?
   - Are there missing error handling steps?
   - Should prerequisite checks be added?

3. **Missing Workflows**
   - Did the session reveal a use case not covered by existing workflows?
   - Should a new workflow be added?

4. **Examples and Documentation**
   - Are the current examples representative of real usage?
   - Should additional examples be added based on this session?

5. **Constraints and Validation**
   - Are there missing safety checks or validations?
   - Should destructive operations require confirmation?

### Step 5: Classify Changes

**Categorize each proposed improvement:**

| Change Type | Risk Level | User Approval |
|-------------|------------|---------------|
| **Additive** - New workflows, trigger phrases, examples | Low | Optional |
| **Enhancement** - Clarify steps, add validation, improve docs | Low | Optional |
| **Modification** - Change existing workflow logic or steps | Medium | Required |
| **Destructive** - Remove workflows, change structure, delete content | High | Required |

### Step 6: Present Findings

**Generate improvement report:**

```markdown
## Retrospective Analysis: [SkillName]

### Session Summary
- User Request: [Brief summary]
- Skill Invoked: [SkillName]
- Workflows Used: [List workflows]
- Outcome: [Success/Partial/Failed]

### Current State
- [Number] workflows
- [Number] trigger phrases in USE WHEN
- [List key capabilities]

### Proposed Improvements

#### 1. [Improvement Category]
**Type:** [Additive/Enhancement/Modification/Destructive]
**Risk:** [Low/Medium/High]
**Description:** [What will change and why]
**Rationale:** [How this addresses gaps from the session]

[Repeat for each improvement]

### Recommended Actions
- [ ] [Action 1] - [Risk Level]
- [ ] [Action 2] - [Risk Level]
```

### Step 7: Get User Approval

**For Low-Risk Changes (Additive/Enhancement):**
```
Present findings and ask:
"These improvements are additive and low-risk. Would you like me to proceed with all of them, or would you like to review each one individually?"

Options:
1. "Proceed with all" -> Apply all low-risk changes
2. "Review individually" -> Go through each change for approval
3. "Skip" -> Move to medium/high-risk changes only
```

**For Medium/High-Risk Changes (Modification/Destructive):**
```
For medium/high-risk changes, present each change individually with:
- Current content/behavior
- Proposed new content/behavior
- Risk assessment
- Impact on existing functionality

Request explicit confirmation:
"This change modifies existing functionality. Type 'confirm' to proceed or 'skip' to move to next change."
```

### Step 8: Apply Approved Changes

**Execute changes in order:**

1. **Additive changes** (if approved)
   - Add new workflows using ManageWorkflows workflow
   - Add trigger phrases to SKILL.md description
   - Add examples to SKILL.md

2. **Enhancement changes** (if approved)
   - Update workflow files with clarifications
   - Add validation steps
   - Improve documentation

3. **Modification changes** (if confirmed)
   - Update existing workflow logic
   - Modify routing table entries
   - Update skill structure

4. **Destructive changes** (if confirmed)
   - Remove workflows with confirmation
   - Delete obsolete content
   - Restructure as needed

### Step 9: Validate Changes

**Run validation suite:**
- Verify SKILL.md frontmatter is valid
- Check all workflow references resolve
- Ensure TitleCase naming compliance
- Verify USE WHEN clause is present
- Check routing table matches actual files

**Compare before/after:**
- List what was added
- List what was modified
- List what was removed (if any)

### Step 10: Report Results

```
SUMMARY: Retrospective analysis completed for [SkillName]
ACTIONS:
  - Analyzed session with [N] interactions
  - Identified [N] improvement opportunities
  - Applied [N] changes ([N] additive, [N] enhancements, [N] modifications)
  - Skipped [N] changes (user declined or high-risk)
RESULTS:
  - [List key improvements made]
  - Validation: [PASSED/FAILED]
COMPLETED: [SkillName] has been enhanced based on session insights.

BEFORE/AFTER COMPARISON:
Added:
  - [New workflows, trigger phrases, examples]
Modified:
  - [Changed workflows or content]
Removed:
  - [Deleted content, if any]
```

### Step 10.5: Organization Check

After applying session-based improvements, check whether content placement is still sound:

- Is there content in `SKILL.md` that is only used by one specific workflow (and would be clearer living in that workflow file)?
- Are there context files now referenced by ALL workflows (and would be clearer as universal content in `SKILL.md`)?
- Did any workflow grow to cover two conceptually distinct jobs (a split candidate)?

If **any** answer is yes:
```
Organization signal found — consider running WorkflowDecompose for a placement analysis.
Would you like to run WorkflowDecompose on [SkillName] now? (yes / no / later)
```

If all answers are no: skip silently — no output needed.

## Constraints

- **Non-destructive by default** - Prefer adding over modifying, modifying over deleting
- **Explicit confirmation required** - All medium/high-risk changes need user approval
- **Preserve functionality** - Always confirm with user before removing workflows or capabilities
- **Session-based improvements** - All suggestions must be grounded in observed session behavior
- **Validation mandatory** - All changes must pass validation before completion
- **Rollback awareness** - Document original state for potential rollback

## Safety Mechanisms

1. **Pre-change backup** - Note all original content before modifications
2. **Incremental changes** - Apply changes one at a time with validation
3. **User gate for risk** - Medium/high-risk changes blocked without explicit user confirmation
4. **Validation gates** - Changes rejected if they fail validation checks
5. **Clear impact assessment** - Every change includes rationale tied to session observations

## Example Output

```
SUMMARY: Retrospective analysis completed for CreateSkill
ACTIONS:
  - Analyzed session with 15 interactions
  - User requested help creating a new skill with custom validation
  - Identified 4 improvement opportunities:
    1. Add trigger phrase "custom validation" to USE WHEN (Low Risk) ✓ Applied
    2. Add Step 4 to Create workflow for custom validation (Enhancement) ✓ Applied
    3. Add example showing custom validation use case (Low Risk) ✓ Applied
    4. Remove deprecated workflow templates (High Risk) ✗ Skipped (user declined)
RESULTS:
  - Enhanced Create workflow with validation step
  - Added "custom validation" to skill triggers
  - Added practical example based on this session
  - Validation: PASSED
COMPLETED: CreateSkill enhanced with custom validation support.

BEFORE/AFTER COMPARISON:
Added:
  - Trigger phrase: "custom validation"
  - Workflow step: "Step 4: Add Custom Validation" in Create.md
  - Example: "Example 3: Skill with Custom Validation Rules"
Modified:
  - None
Removed:
  - None
```

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| Improvement recommendations require content changes | ModifyContent | Announce: "Running ModifyContent to apply recommended changes..." then execute `Workflows/ModifyContent.md` |
| Session reveals a missing workflow that should be added | ManageWorkflows | Announce: "Running ManageWorkflows to add the missing workflow..." then execute `Workflows/ManageWorkflows.md` |

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Skipped chains MUST be logged — silence on a skipped chain violates SC7.

If no conditions match, skip follow-ups.
