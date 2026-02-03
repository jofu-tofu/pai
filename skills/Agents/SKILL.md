---
name: Agents
description: Dynamic agent composition and management system. USE WHEN user says create custom agents, spin up custom agents, specialized agents, OR asks for agent personalities, available traits, agent voices. Handles custom agent creation, personality assignment, voice mapping, and parallel agent orchestration.
---

# Agents - Custom Agent Composition System v2.0

**Auto-routes when user mentions custom agents, agent creation, or specialized personalities.**

## Voice Notification (MANDATORY)

**When executing ANY workflow in this skill, you MUST do BOTH:**

1. **Send voice notification FIRST:**
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow from the Agents skill"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification:**
   ```
   Running the **WorkflowName** workflow from the **Agents** skill...
   ```

**Full documentation:** `$PAI_DIR/skills/PAI/SkillNotifications.md`

## Customization

**Before executing, check for user customizations at:**
`$PAI_DIR/skills/PAI/USER/SKILLCUSTOMIZATIONS/Agents/`

If this directory exists, load and apply:
- `PREFERENCES.md` - Named agent roster summary
- `VoiceConfig.json` - Voice server configuration with ElevenLabs voice IDs
- `NamedAgents.md` - Full agent backstories and character definitions (optional)
- `Traits.yaml` - **NEW in v2.0:** User trait customizations (merged with base traits)

These define user-specific named agents with persistent identities. If the directory does not exist, use only dynamic agent composition from traits.

## Overview

The Agents skill is a complete agent composition and management system. It consolidates all agent-related infrastructure:
- Dynamic agent composition from traits (expertise + personality + approach)
- **NEW:** Base + User traits merge system (user customizations take priority)
- **NEW:** Full prosody settings (stability, similarity_boost, style, speed, volume)
- **NEW:** Agent color generation for visual identity
- Personality definitions and voice mappings
- Custom agent creation with unique voices
- Parallel agent orchestration patterns

## Workflow Routing

**Available Workflows:**
- **CREATECUSTOMAGENT** - Create specialized custom agents → `Workflows/CreateCustomAgent.md`
- **LISTTRAITS** - Show available agent traits → `Workflows/ListTraits.md`
- **SPAWNPARALLEL** - Launch parallel agents → `Workflows/SpawnParallelAgents.md`

## Examples

**Example 1: Create custom agents for analysis**
```
User: "Spin up 5 custom science agents to analyze this data"
→ Invokes CREATECUSTOMAGENT workflow
→ Runs ComposeAgent 5 times with DIFFERENT trait combinations
→ Each agent gets unique personality + matched voice + color
→ Launches agents in parallel with model: "sonnet"
```

**Example 2: List available traits**
```
User: "What agent personalities can you create?"
→ Invokes LISTTRAITS workflow
→ Displays expertise (security, legal, finance, etc.)
→ Shows personality types (skeptical, enthusiastic, analytical, etc.)
→ Lists approach styles (thorough, rapid, systematic, etc.)
→ Shows voice prosody settings
```

**Example 3: Spawn parallel researchers**
```
User: "Launch 10 agents to research these companies"
→ Invokes SPAWNPARALLEL workflow
→ Creates 10 general-purpose agents (generic, same voice)
→ Uses model: "haiku" for speed
→ Launches spotcheck agent after completion
```

## Architecture

### Hybrid Agent Model

The system uses two types of agents:

| Type | Definition | Best For |
|------|------------|----------|
| **Named Agents** | Persistent identities with backstories (Remy, Ava, Marcus) | Recurring work, voice output, relationships |
| **Dynamic Agents** | Task-specific specialists composed from traits | One-off tasks, novel combinations, parallel work |

### The Agent Spectrum

```
┌─────────────────────────────────────────────────────────────────────┐
│   NAMED AGENTS          HYBRID USE          DYNAMIC AGENTS          │
│   (Relationship)        (Best of Both)      (Task-Specific)         │
├──────────────────────────────────────────────────────────────────────┤
│ Remy, Ava, Marcus   "Security expert      Ephemeral specialist      │
│                      with Johannes's      composed from traits      │
│                      skepticism"                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Route Triggers

**CRITICAL: The word "custom" is the KEY trigger:**

| User Says | What to Use | Why |
|-----------|-------------|-----|
| "**custom agents**", "create **custom** agents" | ComposeAgent | Unique prompts + unique voices + colors |
| "agents", "launch agents", "bunch of agents" | Generic general-purpose | Same voice, parallel grunt work |
| "use Remy", "get Ava to" | Named agent | Pre-defined personality |

**Other triggers:**
- "agent personalities", "available traits" → LISTTRAITS workflow
- "specialized agents", "expert in X" → CREATECUSTOMAGENT workflow
- "parallel agents", "spawn 5 agents" → SPAWNPARALLEL workflow

## Components

### Data

**Traits.yaml** (`Data/Traits.yaml`)
- Expertise areas: security, legal, finance, medical, technical, research, creative, business, data, communications
- Personality dimensions: skeptical, enthusiastic, cautious, bold, analytical, creative, empathetic, contrarian, pragmatic, meticulous
- Approach styles: thorough, rapid, systematic, exploratory, comparative, synthesizing, adversarial, consultative
- Voice mappings: Trait combinations → ElevenLabs voices
- **NEW:** Prosody settings per voice (stability, similarity_boost, style, speed, volume)
- Voice registry: 45+ voices with characteristics

### Templates

**DynamicAgent.hbs** (`Templates/DynamicAgent.hbs`)
- Handlebars template for dynamic agent prompts
- Composes: expertise + personality + approach + voice assignment
- **NEW:** Includes color for visual identity
- Includes operational guidelines and response format

### Tools

**ComposeAgent.ts** (`Tools/ComposeAgent.ts`) - **v2.0**
- Dynamic agent composition engine
- Infers traits from task description
- Maps trait combinations to appropriate voices
- **NEW:** Merges base traits with user customizations
- **NEW:** Full prosody settings (stability, similarity_boost, style, speed, volume)
- **NEW:** Generates unique color per trait combination
- Outputs complete agent prompt ready for Task tool

```bash
# Usage examples
bun run $PAI_DIR/skills/Agents/Tools/ComposeAgent.ts --task "Review security architecture"
bun run $PAI_DIR/skills/Agents/Tools/ComposeAgent.ts --traits "legal,skeptical,meticulous"
bun run $PAI_DIR/skills/Agents/Tools/ComposeAgent.ts --list
bun run $PAI_DIR/skills/Agents/Tools/ComposeAgent.ts --task "..." --output json
```

**JSON Output (v2.0):**
```json
{
  "name": "Security Expert Skeptical Thorough",
  "traits": ["security", "skeptical", "thorough"],
  "voice": "Sam",
  "voice_id": "yoZ06aMxZJJ28mfd3POQ",
  "voice_reason": "Security skepticism suits raspy authenticity",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.7,
    "style": 0.0,
    "speed": 1.0,
    "use_speaker_boost": true,
    "volume": 0.8
  },
  "color": "#E74C3C",
  "expertise": ["Security Expert"],
  "personality": ["Skeptical"],
  "approach": ["Thorough"],
  "prompt": "# Dynamic Agent: Security Expert Skeptical Thorough..."
}
```

### Configuration Paths

| Path | Purpose |
|------|---------|
| `$PAI_DIR/skills/Agents/Data/Traits.yaml` | Base traits (ships with PAI) |
| `$PAI_DIR/skills/PAI/USER/SKILLCUSTOMIZATIONS/Agents/Traits.yaml` | User trait customizations |

User traits are **merged over** base traits - user values take priority. This allows adding custom voices, personalities, and prosody settings without modifying base files.

### Personalities

**AgentPersonalities.md** (`AgentPersonalities.md`)
- Named agent definitions with full backstories
- Voice settings and personality traits
- Character development and communication styles
- JSON configuration for voice server

**Named Agents:**
- Jamie - Expressive eager buddy
- Rook Blackburn (Pentester) - Reformed grey hat
- Priya Desai (Artist) - Aesthetic anarchist
- Aditi Sharma (Designer) - Design school perfectionist
- Dev Patel (Intern) - Brilliant overachiever
- Ava Chen (Perplexity) - Investigative analyst
- Ava Sterling (Claude) - Strategic sophisticate
- Alex Rivera (Gemini) - Multi-perspective analyst
- Marcus Webb (Engineer) - Battle-scarred leader
- Serena Blackwood (Architect) - Academic visionary
- Emma Hartley (Writer) - Technical storyteller

## Integration Points

**Voice Server** (`$PAI_DIR/VoiceServer/`)
- Reads agent personality configuration from AgentPersonalities.md
- Maps agent names to ElevenLabs voice IDs
- **NEW:** Uses prosody settings for voice quality tuning
- Delivers personality-driven voice notifications

**CORE Skill** (`$PAI_DIR/skills/PAI/`)
- References Agents skill for custom agent creation
- Documents the custom vs generic distinction
- Includes agent creation in delegation patterns

## Usage Patterns

### For Users (Natural Language)

Users talk naturally:
- "I need a legal expert to review this contract" → System composes legal + analytical + thorough agent
- "Spin up 5 custom science agents" → System uses ComposeAgent 5 times with different traits
- "Launch agents to research these companies" → System spawns generic general-purpose agents
- "Get me someone skeptical about security" → System composes security + skeptical + adversarial agent

### Internal Process

When user says "custom agents", the assistant:
1. Invokes CREATECUSTOMAGENT workflow
2. Runs ComposeAgent for EACH agent with DIFFERENT trait combinations
3. Gets unique prompt + voice ID + color for each
4. Launches agents using Task tool with the composed prompt
5. Each agent has a distinct personality-matched voice

Example internal execution:
```bash
# User: "Create 3 custom research agents"

# Agent 1
bun run ComposeAgent.ts --traits "research,enthusiastic,exploratory" --output json
# Output: voice "Jeremy", color "#FF6B35"

# Agent 2
bun run ComposeAgent.ts --traits "research,skeptical,thorough" --output json
# Output: voice "George", color "#4ECDC4"

# Agent 3
bun run ComposeAgent.ts --traits "research,analytical,systematic" --output json
# Output: voice "Drew", color "#9B59B6"

# Launch all 3 with Task tool
Task({ prompt: <agent1_full_prompt>, subagent_type: "general-purpose", model: "sonnet" })
Task({ prompt: <agent2_full_prompt>, subagent_type: "general-purpose", model: "sonnet" })
Task({ prompt: <agent3_full_prompt>, subagent_type: "general-purpose", model: "sonnet" })
```

## Model Selection

Always specify the appropriate model:

| Task Type | Model | Speed Multiplier |
|-----------|-------|------------------|
| Grunt work, simple checks | `haiku` | 10-20x faster |
| Standard analysis, research | `sonnet` | Balanced |
| Deep reasoning, architecture | `opus` | Maximum intelligence |

**Rule:** Parallel agents especially benefit from `haiku` for speed.

## Related Skills

- **CORE** - Main system identity and delegation patterns
- **VoiceNarration** - Voice output for content (separate from agent notifications)
- **Development** - Uses Engineer and Architect agents

## Version History

- **v2.0.0** (2025-01-24): Major upgrade
  - Replaced AgentFactory.ts with ComposeAgent.ts
  - Added base + user traits merge system
  - Added full prosody settings (style, speed, volume)
  - Added agent color generation
  - Changed subagent_type from "Intern" to "general-purpose"
  - Cross-platform path handling via hooks/core utilities
- **v1.0.0** (2025-12-16): Initial creation - consolidated all agent infrastructure into discrete skill
