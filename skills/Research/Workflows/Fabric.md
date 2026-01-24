# Fabric Workflow

Routes Fabric pattern requests to the dedicated Fabric skill.

**USE WHEN** processing content, analyzing data, creating summaries, threat modeling, or transforming text using Fabric patterns.

## Routing

**This workflow routes to the Fabric skill.** All Fabric pattern execution is now handled by:

`$PAI_DIR/skills/Fabric/SKILL.md`

## When to Route to Fabric Skill

**Primary Use Cases:**
- "Create a threat model for..."
- "Summarize this article/video/paper..."
- "Extract wisdom/insights from..."
- "Analyze this [code/malware/claims/debate]..."
- "Improve my writing/code/prompt..."
- "Create a [visualization/summary/report]..."
- "Rate/review/judge this content..."
- "Use fabric pattern [pattern_name]..."

## How to Use

When a user requests Fabric pattern processing:

1. **Invoke the Fabric skill** - Read and follow `$PAI_DIR/skills/Fabric/SKILL.md`
2. **Route to ExecutePattern workflow** - `$PAI_DIR/skills/Fabric/Workflows/ExecutePattern.md`
3. **The Fabric skill handles**:
   - Pattern selection based on intent
   - Native pattern execution (reads system.md directly)
   - CLI fallback for YouTube (`-y`) and blocked URLs (`-u`)
   - Structured output formatting

## Pattern Categories (240+)

The Fabric skill provides access to 240+ patterns organized by category:

| Category | Examples |
|----------|----------|
| **Extraction** | extract_wisdom, extract_insights, extract_main_idea |
| **Summarization** | summarize, create_5_sentence_summary, youtube_summary |
| **Analysis** | analyze_claims, analyze_code, analyze_threat_report |
| **Creation** | create_threat_model, create_prd, create_mermaid_visualization |
| **Improvement** | improve_writing, improve_prompt, review_code |
| **Security** | create_stride_threat_model, create_sigma_rules, analyze_malware |
| **Rating** | rate_content, judge_output, rate_ai_response |

## Integration Note

The Research skill uses Fabric for content analysis. For deep alpha extraction that goes beyond standard patterns, use the `ExtractAlpha.md` workflow instead, which combines deep thinking with selective Fabric pattern application.

## Quick Reference

```
User: "Use fabric to summarize this article"
→ Invoke Fabric skill
→ Route to ExecutePattern workflow
→ Select 'summarize' pattern
→ Execute natively (read system.md, apply to content)
→ Return structured output
```

**Patterns location:** `$PAI_DIR/skills/Fabric/Patterns/`

**Full documentation:** `$PAI_DIR/skills/Fabric/SKILL.md`
