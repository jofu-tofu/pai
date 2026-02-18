# Prompting Standards (UpdateSkill Local Copy)

> Extracted from `Prompting/Standards.md` — Claude 4.x Best Practices relevant to skill wording, trigger phrases, and description quality. This copy exists to keep UpdateSkill self-contained.

---

## Core Rules

### No XML Tags — Markdown Only

Never use XML-style tags in skill files, workflow files, or descriptions.

❌ `<instructions>Do something</instructions>`
✅ `## Instructions\nDo something`

### Be Explicit and Direct

Vague requests produce vague behavior. Be specific.

❌ "You might want to consider using..."
✅ "Use this tool when..."

### Tell Instead of Forbid (Positive Framing)

Give a clear target, not just a void to avoid.

❌ "Do not use markdown or bullet points."
✅ "Write in flowing prose paragraphs with natural transitions."

### Signal-to-Noise Ratio

Every token competes for attention. Remove redundant or overlapping content. Prefer clear, direct language over verbose explanations.

### Soft Tool/Trigger Language (Claude 4.x Specific)

Avoid aggressive framing — it causes overtriggering.

❌ "CRITICAL: You MUST use this tool"
✅ "Use this tool when [specific condition]"

---

## Trigger Phrase Quality Rules

Trigger phrases are the primary routing signal. Poor phrases cause missed triggers, over-triggers, and routing ambiguity.

**Length:** 2–6 words. Shorter = more reliable matching. Longer = too brittle, too specific to exact wording.

**Natural language:** The phrase must be something a real user would say unprompted. Test by saying it aloud.

**Specificity:** Each phrase must unambiguously point to ONE workflow. If it could fit two workflows, it's too broad.

**No overlap:** Compare against ALL existing trigger phrases in the skill before finalizing. No semantic duplicates across workflows.

**Verb clarity:** The intended action (add, remove, validate, audit, decompose) must be clear from the phrase alone.

**Avoid single-word triggers:** Single words like "validate", "audit", "analyze" will fire on too many unrelated requests.

---

## USE WHEN Clause Standards

The `description:` frontmatter field's USE WHEN clause is what routes the entire skill. It must be:

- **Specific enough to match** — include concrete signal words users actually say
- **Broad enough to cover variants** — include synonyms and natural phrasings
- **Imperative or "USE WHEN" prefixed** — not "This skill handles..." but "USE WHEN user says..."
- **No XML tags** — plain markdown text only
- **Not redundant** — each phrase adds a signal, not a restatement

---

## Writing Style Guidelines

**Clarity over completeness:**
✅ "Validate user input before processing."
❌ "You should always make sure to validate the user's input before you process it because invalid input could cause problems."

**Be direct and specific:**
✅ "Use the `calculate_tax` tool with amount and jurisdiction parameters."
❌ "You might want to consider using the calculate_tax tool if you need to determine tax amounts."

**Imperative voice in instructions:**
Use "Do X", not "You should do X" or "It is recommended to do X."

**Add motivation when it prevents misunderstanding:**
✅ "This output is read aloud by TTS, so never use ellipses or fragments."

---

## Anti-Patterns to Avoid

❌ **Verbose explanations** — Don't explain reasoning behind every instruction. Be direct.

❌ **Negative-only constraints** — Don't just say what NOT to do. Tell what TO do instead.

❌ **Aggressive trigger language** — "CRITICAL: You MUST use this workflow" causes overtriggering.

❌ **Misaligned examples** — Examples shape behavior. If your example doesn't match desired output exactly, Claude will replicate the mismatch.

❌ **Vague instructions** — "might", "could", "should consider" introduce uncertainty. Be imperative.

❌ **Single-word triggers** — Too broad. Will match unrelated user requests.

❌ **Overlapping triggers** — Two workflows with semantically equivalent phrases create routing ambiguity.

---

## Best Practices Checklist (Wording Focus)

When creating or reviewing skill descriptions and trigger phrases:

- [ ] No XML tags — markdown only throughout
- [ ] Language is clear, direct, minimal
- [ ] Instructions tell what TO do (positive framing)
- [ ] Trigger phrases are 2–6 words
- [ ] Each trigger phrase passes the "say it aloud" test
- [ ] No trigger phrase overlaps with another workflow's triggers
- [ ] Tool/workflow descriptions use soft language (avoid "MUST")
- [ ] USE WHEN clause contains concrete signal words, not meta-descriptions
- [ ] Examples (if present) match desired outcomes exactly

---

## Claude 4.x Quick Reference

| ❌ Avoid | ✅ Use Instead |
|----------|---------------|
| "CRITICAL: You MUST use this tool" | "Use this tool when..." |
| "Don't use markdown" | "Write in flowing prose paragraphs" |
| "NEVER do X" | "Do Y instead" (positive framing) |
| "You should probably..." | "Do X" (imperative, direct) |
| Vague: "make it better" | Specific: "Change X to achieve Y" |
| Single-word trigger: "validate" | Specific phrase: "validate skill" |
| Aggressive: "ALWAYS run this" | Conditional: "Run when [condition]" |

---

> **Source:** Distilled from `Prompting/Standards.md` — Anthropic Claude 4.x Best Practices (November 2025), 1,500+ academic papers on prompt optimization.
