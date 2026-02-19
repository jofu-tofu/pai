# Tooling Landscape (Verified 2026-02-19)

This document captures verified references for presentation generation workflows.

## Verified Core Tooling

| Tool | Primary Output | Strengths | Trade-offs | Best Fit |
|---|---|---|---|---|
| [Slidev](https://github.com/slidevjs/slidev) | HTML, PDF, PNG, PPTX export | Markdown-first, interactive components, strong theme ecosystem | Node/Vite toolchain; PPTX path is less template-controlled than native PPT automation | Technical decks and HTML-first authoring |
| [Marp CLI](https://github.com/marp-team/marp-cli) | HTML, PDF, PPTX, images | Fast markdown conversion, simple CLI, watch mode | Editable PPT mode has fidelity limits and extra dependencies | Cross-format draft and conversion workflows |
| [reveal.js](https://github.com/hakimel/reveal.js) | HTML (+ PDF export) | Rich web presentation framework, strong API, speaker notes | More front-end customization effort | Interactive browser-native presentations |
| [PptxGenJS](https://github.com/gitbrent/PptxGenJS) | PPTX | Programmatic control, TypeScript support, HTML table to slides | Requires explicit layout logic | Professional PPT generation from structured data |
| [python-pptx](https://python-pptx.readthedocs.io/en/latest/) | PPTX | Mature PPT automation, placeholders, charts, template-safe editing | Python implementation effort for complex visuals | Enterprise template-driven PPT workflows |
| [claude-office-skills](https://github.com/tfriedel/claude-office-skills) | PPTX, DOCX, XLSX, PDF workflows | End-to-end office workflow patterns, includes HTML-to-PPTX path and validation scripts | Larger dependency footprint | Reference implementation for robust office pipelines |

## Repository Health Snapshot

| Repository | Exists | Stars | Last Push (UTC) |
|---|---|---|---|
| `slidevjs/slidev` | Yes | 44k+ | 2026-02-12 |
| `marp-team/marp-cli` | Yes | 3k+ | 2025-11-03 |
| `hakimel/reveal.js` | Yes | 70k+ | 2026-02-16 |
| `gitbrent/PptxGenJS` | Yes | 4k+ | 2025-11-28 |
| `scanny/python-pptx` | Yes | 3k+ | 2024-08-07 |
| `tfriedel/claude-office-skills` | Yes | 200+ | 2025-10-04 |

## Notes on Prior Community Links

These earlier references were not resolvable on 2026-02-19 and should be treated as stale until re-verified:
- `goetzpa/claude-powerpoint` (GitHub returned 404)
- Multiple `skills.sh` presentation URLs returned 404 during direct checks

## Recommended Baseline Stack

1. HTML-first rapid workflow: Slidev or Marp CLI.
2. PPT professional workflow: PptxGenJS for new generation, python-pptx for template-preserving edits.
3. Conversion workflow: Marp CLI for markdown-based conversion plus a review pass.
4. Enterprise pipeline reference: patterns from tfriedel/claude-office-skills.
