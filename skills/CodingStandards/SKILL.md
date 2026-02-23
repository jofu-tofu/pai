---
name: CodingStandards
description: "Coding standards and implementation best-practice knowledge base. USE WHEN user asks for coding standards, style guidance, code quality rules, architecture guardrails, refactoring guidance, reliability patterns, testing practices, performance hygiene, or type-safety checks before coding."
---

# CodingStandards

A static, indexed knowledge base of coding standards for React/Next.js, Rust, Svelte/SvelteKit, Tailwind CSS, TypeScript, C#, and Python. **261 rules across 7 languages.** Use the Language Lookup table below to navigate directly to the right workflow and rules.

## Language Lookup

| Language | File Signals | Workflow | Rules Directory | Count |
|----------|-------------|---------|-----------------|-------|
| React / Next.js | `.tsx`, `.jsx`, React imports (`from 'react'`), `next.config.*`, `use client`, `use server` | `Workflows/React.md` | `Rules/React/` | 65 |
| Rust | `.rs`, `Cargo.toml`, `Cargo.lock`, `build.rs`, `.cargo/config.toml` | `Workflows/Rust.md` | `Rules/Rust/` | 73 |
| Svelte / SvelteKit | `.svelte`, `.svelte.ts`, `svelte.config.*`, `+page.svelte`, `+layout.svelte`, `+page.server.ts` | `Workflows/Svelte.md` | `Rules/Svelte/` | 36 |
| Tailwind CSS | `tailwind.config.*`, `@tailwind`, `@apply`, `@theme`, `@import "tailwindcss"`, utility class patterns in HTML/JSX | `Workflows/Tailwind.md` | `Rules/Tailwind/` | 32 |
| TypeScript | `.ts` (non-React), `tsconfig.json`, generics, `z.infer`, Zod imports | `Workflows/TypeScript.md` | `Rules/TypeScript/` | 19 |
| C# / .NET | `.cs`, `.csproj`, `.sln`, `using` statements, `namespace` declarations | `Workflows/CSharp.md` | `Rules/CSharp/` | 18 |
| Python | `.py`, `requirements.txt`, `pyproject.toml`, `setup.py`, `__init__.py` | `Workflows/Python.md` | `Rules/Python/` | 18 |

**When a workflow is matched, read its file and follow the steps within it.**

For multi-language contexts (e.g., TypeScript + Python full-stack), read both matching workflow files. Each is independent.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **React** | React components, JSX patterns, Next.js optimization, Server Components, hydration issues | `Workflows/React.md` |
| **Rust** | Rust ownership, borrow checker, error handling, async/tokio, unsafe code, traits, API design, Cargo | `Workflows/Rust.md` |
| **Svelte** | Svelte 5 runes, SvelteKit routing, form actions, reactivity patterns, $state/$derived/$effect | `Workflows/Svelte.md` |
| **Tailwind** | Tailwind utility classes, class ordering, @apply usage, responsive utilities, dark mode variants, Tailwind config | `Workflows/Tailwind.md` |
| **TypeScript** | TypeScript type safety, tsconfig setup, generics, discriminated unions, Zod validation | `Workflows/TypeScript.md` |
| **CSharp** | C# class design, async/await in .NET, nullable context, .csproj configuration | `Workflows/CSharp.md` |
| **Python** | Python type hints, defensive programming, error handling, code organization | `Workflows/Python.md` |

**If no language matches:** This skill only covers React, Rust, Svelte, Tailwind CSS, TypeScript, C#, and Python. For unsupported languages, see `LanguageIndex.md` for the gap list.

## Dimension Routing

For focused tasks (code review, design, planning), load a specific **dimension** instead of the full workflow. Each language's rules are grouped into concern-based dimensions with Consumer Guides tailored for different agent roles.

| Task Type | React | Rust | Svelte | TypeScript | Tailwind | C# | Python |
|-----------|-------|------|--------|------------|----------|----|--------|
| **Component/Type Design** | `Dimensions/React/Architecture.md` | `Dimensions/Rust/TypeSystem.md` | `Dimensions/Svelte/Architecture.md` | `Dimensions/TypeScript/TypeModeling.md` | `Dimensions/Tailwind/Philosophy.md` | `Dimensions/CSharp/Architecture.md` | `Dimensions/Python/CodeOrganization.md` |
| **Performance Review** | `Dimensions/React/RenderingPerf.md` | `Dimensions/Rust/Performance.md` | `Dimensions/Svelte/PerformanceSSR.md` | — | `Dimensions/Tailwind/Accessibility.md` | — | `Dimensions/Python/Performance.md` |
| **Data/Async Patterns** | `Dimensions/React/DataFetching.md` | `Dimensions/Rust/Concurrency.md` | `Dimensions/Svelte/DataForms.md` | `Dimensions/TypeScript/ErrorHandling.md` | — | `Dimensions/CSharp/AsyncPatterns.md` | `Dimensions/Python/DefensiveProgramming.md` |
| **Type Safety** | — | `Dimensions/Rust/Ownership.md` | `Dimensions/Svelte/TypeSystem.md` | `Dimensions/TypeScript/TypeSafety.md` | — | `Dimensions/CSharp/NullSafety.md` | `Dimensions/Python/TypeSystem.md` |
| **Styling/Layout** | — | — | — | — | `Dimensions/Tailwind/ClassOrganization.md` | — | — |
| **Theming/Responsive** | — | — | — | — | `Dimensions/Tailwind/Theming.md`, `Dimensions/Tailwind/ResponsiveDesign.md` | — | — |
| **Unsafe/FFI** | — | `Dimensions/Rust/UnsafeCode.md` | — | — | — | — | — |
| **API Design** | — | `Dimensions/Rust/APIDesign.md` | — | — | — | — | — |
| **Testing** | — | `Dimensions/Rust/Testing.md` | — | — | — | — | — |
| **Project Structure** | — | `Dimensions/Rust/ProjectStructure.md` | — | — | — | — | — |

**How to use dimensions:** Read `Dimensions/[Language]/INDEX.md` for the full routing table with "Load When" triggers. Each dimension doc includes a Consumer Guide with sections for reviewing, designing, and implementing.

**When to use dimensions vs. workflows:**
- **Dimensions** — focused context for a specific concern, multi-agent review, or constrained-context scenarios
- **Workflows** — comprehensive standards review for a complete component or module

## How to Use

1. Identify language via file signals in Language Lookup table above
2. Read the matching Workflow file (full context) or Dimension INDEX (focused context)
3. Use the workflow's decision tree to identify the relevant category
4. Read specific rule file(s) from `Rules/[Language]/` directory

See `LanguageIndex.md` for full coverage registry, gap list, and instructions for adding new languages.

## Examples

**Example 1: React component optimization**
```
User: "I need to optimize this component that re-renders too often"
-> Matches React signal (.tsx, re-render concern)
-> Reads Workflows/React.md
-> Applies RerenderMemo, RerenderDerivedState rules from Rules/React/
```

**Example 2: TypeScript type safety review**
```
User: "Review my TypeScript code for type safety issues"
-> Matches TypeScript signal (.ts, type safety)
-> Reads Workflows/TypeScript.md
-> Applies NeverAny, NarrowBeforeUse, StrictModeAlways rules
```

**Example 3: C# async/await patterns**
```
User: "How should I handle async operations in this .NET service?"
-> Matches C# signal (.cs, async patterns)
-> Reads Workflows/CSharp.md
-> Applies AsyncForIoBound, NoMixingAsyncSync, CancellationTokens rules
```

**Example 4: Python type safety**
```
User: "Add proper type hints to this Python module"
-> Matches Python signal (.py, type hints)
-> Reads Workflows/Python.md
-> Applies TypeHintsRequired, TypeAvoidAny, TypeLiteralValues rules
```

**Example 5: Svelte 5 reactivity**
```
User: "I need to fix reactivity issues in my Svelte 5 component"
-> Matches Svelte signal (.svelte, reactivity concern)
-> Reads Workflows/Svelte.md
-> Applies DerivedOverEffect, NoStateInEffect, NarrowReactiveDeps rules
```
