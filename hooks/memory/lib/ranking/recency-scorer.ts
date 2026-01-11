/**
 * Recency Scoring Component
 *
 * Calculates relevance based on segment age using exponential decay.
 * Uses half-life approach to model how memory relevance decreases over time.
 *
 * Part of Story 2.4: Result Ranking
 */

/**
 * Calculate recency score using half-life exponential decay.
 *
 * Half-life approach is more intuitive than raw exponential decay:
 * - After 1 half-life: score = 50%
 * - After 2 half-lives: score = 25%
 * - After 3 half-lives: score = 12.5%
 *
 * Formula: score = 0.5^(time_elapsed / half_life)
 *
 * This models human memory decay patterns observed in cognitive science.
 * Segments from recent sessions score higher than older ones.
 *
 * @param timestampMs - Segment creation timestamp in milliseconds
 * @param currentTimeMs - Current time in milliseconds
 * @param halfLifeDays - Days for score to drop to 50% (default: 14)
 * @returns Normalized score 0-1 (where 1.0 = just created)
 *
 * @example
 * ```typescript
 * const now = Date.now();
 * const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);
 *
 * // With 14-day half-life:
 * calculateRecencyScore(twoDaysAgo, now, 14); // Returns ~0.906 (90.6%)
 *
 * // 60 days ago:
 * const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
 * calculateRecencyScore(sixtyDaysAgo, now, 14); // Returns ~0.061 (6.1%)
 * ```
 *
 * Decay curve with 14-day half-life:
 * | Age (days) | Score  |
 * |------------|--------|
 * | 0          | 1.000  |
 * | 2          | 0.906  |
 * | 7          | 0.707  |
 * | 14         | 0.500  | <- half-life
 * | 28         | 0.250  |
 * | 60         | 0.061  |
 * | 90         | 0.022  |
 */
export function calculateRecencyScore(
  timestampMs: number,
  currentTimeMs: number,
  halfLifeDays: number = 14
): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const elapsedDays = (currentTimeMs - timestampMs) / MS_PER_DAY;

  // Handle future timestamps (clock skew)
  if (elapsedDays < 0) {
    console.error(
      `[Memory:RecencyScorer] Future timestamp detected: ${elapsedDays.toFixed(2)} days. Using score 1.0`
    );
    return 1.0;
  }

  // Exponential decay: 0.5^(elapsed / half_life)
  const score = Math.pow(0.5, elapsedDays / halfLifeDays);

  return score;
}
