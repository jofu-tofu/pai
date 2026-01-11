---
name: PaiCli
description: PAI CLI knowledge base and command reference. USE WHEN user asks about pai command OR pai-cli features OR Claude Code integration OR development workflow OR user needs PAI CLI help. Separates AI-context knowledge from user-reference documentation.
---

# PaiCli - PAI CLI Knowledge & Reference

**Invoke when:** User asks about `pai` commands, PAI CLI capabilities, Claude Code integration, development workflows, or troubleshooting PAI CLI issues.

## Overview

The PaiCli skill provides comprehensive knowledge about the PAI CLI tool, organized by information type:
- **AI Context** - Knowledge Claude Code needs for autonomous operation (non-scriptable features, hooks, integration points)
- **User Reference** - Queryable documentation for user requests (commands, flags, troubleshooting)
- **Development Context** - AI-only knowledge for development and testing workflows

## File Structure

| File | Audience | Purpose |
|------|----------|---------|
| **AiContext.md** | AI Only | Non-scriptable Claude Code features, hooks behavior, integration context |
| **UserReference.md** | User Queries | Commands, flags, troubleshooting, installation, usage examples |
| **DevelopmentContext.md** | AI Only | Development workflow, testing patterns, code structure |
| **Architecture.md** | Both | System architecture, design principles, extensibility |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **AnswerUserQuery** | "how do I", "what is pai", "pai command" | Read UserReference.md |
| **DevelopmentTask** | "fix pai-cli", "add feature", "test pai" | Read DevelopmentContext.md |
| **ArchitectureQuestion** | "how does pai work", "design principle" | Read Architecture.md |

## Examples

**Example 1: User asks about commands**
```
User: "How do I launch Claude Code with PAI?"
→ Read UserReference.md
→ Return command: `pai launch`
→ Explain flags and options
```

**Example 2: AI needs context about hooks**
```
AI working on PAI integration
→ Read AiContext.md
→ Understand hook system behavior
→ Apply knowledge autonomously
```

**Example 3: Development task**
```
User: "Add a new command to PAI CLI"
→ Read DevelopmentContext.md
→ Follow Oclif patterns
→ Apply established conventions
```

## Quick Reference

**Installation:** `npm install -g .` from `~/.pai/pai-cli`
**Primary Commands:** `pai launch`, `pai setup`, `pai init bmad`
**Global Flags:** `--quiet`, `--debug`, `--help`
**Exit Codes:** 0=success, 1=error, 2=invalid usage, 3=environment error

## References

- Main README: `~/.pai/pai-cli/README.md`
- Architecture: `~/.pai/pai-cli/docs/architecture.md`
- Development: `~/.pai/pai-cli/docs/development-guide.md`
