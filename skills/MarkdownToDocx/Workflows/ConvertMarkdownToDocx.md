# ConvertMarkdownToDocx Workflow

> **Trigger:** "convert markdown to docx", "md to docx", "markdown to word", "make docx from markdown"

## Reference Material

- None.

## Purpose

Convert one or more Markdown files to `.docx` with clear preflight checks, stronger table visibility, automatic output opening, and verifiable output.

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

Check post-processing dependency:
```bash
python -c "import docx; print('python-docx OK')"
```

If unavailable, stop and provide install guidance (`python -m pip install python-docx`), then wait for user direction.

### Step 3: Convert Markdown to DOCX

Single file pattern:
```bash
pandoc "<input.md>" -f gfm -t docx -o "<output.docx>"
```

Batch pattern:
1. Enumerate `*.md` inputs.
2. Build matching `.docx` output paths.
3. Run one `pandoc` command per input and collect results.

### Step 4: Harden Table Visibility

Run the bundled post-processor on generated files:

Single file:
```bash
python "$PAI_DIR/skills/MarkdownToDocx/Tools/PostProcessDocx.py" "<output.docx>"
```

Batch:
```bash
python "$PAI_DIR/skills/MarkdownToDocx/Tools/PostProcessDocx.py" "<output1.docx>" "<output2.docx>" ...
```

This step applies:
1. `Table Grid` styling when available.
2. Explicit cell borders for all table cells.

### Step 5: Verify Output

For each expected output file:
1. Confirm file exists.
2. Confirm file size is greater than zero.

Report any failed file with the exact command and error text.

### Step 6: Open Output Automatically

After successful verification, open generated `.docx` files with the system default app:

Single file:
```bash
python "$PAI_DIR/skills/MarkdownToDocx/Tools/PostProcessDocx.py" --open-only "<output.docx>"
```

Batch:
```bash
python "$PAI_DIR/skills/MarkdownToDocx/Tools/PostProcessDocx.py" --open-only "<output1.docx>" "<output2.docx>" ...
```

### Step 7: Return a Conversion Summary

Provide:
1. Input and output path mapping.
2. Success/failure per file.
3. Whether table visibility hardening and auto-open completed.
4. Next-step options when failures occur (retry, install/repair pandoc, install `python-docx`, or adjust source markdown).
