---
name: CodingStandards
description: Language-specific coding standards and best practices knowledge base. USE WHEN writing React components OR applying React best practices OR refactoring Next.js code OR designing component APIs OR optimizing performance OR eliminating waterfalls OR reducing bundle size OR working with Server Components OR building compound components OR refactoring boolean prop proliferation OR writing TypeScript code OR applying TypeScript standards OR refactoring TypeScript OR type safety decisions OR error handling patterns OR configuring tsconfig OR working with generics OR discriminated unions OR Zod validation OR writing C# code OR applying C# coding standards OR refactoring .NET code OR discussing async patterns OR null safety OR writing Python code OR applying Python best practices OR refactoring Python OR debugging Python issues. Contains 120 rules across 4 languages (React: 65, TypeScript: 19, C#: 18, Python: 18).
---

# CodingStandards

A static, indexed knowledge base of coding standards for React/Next.js, TypeScript, C#, and Python. **120 rules across 4 languages.** Use the Language Lookup table below to navigate directly to the right workflow and rules.

## Language Lookup

| Language | File Signals | Workflow | Rules Directory | Count |
|----------|-------------|---------|-----------------|-------|
| React / Next.js | `.tsx`, `.jsx`, React imports (`from 'react'`), `next.config.*`, `use client`, `use server` | `Workflows/React.md` | `Rules/React/` | 65 |
| TypeScript | `.ts` (non-React), `tsconfig.json`, generics, `z.infer`, Zod imports | `Workflows/TypeScript.md` | `Rules/TypeScript/` | 19 |
| C# / .NET | `.cs`, `.csproj`, `.sln`, `using` statements, `namespace` declarations | `Workflows/CSharp.md` | `Rules/CSharp/` | 18 |
| Python | `.py`, `requirements.txt`, `pyproject.toml`, `setup.py`, `__init__.py` | `Workflows/Python.md` | `Rules/Python/` | 18 |

**When a workflow is matched, read its file and follow the steps within it.**

For multi-language contexts (e.g., TypeScript + Python full-stack), read both matching workflow files. Each is independent.

## Workflow Routing

| Trigger | Workflow File |
|---------|---------------|
| React component, JSX, Next.js, Server Components, RSC, hydration | `Workflows/React.md` |
| TypeScript types, tsconfig, generics, discriminated unions, Zod | `Workflows/TypeScript.md` |
| C# class, async/await in .NET, nullable context, .csproj | `Workflows/CSharp.md` |
| Python function, type hints, defensive programming, pyproject | `Workflows/Python.md` |

## Design Constraint: Static Knowledge Base

This skill is a static, indexed knowledge base. It does NOT perform dynamic language detection, runtime inference, or context analysis. The Language Lookup table above is the complete dispatch mechanism — no code, no LLM inference, no "auto-detect" logic is ever appropriate here.

**Anti-pattern (NEVER do this):** Adding logic like "detect language from context and load appropriate rules"

**Correct pattern:** Invoking workflow reads the Language Lookup table and determines which workflow file(s) to read based on explicit file signals listed in the table.

## How Individual Rules Work

Each workflow file references its own Rules/ subdirectory. Rule files are sharded for efficient loading — only read the rules you need.

```
1. Identify language via file signals in Language Lookup table
2. Read matching Workflow file (e.g., Workflows/CSharp.md)
3. Use workflow's decision tree to identify relevant category
4. Read specific rule file(s) from Rules/[Language]/ directory
```

## Language Coverage

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
