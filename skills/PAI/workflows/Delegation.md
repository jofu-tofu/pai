# Delegation Workflow

Comprehensive guide to delegating tasks to agents in the hybrid agent system.

## CRITICAL: Agent Type Selection

**FIRST, determine what the user is asking for:**

| User Says | Action | Tool |
|-------------|--------|------|
| "**custom agents**", "spin up **custom** agents" | Use **AgentFactory** to generate unique agents with distinct voices | `bun run AgentFactory.ts` |
| "spin up agents", "launch agents", "bunch of agents" | Use **generic Intern** agents for parallel grunt work | `Task(subagent_type="Intern")` |
| "interns", "use interns" | Use **Intern** agents | `Task(subagent_type="Intern")` |
| "use Ava", "get Remy to", "[named agent]" | Use the **named agent** directly | `Task(subagent_type="PerplexityResearcher")` |

**The word "custom" is the KEY differentiator:**
- "custom agents" → AgentFactory (unique prompts + unique voices)
- "agents" (no "custom") → Interns (same voice, parallel work)

### FORBIDDEN — Never Do This

When user says "custom agents", **NEVER** use Task tool subagent_types directly:

```typescript
// WRONG - These are NOT custom agents
Task({ subagent_type: "Architect", prompt: "..." })
Task({ subagent_type: "Designer", prompt: "..." })
Task({ subagent_type: "Engineer", prompt: "..." })
```

Task tool subagent_types (Architect, Designer, Engineer, etc.) are pre-built workflow agents. They do NOT have unique voices or AgentFactory composition. They are for internal workflow use only.

**For custom agents, invoke the Agents skill** → `Skill("Agents")` or follow CreateCustomAgent workflow.

See: `SYSTEM/PAIAGENTSYSTEM.md` for full routing rules | `skills/Agents/SKILL.md` for agent composition system.

---

## How the User Interacts

**Users just talk naturally.** Examples:

- "Research these 5 companies for me" → Spawn 5 parallel Intern agents
- "Spin up custom agents to analyze psychology" → Use AgentFactory for each agent
- "I need a legal expert to review this contract" → Compose a dynamic agent
- "Get Ava to investigate this" → Use the named Perplexity researcher
- "I need someone skeptical about security to red-team this" → Compose security + skeptical + adversarial

**Users never touch CLI tools.** The system uses them internally based on what you ask for.

## Triggers

- "delegate", "spawn agents", "launch agents" → Interns
- "**custom agents**", "specialized agents" → AgentFactory
- "use an intern", "use researcher", "use [agent name]" → Named/Intern
- "in parallel", "parallelize" → Multiple agents
- "I need an expert in", "get me someone who" → Dynamic composition

## The Hybrid Agent Model

The system supports two types of agents:

| Type | Definition | Best For |
|------|------------|----------|
| **Named Agents** | Persistent identities with backstories and voice mappings | Recurring work, voice output, relationship continuity |
| **Dynamic Agents** | Task-specific specialists composed from traits | One-off tasks, novel combinations, parallel grunt work |

## Named Agents

| Agent | Personality | Use When... |
|-------|-------------|-------------|
| Ava (Perplexity) | Investigative journalist | "research", "find out", "investigate" |
| Ava Sterling (Claude) | Strategic thinker | "analyze strategically", "what are implications" |
| Alex (Gemini) | Multi-perspective | "get different viewpoints", "comprehensive" |
| Johannes (Grok) | Contrarian fact-checker | "challenge this", "what's wrong with" |
| Remy (Codex) | Curious technical archaeologist | "dig into the code", "how does this work" |
| Marcus (Engineer) | Battle-scarred leader | "implement this", "build", "code" |
| Serena (Architect) | Academic visionary | "design the system", "architecture" |
| Rook (Pentester) | Reformed grey hat | "security test", "find vulnerabilities" |
| Dev (Intern) | Brilliant overachiever | General-purpose, parallel tasks |

## Dynamic Agents

When your request needs a specific expertise combination that no named agent provides, compose one from traits.

**Example:** "I need someone with legal expertise who's really skeptical to review this contract for security issues"

Internally run:
```
AgentFactory --traits "legal,security,skeptical,meticulous,systematic"
```

### Available Traits

**Expertise** (domain knowledge):
- security, legal, finance, medical, technical
- research, creative, business, data, communications

**Personality** (behavior style):
- skeptical, enthusiastic, cautious, bold, analytical
- creative, empathetic, contrarian, pragmatic, meticulous

**Approach** (work style):
- thorough, rapid, systematic, exploratory
- comparative, synthesizing, adversarial, consultative

### Example Compositions

| Request | Composition |
|---------|-------------|
| "Legal expert, really thorough" | legal + meticulous + thorough |
| "Security red team" | security + contrarian + adversarial |
| "Quick business assessment" | business + pragmatic + rapid |
| "Empathetic user researcher" | research + empathetic + synthesizing |

## Model Selection

**CRITICAL FOR SPEED**: Always specify the right model for the task.

| Task Type | Model | Why |
|-----------|-------|-----|
| Deep reasoning, architecture | `opus` | Maximum intelligence |
| Standard implementation, analysis | `sonnet` | Balance of speed + capability |
| Simple checks, parallel grunt work | `haiku` | 10-20x faster, sufficient |

```typescript
// WRONG - defaults to Opus, takes minutes
Task({ prompt: "Check if file exists", subagent_type: "Intern" })

// RIGHT - Haiku for simple task
Task({ prompt: "Check if file exists", subagent_type: "Intern", model: "haiku" })
```

**Rule of Thumb:**
- Grunt work or verification → `haiku`
- Implementation or research → `sonnet`
- Strategic/architectural → `opus` or default

## Foreground Delegation

Standard blocking delegation - waits for agent to complete.

### Single Agent

```typescript
Task({
  description: "Research competitor",
  prompt: "Investigate Acme Corp's recent product launches...",
  subagent_type: "PerplexityResearcher",
  model: "sonnet"
})
```

### Parallel Agents

**ALWAYS use a single message with multiple Task calls for parallel work:**

```typescript
// Send as SINGLE message with multiple tool calls
Task({ description: "Research A", prompt: "...", subagent_type: "Intern", model: "haiku" })
Task({ description: "Research B", prompt: "...", subagent_type: "Intern", model: "haiku" })
Task({ description: "Research C", prompt: "...", subagent_type: "Intern", model: "haiku" })
// All run in parallel, all results returned together
```

### Spotcheck Pattern

**ALWAYS launch a spotcheck intern after parallel work:**

```typescript
Task({
  description: "Spotcheck parallel results",
  prompt: "Review these results for consistency and completeness: [results]",
  subagent_type: "Intern",
  model: "haiku"
})
```

## Background Delegation

Non-blocking delegation - agents run while you continue working.

```typescript
Task({
  description: "Background research",
  prompt: "Research X...",
  subagent_type: "PerplexityResearcher",
  model: "haiku",
  run_in_background: true  // Returns immediately
})
// Returns { agent_id: "abc123", status: "running" }

// Check later
TaskOutput({ agentId: "abc123", block: false })

// Retrieve when ready
TaskOutput({ agentId: "abc123", block: true })
```

## Full Context Requirements

When delegating, ALWAYS include:

1. **WHY** - Business context, why this matters
2. **WHAT** - Current state, existing implementation
3. **EXACTLY** - Precise actions, file paths, patterns
4. **SUCCESS CRITERIA** - What good output looks like

```typescript
Task({
  description: "Audit auth security",
  prompt: `
    ## Context
    We're preparing for SOC 2 audit. Need to verify our auth implementation.

    ## Current State
    Auth is in src/auth/, uses JWT with refresh tokens.

    ## Task
    1. Review all auth-related code
    2. Check for OWASP Top 10 vulnerabilities
    3. Verify token handling is secure
    4. Check for timing attacks in password comparison

    ## Success Criteria
    - Comprehensive security assessment
    - Specific file:line references for any issues
    - Severity ratings for each finding
    - Remediation recommendations
  `,
  subagent_type: "Pentester",
  model: "sonnet"
})
```

## Related

- **Agent System**: `SYSTEM/PAIAGENTSYSTEM.md` - Full agent routing reference
- **Agents Skill**: `skills/Agents/` - Complete agent composition system
