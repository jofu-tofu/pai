# Transcript: CreateSkill Workflow for ReadingList

## Task
Create a skill for tracking a personal reading list.

## Workflow Followed
SkillForge > CreateSkill workflow (`skills/SkillForge/Workflows/CreateSkill.md`)

---

## Step-by-Step Execution

### Step 1: Load Prompting Standards
- **Tool:** Read (`skills/SkillForge/Standards/PromptingStandards.md`)
- **Decision:** Read the prompting standards as required. Key takeaways applied:
  - Use intent-based trigger language, not exact phrase matching
  - USE WHEN clause with OR-separated triggers
  - Soft language (avoid "MUST", "CRITICAL")
  - Trigger phrases 2-6 words each
  - Positive framing for instructions

### Step 1b: Load Skill System Spec
- **Tool:** Read (`skills/SkillForge/Standards/SkillSystem.md`)
- **Decision:** Read the canonical skill structure specification. Key takeaways applied:
  - TitleCase naming throughout
  - YAML frontmatter with single-line description containing USE WHEN
  - Required sections: Workflow Routing (with "read its file" instruction), Examples (2-3 patterns)
  - Directory structure: SKILL.md, SkillIntent.md, Workflows/, Tools/
  - SkillIntent.md must have Success Criteria with 3+ binary-testable items

### Step 2: Understand the Request
- **Tool:** Write (`outputs/questions.md`)
- **Decision:** Since the workflow calls for interviewing the user, I wrote the questions I would ask to `questions.md` and proceeded with reasonable assumptions:
  - Items tracked: Books primarily, flexible for articles and papers
  - Storage: Markdown table file at `$PAI_DIR/data/ReadingList.md`
  - Status model: to-read, reading, finished, dropped
  - Metadata: title, author, date added, status, rating (1-5), notes
  - Three user-facing workflows: AddBook, UpdateStatus, ViewList

### Step 3: Classify Workflows
- **Decision:** All three workflows are user-facing (users would type trigger phrases directly), so all go in the routing table. No internal-only workflows needed.
  - **AddBook** - user-facing (user says "add book to reading list")
  - **UpdateStatus** - user-facing (user says "mark book finished")
  - **ViewList** - user-facing (user says "what am I reading")

### Step 4: Determine TitleCase Names
- **Decision:** Applied TitleCase naming:
  - Skill directory: `ReadingList`
  - Workflows: `AddBook`, `UpdateStatus`, `ViewList`
  - All conform to PascalCase rules from SkillSystem.md

### Step 5: Create Directory Structure
- **Tool:** Bash (`mkdir -p`)
- **Decision:** Created:
  - `outputs/ReadingList/Workflows/`
  - `outputs/ReadingList/Tools/` (empty, as required by spec)

### Step 6: Create SKILL.md
- **Tool:** Write (`outputs/ReadingList/SKILL.md`)
- **Decision:** Created with:
  - YAML frontmatter: `name: ReadingList`, single-line `description` with USE WHEN clause
  - 15 OR-separated trigger phrases covering add/update/view use cases
  - "read its file and follow the steps within it" instruction above routing table (mandatory per spec)
  - Routing table with 3 workflows
  - 3 concrete examples matching the example format from SkillSystem.md
  - Trigger phrases are 2-5 words each, natural language

### Step 7: Create Workflow Files
- **Tool:** Write (3 calls for AddBook.md, UpdateStatus.md, ViewList.md)
- **Decisions per workflow:**
  - **AddBook.md:** 4 steps - parse request, locate/create list file, add entry, confirm. Defines the markdown table schema. Reference Material: None (self-contained).
  - **UpdateStatus.md:** 4 steps - parse request, find entry (fuzzy match), apply update (status/rating/notes/remove), confirm. Includes logic for rating only on finished/dropped items. Reference Material: None.
  - **ViewList.md:** 4 steps - parse request, load list, filter/sort, display. Includes three display modes (full, filtered, recommendation). Adds summary statistics. Reference Material: None.
  - All workflows follow the canonical structure: Trigger line, Reference Material, Purpose, Workflow Steps

### Step 8: Generate SkillIntent.md
- **Tool:** Write (`outputs/ReadingList/SkillIntent.md`)
- **Decision:** Created with all required sections from the SkillSystem.md template:
  - **First Principles:** 4 principles (reading is personal, low friction, plain text, reality-based status)
  - **Problem This Skill Solves:** Reading intentions scatter across multiple locations
  - **Design Decisions:** 4 decisions with alternatives rejected and reasoning (storage format, status model, rating scale, recommendations)
  - **Explicit Out-of-Scope:** 5 items (social, sync, discovery, speed tracking, purchases)
  - **Success Criteria:** 5 binary-testable criteria (exceeds minimum of 3):
    1. Add book in single message
    2. Valid markdown output
    3. Every item has clear status
    4. Find current reading without filters
    5. Finished books retain date and rating
  - **Constraints:** 5 non-negotiable rules
  - Verified testability gate: all criteria are binary (YES/NO), point to observable artifacts, and are atomic

### Step 9: Verify
- **Tool:** Read (re-read SKILL.md), Bash (ls commands)
- **Verification checklist:**
  - [x] All files use TitleCase naming (ReadingList, AddBook, UpdateStatus, ViewList)
  - [x] YAML frontmatter parses correctly with USE WHEN clause
  - [x] All 3 routing table entries resolve to existing files
  - [x] Examples section present with 3 patterns
  - [x] Tools/ directory exists (empty)
  - [x] SkillIntent.md present with all required sections
  - [x] Description is single-line
  - [x] Description under 1024 characters
  - [x] "read its file and follow the steps within it" instruction present above routing table
  - [x] No blocklisted directories (Context, Docs, Resources, backups)
  - Note: ValidateSkill.ts was not run because it expects skills in `$PAI_DIR/skills/` and the output is in a workspace directory. Manual verification covers all the same checks.

---

## Workflow Text (CreateSkill.md - Full)

```markdown
# CreateSkill Workflow

> **Trigger:** "create a new skill", "new skill", "build a skill", "make a skill"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md` — Prompt engineering reference. Read first.
- **Skill System Spec:** `../Standards/SkillSystem.md`

## Purpose

Create a new skill following the canonical structure with proper TitleCase naming.

## Workflow Steps

### Step 1: Load Prompting Standards

Read `../Standards/PromptingStandards.md`. All skill content (descriptions, triggers, workflow instructions) must align with its principles.

### Step 2: Understand the Request

Ask the user:
1. What does this skill do?
2. What should trigger it?
3. What workflows does it need?

### Step 3: Classify Workflows

Before creating files, classify each workflow:
- **User-facing** (user would type the trigger phrase) -> goes in routing table
- **Internal** (called by another workflow) -> file exists but NOT in routing table

### Step 4: Determine TitleCase Names

All names must use TitleCase (PascalCase). See SkillSystem.md for naming rules.

### Step 5: Create Directory Structure

mkdir -p $PAI_DIR/skills/[SkillName]/Workflows
mkdir -p $PAI_DIR/skills/[SkillName]/Tools

### Step 6: Create SKILL.md

Follow the structure defined in SkillSystem.md:
- YAML frontmatter with TitleCase name: and single-line description: containing USE WHEN
- ## Workflow Routing section with table
- ## Examples section with 2-3 concrete patterns

### Step 7: Create Workflow Files

For each workflow, create Workflows/[WorkflowName].md with:
- Trigger line
- ## Reference Material section
- ## Purpose section
- ## Workflow Steps section

If a workflow calls a CLI tool, include intent-to-flag mapping tables.

### Step 8: Generate SkillIntent.md

Using the answers from Step 2, generate a SkillIntent.md for the new skill. [See full template in workflow file]

**Testability Gate:** Before writing, verify each success criterion:
- Binary-testable (YES/NO in under 5 seconds)
- Points to an observable artifact
- Atomic (no "and" — split if needed)
- Minimum 3 criteria covering distinct aspects

### Step 9: Verify

- All files use TitleCase naming
- YAML frontmatter parses correctly with USE WHEN clause
- All routing table entries resolve to existing files
- Examples section present with 2-3 patterns
- Tools/ directory exists
- SkillIntent.md present with required sections

After creating the skill, run ValidateSkill.ts on it.
```

---

## Files Created
1. `outputs/questions.md` - Interview questions with assumptions
2. `outputs/ReadingList/SKILL.md` - Main skill file with routing and examples
3. `outputs/ReadingList/SkillIntent.md` - Design intent document
4. `outputs/ReadingList/Workflows/AddBook.md` - Add book workflow
5. `outputs/ReadingList/Workflows/UpdateStatus.md` - Update status workflow
6. `outputs/ReadingList/Workflows/ViewList.md` - View list workflow
7. `outputs/ReadingList/Tools/` - Empty tools directory (required by spec)
8. `outputs/metrics.json` - Tool call metrics
