---
name: MarkdownToDocx
description: Convert Markdown content to DOCX with reliable defaults and output checks. USE WHEN user wants to convert markdown to docx, md to word, generate a .docx from markdown, or batch-convert markdown files.
---

# MarkdownToDocx

Convert Markdown documents into Word `.docx` output using `pandoc` with a repeatable workflow.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **ConvertMarkdownToDocx** | "convert markdown to docx", "md to docx", "markdown to word", "make docx from markdown" | `Workflows/ConvertMarkdownToDocx.md` |

## Examples

**Example 1: Single file conversion**
```
User: "Convert notes.md to docx."
-> Invokes ConvertMarkdownToDocx workflow
-> Runs pandoc conversion command with explicit output path
-> Returns the created .docx path and verification status
```

**Example 2: Explicit output location**
```
User: "Make a Word file from docs/summary.md into exports/summary.docx."
-> Invokes ConvertMarkdownToDocx workflow
-> Converts with provided destination path
-> Verifies output exists and is non-empty
```

**Example 3: Batch conversion**
```
User: "Convert all markdown files in reports/ to docx files."
-> Invokes ConvertMarkdownToDocx workflow
-> Iterates markdown inputs and converts each to matching .docx output
-> Returns success/failure summary per file
```
