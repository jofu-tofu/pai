# GatherContext Workflow

> Internal workflow - invoked by `Review.md`, not user-facing.

## Input / Output

**Input:**
- Target skill name/path
- Optional scope hints from user request

**Output:**
- Writes `$REVIEW_DIR/context.md`
- Returns absolute path to `context.md`

## Purpose

Create a rich context layer that gives ALL downstream dimension agents the information they need to make informed, stakeholder-aware judgments about the target design.

This is not just a structural inventory — it is an **exploration-driven assessment** of what the design contains, what it claims about itself, who it serves, and what's expected given those factors.

## Step 1: Resolve Target

1. Resolve target skill directory (`skills/[TargetSkill]`).
2. If path is invalid, return an explicit error.
3. Define default in-scope artifacts:
   - `SKILL.md`
   - `SkillIntent.md` (if present)
   - `Workflows/**/*.md`
   - `Dimensions/**/*.md` (if present)
   - `Templates/**/*.md` (if present)
   - `Standards/**/*.md` (if present)
   - `Tools/**/*` (if present)

## Step 2: Build Structural Inventory

Collect:
1. File map by category (entrypoint, internal stages, dimensions, templates, standards, tools)
2. Workflow map:
   - User-facing workflows from routing table
   - Internal workflow files not in routing
3. Existing diagram coverage (`mermaid` blocks)
4. External metadata links (`https://` or `http://`)

## Step 3: Explore and Assess Design Checklist

This is the core of context gathering. Read the target design's files and assess each checklist item below. For each item, determine:
- **Present** — The design addresses this adequately
- **Partial** — The design touches this but incompletely
- **Missing** — The design doesn't address this but should, given stakeholders and design type
- **N/A** — Not applicable to this design given its type and stakeholders

### Design Checklist

#### Identity and Audience
| # | Item | What to look for |
|---|------|-----------------|
| C1 | **Stakeholders** | Who consumes this design? (developers, maintainers, end users, reviewers, AI agents) |
| C2 | **Design type** | What kind of artifact is this? (skill, architecture doc, RFC, workflow, API spec, etc.) |
| C3 | **Purpose statement** | A clear statement of what problem this design solves and why it exists |

#### Scope and Boundaries
| # | Item | What to look for |
|---|------|-----------------|
| C4 | **Explicit scope** | What is included and what is excluded — concrete and testable |
| C5 | **Non-goals** | What the design explicitly will NOT do |
| C6 | **Boundary with adjacent systems** | Where this design ends and others begin |

#### Decisions and Rationale
| # | Item | What to look for |
|---|------|-----------------|
| C7 | **Key decisions** | Labeled decisions with chosen approach |
| C8 | **Alternatives considered** | What was rejected and why |
| C9 | **Constraints** | Hard constraints that shaped decisions (technical, organizational, resource) |

#### Structure and Flow
| # | Item | What to look for |
|---|------|-----------------|
| C10 | **Entry points** | How users/agents enter the system — clearly identified |
| C11 | **Internal stages/steps** | Pipeline, workflow, or process stages with defined handoffs |
| C12 | **Artifact contracts** | What each stage produces and what downstream stages consume |

#### Verification and Trust
| # | Item | What to look for |
|---|------|-----------------|
| C13 | **Success criteria** | How to know if the design achieves its goals |
| C14 | **Evidence for claims** | Claims tied to verifiable artifacts, not just assertions |

#### External Dependencies
| # | Item | What to look for |
|---|------|-----------------|
| C15 | **External links** | Links to external resources, with purpose labels |
| C16 | **In-doc summaries** | Critical linked items summarized in-doc so the design is understandable without clicking links |

### How to Assess

1. Read all in-scope files.
2. For each checklist item, search for evidence in the design content.
3. Assess status (Present / Partial / Missing / N/A).
4. For **Missing** items: explain WHY it's expected given the stakeholders and design type. Don't mark things missing just because a universal template says so — ground it in context.
5. For **Partial** items: note what's there and what's lacking.

## Step 4: Extract Self-Claims

From `SkillIntent.md`, `SKILL.md`, and any standards files, extract:
1. What the design says it will do (stated purpose, success criteria)
2. What constraints it imposes on itself
3. What policies it declares (e.g., "mermaid-first", "thin orchestrator", "baseline dimensions")
4. What it explicitly excludes

These self-claims become the baseline that dimension agents check the design against.

## Step 5: Produce Context Layer

Write `context.md` with this structure:

```markdown
## DesignReview Context Layer

### Target
- Skill: [name]
- Root: [path]
- Design type: [skill / architecture doc / RFC / etc.]
- Primary stakeholders: [who consumes this]

### Scope
- Included: [list]
- Excluded: [list]

### Structural Inventory
- Entrypoints: [...]
- Internal stages: [...]
- Dimensions available: [...]
- Templates/standards: [...]

### Self-Claims
[What the design says about itself — purpose, constraints, policies, exclusions.
Extracted from SkillIntent.md, SKILL.md, and standards files.]

### Design Checklist Assessment

| # | Item | Status | Evidence / Notes |
|---|------|--------|-----------------|
| C1 | Stakeholders | [Present/Partial/Missing/N/A] | [brief evidence or reason] |
| C2 | Design type | ... | ... |
| ... | ... | ... | ... |
| C16 | In-doc summaries | ... | ... |

### Checklist Summary
- Present: [count]
- Partial: [count] — [list item #s]
- Missing: [count] — [list item #s with brief rationale for why expected]
- N/A: [count]

### Risk Signals
[Based on checklist gaps, self-claims, and structural inventory — what are the likely problem areas for dimension agents to focus on?]

### File List
[flat list of files to review]
```

Ensure this file is written to `$REVIEW_DIR/context.md`.
