/**
 * Term Match Scoring Component
 *
 * Calculates relevance based on how many search terms matched the segment.
 * Part of Story 2.4: Result Ranking
 */

/**
 * Calculate term match score based on absolute match count.
 *
 * The term match score represents how well a segment matches the user's search query.
 * Since totalTerms is not available in FilterResult, we normalize based on a maximum
 * expected match count (5 terms typical, saturates at 10).
 *
 * @param matchCount - Number of search terms that matched this segment
 * @param totalTerms - Total number of search terms in query (matchedTerms.length as proxy)
 * @returns Normalized score 0-1 (where 1.0 = high match count)
 *
 * @example
 * ```typescript
 * // Segment matched 3 terms
 * calculateTermMatchScore(3, 3); // Returns 0.60 (3/5)
 * // Segment matched 5 terms
 * calculateTermMatchScore(5, 5); // Returns 1.0 (saturated)
 * ```
 */
export function calculateTermMatchScore(
  matchCount: number,
  totalTerms: number
): number {
  const MAX_TERMS = 5; // Typical query has ~2-5 terms, saturate at 5

  // Handle edge case: no search terms
  if (matchCount === 0 && totalTerms === 0) {
    console.error('[Memory:TermMatchScorer] No search terms provided, returning 0');
    return 0;
  }

  // Handle negative values
  if (matchCount < 0) {
    console.error(
      `[Memory:TermMatchScorer] Negative matchCount (${matchCount}), using 0`
    );
    return 0;
  }

  // Normalize based on maximum expected match count
  // Saturates at MAX_TERMS for high match counts
  return Math.min(matchCount / MAX_TERMS, 1.0);
}
