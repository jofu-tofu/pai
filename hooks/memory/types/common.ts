/**
 * Core types for the PAI Memory System
 *
 * This module defines the fundamental types used throughout the memory system:
 * - Result type for error handling without exceptions
 * - Provider base interface for pluggable components
 * - Error and health status types
 */

/**
 * Result type for representing success or failure without throwing exceptions.
 *
 * All provider methods return Result types to enable explicit error handling
 * and type-safe value access.
 *
 * @template T - The type of the success value
 * @template E - The type of the error (defaults to Error)
 *
 * @example
 * ```typescript
 * const result: Result<string, ProviderError> = await provider.getData();
 *
 * if (!result.ok) {
 *   console.error(`[Memory:Component] ${result.error.message}`);
 *   return;
 * }
 *
 * // TypeScript knows result.value is string here
 * const data = result.value;
 * ```
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Error type returned by provider methods.
 *
 * All errors include a namespaced code, human-readable message,
 * and optional original error cause.
 *
 * @example
 * ```typescript
 * const error: ProviderError = {
 *   code: 'STORAGE_WRITE_FAILED',
 *   message: 'Failed to write segment to disk',
 *   cause: originalError
 * };
 * ```
 */
export interface ProviderError {
  /** Namespaced error code (e.g., 'STORAGE_WRITE_FAILED', 'SEARCH_INDEX_CORRUPT') */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Optional original error that caused this error */
  cause?: Error;
}

/**
 * Health status returned by provider health checks.
 *
 * Used for diagnostics and graceful degradation.
 *
 * @example
 * ```typescript
 * const health = await provider.healthCheck();
 *
 * if (!health.healthy) {
 *   console.warn(`[Memory:Provider] ${health.message}`);
 * }
 * ```
 */
export interface HealthStatus {
  /** Whether the provider is healthy and operational */
  healthy: boolean;

  /** Human-readable status message */
  message: string;

  /** Optional provider-specific diagnostic details */
  details?: Record<string, unknown>;
}

/**
 * Base interface for all providers in the memory system.
 *
 * All provider types (storage, search, extraction, etc.) extend this interface
 * to ensure consistent lifecycle management and health monitoring.
 *
 * @example
 * ```typescript
 * interface StorageProvider extends Provider {
 *   write(segment: MemorySegment): Promise<Result<void, ProviderError>>;
 *   read(id: string): Promise<Result<MemorySegment, ProviderError>>;
 * }
 * ```
 */
export interface Provider {
  /** Provider name (e.g., 'FileBackend', 'KeywordSearch') */
  readonly name: string;

  /** Semantic version (e.g., '1.0.0') */
  readonly version: string;

  /**
   * Initialize the provider and any required resources.
   *
   * Called once during system startup.
   *
   * @returns Result indicating success or initialization error
   */
  initialize(): Promise<Result<void, ProviderError>>;

  /**
   * Check provider health and operational status.
   *
   * Used for diagnostics and graceful degradation.
   *
   * @returns Current health status
   */
  healthCheck(): Promise<HealthStatus>;

  /**
   * Gracefully shutdown the provider and release resources.
   *
   * Called during system shutdown or provider replacement.
   */
  shutdown(): Promise<void>;
}
