# CodingStandards — Skill Intent

## Purpose

Provide a single, unified entry point for language-specific coding standards that previously lived in 4 separate skills (React, TypeScript, CSharp, PythonCoding). The skill is a static, indexed knowledge base — not a dynamic router.

## Success Criteria

1. **Single entry point** — One skill triggers for all 4 language contexts with no collision between languages
2. **Isolation guarantee** — C# invocation loads ONLY `Workflows/CSharp.md` + `Rules/CSharp/`; no other language rules enter context
3. **Parity** — Context loaded for C# work is functionally identical to what the old CSharp skill loaded
4. **Multi-language** — Full-stack context (TS + Python) → both workflows readable independently; React/CSharp workflows untouched
5. **Zero ambiguity** — Language Lookup table in SKILL.md is deterministic: explicit file signals → exact paths
6. **Gap visibility** — LanguageIndex.md shows unsupported languages; adding new language has exactly 5 documented steps

## Design Intent

The SKILL.md is a reference document, not a dispatcher. An invoking agent reads the Language Lookup table, identifies which language is present by file signals (not inference), and reads only the matching workflow file. No LLM reasoning is required to route.

Workflow files are self-contained: each contains the decision tree, priority hierarchy, examples, and rule index from the original skill. They reference `../Rules/[Language]/` for individual rule files.

## Explicit Out-of-Scope

The following are explicitly **not appropriate** improvements to this skill:

1. **Dynamic language detection or LLM inference of context** — The skill does not auto-detect languages. File signals in the Language Lookup table are the only routing mechanism.
2. **Runtime routing logic or conditional loading** — No code, no conditionals, no dynamic dispatch. Static tables only.
3. "Improving" the skill by adding a detection layer — This would violate the static knowledge base design.
4. **Centralizing rule file content** — Rules stay sharded in `Rules/[Language]/` subdirectories. Never consolidate rules into a single file for "convenience."
5. **Merging language content** — Each language's rules, decision trees, and examples stay isolated in their own workflow file and Rules/ subdirectory.

## Maintenance Lifecycle

To add a new language:
1. Create `Rules/LangName/` with individual rule files
2. Create `Workflows/LangName.md` with decision tree + reference to `../Rules/LangName/`
3. Add file signal patterns to SKILL.md Language Lookup table and Workflow Routing table
4. Add row to LanguageIndex.md supported table, remove from gaps list
5. Run SkillForge > ValidateSkill and InvocationSim

To update a language's rules:
- Edit files in `Rules/[Language]/` directly
- Update the workflow file's rule index if rules are added/removed
- Update count in SKILL.md Language Lookup table and LanguageIndex.md

## Version History

- v1.0.0 (2026-02-18) — Initial creation, migrated from React, TypeScript, CSharp, PythonCoding skills
