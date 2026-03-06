# CreateSkill Workflow Transcript — RecipeManager

## Task

Create a skill called RecipeManager for organizing recipes -- adding new recipes, searching by ingredient, generating shopping lists from meal plans. Triggers: recipes, cooking, meal planning.

## Workflow Followed

SkillForge > Workflows/CreateSkill.md (9 steps)

---

## Step 1: Load Prompting Standards

**Tool:** Read `skills/SkillForge/Standards/PromptingStandards.md`

**Decision:** Loaded and internalized all prompting standards before writing any skill content. Key takeaways applied:
- Use intent-based language in USE WHEN clause, not literal phrase lists
- Trigger phrases 2-6 words each
- Soft language (avoid "MUST", "CRITICAL")
- No XML tags, markdown only
- Positive framing throughout

---

## Step 2: Understand the Request

**Tool:** None (extracted from user prompt)

**Answers to interview questions:**
1. **What does this skill do?** Organizes recipes — adding new recipes, searching by ingredient, generating shopping lists from meal plans.
2. **What should trigger it?** Recipes, cooking, meal planning.
3. **What workflows does it need?** AddRecipe, SearchByIngredient, GenerateShoppingList.

**Decision:** The user provided all three answers directly in the task description, so no interactive interview was needed. Per instructions, assumed user approves and proceeded.

---

## Step 3: Classify Workflows

**Tool:** None (analysis step)

**Classification:**
| Workflow | Type | Reasoning |
|----------|------|-----------|
| AddRecipe | User-facing | Users would say "add a recipe" directly |
| SearchByIngredient | User-facing | Users would say "what can I make with..." directly |
| GenerateShoppingList | User-facing | Users would say "generate shopping list" directly |

**Decision:** All three workflows are user-facing and go in the routing table. No internal-only workflows needed.

---

## Step 4: Determine TitleCase Names

**Tool:** Read `skills/SkillForge/Standards/SkillSystem.md`

**Names determined:**
- Skill: `RecipeManager`
- Workflows: `AddRecipe`, `SearchByIngredient`, `GenerateShoppingList`

**Decision:** All names follow PascalCase convention. No hyphens, underscores, or spaces.

---

## Step 5: Create Directory Structure

**Tool:** Bash `mkdir -p`

**Created:**
```
RecipeManager/
  Workflows/
  Tools/
```

**Decision:** Created both Workflows/ and Tools/ directories. Tools/ is empty but required by SkillSystem.md ("Tools/ directory MUST always be present").

---

## Step 6: Create SKILL.md

**Tool:** Write `RecipeManager/SKILL.md`

**Decisions:**
- **USE WHEN clause:** Used intent-based OR triggers covering: recipes, cooking, meal planning, add recipe, search ingredient, shopping list, meal prep, recipe collection, find recipe, what ingredients, grocery list. Covered synonyms and natural phrasings per PromptingStandards.
- **Description opening:** Started with what the skill does ("Organize and manage recipes...") before the USE WHEN clause, following the pattern from SkillSystem.md.
- **Routing table:** Three entries, one per workflow, with 3-4 trigger phrases each. All trigger phrases are 2-6 words.
- **Examples:** Three concrete examples covering each workflow, showing user input -> invocation -> actions -> output.
- **"read its file and follow the steps within it":** Included verbatim above routing table as required by SkillSystem.md.

---

## Step 7: Create Workflow Files

**Tool:** Write (3 files)

### AddRecipe.md
- Trigger line with 4 natural phrases
- Reference Material: None (no external context files needed)
- Purpose: Capture and store recipes in structured format
- 4 workflow steps: Collect details, Normalize ingredients, Format and store, Confirm
- Included ingredient field table (required/optional)
- Included standardized unit list for normalization
- Included recipe markdown template

### SearchByIngredient.md
- Trigger line with 4 natural phrases
- Reference Material: None
- Purpose: Search by ingredient with ranked results
- 4 workflow steps: Collect ingredients, Search collection, Rank and filter, Present results
- Included match score calculation (percentage-based)
- Included result display template with have/need breakdown
- Included fallback threshold logic (50% -> 25% -> no results)

### GenerateShoppingList.md
- Trigger line with 4 natural phrases
- Reference Material: None
- Purpose: Consolidate ingredients from meal plans into shopping lists
- 5 workflow steps: Collect meal plan, Scale ingredients, Consolidate, Categorize, Output
- Included grocery category taxonomy table
- Included unit conversion rules
- Included checkbox-format output template

**Decision:** Each workflow follows the canonical structure from SkillSystem.md: Trigger line, Reference Material, Purpose, Workflow Steps. All workflows are self-contained with no external context file dependencies.

---

## Step 8: Generate SkillIntent.md

**Tool:** Write `RecipeManager/SkillIntent.md`

**Decisions:**
- **First Principles:** Derived 3 principles from the skill's purpose: (1) recipes as structured data, (2) ingredient-first search, (3) shopping as bridge between planning and cooking.
- **Problem statement:** Framed as the gap — scattered recipes, manual scanning, error-prone shopping list creation.
- **Design Decisions table:** 4 decisions documented with alternatives rejected and reasoning.
- **Out-of-Scope:** 5 explicit exclusions: nutritional analysis, web scraping, meal plan generation, inventory tracking, recipe sharing.
- **Success Criteria:** 5 binary-testable criteria, each pointing to an observable artifact:
  1. Recipe findable by its ingredients after adding
  2. Search results ranked by match percentage
  3. No duplicate ingredients in consolidated shopping lists
  4. All required fields populated in stored recipes
  5. Quantities correctly scaled for serving multipliers
- **Constraints:** 5 non-negotiable rules covering decimal notation, lowercase ingredients, standardized units, markdown format, checkbox output.

**Testability gate verification:**
- All 5 criteria are binary-testable (YES/NO in under 5 seconds)
- All point to observable artifacts (search results, shopping lists, recipe files)
- All are atomic (no "and" — each tests one thing)
- Exceeds minimum of 3 criteria

---

## Step 9: Verify

**Tool:** Bash (find), Read (SKILL.md frontmatter)

**Validation results against SkillSystem.md checklist:**

### Naming
- [x] Skill directory uses TitleCase: RecipeManager
- [x] YAML name uses TitleCase: RecipeManager
- [x] All workflow files use TitleCase: AddRecipe.md, SearchByIngredient.md, GenerateShoppingList.md
- [x] Routing table names match file names

### YAML Frontmatter
- [x] Single-line description with USE WHEN
- [x] No separate triggers: or workflows: arrays
- [x] Intent-based language
- [x] Under 1024 characters

### Markdown Body
- [x] Workflow Routing section with table
- [x] "read its file and follow the steps within it" instruction present
- [x] All 3 routing entries resolve to existing files
- [x] Examples section with 3 patterns

### Structure
- [x] Tools/ directory exists (empty)
- [x] No blocklisted subdirectories
- [x] Each workflow has Reference Material section
- [x] SkillIntent.md present with all required sections

### Bidirectional Integrity
- [x] Every routing table entry has a matching file (3/3)
- [x] Every Workflows/*.md has a routing table entry (3/3)
- [x] No ghost files

### SkillIntent Completeness
- [x] SkillIntent.md exists
- [x] Success Criteria section has 5 criteria (exceeds minimum 3)

**ValidateSkill.ts:** Not run because the skill is in a non-standard output directory, not under $PAI_DIR/skills/. Manual validation performed against the full checklist from SkillSystem.md instead.

---

## Files Created

| File | Purpose |
|------|---------|
| `RecipeManager/SKILL.md` | Main skill file with frontmatter, routing table, examples |
| `RecipeManager/SkillIntent.md` | Design intent document with principles, decisions, criteria |
| `RecipeManager/Workflows/AddRecipe.md` | Workflow for adding new recipes |
| `RecipeManager/Workflows/SearchByIngredient.md` | Workflow for searching recipes by ingredient |
| `RecipeManager/Workflows/GenerateShoppingList.md` | Workflow for generating shopping lists from meal plans |
| `RecipeManager/Tools/` | Empty tools directory (required by convention) |

## Tool Call Summary

| Tool | Count | Purpose |
|------|-------|---------|
| Read | 4 | SKILL.md, CreateSkill.md, PromptingStandards.md, SkillSystem.md, frontmatter verification |
| Write | 5 | SKILL.md, SkillIntent.md, 3 workflow files |
| Bash | 4 | Directory checks, mkdir, file listing, validator check |
| Glob | 1 | Finding existing skills for reference |
| ToolSearch | 1 | Loading tools |
| **Total** | **15** | |
