# Risk Framework

Change categorization and risk assessment guide for skill modifications.

Used by: `RefactorSkill.md`, `Retrospective.md`

---

## Change Categories

| Category | Description | Risk Level | User Approval |
|----------|-------------|------------|---------------|
| **Additive** | New workflows, trigger phrases, examples | Low | Optional |
| **Enhancement** | Clarify steps, add validation, improve docs | Low | Optional |
| **Modification** | Change existing workflow logic or steps | Medium | Required |
| **Destructive** | Remove workflows, change structure, delete content | High | Required |

---

## Risk Levels

### Low Risk
- Adding new content that doesn't change existing behavior
- Documentation improvements
- New examples or trigger phrases
- New workflows that extend capabilities

**Approval:** Optional - can proceed with user awareness

### Medium Risk
- Modifying existing workflow steps
- Changing routing table entries
- Updating skill structure
- Renaming files (breaks git history)

**Approval:** Required - present change and get confirmation

### High Risk
- Removing workflows or capabilities
- Deleting content
- Renaming skill directory
- Merging or splitting skills
- Any change that could break existing usage

**Approval:** Required - present detailed impact assessment

---

## Decision Framework Template

For each proposed change, document:

```
CHANGE #: [Title of change]

What changes: [Specific files, sections, or content being modified]
Why: [Root problem being addressed]
Impact: [CRITICAL/HIGH/MEDIUM/LOW] - [who/what affected]
Risk: [HIGH/MEDIUM/LOW] - [brief justification]
Rollback: [Specific steps to undo, or "Revert file changes" for simple cases]
Dependencies: [List if any, or "None"]
```

---

## Impact Assessment

### Breaking Changes

Changes that affect existing users or integrations:
- Renaming skill → User commands, git history, documentation
- Restructuring workflows → Existing user workflows, routing
- Removing capabilities → Features users depend on

### Backward Compatibility

What must be preserved:
- Existing trigger phrases should continue to work
- Workflow behavior should not change unexpectedly
- Tool interfaces should remain stable

### Complexity Implications

Consider:
- Added complexity vs. improved clarity
- Long-term maintenance burden
- User cognitive load

---

## Approval Workflow

### For Low-Risk Changes

```
Present findings and ask:
"These improvements are additive and low-risk. Would you like me to
proceed with all of them, or would you like to review each individually?"

Options:
1. "Proceed with all" -> Apply all low-risk changes
2. "Review individually" -> Go through each change for approval
3. "Skip" -> Move to medium/high-risk changes only
```

### For Medium/High-Risk Changes

```
Present each change individually with:
- Current content/behavior
- Proposed new content/behavior
- Risk assessment
- Impact on existing functionality

Request explicit confirmation:
"This change modifies existing functionality. Type 'confirm' to proceed
or 'skip' to move to next change."
```

---

## Plan Presentation Template

```
REFACTORING PLAN: [SkillName]

Goal: [High-level objective]

Summary:
  - X breaking changes (HIGH risk)
  - Y structural improvements (MEDIUM risk)
  - Z minor cleanups (LOW risk)

CHANGE 1: [Title]
  What: [Brief summary]
  Why: [Brief reason]
  Impact: [Severity level]
  Risk: [Level]

CHANGE 2: [Title]
  What: [Brief summary]
  Why: [Brief reason]
  Impact: [Severity level]
  Risk: [Level]

Total files affected: X
Estimated rollback effort: [Quick / Moderate / Extensive]

Confirm to proceed? (yes/no)
```

---

## Safety Mechanisms

1. **Pre-change backup** - Note all original content before modifications
2. **Incremental changes** - Apply changes one at a time with validation
3. **User gate for risk** - Medium/high-risk changes blocked without confirmation
4. **Validation gates** - Changes rejected if they fail validation checks
5. **Clear impact assessment** - Every change includes rationale

---

## Rollback Guidelines

### Quick Rollback (Low Risk)
- Revert file changes via git or undo
- No downstream effects

### Moderate Rollback (Medium Risk)
- Revert file changes
- May need to update references
- Check routing table consistency

### Extensive Rollback (High Risk)
- Full restore from documented original state
- May require manual fixes
- Validate all references after restore

---

## Common Patterns

| Scenario | Risk | Key Considerations |
|----------|------|-------------------|
| Add new workflow | Low | Ensure routing table updated |
| Rename workflow | Medium | Update all references, routing |
| Remove workflow | High | Confirm no dependencies, user approval |
| Update workflow steps | Medium | Preserve behavior, test afterward |
| Add trigger phrase | Low | Ensure no conflicts with other skills |
| Change skill name | High | Affects directory, YAML, all references |
| Merge skills | High | Plan for combined routing, no overlap |
| Split skill | High | Ensure both skills complete and valid |
