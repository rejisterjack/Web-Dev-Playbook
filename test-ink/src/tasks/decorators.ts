/**
 * Task Decorators Module
 * 
 * Provides task decorators for common patterns.
 * Includes retry, timeout, throttle, debounce, and memoize decorators.
 */

import type { RetryOptions } from './types.js';
import { retry, timeout, throttle, debounce, memoize } from './utils.js';

/**
 * Retry decorator - automatically retries a function on failure
 * @param options - Retry options
 * @returns Method decorator
 */
export function Retry(options?: Partial<RetryOptions>): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      return retry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

/**
 * Timeout decorator - adds timeout to a function
 * @param ms - Timeout in milliseconds
 * @returns Method decorator
 */
export function Timeout(ms: number): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      return timeout(originalMethod.apply(this, args), ms);
    };

    return descriptor;
  };
}

/**
 * Throttle decorator - throttles a function
 * @param ms - Delay in milliseconds
 * @returns Method decorator
 */
export function Throttle(ms: number): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: unknown, ...args: unknown[]): void {
      const throttled = throttle(originalMethod.bind(this), ms);
      throttled(...args);
    };

    return descriptor;
  };
}

/**
 * Debounce decorator - debounces a function
 * @param ms - Delay in milliseconds
 * @returns Method decorator
 */
export function Debounce(ms: number): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: unknown, ...args: unknown[]): void {
      const debounced = debounce(originalMethod.bind(this), ms);
      debounced(...args);
    };

    return descriptor;
  };
}

/**
 * Memoize decorator - caches function results
 * @returns Method decorator
 */
export function Memoize(): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
      const memoized = memoize(originalMethod.bind(this));
      return memoized(...args);
    };

    return descriptor;
  };
}

/**
 * Async decorator - ensures a function returns a promise
 * @returns Method decorator
 */
export function Async(): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      const result = originalMethod.apply(this, args);
      return Promise.resolve(result);
    };

    return descriptor;
  };
}

/**
 * Catch decorator - catches errors and returns a default value
 * @param defaultValue - Default value to return on error
 * @returns Method decorator
 */
export function Catch(defaultValue: unknown): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        console.error(`Error in ${String(propertyKey)}:`, error);
        return defaultValue;
      }
    };

    return descriptor;
  };
}

/**
 * Log decorator - logs function calls
 * @param options - Logging options
 * @returns Method decorator
 */
export function Log(options?: {
  logArgs?: boolean;
  logResult?: boolean;
  logError?: boolean;
}): MethodDecorator {
  const { logArgs = true, logResult = true, logError = true } = options ?? {};

  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      const methodName = String(propertyKey);

      if (logArgs) {
        console.log(`[CALL] ${methodName}`, args);
      }

      try {
        const result = await originalMethod.apply(this, args);

        if (logResult) {
          console.log(`[RESULT] ${methodName}`, result);
        }

        return result;
      } catch (error) {
        if (logError) {
          console.error(`[ERROR] ${methodName}`, error);
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Measure decorator - measures function execution time
 * @returns Method decorator
 */
export function Measure(): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      const methodName = String(propertyKey);
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const endTime = Date.now();
        console.log(`[MEASURE] ${methodName} took ${endTime - startTime}ms`);
        return result;
      } catch (error) {
        const endTime = Date.now();
        console.error(`[MEASURE] ${methodName} failed after ${endTime - startTime}ms`);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Once decorator - ensures a function is only called once
 * @returns Method decorator
 */
export function Once(): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    let called = false;
    let cachedResult: unknown;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      if (called) {
        return cachedResult;
      }

      called = true;
      cachedResult = await originalMethod.apply(this, args);
      return cachedResult;
    };

    return descriptor;
  };
}

/**
 * RateLimit decorator - limits function call rate
 * @param maxCalls - Maximum number of calls
 * @param period - Time period in milliseconds
 * @returns Method decorator
 */
export function RateLimit(maxCalls: number, period: number): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const calls: number[] = [];

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      const now = Date.now();

      // Remove old calls outside the period
      const recentCalls = calls.filter((time) => now - time < period);
      calls.length = 0;
      calls.push(...recentCalls);

      if (calls.length >= maxCalls) {
        const oldestCall = calls[0];
        const waitTime = period - (now - oldestCall);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        calls.shift();
      }

      calls.push(now);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * CircuitBreaker decorator - implements circuit breaker pattern
 * @param options - Circuit breaker options
 * @returns Method decorator
 */
export function CircuitBreaker(options?: {
  threshold?: number;
  timeout?: number;
  resetTimeout?: number;
}): MethodDecorator {
  const { threshold = 5, timeout: timeoutMs = 30000, resetTimeout = 60000 } = options ?? {};

  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    let failures = 0;
    let lastFailureTime = 0;
    let state: 'closed' | 'open' | 'half-open' = 'closed';

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      const now = Date.now();

      // Check if circuit should reset
      if (state === 'open' && now - lastFailureTime > resetTimeout) {
        state = 'half-open';
      }

      // Reject if circuit is open
      if (state === 'open') {
        throw new Error('Circuit breaker is open');
      }

      try {
        const result = await timeout(originalMethod.apply(this, args), timeoutMs);

        // Reset on success
        if (state === 'half-open') {
          state = 'closed';
          failures = 0;
        }

        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;

        // Open circuit if threshold exceeded
        if (failures >= threshold) {
          state = 'open';
        }

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Cache decorator - caches function results with TTL
 * @param ttl - Time to live in milliseconds
 * @returns Method decorator
 */
export function Cache(ttl: number): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const cache = new Map<string, { value: unknown; expiry: number }>();

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      const key = JSON.stringify(args);
      const now = Date.now();
      const cached = cache.get(key);

      // Return cached value if valid
      if (cached && cached.expiry > now) {
        return cached.value;
      }

      // Execute and cache result
      const result = await originalMethod.apply(this, args);
      cache.set(key, { value: result, expiry: now + ttl });

      return result;
    };

    return descriptor;
  };
}

/**
 * Validate decorator - validates function arguments
 * @param validators - Array of validator functions
 * @returns Method decorator
 */
export function Validate(
  validators: Array<(arg: unknown) => boolean | string>,
): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      for (let i = 0; i < validators.length; i++) {
        const validator = validators[i];
        const result = validator(args[i]);

        if (result !== true) {
          const errorMsg = typeof result === 'string' ? result : `Invalid argument at index ${i}`;
          throw new Error(errorMsg);
        }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Compose decorator - composes multiple decorators
 * @param decorators - Array of decorators to apply
 * @returns Composed decorator
 */
export function Compose(...decorators: MethodDecorator[]): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    let result = descriptor;
    for (const decorator of decorators) {
      const newResult = decorator(target as object, propertyKey, result);
      if (newResult !== undefined) {
        result = newResult as PropertyDescriptor;
      }
    }
    return result;
  };
}
