# GenerateReport Workflow

Transform verified findings into a report the user will actually read — clear, concise, severity-ordered, with an architectural map of what changed and why it matters.

## Purpose

The report is the product. Everything before this was machinery. A technically correct but unreadable report fails the success criteria as much as a wrong one does. The goal: the user reads every word, doesn't skim, and comes away with a clear picture of (1) what they must fix, (2) what they should fix, and (3) what changed architecturally.

## Formatting Principles

- **Lead with the verdict** — Start with a 2-3 sentence summary: "Overall this change is X. N critical issues found, Y high. Here's the most important thing."
- **Severity ordering** — CRITICAL first, then HIGH, MEDIUM, LOW, SUGGESTIONS last
- **No wall of text** — Each finding is a card: issue, location, why it matters, what to do
- **Architectural map** — Visual or structured overview of what modules/components changed and how they relate
- **Clean domains** — Group by concern (Security, Performance, Correctness, etc.) within each severity level
- **What passed** — Include a "What looks good" section — gives credibility and context

## TODO

- [ ] Define the exact report template/schema (markdown? JSON? Both?)
- [ ] Define how to render the architectural map — ASCII diagram? Mermaid? Plain prose?
- [ ] Define the "finding card" format — what fields, what order, how verbose
- [ ] Define severity thresholds — what actually warrants CRITICAL vs HIGH?
- [ ] Define how suggestions differ from findings in the report (separate section? lower visual weight?)
- [ ] Define what "what passed clean" looks like — list domains? List files? Be specific
- [ ] Decide: does the report include the context layer summary at the top (so it's self-contained)?
- [ ] Define output location — just terminal? Also write to a file? Post to PR?
- [ ] Consider: confidence indicators per finding ("3 agents flagged this" is more credible than "1 agent flagged this")

## Expected Output Structure

```markdown
# Code Review Report
**Branch/Range:** [commit range]
**Review date:** [date]
**Agents used:** [N agents — domains covered]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W | SUGGESTIONS: V
**Verified:** N/M findings confirmed against changed commits

---

## Verdict
[2-3 sentence overall assessment]

---

## Architectural Map
[What changed at a system level — which modules, how they connect, what the change accomplishes]

---

## 🔴 Critical Issues (must fix)
### [Issue title] — [filename:line]
**Why it matters:** [1 sentence]
**What to do:** [concrete recommendation]
**Introduced in:** commit [SHA] "[message]"

---

## 🟠 High Issues (should fix)
[...]

## 🟡 Medium Issues (consider fixing)
[...]

## 🔵 Suggestions (optional)
[...]

---

## What Looks Good
- [Domain/pattern]: No issues found
- [...]

---

## Pre-existing Issues (not introduced by this change)
[If any were found and discarded from VerifyClaims — optional appendix for awareness]
```

## Follow-Up

End of pipeline — no automatic chains. Output report to user.
Optionally: post to PR comments if `--comment` flag provided.
