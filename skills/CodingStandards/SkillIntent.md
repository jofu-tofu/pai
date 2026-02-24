# CodingStandards — Skill Intent

> **For agents modifying this skill:** Read this document before making any changes.

## First Principles

1. **Static over dynamic** — Routing is deterministic table lookup, never LLM inference. File signals map to exact paths.
2. **Language isolation** — Each language's rules, decision trees, and examples live in their own workflow and Dimensions/ subdirectory. No cross-language contamination.
3. **Inlined rules** — All rule content is inlined directly in dimension files under `Dimensions/[Language]/`. No separate Rules/ directory exists.
4. **Parity with originals** — Each workflow must deliver the same content its predecessor skill delivered. Consolidation is structural, not reductive.

## Problem This Skill Solves

Language-specific standards spread across multiple skills create routing ambiguity and maintenance overhead. CodingStandards provides one deterministic entry point that routes to isolated, self-contained language workflows while preserving parity and reducing context collisions.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Routing mechanism | Static Language Lookup table with file signals | Dynamic language detection via LLM inference | Static tables are deterministic, fast, and never misroute |
| Rule storage | Rules inlined in dimension files under `Dimensions/[Language]/` | Sharded individual .md files per rule | Agents never followed links to read individual rule files; inlining ensures full rule content is always available in a single read |
| Workflow structure | Self-contained per-language workflow with decision tree | Shared decision tree with language branching | Self-contained workflows guarantee isolation and maintain parity |
| Multi-language handling | Read both matching workflow files independently | Merged cross-language workflow | Independent reads preserve isolation principle |
| Dimension layer structure | Language-First with standardized dimension names under `Dimensions/[Language]/` | Cross-cutting Concern-First grouping (e.g., `Dimensions/Architecture/` across all languages) | Preserves language isolation first principle; each dimension only references its own language's rules |
| Dimension content model | Rules inlined directly in dimension files with full content | Separate rule files linked from dimensions | Agents never followed links; inlining guarantees full context in a single file read |
| Dimension consumer format | Consumer Guide with When Reviewing / When Designing / When Implementing sections | Flat rule lists without role-based guidance | Different agents need different views of the same rules; consumer guide enables focused loading |

## Explicit Out-of-Scope

1. **Dynamic language detection or LLM inference of context** — File signals in the Language Lookup table are the only routing mechanism.
2. **Runtime routing logic or conditional loading** — No code, no conditionals, no dynamic dispatch. Static tables only.
3. **Adding a detection layer** — This would violate the static knowledge base design.
4. **Creating a separate Rules/ directory** — All rules are inlined in dimension files. Do not recreate `Rules/`.
5. **Merging language content** — Each language's rules, decision trees, and examples stay isolated.

## Success Criteria

1. **Single entry point** — One skill triggers for all supported language contexts with no collision between languages
2. **Isolation guarantee** — C# invocation loads ONLY `Workflows/CSharp.md` + `Dimensions/CSharp/`; no other language rules enter context
3. **Parity** — Context loaded for C# work is functionally identical to what the old CSharp skill loaded
4. **Multi-language** — Full-stack context (TS + Python) and cross-stack contexts (for example C# + MUMPS) load both workflows independently without contamination
5. **Zero ambiguity** — Language Lookup table in SKILL.md is deterministic: explicit file signals → exact paths
6. **Gap visibility** — LanguageIndex.md shows unsupported languages; adding new language has exactly 5 documented steps

## Constraints

1. **No dynamic routing** — All routing is via static tables. No LLM inference, no code, no conditionals.
2. **Language isolation** — Each workflow references only its own `Dimensions/[Language]/` directory. Cross-language references are forbidden.
3. **Rules inlined in dimensions** — All rule content lives directly in dimension files. No separate Rules/ directory.
4. **Parity preservation** — Content changes must not reduce what was available in the original per-language skills.
5. **File signal determinism** — Every Language Lookup entry maps file signals to exactly one workflow path.

## Maintenance Lifecycle

To add a new language:
1. Create `Dimensions/LangName/` with dimension files containing inlined rules
2. Create `Workflows/LangName.md` with decision tree + reference to `../Dimensions/LangName/`
3. Add file signal patterns to SKILL.md Language Lookup table and Workflow Routing table
4. Add row to LanguageIndex.md supported table, remove from gaps list
5. Run SkillForge > ValidateSkill

To update a language's rules:
- Edit rules directly in the relevant `Dimensions/[Language]/` dimension file
- Update the workflow file's rule index if rules are added/removed

## Dimension Layer

Dimensions are the primary rule storage layer. They group rules into concern-based dimensions with Consumer Guides (When Reviewing / When Designing / When Implementing) so different agents load only what they need. All rule content is inlined directly in dimension files.

**Structure:** `Dimensions/[Language]/INDEX.md` routes to dimension documents. Each dimension doc contains full rule content inlined as `### ID RuleName` subsections.

**Language-First approach:** Each language has its own dimension directory. No cross-language dimensions exist. This preserves the skill's language isolation first principle.

**Cross-references:** A rule can appear in multiple dimensions' rule tables when it genuinely spans concerns. Each rule has a "primary" dimension (where it's listed first), but secondary dimensions can cross-reference it.

To add dimensions for a new language:
1. Create `Dimensions/LangName/INDEX.md` with routing table
2. Create dimension documents following the Consumer Guide format with rules inlined as `### ID RuleName` subsections
4. Append "Dimensional Loading" section to `Workflows/LangName.md`
5. Add language column to Dimension Routing table in `SKILL.md`

## Version History

- v1.1.0 (2026-02-19) — SkillForge audit: added First Principles, Problem, Design Decisions, Constraints sections
- v1.0.0 (2026-02-18) — Initial creation, migrated from React, TypeScript, CSharp, PythonCoding skills
