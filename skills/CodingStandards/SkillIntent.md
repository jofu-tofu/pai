# CodingStandards — Skill Intent

> **For agents modifying this skill:** Read this document before making any changes.

## First Principles

1. **Static over dynamic** — Routing is deterministic table lookup, never LLM inference. File signals map to exact paths.
2. **Language isolation** — Each language's rules, decision trees, and examples live in their own workflow and Rules/ subdirectory. No cross-language contamination.
3. **Sharded rules** — Individual rule files in `Rules/[Language]/` load on demand. Never consolidate into monolithic files.
4. **Parity with originals** — Each workflow must deliver the same content its predecessor skill delivered. Consolidation is structural, not reductive.

## Problem This Skill Solves

Four separate skills (React, TypeScript, CSharp, PythonCoding) created routing ambiguity and maintenance overhead. CodingStandards provides a single entry point that routes to isolated, self-contained language workflows — reducing skill count while preserving full content parity.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Routing mechanism | Static Language Lookup table with file signals | Dynamic language detection via LLM inference | Static tables are deterministic, fast, and never misroute |
| Rule storage | Sharded individual .md files per rule per language | Single consolidated file per language | Sharded files load only what's needed; consolidation wastes context |
| Workflow structure | Self-contained per-language workflow with decision tree | Shared decision tree with language branching | Self-contained workflows guarantee isolation and maintain parity |
| Multi-language handling | Read both matching workflow files independently | Merged cross-language workflow | Independent reads preserve isolation principle |

## Explicit Out-of-Scope

1. **Dynamic language detection or LLM inference of context** — File signals in the Language Lookup table are the only routing mechanism.
2. **Runtime routing logic or conditional loading** — No code, no conditionals, no dynamic dispatch. Static tables only.
3. **Adding a detection layer** — This would violate the static knowledge base design.
4. **Centralizing rule file content** — Rules stay sharded in `Rules/[Language]/` subdirectories.
5. **Merging language content** — Each language's rules, decision trees, and examples stay isolated.

## Success Criteria

1. **Single entry point** — One skill triggers for all 4 language contexts with no collision between languages
2. **Isolation guarantee** — C# invocation loads ONLY `Workflows/CSharp.md` + `Rules/CSharp/`; no other language rules enter context
3. **Parity** — Context loaded for C# work is functionally identical to what the old CSharp skill loaded
4. **Multi-language** — Full-stack context (TS + Python) → both workflows readable independently; React/CSharp workflows untouched
5. **Zero ambiguity** — Language Lookup table in SKILL.md is deterministic: explicit file signals → exact paths
6. **Gap visibility** — LanguageIndex.md shows unsupported languages; adding new language has exactly 5 documented steps

## Constraints

1. **No dynamic routing** — All routing is via static tables. No LLM inference, no code, no conditionals.
2. **Language isolation** — Each workflow references only its own `Rules/[Language]/` directory. Cross-language references are forbidden.
3. **Rule sharding** — Individual rule files must remain separate. Never merge into monolithic files.
4. **Parity preservation** — Content changes must not reduce what was available in the original per-language skills.
5. **File signal determinism** — Every Language Lookup entry maps file signals to exactly one workflow path.

## Maintenance Lifecycle

To add a new language:
1. Create `Rules/LangName/` with individual rule files
2. Create `Workflows/LangName.md` with decision tree + reference to `../Rules/LangName/`
3. Add file signal patterns to SKILL.md Language Lookup table and Workflow Routing table
4. Add row to LanguageIndex.md supported table, remove from gaps list
5. Run SkillForge > ValidateSkill

To update a language's rules:
- Edit files in `Rules/[Language]/` directly
- Update the workflow file's rule index if rules are added/removed

## Version History

- v1.1.0 (2026-02-19) — SkillForge audit: added First Principles, Problem, Design Decisions, Constraints sections
- v1.0.0 (2026-02-18) — Initial creation, migrated from React, TypeScript, CSharp, PythonCoding skills
