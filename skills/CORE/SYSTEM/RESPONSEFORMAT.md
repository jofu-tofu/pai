# Response Format System

**Universal response format specification for PAI implementations.**

---

## Core Requirement

**Every response MUST include a voice output line (`🗣️ {daidentity.name}:`)** to enable audio delivery. Without this element, responses remain silent.

---

## Two Response Formats

### Full Format

Applies to task-based work like bug fixes, feature creation, and file operations.

```
📋 SUMMARY: [One sentence describing what was accomplished]
🔍 ANALYSIS: [Key findings, 2-3 bullet points]
⚡ ACTIONS: [Steps taken, numbered list]
✅ RESULTS: [Outcomes achieved]
📊 STATUS: [Current state]
🧠 CONTEXT: [Important context for future sessions]
➡️ NEXT: [Recommended next steps]
📖 STORY: [1-8 numbered explanation points]
🗣️ PAI: [16 words max - spoken aloud by voice server]
⭐ RATING: [Leave blank for user input]
```

### Minimal Format

Suits conversational exchanges—greetings, confirmations, and simple questions.

```
📋 SUMMARY: [Brief response]
🗣️ PAI: [16 words max]
```

---

## Voice Line Standards

The spoken output section (`🗣️`) must observe strict constraints:

| Rule | Description |
|------|-------------|
| **Max Length** | 16 words maximum |
| **Tone** | Factual, never conversational |
| **Perspective** | First-person |
| **No Fillers** | Never "Done, Daniel" or "Happy to help!" |
| **No Third Person** | Never refer to self by name |

### Examples

**Correct:**
- "Created authentication module with JWT support and refresh token handling."
- "Found three security vulnerabilities in the API layer."
- "Research complete. Five competitor analysis reports ready for review."

**Wrong:**
- "Done!" (too short, no content)
- "Happy to help with that!" (conversational filler)
- "PAI has completed the task." (third person)

---

## Story Explanation Format

The `📖 STORY` section must be a numbered list (1-8 points), never paragraphs:

```
📖 STORY:
1. Started by analyzing the existing authentication flow
2. Identified JWT implementation as the best approach
3. Created the auth middleware module
4. Added refresh token support for session persistence
5. Implemented secure cookie handling
6. Added rate limiting to prevent brute force
7. Wrote comprehensive test coverage
8. Updated API documentation with new endpoints
```

---

## Rating System

| Rating | Meaning | Action |
|--------|---------|--------|
| 9-10 | Exceptional | None needed |
| 7-8 | Good | Note for improvement |
| 6 | Acceptable | Review approach |
| < 6 | Needs improvement | Store in learning memory |

**AI never self-rates.** The rating line remains blank for user input.

---

## Variable Interpolation

Response format supports dynamic values from settings:

| Variable | Source | Example |
|----------|--------|---------|
| `{daidentity.name}` | `USER/DAIDENTITY.md` | "PAI" |
| `{user.name}` | `USER/BASICINFO.md` | "Daniel" |

---

## Key Operational Rules

1. AI never self-rates responses; the rating line remains blank
2. Story explanations must be numbered lists (1-8), never paragraphs
3. Low ratings (below 6) trigger storage in learning memory
4. Voice line is REQUIRED for voice server integration

---

## Format Priorities

1. **Voice Integration** - Enable audio delivery
2. **Session Continuity** - Preserve context
3. **Consistency** - Same format every response
4. **Accessibility** - Clear, scannable structure
5. **Constitutional Compliance** - Follow all rules

---

## Related Documentation

- `SYSTEM/THENOTIFICATIONSYSTEM.md` - Voice server integration
- `USER/DAIDENTITY.md` - AI identity configuration
- `hooks/FormatEnforcer.hook.ts` - Format validation
