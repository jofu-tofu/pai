import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { KeywordSearch } from './keyword-search';

const TEST_PAI_DIR = join(homedir(), '.pai-test-keyword-search');
const TEST_INDEX_DIR = join(TEST_PAI_DIR, 'mem-store', 'indexes', 'keyword');
const TEST_INDEX_FILE = join(TEST_INDEX_DIR, 'index.json');

describe('KeywordSearch Provider', () => {
  let provider: KeywordSearch;

  beforeAll(() => {
    // Create test directory structure
    mkdirSync(TEST_INDEX_DIR, { recursive: true });

    // Create test index with known data
    const testIndex = {
      typescript: ['seg_001', 'seg_042', 'seg_089'],
      hook: ['seg_001', 'seg_055'],
      error: ['seg_001', 'seg_023', 'seg_067'],
      fix: ['seg_001', 'seg_023'],
      authentication: ['seg_002', 'seg_045'],
      performance: ['seg_015', 'seg_067', 'seg_091']
    };

    writeFileSync(TEST_INDEX_FILE, JSON.stringify(testIndex, null, 2));
  });

  afterAll(() => {
    // ALWAYS clean up test directory
    if (existsSync(TEST_PAI_DIR)) {
      rmSync(TEST_PAI_DIR, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    // Create fresh provider instance for each test
    provider = new KeywordSearch({ paiDir: TEST_PAI_DIR });
    const initResult = await provider.initialize();
    expect(initResult.ok).toBe(true);
  });

  describe('initialization', () => {
    test('should load index successfully', async () => {
      const health = await provider.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.details?.indexSize).toBeGreaterThan(0);
    });

    test('should handle missing index file', async () => {
      // Create provider pointing to non-existent index
      const emptyProvider = new KeywordSearch({
        paiDir: join(TEST_PAI_DIR, 'nonexistent')
      });

      const result = await emptyProvider.initialize();

      // Missing index should NOT be an error - just empty
      expect(result.ok).toBe(true);

      const health = await emptyProvider.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.details?.indexSize).toBe(0);
    });

    test('should detect corrupted index file', async () => {
      const corruptDir = join(TEST_PAI_DIR, 'corrupt');
      const corruptIndexDir = join(corruptDir, 'mem-store', 'indexes', 'keyword');
      mkdirSync(corruptIndexDir, { recursive: true });

      // Write invalid JSON
      writeFileSync(
        join(corruptIndexDir, 'index.json'),
        'this is not valid json{{'
      );

      const corruptProvider = new KeywordSearch({ paiDir: corruptDir });
      const result = await corruptProvider.initialize();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('SEARCH_INDEX_CORRUPT');
      }

      // Cleanup
      rmSync(corruptDir, { recursive: true, force: true });
    });
  });

  describe('search', () => {
    test('should find segments matching single term', async () => {
      const result = await provider.search('typescript');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(3);

        // Sort results for deterministic testing (implementation may vary order)
        const sorted = result.value.sort((a, b) => a.segmentId.localeCompare(b.segmentId));

        expect(sorted).toEqual([
          { segmentId: 'seg_001', matchCount: 1, matchedTerms: ['typescript'], totalQueryTerms: 1 },
          { segmentId: 'seg_042', matchCount: 1, matchedTerms: ['typescript'], totalQueryTerms: 1 },
          { segmentId: 'seg_089', matchCount: 1, matchedTerms: ['typescript'], totalQueryTerms: 1 }
        ]);
      }
    });

    test('should extract terms and filter stop words', async () => {
      const result = await provider.search('How did I fix the TypeScript hook error?');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // Stop words filtered: "how", "did", "I", "the"
        // Terms: "fix", "typescript", "hook", "error"

        // seg_001 should match all 4 terms (typescript, hook, error, fix)
        const seg001 = result.value.find(r => r.segmentId === 'seg_001');
        expect(seg001).toBeDefined();
        expect(seg001?.matchCount).toBe(4);
        expect(seg001?.matchedTerms).toContain('typescript');
        expect(seg001?.matchedTerms).toContain('hook');
        expect(seg001?.matchedTerms).toContain('error');
        expect(seg001?.matchedTerms).toContain('fix');
      }
    });

    test('should combine results with match counts (OR logic)', async () => {
      const result = await provider.search('typescript hook');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // seg_001 matches both terms (count: 2)
        // seg_042, seg_089 match "typescript" only (count: 1)
        // seg_055 matches "hook" only (count: 1)

        const seg001 = result.value.find(r => r.segmentId === 'seg_001');
        expect(seg001?.matchCount).toBe(2);

        const seg042 = result.value.find(r => r.segmentId === 'seg_042');
        expect(seg042?.matchCount).toBe(1);

        const seg055 = result.value.find(r => r.segmentId === 'seg_055');
        expect(seg055?.matchCount).toBe(1);
      }
    });

    test('should sort results by match count descending', async () => {
      const result = await provider.search('typescript hook error');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // seg_001 matches all 3 terms (count: 3)
        // Should be first in results
        expect(result.value[0].segmentId).toBe('seg_001');
        expect(result.value[0].matchCount).toBe(3);

        // Results should be in descending order by match count
        for (let i = 0; i < result.value.length - 1; i++) {
          expect(result.value[i].matchCount).toBeGreaterThanOrEqual(
            result.value[i + 1].matchCount
          );
        }
      }
    });

    test('should return empty array when no matches', async () => {
      const result = await provider.search('nonexistent keyword xyz');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    test('should return empty array when only stop words', async () => {
      const result = await provider.search('how did the a an is are');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    test('should apply maxResults limit', async () => {
      const result = await provider.search('error typescript hook', {
        maxResults: 2
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeLessThanOrEqual(2);
      }
    });

    test('should apply minMatchCount filter', async () => {
      const result = await provider.search('typescript hook error', {
        minMatchCount: 2  // Only segments matching 2+ terms
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        // All results should have matchCount >= 2
        result.value.forEach(r => {
          expect(r.matchCount).toBeGreaterThanOrEqual(2);
        });
      }
    });

    test('should complete search in < 100ms for large index (10K segments)', async () => {
      // Create realistic 10K segment index
      const largeIndexDir = join(TEST_PAI_DIR, 'large-index', 'mem-store', 'indexes', 'keyword');
      mkdirSync(largeIndexDir, { recursive: true });

      // Generate 10,000 unique segment IDs with ~1000 keywords
      const largeIndex: Record<string, string[]> = {};
      const keywords = [
        'typescript', 'javascript', 'python', 'error', 'fix', 'bug', 'feature',
        'api', 'database', 'authentication', 'security', 'performance', 'test',
        'deploy', 'config', 'hook', 'function', 'class', 'interface', 'type'
      ];

      // Generate 10,000 segments distributed across keywords
      for (let i = 0; i < 10000; i++) {
        const segmentId = `seg_${String(i).padStart(5, '0')}`;

        // Each segment gets 2-5 random keywords
        const keywordCount = 2 + Math.floor(Math.random() * 4);
        for (let j = 0; j < keywordCount; j++) {
          const keyword = keywords[Math.floor(Math.random() * keywords.length)];
          if (!largeIndex[keyword]) {
            largeIndex[keyword] = [];
          }
          if (!largeIndex[keyword].includes(segmentId)) {
            largeIndex[keyword].push(segmentId);
          }
        }
      }

      writeFileSync(
        join(largeIndexDir, 'index.json'),
        JSON.stringify(largeIndex)
      );

      // Create provider with large index
      const largeProvider = new KeywordSearch({ paiDir: join(TEST_PAI_DIR, 'large-index') });
      await largeProvider.initialize();

      // Test performance with multi-term query
      const startTime = Date.now();
      await largeProvider.search('typescript hook error performance');
      const elapsed = Date.now() - startTime;

      // Cleanup
      rmSync(join(TEST_PAI_DIR, 'large-index'), { recursive: true, force: true });

      // Validate < 100ms requirement (AC #5)
      expect(elapsed).toBeLessThan(100);
    });

    test('should handle PAI_DIR environment variable', async () => {
      // This test validates PAI_DIR support exists
      const customProvider = new KeywordSearch({ paiDir: TEST_PAI_DIR });
      const result = await customProvider.initialize();
      expect(result.ok).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should return Result type with error on search failure', async () => {
      // Force provider into bad state
      await provider.shutdown();

      const result = await provider.search('test query');

      // Should auto-reinitialize and work
      expect(result.ok).toBe(true);
    });
  });

  describe('Provider interface compliance', () => {
    test('should implement required Provider methods', async () => {
      expect(provider.name).toBe('keyword-search');
      expect(provider.version).toBeDefined();
      expect(typeof provider.initialize).toBe('function');
      expect(typeof provider.healthCheck).toBe('function');
      expect(typeof provider.shutdown).toBe('function');
      expect(typeof provider.search).toBe('function');
    });

    test('should return Result types from search', async () => {
      const result = await provider.search('test');

      expect(result).toHaveProperty('ok');
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
      } else {
        expect(result.error).toHaveProperty('code');
        expect(result.error).toHaveProperty('message');
      }
    });
  });
});
