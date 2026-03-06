# SkillIntent — ReadingList

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. **Reading is personal** — The list reflects the user's unique interests and goals. The skill never judges choices or imposes external reading standards.
2. **Low friction captures more** — Adding a book should take one message. If it feels like work, users stop tracking.
3. **Data lives in plain text** — Markdown storage means the reading list is human-readable, version-controllable, and never locked into a proprietary format.
4. **Status reflects reality** — Dropping a book is a valid and respected outcome. The skill tracks what actually happened, not what "should" happen.

## Problem This Skill Solves

Without this skill, reading intentions scatter across bookmarks, notes, recommendations from friends, and mental lists. Books get forgotten, re-discovered, and forgotten again. There is no single place to answer "what am I reading?" or "what have I read this year?" — this skill provides that single source of truth.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Storage format | Single markdown table file | JSON file, SQLite database, external API | Markdown is human-readable, diffable, and requires no tooling to inspect |
| Status model | Four states: to-read, reading, finished, dropped | Binary (read/unread), unlimited custom states | Four states cover all real outcomes without complexity. "Dropped" respects that not every book gets finished |
| Rating scale | 1-5 numeric | 1-10, thumbs up/down, no rating | 1-5 is familiar (Goodreads, Amazon) and provides enough granularity without decision fatigue |
| Recommendations | Priority-based from existing list | ML-based, genre analysis, external API | Simple priority sorting is transparent and works without external dependencies |

## Explicit Out-of-Scope

- **Social features** — No sharing, no comparing with others' lists
- **External service sync** — No Goodreads, Amazon, or library system integration
- **Automated discovery** — No crawling or suggesting books the user hasn't expressed interest in
- **Reading speed tracking** — No page-by-page progress or time estimates
- **Purchase tracking** — This tracks reading intent and status, not acquisition

## Success Criteria

1. A user can add a book to their reading list in a single message
2. The reading list file is valid markdown that renders correctly in any markdown viewer
3. Every item on the list has a clear status (to-read, reading, finished, or dropped)
4. A user can find out what they are currently reading without specifying filters
5. Finished books retain their completion date and rating permanently

## Constraints

- The reading list file lives at `$PAI_DIR/data/ReadingList.md` — this path is stable and must not change
- All dates use YYYY-MM-DD format
- Entries are never silently deleted — removal requires explicit user confirmation
- The skill operates entirely on local files with no network dependencies
- TitleCase naming for all skill files and directories
