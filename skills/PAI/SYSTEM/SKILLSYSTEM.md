# Custom Skill System

**The MANDATORY configuration system for ALL PAI skills.**

---

## THIS IS THE AUTHORITATIVE SOURCE

This document defines the **required structure** for every skill in the PAI system.

**ALL skill creation MUST follow this structure** - including skills created by the CreateSkill skill.

**"Canonicalize a skill"** = Restructure it to match this exact format, including TitleCase naming.

If a skill does not follow this structure, it is not properly configured and will not work correctly.

---

## TitleCase Naming Convention (MANDATORY)

**All naming in the skill system MUST use TitleCase (PascalCase).**

| Component | Wrong | Correct |
|-----------|-------|---------|
| Skill directory | `createskill`, `create-skill`, `CREATE_SKILL` | `Createskill` or `CreateSkill` |
| Workflow files | `create.md`, `update-info.md`, `SYNC_REPO.md` | `Create.md`, `UpdateInfo.md`, `SyncRepo.md` |
| Reference docs | `prosody-guide.md`, `API_REFERENCE.md` | `ProsodyGuide.md`, `ApiReference.md` |
| Tool files | `manage-server.ts`, `MANAGE_SERVER.ts` | `ManageServer.ts` |
| Help files | `manage-server.help.md` | `ManageServer.help.md` |
| YAML name | `name: create-skill` | `name: CreateSkill` |

**TitleCase Rules:**
- First letter of each word capitalized
- No hyphens, underscores, or spaces
- No ALL_CAPS or all_lowercase
- Single words: first letter capital (e.g., `Blogging`, `Daemon`)
- Multi-word: each word capitalized, no separator (e.g., `UpdateDaemonInfo`, `SyncRepo`)

**Exception:** `SKILL.md` is always uppercase (convention for the main skill file).

---

## Personal vs System Skills (CRITICAL)

**Skills are classified into two categories:**

### System Skills (Shareable via PAI Packs)
- Use **TitleCase** naming: `Browser`, `Research`, `Development`
- Contain NO personal data (contacts, API keys, team members)
- Reference `${PAI_DIR}/skills/PAI/USER/` for any personalization
- Can be exported to the public PAI repository

### Personal Skills (Never Shared)
- Use **underscore + ALL CAPS** naming: `_BLOGGING`, `_METRICS`, `_CLICKUP`
- Contain personal configuration, API keys, business-specific workflows
- Will NEVER be pushed to public PAI
- The underscore prefix makes them sort first and visually distinct

**Pattern for Personalization in System Skills:**
System skills should reference CORE/USER files for personal data:
```markdown
## Configuration
Personal configuration loaded from:
- `${PAI_DIR}/skills/PAI/USER/CONTACTS.md` - Contact information
- `${PAI_DIR}/skills/PAI/USER/TECHSTACKPREFERENCES.md` - Tech preferences
```

**NEVER hardcode personal data in system skills.**

---

## The Required Structure

Every SKILL.md has two parts:

### 1. YAML Frontmatter (Single-Line Description)

```yaml
---
name: SkillName
description: [What it does]. USE WHEN [intent triggers using OR]. [Additional capabilities].
implements: Science              # Optional: declares Science Protocol compliance
science_cycle_time: meso         # Optional: micro | meso | macro
---
```

**Rules:**
- `name` uses **TitleCase**
- `description` is a **single line** (not multi-line with `|`)
- `USE WHEN` keyword is **MANDATORY** (Claude Code parses this for skill activation)
- Use intent-based triggers with `OR` for multiple conditions
- Max 1024 characters (Anthropic hard limit)
- **NO separate `triggers:` or `workflows:` arrays in YAML**

### Science Protocol Compliance (Optional)

Skills that involve systematic investigation, iteration, or evidence-based improvement can declare Science Protocol compliance:

```yaml
implements: Science
science_cycle_time: meso
```

**What This Means:**
- The skill embodies the scientific method: Goal → Observe → Hypothesize → Experiment → Measure → Analyze → Iterate
- This is documentation of the mapping, not runtime coupling
- Skills implement Science like classes implement interfaces—they follow the pattern independently

**Cycle Time Options:**
| Level | Cycle Time | Formality | Example Skills |
|-------|------------|-----------|----------------|
| `micro` | Seconds-Minutes | Implicit (internalized) | Most skills |
| `meso` | Hours-Days | Explicit when stuck | Evals, Research, Development |
| `macro` | Weeks-Months | Formal documentation | Major architecture work |

### 2. Markdown Body (Workflow Routing + Examples + Documentation)

```markdown
# SkillName

[Brief description of what the skill does]

## Voice Notification

**When executing a workflow, do BOTH:**

1. **Send voice notification**:
   ```bash
   curl -s -X POST ${VOICE_SERVER_URL}/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow from the SKILLNAME skill"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow from the **SkillName** skill...
   ```

**Full documentation:** `${PAI_DIR}/skills/PAI/SYSTEM/THENOTIFICATIONSYSTEM.md`

## Workflow Routing

The notification announces workflow execution. The routing table tells Claude which workflow to execute:

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase" | `Workflows/WorkflowOne.md` |
| **WorkflowTwo** | "another trigger" | `Workflows/WorkflowTwo.md` |

## Examples

**Example 1: [Common use case]**
```
User: "[Typical user request]"
→ Invokes WorkflowOne workflow
→ [What skill does]
→ [What user gets back]
```

**Example 2: [Another use case]**
```
User: "[Another typical request]"
→ [Process]
→ [Output]
```

## [Additional Sections]

[Documentation, quick reference, critical paths, etc.]
```

**Workflow routing format:** Table with Workflow, Trigger, File columns
- Workflow names in **TitleCase** matching file names
- Simple trigger description
- File path in backticks

**When to show the workflow message:**
- ONLY output the message when actually loading and executing a workflow file
- If the skill handles the request directly without calling a workflow, do NOT show the message
- The message indicates "I'm reading and following instructions from a workflow file"

---

## Dynamic Loading Pattern (Recommended for Large Skills)

**Purpose:** Reduce context on skill invocation by keeping SKILL.md minimal and loading additional context files only when needed.

### How Loading Works

**Session Startup:**
- Only frontmatter (YAML) loads from all SKILL.md files for routing

**Skill Invocation:**
- Full SKILL.md body loads when skill is invoked
- Additional .md context files load when referenced by workflows or called directly

**Benefit:** Most skill invocations don't need all documentation - load only what workflows actually use.

### The Pattern

**SKILL.md** = Minimal routing + quick reference (30-50 lines)
**Additional .md files** = Context files - SOPs for specific aspects (loaded on-demand)

### Structure

```
skills/SkillName/
├── SKILL.md                    # Minimal routing - loads on invocation
├── Aesthetic.md                # Context file - SOP for aesthetic handling
├── Examples.md                 # Context file - SOP for examples
├── ApiReference.md             # Context file - SOP for API usage
├── Tools.md                    # Context file - SOP for tool usage
├── Workflows/                  # Workflow execution files
│   ├── Create.md
│   └── Update.md
└── Tools/                      # Actual CLI tools
    └── Generate.ts
```

### 🚨 CRITICAL: NO Context/ Subdirectory 🚨

**NEVER create a Context/ or Docs/ subdirectory.**

The additional .md files ARE the context files. They live **directly in the skill root directory** alongside SKILL.md.

**WRONG (DO NOT DO THIS):**
```
skills/SkillName/
├── SKILL.md
└── Context/              ❌ NEVER CREATE THIS DIRECTORY
    ├── Aesthetic.md
    └── Examples.md
```

**CORRECT:**
```
skills/SkillName/
├── SKILL.md
├── Aesthetic.md          ✅ Context file in skill root
└── Examples.md           ✅ Context file in skill root
```

**The skill directory itself IS the context.** Additional .md files are context files that provide SOPs for specific aspects of the skill's operation.

---

## Canonicalization

**"Canonicalize a skill"** means restructuring it to match this document exactly.

### When to Canonicalize

- Skill has old YAML format (separate `triggers:` or `workflows:` arrays)
- Skill uses non-TitleCase naming
- Skill is missing `USE WHEN` in description
- Skill lacks `## Examples` section
- Skill has `backups/` inside its directory
- Workflow routing uses old format

### Canonicalization Checklist

#### Naming (TitleCase)
- [ ] Skill directory uses TitleCase
- [ ] All workflow files use TitleCase
- [ ] All reference docs use TitleCase
- [ ] All tool files use TitleCase
- [ ] Routing table names match file names exactly
- [ ] YAML `name:` uses TitleCase

#### YAML Frontmatter
- [ ] Single-line `description` with embedded `USE WHEN`
- [ ] No separate `triggers:` or `workflows:` arrays
- [ ] Description uses intent-based language
- [ ] Description under 1024 characters

#### Markdown Body
- [ ] `## Workflow Routing` section with table format
- [ ] All workflow files have routing entries
- [ ] `## Examples` section with 2-3 concrete patterns

#### Structure
- [ ] `tools/` directory exists (even if empty)
- [ ] No `backups/` directory inside skill
- [ ] Reference docs at skill root (not in Workflows/)
- [ ] Workflows contain ONLY execution procedures

---

## Examples Section (REQUIRED)

**Every skill MUST have an `## Examples` section** showing 2-3 concrete usage patterns.

**Why Examples Matter:**
- Anthropic research shows examples improve tool selection accuracy from 72% to 90%
- Descriptions tell Claude WHEN to activate; examples show HOW the skill works
- Claude learns the full input→behavior→output pattern, not just trigger keywords

**Example Format:**
```markdown
## Examples

**Example 1: [Use case name]**
```
User: "[Actual user request]"
→ Invokes WorkflowName workflow
→ [What the skill does - action 1]
→ [What user receives back]
```

**Example 2: [Another use case]**
```
User: "[Different request pattern]"
→ [Process steps]
→ [Output/result]
```
```

**Guidelines:**
- Use 2-3 examples per skill (not more)
- Show realistic user requests (natural language)
- Include the workflow or action taken (TitleCase)
- Show what output/result the user gets
- Cover the most common use cases

---

## Intent Matching, Not String Matching

We use **intent matching**, not exact phrase matching.

**Example description:**
```yaml
description: Complete blog workflow. USE WHEN user mentions doing anything with their blog, website, site, including things like update, proofread, write, edit, publish, preview, blog posts, articles, headers, or website pages, etc.
```

**Key Principles:**
- Use intent language: "user mentions", "user wants to", "including things like"
- Don't list exact phrases in quotes
- Cover the domain conceptually
- Use `OR` to combine multiple trigger conditions

---

## Directory Structure

Every skill follows this structure:

```
SkillName/                    # TitleCase directory name
├── SKILL.md                  # Main skill file (always uppercase)
├── QuickStartGuide.md        # Context/reference files in root (TitleCase)
├── DefenseMechanisms.md      # Context/reference files in root (TitleCase)
├── Examples.md               # Context/reference files in root (TitleCase)
├── Tools/                    # CLI tools (ALWAYS present, even if empty)
│   ├── ToolName.ts           # TypeScript CLI tool (TitleCase)
│   └── ToolName.help.md      # Tool documentation (TitleCase)
└── Workflows/                # Work execution workflows (TitleCase)
    ├── Create.md             # Workflow file
    ├── UpdateInfo.md         # Workflow file
    └── SyncRepo.md           # Workflow file
```

- **SKILL.md** - Contains single-line description in YAML, workflow routing and documentation in body
- **Context files (in root)** - Documentation, guides, reference materials live in skill root, NOT in subdirectories (TitleCase names)
- **Tools/** - CLI tools for automation (ALWAYS present directory, even if empty)
- **Workflows/** - Contains work execution workflows ONLY (TitleCase names)
- **NO Resources/ or Docs/ subdirectories** - Context files go in skill root

---

## Flat Folder Structure (MANDATORY)

**CRITICAL: Keep folder structure FLAT - maximum 2 levels deep.**

### The Rule

Skills use a **flat hierarchy** - no deep nesting of subdirectories.

**Maximum depth:** `skills/SkillName/Category/`

### ✅ ALLOWED (2 levels max)

```
skills/OSINT/SKILL.md                           # Skill root
skills/OSINT/Workflows/CompanyDueDiligence.md   # Workflow - one level deep
skills/OSINT/Tools/Analyze.ts                   # Tool - one level deep
skills/OSINT/CompanyTools.md                    # Context file - in root
skills/OSINT/Examples.md                        # Context file - in root
```

### ❌ FORBIDDEN (Too deep OR wrong location)

```
skills/OSINT/Resources/Examples.md              # Context files go in root, NOT Resources/
skills/OSINT/Docs/CompanyTools.md               # Context files go in root, NOT Docs/
skills/OSINT/Templates/Primitives/Extract.md    # THREE levels - NO
skills/OSINT/Workflows/Company/DueDiligence.md  # THREE levels - NO
```

### Why Flat Structure

1. **Discoverability** - Easy to find files with simple `ls` or `grep`
2. **Simplicity** - Less cognitive overhead navigating directories
3. **Speed** - Faster file operations without deep traversal
4. **Maintainability** - Harder to create organizational complexity
5. **Consistency** - Every skill follows same simple pattern

---

## CLI Tools (`tools/` directory)

**Every skill MUST have a `tools/` directory**, even if empty. CLI tools automate repetitive tasks and manage stateful resources.

### When to Create a CLI Tool

Create CLI tools for:
- **Server management** - start, stop, restart, status
- **State queries** - check if running, get configuration
- **Repeated operations** - tasks executed frequently by workflows
- **Complex automation** - multi-step processes that benefit from encapsulation

### Tool Requirements

Every CLI tool must:
1. **Be TypeScript** - Use `#!/usr/bin/env bun` shebang
2. **Use TitleCase naming** - `ToolName.ts`, not `tool-name.ts`
3. **Have a help file** - `ToolName.help.md` with full documentation
4. **Support `--help`** - Display usage information
5. **Use colored output** - ANSI colors for terminal feedback
6. **Handle errors gracefully** - Clear error messages, appropriate exit codes
7. **Expose configuration via flags** - Enable behavioral control

### Tool Structure

```typescript
#!/usr/bin/env bun
/**
 * ToolName.ts - Brief description
 *
 * Usage:
 *   bun ${PAI_DIR}/skills/SkillName/Tools/ToolName.ts <command> [options]
 *
 * Commands:
 *   start     Start the thing
 *   stop      Stop the thing
 *   status    Check status
 *
 * @author PAI System
 * @version 1.0.0
 */
```

**Principle:** Workflows call tools; tools encapsulate complexity. This keeps workflows simple and tools reusable.

---

## How It Works

1. **Skill Activation**: Claude Code reads skill descriptions at startup. The `USE WHEN` clause in the description determines when the skill activates based on user intent.

2. **Workflow Routing**: Once the skill is active, the `## Workflow Routing` section determines which workflow file to execute.

3. **Workflow Execution**: Follow the workflow file instructions step-by-step.

---

## Skills Are Scripts to Follow

When a skill is invoked, follow the SKILL.md instructions step-by-step rather than analyzing the skill structure.

**The pattern:**
1. Execute voice notification (if present)
2. Use the routing table to find the right workflow
3. Follow the workflow instructions in order
4. Your behavior should match the Examples section

Think of SKILL.md as a script - it already encodes "how to do X" so you can follow it directly.

---

## Complete Checklist

Before a skill is complete:

### Naming (TitleCase)
- [ ] Skill directory uses TitleCase (e.g., `Blogging`, `Daemon`)
- [ ] YAML `name:` uses TitleCase
- [ ] All workflow files use TitleCase (e.g., `Create.md`, `UpdateInfo.md`)
- [ ] All reference docs use TitleCase (e.g., `ProsodyGuide.md`)
- [ ] All tool files use TitleCase (e.g., `ManageServer.ts`)
- [ ] Routing table workflow names match file names exactly

### YAML Frontmatter
- [ ] Single-line `description` with embedded `USE WHEN` clause
- [ ] No separate `triggers:` or `workflows:` arrays
- [ ] Description uses intent-based language
- [ ] Description under 1024 characters

### Markdown Body
- [ ] `## Workflow Routing` section with table format
- [ ] All workflow files have routing entries
- [ ] **`## Examples` section with 2-3 concrete usage patterns** (REQUIRED)

### Structure
- [ ] `tools/` directory exists (even if empty)
- [ ] No `backups/` directory inside skill
- [ ] Workflows contain ONLY work execution procedures
- [ ] Reference docs live at skill root (not in Workflows/)
- [ ] Each CLI tool has a corresponding `.help.md` documentation file
- [ ] (Recommended) Output Requirements section for variable-output skills

---

## Summary

| Component | Purpose | Naming |
|-----------|---------|--------|
| **Skill directory** | Contains all skill files | TitleCase (e.g., `Blogging`) |
| **SKILL.md** | Main skill file | Always uppercase |
| **Workflow files** | Execution procedures | TitleCase (e.g., `Create.md`) |
| **Reference docs** | Information to read | TitleCase (e.g., `ApiReference.md`) |
| **Tool files** | CLI automation | TitleCase (e.g., `ManageServer.ts`) |

This system ensures:
1. Skills invoke properly based on intent (USE WHEN in description)
2. Specific functionality executes accurately (Workflow Routing in body)
3. All skills have consistent, predictable structure
4. **All naming follows TitleCase convention**
