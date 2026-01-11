import { Result } from '../types/common';
import { KeywordSearch } from '../providers/search/keyword-search';

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
}

/**
 * Error type for retrieval failures
 */
export interface RetrievalError {
  code: string;
  message: string;
  cause?: Error;
}

// Global provider instance (initialized once)
let searchProvider: KeywordSearch | null = null;

/**
 * Get or initialize the search provider
 * Returns Result type to avoid throwing exceptions
 */
async function getSearchProvider(): Promise<Result<KeywordSearch, RetrievalError>> {
  if (!searchProvider) {
    searchProvider = new KeywordSearch();
    const initResult = await searchProvider.initialize();

    if (!initResult.ok) {
      console.error(`[Memory:Retrieval] Failed to initialize search: ${initResult.error.message}`);
      return {
        ok: false,
        error: {
          code: 'RETRIEVAL_PROVIDER_INIT_FAILED',
          message: `Failed to initialize search provider: ${initResult.error.message}`,
          cause: initResult.error.cause
        }
      };
    }
  }

  return { ok: true, value: searchProvider };
}

/**
 * Retrieval Pipeline - Now with keyword search
 *
 * Story 2.2: ✅ Keyword search from inverted index
 * Stories 2.3-2.5 will add:
 * - Story 2.3: Filter by tags, recency, importance
 * - Story 2.4: Rank by relevance score
 * - Story 2.5: Format for context injection and load full content
 *
 * For Story 2.2, this returns search results from keyword index.
 * Full memory context loading will be implemented in Story 2.5.
 *
 * @param query - User's search query text
 * @param options - Optional configuration for retrieval behavior
 * @returns Result containing array of MemoryContext items (empty until Story 2.5)
 */
export async function retrieveMemories(
  query: string,
  options?: RetrievalOptions
): Promise<Result<MemoryContext[], RetrievalError>> {
  try {
    // Get search provider (now returns Result)
    const providerResult = await getSearchProvider();
    if (!providerResult.ok) {
      return providerResult;
    }

    const provider = providerResult.value;

    // Execute keyword search
    const searchResult = await provider.search(query, {
      maxResults: options?.maxResults || 10,
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

    // For Story 2.2 (Stories 2.3-2.5 pending), return empty results
    // Story 2.3 will add filtering, Story 2.4 ranking, Story 2.5 content loading
    console.error(
      `[Memory:Retrieval] Keyword search found ${searchResult.value.length} candidates (filtering/ranking/content-loading pending Story 2.3-2.5)`
    );

    return {
      ok: true,
      value: []  // Still return empty until Stories 2.3-2.5 implement full pipeline
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
