# CodingStandards — Workflow Chains

Recommended follow-up workflows after using CodingStandards.

## Post-Apply Chains

| Scenario | Follow-up Skill | Trigger |
|----------|----------------|---------|
| After applying React rules to a component | SkillForge > ValidateSkill | Confirm skill structure still valid |
| After writing TypeScript with new patterns | TestDriven | Verify type-safe patterns with tests |
| After C# refactor using async patterns | SkillForge > InvocationSim | Simulate C# scenario to confirm correct rules loaded |
| Adding a new language to this skill | SkillForge > ValidateSkill + InvocationSim | Validate structure + simulate trigger |

## Validation Chains (for SkillForge maintainers)

Run after any update to CodingStandards:

1. **ValidateSkill** — Confirms all required files exist, naming conventions correct
2. **InvocationSim** — Simulate "reviewing C# code" → only `Workflows/CSharp.md` activates
3. **InvocationSim** — Simulate "writing React components" → only `Workflows/React.md` activates
4. **InvocationSim** — Simulate "TypeScript + Python full-stack" → both `Workflows/TypeScript.md` + `Workflows/Python.md` activate
