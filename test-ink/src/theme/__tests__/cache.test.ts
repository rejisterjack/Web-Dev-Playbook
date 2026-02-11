/**
 * Color Cache Module Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ColorCache, colorCache, CacheConfig } from '../cache.js';
import { ColorSpace } from '../types.js';

describe('ColorCache', () => {
  let cache: ColorCache;

  beforeEach(() => {
    cache = new ColorCache();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const config = cache.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.maxSize).toBe(1000);
      expect(config.ttl).toBe(300000);
    });

    it('should initialize with custom config', () => {
      const customCache = new ColorCache({ maxSize: 100, ttl: 60000 });
      const config = customCache.getConfig();
      expect(config.maxSize).toBe(100);
      expect(config.ttl).toBe(60000);
    });
  });

  describe('get and set', () => {
    it('should store and retrieve values', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      const result = cache.get('test', color);
      expect(result).toBe('#ff0000');
    });

    it('should return undefined for non-existent key', () => {
      const result = cache.get('nonexistent', 'test');
      expect(result).toBeUndefined();
    });

    it('should not store when disabled', () => {
      cache.disable();
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      const result = cache.get('test', color);
      expect(result).toBeUndefined();
    });
  });

  describe('getOrCompute', () => {
    it('should return cached value if exists', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      const result = cache.getOrCompute('test', color, () => '#00ff00');
      expect(result).toBe('#ff0000');
    });

    it('should compute and cache if not exists', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      const result = cache.getOrCompute('test', color, () => '#ff0000');
      expect(result).toBe('#ff0000');
      const cached = cache.get('test', color);
      expect(cached).toBe('#ff0000');
    });
  });

  describe('invalidate', () => {
    it('should invalidate specific entry', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      cache.invalidate('test', color);
      const result = cache.get('test', color);
      expect(result).toBeUndefined();
    });

    it('should invalidate all entries for operation', () => {
      const color1 = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      const color2 = { type: ColorSpace.RGB, red: 0, green: 255, blue: 0 };
      cache.set('test', color1, '#ff0000');
      cache.set('test', color2, '#00ff00');
      cache.invalidateOperation('test');
      expect(cache.get('test', color1)).toBeUndefined();
      expect(cache.get('test', color2)).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should reset statistics', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      cache.get('test', color);
      cache.clear();
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      cache.get('test', color);
      cache.get('test', 'other');

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.size).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe('resetStats', () => {
    it('should reset statistics', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      cache.get('test', color);
      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('enable and disable', () => {
    it('should enable cache', () => {
      cache.disable();
      cache.enable();
      expect(cache.isEnabled()).toBe(true);
    });

    it('should disable cache', () => {
      cache.disable();
      expect(cache.isEnabled()).toBe(false);
    });
  });

  describe('size', () => {
    it('should return cache size', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test1', color, '#ff0000');
      cache.set('test2', color, '#00ff00');
      expect(cache.size()).toBe(2);
    });
  });

  describe('isEmpty', () => {
    it('should return true when empty', () => {
      expect(cache.isEmpty()).toBe(true);
    });

    it('should return false when not empty', () => {
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      cache.set('test', color, '#ff0000');
      expect(cache.isEmpty()).toBe(false);
    });
  });

  describe('prune', () => {
    it('should prune expired entries', () => {
      const shortCache = new ColorCache({ ttl: 100 });
      const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
      shortCache.set('test', color, '#ff0000');

      // Wait for expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          const pruned = shortCache.prune();
          expect(pruned).toBeGreaterThan(0);
          resolve(null);
        }, 150);
      });
    });
  });
});

describe('colorCache singleton', () => {
  it('should export singleton instance', () => {
    expect(colorCache).toBeInstanceOf(ColorCache);
  });
});
