import { Result } from '../types/common';
import { applyFilters } from './filters';
import { rankResults } from './ranking';
import { FilterOptions } from '../types/filters';
import { RankingOptions, RankedResult } from '../types/ranking';
import { globalProviderRegistry, Provider } from './provider-registry';
import { getMemoryConfig } from './config';

/**
 * Memory context item returned by retrieval pipeline
 */
export interface MemoryContext {
  id: string;
  relevance: number;
  age: string;
  tags: string[];
  content: string;
}

/**
 * Options for configuring retrieval behavior
 */
export interface RetrievalOptions {
  maxResults?: number;      // Maximum number of memories to return
  maxTokens?: number;        // Maximum total tokens in results
  minRelevance?: number;     // Minimum relevance score (0-100)
  filters?: FilterOptions;   // Filter options (Story 2.3)
  ranking?: RankingOptions;  // Ranking options (Story 2.4)
}

/**
 * Error type for retrieval failures
 */
export interface RetrievalError {
  code: string;
  message: string;
  cause?: Error;
}

/**
 * Search provider interface
 */
export interface SearchProvider extends Provider {
  search(
    query: string,
    options?: { maxResults?: number; minMatchCount?: number }
  ): Promise<Result<any[], any>>;
}

// MVP default fallback
const MVP_SEARCH_PROVIDER = 'keyword-search';

// Cached provider instance (per-process)
// NOTE: Not thread-safe - concurrent hook invocations could create multiple instances.
// This is acceptable since: (1) hooks typically run sequentially, (2) globalProviderRegistry
// has its own caching, so worst case is we create 2 instances that both work correctly.
let searchProvider: SearchProvider | null = null;
let providerLoadInProgress = false;

/**
 * Get or initialize the search provider
 *
 * Loads search provider based on configuration with fallback to MVP default.
 * Caches provider instance for session duration.
 *
 * Note: This function is not fully thread-safe. If multiple invocations occur
 * concurrently, multiple provider instances might be created. However, this is
 * acceptable since the globalProviderRegistry has its own caching.
 *
 * @returns Result with search provider or error
 */
async function getSearchProvider(): Promise<
  Result<SearchProvider, RetrievalError>
> {
  // Return cached instance if available
  if (searchProvider !== null) {
    return { ok: true, value: searchProvider };
  }

  // Warn if concurrent loading detected (shouldn't happen in practice)
  if (providerLoadInProgress) {
    console.error(
      '[Memory:Retrieval] Warning: Concurrent provider loading detected'
    );
  }
  providerLoadInProgress = true;

  // Load config to determine which provider to use
  const configResult = await getMemoryConfig();

  if (!configResult.ok) {
    console.error(
      `[Memory:Retrieval] Failed to load config: ${configResult.error.message}`
    );
    providerLoadInProgress = false;
    return {
      ok: false,
      error: {
        code: 'RETRIEVAL_CONFIG_FAILED',
        message: `Failed to load configuration: ${configResult.error.message}`,
        cause: configResult.error.cause,
      },
    };
  }

  const config = configResult.value;
  const searchName = config.providers.search;

  // Try to load configured search provider
  const providerResult = await globalProviderRegistry.getProvider<SearchProvider>(
    'search',
    searchName
  );

  if (!providerResult.ok) {
    console.error(
      `[Memory:Config] Provider '${searchName}' not found, using default`
    );

    // Fallback to MVP default
    const fallbackResult = await globalProviderRegistry.getProvider<SearchProvider>(
      'search',
      MVP_SEARCH_PROVIDER
    );

    if (!fallbackResult.ok) {
      providerLoadInProgress = false;
      return {
        ok: false,
        error: {
          code: 'RETRIEVAL_PROVIDER_INIT_FAILED',
          message: `Fatal: Default search provider '${MVP_SEARCH_PROVIDER}' not registered`,
        },
      };
    }

    console.error(
      `[Memory:Retrieval] Using search provider: ${fallbackResult.value.name}`
    );
    searchProvider = fallbackResult.value;
    providerLoadInProgress = false;
    return { ok: true, value: searchProvider };
  }

  console.error(
    `[Memory:Retrieval] Using search provider: ${providerResult.value.name}`
  );
  searchProvider = providerResult.value;
  providerLoadInProgress = false;
  return { ok: true, value: searchProvider };
}

/**
 * Retrieval Pipeline - Now with keyword search, filtering, and ranking
 *
 * Story 2.2: ✅ Keyword search from inverted index
 * Story 2.3: ✅ Filter by tags, recency, importance, access count
 * Story 2.4: ✅ Rank by relevance score (multi-factor scoring)
 * Story 2.5 will add:
 * - Story 2.5: Format for context injection and load full content
 *
 * For Stories 2.2-2.4, this returns ranked search results with metadata.
 * Full memory context loading will be implemented in Story 2.5.
 *
 * @param query - User's search query text
 * @param options - Optional configuration for retrieval behavior
 * @returns Result containing array of ranked results (Story 2.4+)
 */
export async function retrieveMemories(
  query: string,
  options?: RetrievalOptions
): Promise<Result<RankedResult[], RetrievalError>> {
  try {
    // Get search provider (now returns Result)
    const providerResult = await getSearchProvider();
    if (!providerResult.ok) {
      return providerResult;
    }

    const provider = providerResult.value;

    // Execute keyword search
    const searchResult = await provider.search(query, {
      maxResults: options?.maxResults || 100, // Increase for filtering
      minMatchCount: 1  // At least one term must match
    });

    if (!searchResult.ok) {
      return {
        ok: false,
        error: {
          code: 'RETRIEVAL_SEARCH_FAILED',
          message: searchResult.error.message,
          cause: searchResult.error.cause
        }
      };
    }

    // Apply filters to search results (Story 2.3)
    const filterResult = await applyFilters(
      searchResult.value,
      options?.filters
    );

    if (!filterResult.ok) {
      return {
        ok: false,
        error: {
          code: 'RETRIEVAL_FILTER_FAILED',
          message: filterResult.error.message,
          cause: filterResult.error.cause
        }
      };
    }

    console.error(
      `[Memory:Retrieval] Filtered to ${filterResult.value.length} candidates`
    );

    // Story 2.4: Rank results by relevance
    const rankingResult = await rankResults(
      filterResult.value,
      {
        limit: options?.maxResults || 10,
        minScore: options?.minRelevance || 0,
        ...options?.ranking
      }
    );

    if (!rankingResult.ok) {
      return {
        ok: false,
        error: {
          code: 'RETRIEVAL_RANKING_FAILED',
          message: rankingResult.error.message,
          cause: rankingResult.error.cause
        }
      };
    }

    console.error(
      `[Memory:Retrieval] Ranked to top ${rankingResult.value.length} results`
    );

    // Story 2.5 will add content loading and formatting
    return {
      ok: true,
      value: rankingResult.value
    };

  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'RETRIEVAL_FAILED',
        message: (error as Error).message,
        cause: error as Error
      }
    };
  }
}
