# SkillIntent - MarkdownToDocx

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

- Deterministic conversion is better than ad-hoc formatting edits.
- Explicit file mapping prevents silent output mistakes.
- Verification is required; conversion is not done until output is checked.

## Problem This Skill Solves

Users often need fast, repeatable Markdown-to-Word export. Without a dedicated skill, conversions are inconsistent, path handling is error-prone, and failures are easy to miss.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Conversion engine | `pandoc` CLI | Custom parser-based converter | Mature, stable, and widely installed |
| Workflow shape | Single conversion workflow with batch support | Multiple fragmented workflows | Keeps invocation simple while covering common cases |
| Validation | Require post-conversion file checks | Trust command exit code only | Prevents false success from partial failures |

## Explicit Out-of-Scope

- Rich DOCX template authoring.
- PDF or PPT export.
- Semantic document cleanup beyond conversion.

## Success Criteria

- Agent maps each markdown input to an explicit docx output.
- Agent verifies every output file exists and is non-empty.
- Agent reports actionable failure details when conversion fails.

## Constraints

- Keep dependencies limited to `pandoc`.
- Preserve TitleCase file naming and SkillForge structure.
- Keep triggers focused on markdown-to-docx intent.
