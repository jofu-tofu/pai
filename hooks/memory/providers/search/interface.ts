/**
 * Search Provider Interface for the PAI Memory System
 *
 * Defines the contract for search providers that query the memory index.
 * This interface enables pluggable search strategies (keyword, semantic, hybrid).
 */

import { Provider, ProviderError } from '../../types/common';
import { Result } from '../../types/common';

/**
 * Search provider interface for querying memory index
 */
export interface SearchProvider extends Provider {
  /**
   * Search for memories matching the given query
   *
   * @param query - User's search query text
   * @param options - Optional search configuration
   * @returns Result containing search results or error
   */
  search(query: string, options?: SearchOptions): Promise<Result<SearchResult[], SearchError>>;
}

/**
 * Options for configuring search behavior
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  maxResults?: number;

  /** Minimum number of search terms that must match */
  minMatchCount?: number;
}

/**
 * Search result representing a matching memory segment
 */
export interface SearchResult {
  /** Segment identifier */
  segmentId: string;

  /** Number of search terms that matched this segment */
  matchCount: number;

  /** List of terms that matched */
  matchedTerms: string[];

  /** Total number of terms in the original query (for percentage calculation) */
  totalQueryTerms: number;
}

/**
 * Error type for search failures
 */
export interface SearchError extends ProviderError {
  /** Error code (e.g., 'SEARCH_INDEX_CORRUPT', 'SEARCH_FAILED') */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Optional original error */
  cause?: Error;
}
