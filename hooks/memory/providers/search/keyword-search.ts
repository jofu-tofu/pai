/**
 * Keyword Search Provider for the PAI Memory System
 *
 * Implements keyword-based search using an inverted index.
 * Supports stop word filtering, multi-term OR logic, and match count tracking.
 */

import { SearchProvider, SearchOptions, SearchResult, SearchError } from './interface';
import { Result, HealthStatus } from '../../types/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { DEFAULT_STOP_WORDS } from '../../lib/stop-words';
import { getPaiDir } from '../../lib/utils';

/**
 * Type definition for the inverted index
 * Maps keywords to arrays of segment IDs
 */
interface KeywordIndex {
  [keyword: string]: string[];
}

/**
 * Keyword search provider using inverted index
 */
export class KeywordSearch implements SearchProvider {
  readonly name = 'keyword-search';
  readonly version = '1.0.0';

  private indexPath: string;
  private indexCache: KeywordIndex | null = null;
  private initialized = false;
  private stopWords: Set<string>;

  constructor(options?: { paiDir?: string; customStopWords?: Set<string> }) {
    const paiDir = options?.paiDir || getPaiDir();
    this.indexPath = join(paiDir, 'mem-store', 'indexes', 'keyword', 'index.json');
    this.stopWords = options?.customStopWords || DEFAULT_STOP_WORDS;
  }

  /**
   * Initialize the provider by loading the keyword index
   */
  async initialize(): Promise<Result<void, SearchError>> {
    try {
      // Load index into memory
      const result = await this.loadIndex();
      if (!result.ok) {
        return result as Result<void, SearchError>;
      }

      this.indexCache = result.value;
      this.initialized = true;

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'SEARCH_INIT_FAILED',
          message: `Failed to initialize keyword search: ${(error as Error).message}`,
          cause: error as Error
        }
      };
    }
  }

  /**
   * Check provider health and operational status
   */
  async healthCheck(): Promise<HealthStatus> {
    return {
      healthy: this.initialized && this.indexCache !== null,
      message: this.initialized ? 'Keyword index loaded' : 'Not initialized',
      details: {
        indexSize: this.indexCache ? Object.keys(this.indexCache).length : 0,
        indexPath: this.indexPath
      }
    };
  }

  /**
   * Gracefully shutdown the provider
   */
  async shutdown(): Promise<void> {
    this.indexCache = null;
    this.initialized = false;
  }

  /**
   * Search for segments matching the given query
   *
   * @param query - User's search query text
   * @param options - Optional search configuration
   * @returns Result containing matching segments or error
   */
  async search(query: string, options?: SearchOptions): Promise<Result<SearchResult[], SearchError>> {
    try {
      // Ensure initialized
      if (!this.initialized || !this.indexCache) {
        const initResult = await this.initialize();
        if (!initResult.ok) {
          return { ok: false, error: initResult.error };
        }
      }

      // Extract and filter search terms
      const terms = this.extractTerms(query);

      if (terms.length === 0) {
        // No valid search terms after filtering
        return { ok: true, value: [] };
      }

      // Lookup terms in index and track match counts
      const segmentMatches = new Map<string, { count: number; terms: string[] }>();

      for (const term of terms) {
        const segmentIds = this.indexCache![term] || [];

        for (const segmentId of segmentIds) {
          const existing = segmentMatches.get(segmentId);
          if (existing) {
            existing.count++;
            existing.terms.push(term);
          } else {
            segmentMatches.set(segmentId, { count: 1, terms: [term] });
          }
        }
      }

      // Convert to SearchResult array
      const results: SearchResult[] = Array.from(segmentMatches.entries()).map(
        ([segmentId, match]) => ({
          segmentId,
          matchCount: match.count,
          matchedTerms: match.terms
        })
      );

      // Apply filters if specified
      let filteredResults = results;

      if (options?.minMatchCount) {
        filteredResults = filteredResults.filter(
          r => r.matchCount >= options.minMatchCount!
        );
      }

      // Sort by match count (descending) for best matches first
      filteredResults.sort((a, b) => b.matchCount - a.matchCount);

      // Apply result limit
      if (options?.maxResults) {
        filteredResults = filteredResults.slice(0, options.maxResults);
      }

      console.error(
        `[Memory:KeywordSearch] Found ${filteredResults.length} matches for ${terms.length} terms`
      );

      return { ok: true, value: filteredResults };

    } catch (error) {
      console.error(`[Memory:KeywordSearch] Search failed: ${(error as Error).message}`);
      return {
        ok: false,
        error: {
          code: 'SEARCH_FAILED',
          message: `Keyword search failed: ${(error as Error).message}`,
          cause: error as Error
        }
      };
    }
  }

  /**
   * Extract search terms from query
   * - Convert to lowercase
   * - Split on whitespace and punctuation
   * - Filter stop words
   * - Remove duplicates
   */
  private extractTerms(query: string): string[] {
    // Convert to lowercase
    const normalized = query.toLowerCase();

    // Split on whitespace and punctuation, but preserve programming terms
    // This regex splits but keeps alphanumeric and underscores
    const tokens = normalized.split(/[^\w]+/);

    // Filter out empty strings and stop words
    const filtered = tokens.filter(
      token => token && !this.stopWords.has(token)
    );

    // Remove duplicates
    return Array.from(new Set(filtered));
  }

  /**
   * Load keyword index from disk
   * - Missing file returns empty index (not an error)
   * - Corrupted file returns error
   */
  private async loadIndex(): Promise<Result<KeywordIndex, SearchError>> {
    try {
      const content = await readFile(this.indexPath, 'utf-8');
      const index = JSON.parse(content) as KeywordIndex;

      console.error(`[Memory:KeywordSearch] Loaded index with ${Object.keys(index).length} keywords`);

      return { ok: true, value: index };
    } catch (error) {
      const err = error as NodeJS.ErrnoException;

      // Missing file is not an error - return empty index
      if (err.code === 'ENOENT') {
        console.error('[Memory:KeywordSearch] Index file not found, using empty index');
        return { ok: true, value: {} };
      }

      // Corrupted file IS an error
      if (error instanceof SyntaxError) {
        return {
          ok: false,
          error: {
            code: 'SEARCH_INDEX_CORRUPT',
            message: `Index file is corrupted: ${error.message}`,
            cause: error
          }
        };
      }

      // Other errors
      return {
        ok: false,
        error: {
          code: 'SEARCH_INDEX_READ_FAILED',
          message: `Failed to read index: ${err.message}`,
          cause: err
        }
      };
    }
  }
}

export default KeywordSearch;
