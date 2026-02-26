# ConvertMarkdownToDocx Workflow

> **Trigger:** "convert markdown to docx", "md to docx", "markdown to word", "make docx from markdown"

## Reference Material

- None.

## Purpose

Convert one or more Markdown files to `.docx` with clear preflight checks and verifiable output.

## Workflow Steps

### Step 1: Confirm Inputs and Outputs

Identify:
1. Source markdown file(s) or directory.
2. Requested destination `.docx` path(s).
3. Whether this is single-file or batch conversion.

If output path is not provided, default to the same directory and same base filename.

### Step 2: Run Preflight Checks

Check converter availability:
```bash
pandoc --version
```

If unavailable, stop and provide install guidance, then wait for user direction.

### Step 3: Convert Markdown to DOCX

Single file pattern:
```bash
pandoc "<input.md>" -f gfm -t docx -o "<output.docx>"
```

Batch pattern:
1. Enumerate `*.md` inputs.
2. Build matching `.docx` output paths.
3. Run one `pandoc` command per input and collect results.

### Step 4: Verify Output

For each expected output file:
1. Confirm file exists.
2. Confirm file size is greater than zero.

Report any failed file with the exact command and error text.

### Step 5: Return a Conversion Summary

Provide:
1. Input and output path mapping.
2. Success/failure per file.
3. Next-step options when failures occur (retry, install/repair pandoc, or adjust source markdown).
