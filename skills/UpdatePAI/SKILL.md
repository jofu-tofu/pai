---
name: UpdatePAI
description: Fully autonomous PAI system updater with smart defaults. USE WHEN update PAI OR upgrade PAI OR sync PAI OR backup PAI OR verify PAI. Handles major version upgrades, breaking changes, custom skill preservation, and configuration migration automatically.
---

# UpdatePAI

Autonomous PAI system updater that manages complete updates from the GitHub repository. Handles major version upgrades (v1.x → v2.x), breaking changes, custom skill preservation, and configuration migration with minimal user decisions.

**Repository:** https://github.com/danielmiessler/Personal_AI_Infrastructure

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **AutoUpdate** | "update PAI" OR "upgrade PAI" OR "sync PAI" | `Workflows/AutoUpdate.md` |
| **Analyze** | "analyze PAI" OR "check PAI version" OR "compare installation" | `Workflows/Analyze.md` |
| **Backup** | "backup PAI" OR "backup current installation" | `Workflows/Backup.md` |
| **HybridUpdate** | "manual update PAI" OR "hybrid update" | `Workflows/HybridUpdate.md` |
| **FreshInstall** | "fresh install PAI" OR "clean install" OR "reinstall PAI" | `Workflows/FreshInstall.md` |
| **Verify** | "verify PAI" OR "check installation" | `Workflows/Verify.md` |

## Examples

**Example 1: Autonomous update (default)**
```
User: "Update PAI system to latest version"
→ Invokes AutoUpdate workflow
→ Runs pre-flight analysis, creates backup, installs latest
→ Preserves custom skills, migrates config, runs tests
→ Result: Complete update in 5-10 minutes
```

**Example 2: Analyze before updating**
```
User: "What's different in my PAI vs the latest version?"
→ Invokes Analyze workflow
→ Compares current installation with repository
→ Result: Detailed analysis report with breaking changes
```

**Example 3: Verify installation health**
```
User: "Verify my PAI installation"
→ Invokes Verify workflow
→ Checks structure, validates SKILL.md files, tests hooks
→ Result: Health report with any issues found
```
