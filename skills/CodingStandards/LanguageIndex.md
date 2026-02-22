# Language Coverage Index

Authoritative registry of supported languages and known gaps in CodingStandards.

## Supported (7)

| Language | Workflow | Rules Directory | Count | Sources |
|----------|---------|-----------------|-------|---------|
| React / Next.js | `Workflows/React.md` | `Rules/React/` | 65 | Vercel Engineering (Jan 2026) |
| Rust | `Workflows/Rust.md` | `Rules/Rust/` | 73 | Rust API Guidelines, Effective Rust, The Rustonomicon, Tokio docs, Google Comprehensive Rust, Rust Design Patterns |
| Svelte 5 / SvelteKit | `Workflows/Svelte.md` | `Rules/Svelte/` | 36 | Svelte docs, Joy of Code, Captain Codeman, Mainmatter |
| Tailwind CSS | `Workflows/Tailwind.md` | `Rules/Tailwind/` | 32 | Tailwind official docs (v3/v4), prettier-plugin-tailwindcss, eslint-plugin-tailwindcss, Adam Wathan, Evil Martians, Atomic Object |
| TypeScript | `Workflows/TypeScript.md` | `Rules/TypeScript/` | 19 | Matt Pocock, Steve Kinney |
| C# / .NET | `Workflows/CSharp.md` | `Rules/CSharp/` | 18 | csharpcodingguidelines.com, dotnet-cursor-rules |
| Python | `Workflows/Python.md` | `Rules/Python/` | 18 | minimaxir, Dagster "Dignified Python" |

## Not Yet Covered (gaps)

Go, Java, Ruby, Swift, Kotlin, PHP, Elixir, Scala, SQL

## How to Add a New Language

Follow these 5 steps in order:

1. **Create rules directory** — `Rules/LangName/` with individual rule files (TitleCase naming, one rule per file)
2. **Create workflow file** — `Workflows/LangName.md` with:
   - Trigger line (file signals: extensions + framework names)
   - Reference to `../Rules/LangName/`
   - Decision tree, priority hierarchy, top 10 rules, examples, complete rule index
3. **Update SKILL.md** — Add row to Language Lookup table and Workflow Routing table with file signal patterns
4. **Update this file** — Add row to Supported table above, remove language from gaps list
5. **Validate** — Run SkillForge > ValidateSkill and InvocationSim to confirm structure and routing
