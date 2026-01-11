import { retrieveMemories } from './core/retrieval';
import { formatMemoryContext } from './core/context-formatter';
import { batchIncrementAccessCounts } from './core/access-tracker';
import { logRetrieval, createLogEntry } from './lib/logging/retrieval-logger';
import { estimateTokens } from './lib/formatting/token-counter';

/**
 * Read all input from stdin
 */
async function readStdin(): Promise<string> {
  let input = '';
  const decoder = new TextDecoder();
  const reader = Bun.stdin.stream().getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      input += decoder.decode(value, { stream: true });
    }
  } catch (e) {
    // Ignore read errors - graceful degradation
  }
  return input;
}

/**
 * Flexible payload structure for UserPromptSubmit
 */
interface PromptPayload {
  query?: string;
  prompt?: string;
  message?: string;
  text?: string;
  // Payload structure may vary - be flexible
}

/**
 * Extract user query from payload, trying multiple possible field names
 */
function extractQuery(payload: PromptPayload): string {
  return payload.query || payload.prompt || payload.message || payload.text || '';
}

/**
 * Main hook execution
 */
async function main() {
  const startTime = Date.now();

  try {
    // Read input payload
    const input = await readStdin();
    if (!input.trim()) {
      process.exit(0);
    }

    const payload = JSON.parse(input);

    // Extract query from payload
    // Support multiple payload formats: { query, prompt, message, text }
    const userQuery = extractQuery(payload);

    if (!userQuery.trim()) {
      console.error('[Memory:Retrieve] Empty query, skipping retrieval');
      process.exit(0);
    }

    console.error(`[Memory:Retrieve] Query: "${userQuery}"`);

    // Execute retrieval pipeline (search → filter → rank)
    const retrievalResult = await retrieveMemories(userQuery, {
      maxResults: 10,
      minRelevance: 0,
      filters: {
        recency: '30d'  // Only memories from last 30 days
      }
    });

    if (!retrievalResult.ok) {
      console.error(
        `[Memory:Retrieve] Retrieval failed: ${retrievalResult.error.message}`
      );
      process.exit(0);  // Graceful degradation
    }

    const rankedResults = retrievalResult.value;

    if (rankedResults.length === 0) {
      console.error('[Memory:Retrieve] No memories found');

      // Log zero-result retrieval for diagnostics
      const latency = Date.now() - startTime;
      logRetrieval(createLogEntry(userQuery, [], latency, 0));

      process.exit(0);
    }

    console.error(
      `[Memory:Retrieve] Found ${rankedResults.length} ranked memories`
    );

    // Format memories for context injection
    const formatResult = await formatMemoryContext(rankedResults, {
      maxTokens: 2000,
      maxMemories: 10
    });

    if (!formatResult.ok) {
      console.error(
        `[Memory:Retrieve] Formatting failed: ${formatResult.error.message}`
      );
      process.exit(0);
    }

    const formattedContext = formatResult.value;

    if (!formattedContext) {
      console.error('[Memory:Retrieve] No context formatted (all memories failed)');
      process.exit(0);
    }

    // Output formatted context to stdout for Claude Code
    console.log(formattedContext);

    // Track access counts for injected segments
    const injectedIds = rankedResults.map(r => r.segmentId);
    const trackResult = await batchIncrementAccessCounts(injectedIds);

    if (!trackResult.ok) {
      console.error(
        `[Memory:Retrieve] Access tracking failed: ${trackResult.error.message}`
      );
      // Don't fail retrieval if tracking fails
    }

    // Log retrieval for diagnostics
    const latency = Date.now() - startTime;
    const injectedTokens = estimateTokens(formattedContext);
    logRetrieval(createLogEntry(userQuery, rankedResults, latency, injectedTokens));

    console.error(
      `[Memory:Retrieve] Complete: ${rankedResults.length} memories, ${injectedTokens} tokens, ${latency}ms`
    );

    // Check latency budget
    if (latency > 1000) {
      console.error(
        `[Memory:Retrieve] WARNING: Latency (${latency}ms) exceeds 1s budget`
      );
    }

    process.exit(0);

  } catch (error) {
    console.error(
      `[Memory:Retrieve] Error: ${(error as Error).message}`
    );
    process.exit(0);  // Always exit 0 for graceful degradation
  }
}

main();
