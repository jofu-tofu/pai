---
name: ScrapingReference
description: Web scraping and MCP system routing details. Reference material for on-demand loading.
---

# Web Scraping & MCP Systems Reference

**Quick reference for web scraping capabilities and routing.**

---

## Web Scraping & MCP Systems

### Route Triggers
- User says "use the MCP" or "use Bright Data" or "use Apify" → Use MCP Skill
- User mentions "scrape my site" or "scrape website" → Use MCP Skill
- User asks "extract data from" or "get data from website" → Use MCP Skill
- User mentions "Instagram scraper" or "LinkedIn data" or social media scraping → Use MCP Skill
- User asks "Google Maps businesses" or lead generation → Use MCP Skill
- Questions about "web scraping" or "data extraction" → Use MCP Skill

### Web Scraping: Use MCP Skill

**The MCP Skill is THE skill for web scraping and data extraction.**

- Location: `${PAI_DIR}/skills/mcp/`
- Handles: Bright Data, Apify, and future web scraping providers
- Implementation: TypeScript wrappers that call APIs directly (not old MCP protocol tools)
- **When user says "use the MCP" or "use Bright Data" or "use Apify"** → Use MCP Skill
- Execute with: `bun run script.ts` using TypeScript imports
- 99% token savings by filtering data in TypeScript code BEFORE model context

**Why TypeScript Wrappers (not old MCP protocol):**
- Direct API calls (faster, more efficient)
- Filter results in code before sending to model (massive token savings)
- Full control over data processing
- No MCP protocol overhead

---

## Provider Configuration

### Bright Data

```bash
# Environment variables
BRIGHT_DATA_API_KEY=your_api_key_here
```

**Capabilities:**
- Web Unlocking (bypass anti-bot)
- SERP API (search results)
- Data Collector (pre-built scrapers)
- Scraping Browser (headless automation)

### Apify

```bash
# Environment variables
APIFY_API_TOKEN=your_api_token_here
```

**Capabilities:**
- Actor marketplace (pre-built scrapers)
- Custom actors (your own scrapers)
- Social media scrapers (Instagram, Twitter, LinkedIn, etc.)
- E-commerce scrapers (Amazon, eBay, etc.)
- Business data (Google Maps, Yelp, etc.)

---

## Usage Pattern

```typescript
// Import from MCP skill
import { scrapeAsMarkdown } from '${PAI_DIR}/skills/mcp/Providers/brightdata/actors';

// Scrape and filter in TypeScript
const data = await scrapeAsMarkdown(url);
const filtered = extractRelevantFields(data);

// Only send filtered data to model context
```

---

## See Also

- `${PAI_DIR}/skills/mcp/SKILL.md` - Complete MCP skill documentation
- `${PAI_DIR}/skills/mcp/Providers/` - Bright Data and Apify integrations
