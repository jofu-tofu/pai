import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync, rmSync, readFileSync } from 'fs';
import {
  logCaptureOperation,
  logRetrievalOperation,
  type CaptureOperationMetadata,
  type RetrievalOperationMetadata,
} from '../operations-logger';

const TEST_PAI_DIR = join(homedir(), '.pai-test-operations-logger');

describe('operations-logger', () => {
  beforeAll(() => {
    // Create test directory
    mkdirSync(TEST_PAI_DIR, { recursive: true });
  });

  afterAll(() => {
    // Clean up test directory
    if (existsSync(TEST_PAI_DIR)) {
      rmSync(TEST_PAI_DIR, { recursive: true, force: true });
    }
  });

  describe('logCaptureOperation', () => {
    test('should write capture metadata to JSONL file', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      process.env.PAI_DIR = TEST_PAI_DIR;

      const metadata: CaptureOperationMetadata = {
        sessionId: 'mem_123_abc',
        capturedAt: 1704912345000,
        segmentsCreated: 8,
        processingMs: 2100,
        providers: {
          segment: 'per-message',
          extract: ['frontmatter-gen', 'keyword-tagger'],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      const result = await logCaptureOperation(metadata);

      expect(result.ok).toBe(true);

      const logPath = join(TEST_PAI_DIR, 'mem-store', 'metrics', 'operations.jsonl');
      expect(existsSync(logPath)).toBe(true);

      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');
      expect(lines.length).toBe(1);

      const parsed = JSON.parse(lines[0]);
      expect(parsed.sessionId).toBe('mem_123_abc');
      expect(parsed.capturedAt).toBe(1704912345000);
      expect(parsed.segmentsCreated).toBe(8);
      expect(parsed.processingMs).toBe(2100);
      expect(parsed.providers.segment).toBe('per-message');
      expect(parsed.providers.extract).toEqual(['frontmatter-gen', 'keyword-tagger']);
      expect(parsed.providers.summarize).toBe('simple-extract');
      expect(parsed.providers.storage).toBe('file-backend');

      process.env.PAI_DIR = oldPaiDir;
    });

    test('should append to existing file without overwriting', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      const isolatedDir = join(TEST_PAI_DIR, 'append-test');
      process.env.PAI_DIR = isolatedDir;

      const metadata1: CaptureOperationMetadata = {
        sessionId: 'mem_1',
        capturedAt: 1000,
        segmentsCreated: 5,
        processingMs: 1000,
        providers: {
          segment: 'per-message',
          extract: ['keyword-tagger'],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      const metadata2: CaptureOperationMetadata = {
        sessionId: 'mem_2',
        capturedAt: 2000,
        segmentsCreated: 10,
        processingMs: 2000,
        providers: {
          segment: 'per-message',
          extract: ['frontmatter-gen'],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      await logCaptureOperation(metadata1);
      await logCaptureOperation(metadata2);

      const logPath = join(isolatedDir, 'mem-store', 'metrics', 'operations.jsonl');
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      expect(lines.length).toBe(2);

      const parsed1 = JSON.parse(lines[0]);
      const parsed2 = JSON.parse(lines[1]);

      expect(parsed1.sessionId).toBe('mem_1');
      expect(parsed2.sessionId).toBe('mem_2');

      process.env.PAI_DIR = oldPaiDir;
    });

    test('should create directory if it does not exist', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      const testDir = join(TEST_PAI_DIR, 'new-dir');
      process.env.PAI_DIR = testDir;

      const metadata: CaptureOperationMetadata = {
        sessionId: 'mem_test',
        capturedAt: 1000,
        segmentsCreated: 1,
        processingMs: 100,
        providers: {
          segment: 'per-message',
          extract: [],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      const result = await logCaptureOperation(metadata);

      expect(result.ok).toBe(true);

      const logPath = join(testDir, 'mem-store', 'metrics', 'operations.jsonl');
      expect(existsSync(logPath)).toBe(true);

      process.env.PAI_DIR = oldPaiDir;
    });
  });

  describe('logRetrievalOperation', () => {
    test('should write retrieval metadata to JSONL file', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      process.env.PAI_DIR = TEST_PAI_DIR;

      const metadata: RetrievalOperationMetadata = {
        timestamp: 1704912345000,
        queryLength: 45,
        termsExtracted: 4,
        candidatesFound: 23,
        resultsReturned: 5,
        tokensInjected: 920,
        latencyMs: 180,
        success: true,
        provider: 'keyword-search',
      };

      const result = await logRetrievalOperation(metadata);

      expect(result.ok).toBe(true);

      const logPath = join(TEST_PAI_DIR, 'mem-store', 'metrics', 'operations.jsonl');
      expect(existsSync(logPath)).toBe(true);

      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      // Find the last line (newest entry)
      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);

      expect(parsed.timestamp).toBe(1704912345000);
      expect(parsed.queryLength).toBe(45);
      expect(parsed.termsExtracted).toBe(4);
      expect(parsed.candidatesFound).toBe(23);
      expect(parsed.resultsReturned).toBe(5);
      expect(parsed.tokensInjected).toBe(920);
      expect(parsed.latencyMs).toBe(180);
      expect(parsed.success).toBe(true);
      expect(parsed.provider).toBe('keyword-search');

      process.env.PAI_DIR = oldPaiDir;
    });

    test('should log failure with reason when success is false', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      process.env.PAI_DIR = TEST_PAI_DIR;

      const metadata: RetrievalOperationMetadata = {
        timestamp: 1704912345000,
        queryLength: 45,
        termsExtracted: 4,
        candidatesFound: 0,
        resultsReturned: 0,
        tokensInjected: 0,
        latencyMs: 50,
        success: false,
        reason: 'no_matches',
        provider: 'keyword-search',
      };

      const result = await logRetrievalOperation(metadata);

      expect(result.ok).toBe(true);

      const logPath = join(TEST_PAI_DIR, 'mem-store', 'metrics', 'operations.jsonl');
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);

      expect(parsed.success).toBe(false);
      expect(parsed.reason).toBe('no_matches');
      expect(parsed.resultsReturned).toBe(0);

      process.env.PAI_DIR = oldPaiDir;
    });

    test('should handle filtered_all reason correctly', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      process.env.PAI_DIR = TEST_PAI_DIR;

      const metadata: RetrievalOperationMetadata = {
        timestamp: 1704912345000,
        queryLength: 45,
        termsExtracted: 4,
        candidatesFound: 23,
        resultsReturned: 0,
        tokensInjected: 0,
        latencyMs: 150,
        success: false,
        reason: 'filtered_all',
        provider: 'keyword-search',
      };

      const result = await logRetrievalOperation(metadata);

      expect(result.ok).toBe(true);

      const logPath = join(TEST_PAI_DIR, 'mem-store', 'metrics', 'operations.jsonl');
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);

      expect(parsed.success).toBe(false);
      expect(parsed.reason).toBe('filtered_all');
      expect(parsed.candidatesFound).toBe(23);
      expect(parsed.resultsReturned).toBe(0);

      process.env.PAI_DIR = oldPaiDir;
    });
  });

  describe('JSONL format', () => {
    test('should write valid JSONL with each line parseable independently', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      const isolatedDir = join(TEST_PAI_DIR, 'jsonl-test');
      process.env.PAI_DIR = isolatedDir;

      const capture1: CaptureOperationMetadata = {
        sessionId: 'mem_1',
        capturedAt: 1000,
        segmentsCreated: 5,
        processingMs: 1000,
        providers: {
          segment: 'per-message',
          extract: [],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      const retrieval1: RetrievalOperationMetadata = {
        timestamp: 2000,
        queryLength: 30,
        termsExtracted: 3,
        candidatesFound: 10,
        resultsReturned: 5,
        tokensInjected: 500,
        latencyMs: 100,
        success: true,
        provider: 'keyword-search',
      };

      await logCaptureOperation(capture1);
      await logRetrievalOperation(retrieval1);

      const logPath = join(isolatedDir, 'mem-store', 'metrics', 'operations.jsonl');
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      expect(lines.length).toBe(2);

      // Each line should be parseable independently
      lines.forEach((line, index) => {
        expect(() => JSON.parse(line)).not.toThrow();
      });

      process.env.PAI_DIR = oldPaiDir;
    });

    test('should not have trailing commas or invalid JSON', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      process.env.PAI_DIR = TEST_PAI_DIR;

      const metadata: CaptureOperationMetadata = {
        sessionId: 'mem_test',
        capturedAt: 1000,
        segmentsCreated: 1,
        processingMs: 100,
        providers: {
          segment: 'per-message',
          extract: [],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      await logCaptureOperation(metadata);

      const logPath = join(TEST_PAI_DIR, 'mem-store', 'metrics', 'operations.jsonl');
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      const lastLine = lines[lines.length - 1];

      // Should not end with comma
      expect(lastLine.endsWith(',')).toBe(false);

      // Should be valid JSON
      expect(() => JSON.parse(lastLine)).not.toThrow();

      process.env.PAI_DIR = oldPaiDir;
    });
  });

  describe('concurrent writes', () => {
    test('should handle multiple concurrent writes safely', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      const isolatedDir = join(TEST_PAI_DIR, 'concurrent-test');
      process.env.PAI_DIR = isolatedDir;

      const writes = Array.from({ length: 10 }, (_, i) => {
        const metadata: CaptureOperationMetadata = {
          sessionId: `mem_${i}`,
          capturedAt: 1000 + i,
          segmentsCreated: i,
          processingMs: i * 100,
          providers: {
            segment: 'per-message',
            extract: [],
            summarize: 'simple-extract',
            storage: 'file-backend',
          },
        };
        return logCaptureOperation(metadata);
      });

      const results = await Promise.all(writes);

      // All should succeed
      results.forEach(result => {
        expect(result.ok).toBe(true);
      });

      const logPath = join(isolatedDir, 'mem-store', 'metrics', 'operations.jsonl');
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');

      // Should have all 10 entries
      expect(lines.length).toBe(10);

      // Each should be valid JSON
      lines.forEach(line => {
        expect(() => JSON.parse(line)).not.toThrow();
      });

      process.env.PAI_DIR = oldPaiDir;
    });
  });

  describe('error handling', () => {
    test('should return error result on write failure', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      // Set to a file path (not directory) to trigger write failure
      const invalidPath = join(TEST_PAI_DIR, 'not-a-directory.txt');
      // Create a file where directory should be
      const fs = require('fs');
      fs.writeFileSync(invalidPath, 'this is a file');

      process.env.PAI_DIR = invalidPath;

      const metadata: CaptureOperationMetadata = {
        sessionId: 'mem_test',
        capturedAt: 1000,
        segmentsCreated: 1,
        processingMs: 100,
        providers: {
          segment: 'per-message',
          extract: [],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      const result = await logCaptureOperation(metadata);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('OPERATIONS_LOG_WRITE_FAILED');
        expect(result.error.message).toContain('Failed to write');
      }

      process.env.PAI_DIR = oldPaiDir;
    });

    test('should gracefully handle directory creation failure', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      // Set to a file path (not directory) to trigger directory creation failure
      const invalidPath = join(TEST_PAI_DIR, 'also-not-a-directory.txt');
      // Create a file where directory should be
      const fs = require('fs');
      fs.writeFileSync(invalidPath, 'blocking directory creation');

      process.env.PAI_DIR = invalidPath;

      const metadata: RetrievalOperationMetadata = {
        timestamp: 1000,
        queryLength: 10,
        termsExtracted: 1,
        candidatesFound: 5,
        resultsReturned: 2,
        tokensInjected: 100,
        latencyMs: 50,
        success: true,
        provider: 'keyword-search',
      };

      const result = await logRetrievalOperation(metadata);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('OPERATIONS_LOG_WRITE_FAILED');
      }

      process.env.PAI_DIR = oldPaiDir;
    });
  });

  describe('metadata completeness', () => {
    test('should include all required capture metadata fields', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      process.env.PAI_DIR = TEST_PAI_DIR;

      const metadata: CaptureOperationMetadata = {
        sessionId: 'mem_complete',
        capturedAt: 1704912345000,
        segmentsCreated: 8,
        processingMs: 2100,
        providers: {
          segment: 'per-message',
          extract: ['frontmatter-gen', 'keyword-tagger'],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      await logCaptureOperation(metadata);

      const logPath = join(TEST_PAI_DIR, 'mem-store', 'metrics', 'operations.jsonl');
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);

      // Verify all required fields exist
      expect(parsed).toHaveProperty('sessionId');
      expect(parsed).toHaveProperty('capturedAt');
      expect(parsed).toHaveProperty('segmentsCreated');
      expect(parsed).toHaveProperty('processingMs');
      expect(parsed).toHaveProperty('providers');
      expect(parsed.providers).toHaveProperty('segment');
      expect(parsed.providers).toHaveProperty('extract');
      expect(parsed.providers).toHaveProperty('summarize');
      expect(parsed.providers).toHaveProperty('storage');

      process.env.PAI_DIR = oldPaiDir;
    });

    test('should include all required retrieval metadata fields', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      process.env.PAI_DIR = TEST_PAI_DIR;

      const metadata: RetrievalOperationMetadata = {
        timestamp: 1704912345000,
        queryLength: 45,
        termsExtracted: 4,
        candidatesFound: 23,
        resultsReturned: 5,
        tokensInjected: 920,
        latencyMs: 180,
        success: true,
        provider: 'keyword-search',
      };

      await logRetrievalOperation(metadata);

      const logPath = join(TEST_PAI_DIR, 'mem-store', 'metrics', 'operations.jsonl');
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);

      // Verify all required fields exist
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('queryLength');
      expect(parsed).toHaveProperty('termsExtracted');
      expect(parsed).toHaveProperty('candidatesFound');
      expect(parsed).toHaveProperty('resultsReturned');
      expect(parsed).toHaveProperty('tokensInjected');
      expect(parsed).toHaveProperty('latencyMs');
      expect(parsed).toHaveProperty('success');
      expect(parsed).toHaveProperty('provider');

      process.env.PAI_DIR = oldPaiDir;
    });
  });

  describe('Windows compatibility', () => {
    test('should handle Windows path separators correctly', async () => {
      const oldPaiDir = process.env.PAI_DIR;
      const windowsStylePath = 'C:\\Users\\test\\.pai-test';
      process.env.PAI_DIR = windowsStylePath;

      const metadata: CaptureOperationMetadata = {
        sessionId: 'mem_windows',
        capturedAt: 1000,
        segmentsCreated: 1,
        processingMs: 100,
        providers: {
          segment: 'per-message',
          extract: [],
          summarize: 'simple-extract',
          storage: 'file-backend',
        },
      };

      // Should not throw - path handling should work
      const result = await logCaptureOperation(metadata);

      // Must return a Result (either ok or error, but defined)
      expect(result).toBeDefined();
      expect(result).toHaveProperty('ok');

      // Result should be boolean (true or false, not undefined)
      expect(typeof result.ok).toBe('boolean');

      process.env.PAI_DIR = oldPaiDir;
    });
  });
});
