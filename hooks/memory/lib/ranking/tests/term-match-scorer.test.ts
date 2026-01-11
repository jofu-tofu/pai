import { describe, test, expect } from 'bun:test';
import { calculateTermMatchScore } from '../term-match-scorer';

describe('Term Match Scorer', () => {
  describe('basic scoring', () => {
    test('should return 1.0 when 5 or more terms match (saturated)', () => {
      const score = calculateTermMatchScore(5, 5);
      expect(score).toBe(1.0);
    });

    test('should return 0.6 when 3 terms match', () => {
      const score = calculateTermMatchScore(3, 3);
      expect(score).toBe(0.6);
    });

    test('should return 0.4 when 2 terms match', () => {
      const score = calculateTermMatchScore(2, 2);
      expect(score).toBe(0.4);
    });

    test('should return 0.2 when 1 term matches', () => {
      const score = calculateTermMatchScore(1, 1);
      expect(score).toBe(0.2);
    });

    test('should return 0.0 when no terms match', () => {
      const score = calculateTermMatchScore(0, 0);
      expect(score).toBe(0.0);
    });
  });

  describe('edge cases', () => {
    test('should return 0 when totalTerms is 0', () => {
      const score = calculateTermMatchScore(0, 0);
      expect(score).toBe(0);
    });

    test('should cap at 1.0 when matchCount exceeds saturation (5 terms)', () => {
      const score = calculateTermMatchScore(10, 10);
      expect(score).toBe(1.0);
    });

    test('should handle negative matchCount gracefully', () => {
      const score = calculateTermMatchScore(-1, 1);
      expect(score).toBe(0);
    });

    test('should handle single term query', () => {
      const score = calculateTermMatchScore(1, 1);
      expect(score).toBe(0.2); // 1/5 = 0.2
    });
  });

  describe('saturation behavior', () => {
    test('should saturate at 5 terms', () => {
      const score5 = calculateTermMatchScore(5, 5);
      const score10 = calculateTermMatchScore(10, 10);
      expect(score5).toBe(1.0);
      expect(score10).toBe(1.0);
    });

    test('should differentiate between low and high match counts', () => {
      const score1 = calculateTermMatchScore(1, 1);  // 0.2
      const score3 = calculateTermMatchScore(3, 3);  // 0.6
      expect(score3).toBeGreaterThan(score1);
      expect(score3 / score1).toBeCloseTo(3, 1);
    });
  });
});
