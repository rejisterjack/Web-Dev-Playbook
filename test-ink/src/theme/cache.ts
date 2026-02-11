/**
 * Color Cache Module
 * 
 * Provides the ColorCache class for caching color operations.
 * Caches color conversions, manipulations, and contrast calculations
 * to improve performance.
 */

import type { Color, ColorCacheEntry } from './types.js';

/**
 * Cache configuration options
 */
export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  enabled: boolean;
}

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 1000,
  ttl: 300000, // 5 minutes
  enabled: true,
};

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * Color Cache class for caching color operations
 */
export class ColorCache {
  private cache: Map<string, ColorCacheEntry>;
  private config: CacheConfig;
  private stats: { hits: number; misses: number };

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Generate a cache key from input
   */
  private generateKey(operation: string, input: string | Color): string {
    if (typeof input === 'string') {
      return `${operation}:${input}`;
    }
    return `${operation}:${JSON.stringify(input)}`;
  }

  /**
   * Check if a cache entry is expired
   */
  private isExpired(entry: ColorCacheEntry): boolean {
    return Date.now() - entry.timestamp > this.config.ttl;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    if (this.cache.size <= this.config.maxSize) {
      return;
    }

    // Remove expired entries first
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // If still over limit, remove oldest entries
    if (this.cache.size > this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.length - this.config.maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Get a cached value
   * @param operation - Operation name
   * @param input - Input value
   * @returns Cached value or undefined
   */
  get(operation: string, input: string | Color): Color | number | string | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    const key = this.generateKey(operation, input);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.output;
  }

  /**
   * Set a cached value
   * @param operation - Operation name
   * @param input - Input value
   * @param output - Output value to cache
   */
  set(operation: string, input: string | Color, output: Color | number | string): void {
    if (!this.config.enabled) {
      return;
    }

    this.cleanup();

    const key = this.generateKey(operation, input);
    const entry: ColorCacheEntry = {
      input,
      output,
      timestamp: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Get or compute a cached value
   * @param operation - Operation name
   * @param input - Input value
   * @param compute - Function to compute the value if not cached
   * @returns Cached or computed value
   */
  getOrCompute<T extends Color | number | string>(
    operation: string,
    input: string | Color,
    compute: () => T,
  ): T {
    const cached = this.get(operation, input);
    if (cached !== undefined) {
      return cached as T;
    }

    const result = compute();
    this.set(operation, input, result);
    return result;
  }

  /**
   * Invalidate a specific cache entry
   * @param operation - Operation name
   * @param input - Input value
   */
  invalidate(operation: string, input: string | Color): void {
    const key = this.generateKey(operation, input);
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries for an operation
   * @param operation - Operation name
   */
  invalidateOperation(operation: string): void {
    const prefix = `${operation}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Update cache configuration
   * @param config - New configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    this.cleanup();
  }

  /**
   * Get current cache configuration
   * @returns Current configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Enable the cache
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disable the cache
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Check if cache is enabled
   * @returns True if enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get cache size
   * @returns Number of cached entries
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if cache is empty
   * @returns True if empty
   */
  isEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache entries
   * @returns Array of cache entries
   */
  entries(): Array<[string, ColorCacheEntry]> {
    return Array.from(this.cache.entries());
  }

  /**
   * Prune expired entries
   * @returns Number of entries pruned
   */
  prune(): number {
    let pruned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Get memory usage estimate
   * @returns Estimated memory usage in bytes
   */
  getMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(entry).length * 2;
    }
    return size;
  }
}

/**
 * Cache decorator for memoizing color operations
 */
export function cached<T extends (...args: any[]) => any>(
  operation: string,
  cache: ColorCache,
): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]): T {
      const input = args.length === 1 ? args[0] : JSON.stringify(args);
      const cached = cache.get(operation, input);

      if (cached !== undefined) {
        return cached as T;
      }

      const result = originalMethod.apply(this, args);
      cache.set(operation, input, result);
      return result;
    };

    return descriptor;
  };
}

// Export singleton instance
export const colorCache = new ColorCache();
