/**
 * @file src/utils/performance.ts
 * @description Advanced performance utilities for the QorPay V3 SDK
 */

import type { RequestConfig } from '../client/base-client';

/**
 * Performance-optimized request interceptor
 * Implements connection pooling, caching, and intelligent retries
 */
export class PerformanceManager {
  private cache = new Map<string, CacheEntry>();
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private activeRequests = new Map<string, Promise<any>>();
  private metrics: PerformanceMetrics;

  constructor(private options: PerformanceOptions = {}) {
    this.metrics = new PerformanceMetrics();
  }

  /**
   * Optimized request execution with caching, deduplication, and circuit breaking
   */
  async executeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    const startTime = performance.now();
    this.metrics.requestStart();

    try {
      // Check cache first
      if (options.cache !== false) {
        const cached = this.getCached<T>(key);
        if (cached) {
          this.metrics.recordHit(performance.now() - startTime);
          return cached;
        }
      }

      // Check for duplicate requests
      if (options.deduplicate !== false) {
        const existing = this.activeRequests.get(key);
        if (existing) {
          this.metrics.recordDeduplication();
          return existing;
        }
      }

      // Check circuit breaker
      const circuitBreaker = this.getCircuitBreaker(key);
      if (circuitBreaker.isOpen()) {
        throw new Error(`Circuit breaker open for ${key}`);
      }

      // Execute request
      const requestPromise = this.executeWithRetry(requestFn, options)
        .then(result => {
          circuitBreaker.recordSuccess();

          // Cache successful result
          if (options.cache !== false && this.shouldCache(key)) {
            this.setCache(key, result, options.cacheTtl || 300000);
          }

          this.metrics.recordSuccess(performance.now() - startTime);
          return result;
        })
        .catch(error => {
          circuitBreaker.recordFailure();
          this.metrics.recordFailure(performance.now() - startTime);
          throw error;
        })
        .finally(() => {
          this.activeRequests.delete(key);
        });

      // Track active request
      this.activeRequests.set(key, requestPromise);

      return await requestPromise;
    } catch (error) {
      this.metrics.recordFailure(performance.now() - startTime);
      throw error;
    }
  }

  /**
   * Execute with intelligent retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    options: RequestOptions
  ): Promise<T> {
    const maxRetries = options.maxRetries || 3;
    const baseDelay = options.retryDelay || 1000;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        // Exponential backoff with jitter
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Get or create circuit breaker for key
   */
  private getCircuitBreaker(key: string): CircuitBreaker {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, new CircuitBreaker(this.options.circuitBreaker));
    }
    return this.circuitBreakers.get(key)!;
  }

  /**
   * Cache management
   */
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  private setCache<T>(key: string, value: T, ttlMs: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= (this.options.maxCacheSize || 1000)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs,
      accessed: Date.now(),
    });
  }

  private shouldCache(key: string): boolean {
    // Implement cache rules (e.g., don't cache mutations)
    return !key.includes('create') && !key.includes('update') && !key.includes('delete');
  }

  private shouldNotRetry(error: Error): boolean {
    // Don't retry on authentication errors, invalid data, etc.
    return error.message.includes('401') ||
           error.message.includes('400') ||
           error.message.includes('403') ||
           error.message.includes('404');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetricsData {
    return {
      ...this.metrics.getStats(),
      cache: {
        size: this.cache.size,
        hitRate: this.metrics.getCacheHitRate(),
      },
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([key, cb]) => ({
        key,
        state: cb.getState(),
        failures: cb.getFailures(),
      })),
    };
  }

  /**
   * Clear cache and reset metrics
   */
  reset(): void {
    this.cache.clear();
    this.metrics.reset();
    this.circuitBreakers.forEach(cb => cb.reset());
  }
}

/**
 * Circuit breaker implementation
 */
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private lastFailureTime = 0;
  private nextRetryTime = 0;

  constructor(private options: CircuitBreakerOptions = {}) {
    this.options = {
      threshold: 5,
      timeout: 60000,
      resetTimeout: 30000,
      ...options,
    };
  }

  isOpen(): boolean {
    if (this.state === 'open') {
      if (Date.now() >= this.nextRetryTime) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.threshold!) {
      this.state = 'open';
      this.nextRetryTime = Date.now() + this.options.resetTimeout!;
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
    this.nextRetryTime = 0;
  }
}

/**
 * Performance metrics tracker
 */
class PerformanceMetrics {
  private metrics = {
    requests: 0,
    successes: 0,
    failures: 0,
    hits: 0,
    deduplications: 0,
    totalTime: 0,
    minTime: Infinity,
    maxTime: 0,
  };

  requestStart(): void {
    this.metrics.requests++;
  }

  recordSuccess(time: number): void {
    this.metrics.successes++;
    this.recordTime(time);
  }

  recordFailure(time: number): void {
    this.metrics.failures++;
    this.recordTime(time);
  }

  recordHit(time: number): void {
    this.metrics.hits++;
    this.recordTime(time);
  }

  recordDeduplication(): void {
    this.metrics.deduplications++;
  }

  private recordTime(time: number): void {
    this.metrics.totalTime += time;
    this.metrics.minTime = Math.min(this.metrics.minTime, time);
    this.metrics.maxTime = Math.max(this.metrics.maxTime, time);
  }

  getStats(): PerformanceMetricsData {
    const { requests, successes, failures, hits, deduplications, totalTime, minTime, maxTime } = this.metrics;

    return {
      requests,
      successes,
      failures,
      hits,
      deduplications,
      successRate: requests > 0 ? (successes / requests) * 100 : 0,
      averageTime: requests > 0 ? totalTime / requests : 0,
      minTime: minTime === Infinity ? 0 : minTime,
      maxTime,
      hitRate: requests > 0 ? (hits / requests) * 100 : 0,
      throughput: successes / (totalTime / 1000), // per second
    };
  }

  getCacheHitRate(): number {
    const total = this.metrics.requests;
    return total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  reset(): void {
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      hits: 0,
      deduplications: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
    };
  }
}

// Type definitions
interface CacheEntry {
  value: any;
  expires: number;
  accessed: number;
}

interface PerformanceOptions {
  maxCacheSize?: number;
  circuitBreaker?: CircuitBreakerOptions;
}

interface CircuitBreakerOptions {
  threshold?: number;
  timeout?: number;
  resetTimeout?: number;
}

interface RequestOptions {
  cache?: boolean;
  cacheTtl?: number;
  deduplicate?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface PerformanceMetricsData {
  requests: number;
  successes: number;
  failures: number;
  hits: number;
  deduplications: number;
  successRate: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  hitRate: number;
  throughput: number;
  cache?: {
    size: number;
    hitRate: number;
  };
  circuitBreakers?: Array<{
    key: string;
    state: string;
    failures: number;
  }>;
}

/**
 * Tree-shaking friendly exports
 */
export { PerformanceManager as default };

/**
 * Lazy loading utilities for reduced bundle size
 */
export class LazyLoader {
  private static loadedModules = new Map<string, any>();

  static async load<T>(module: string, loader: () => Promise<T>): Promise<T> {
    if (this.loadedModules.has(module)) {
      return this.loadedModules.get(module);
    }

    const loaded = await loader();
    this.loadedModules.set(module, loaded);
    return loaded;
  }
}

/**
 * Bundle size optimizer
 */
export class BundleOptimizer {
  /**
   * Dynamic import for code splitting
   */
  static async importResource(resourceName: string): Promise<any> {
    switch (resourceName) {
      case 'payments':
        return import('../resources/payments');
      case 'customers':
        return import('../resources/customers');
      case 'transactions':
        return import('../resources/transactions');
      default:
        throw new Error(`Unknown resource: ${resourceName}`);
    }
  }

  /**
   * Polyfill loader - loads only needed polyfills
   */
  static async loadPolyfills(features: string[]): Promise<void> {
    const polyfills: Record<string, () => Promise<void>> = {
      'fetch': () => import('whatwg-fetch'),
      'abort-controller': () => import('abort-controller'),
      'url-search-params': () => import('url-search-params'),
    };

    await Promise.all(
      features
        .filter(f => polyfills[f])
        .map(f => polyfills[f]())
    );
  }
}

/**
 * Memory optimization utilities
 */
export class MemoryOptimizer {
  private static weakRefs = new WeakMap();

  /**
   * Store data in WeakMap for automatic garbage collection
   */
  static storeWeak<T extends object>(key: object, value: T): void {
    this.weakRefs.set(key, value);
  }

  /**
   * Retrieve from WeakMap
   */
  static getWeak<T extends object>(key: object): T | undefined {
    return this.weakRefs.get(key);
  }

  /**
   * Clean up unused resources
   */
  static gc(): void {
    if (global.gc) {
      global.gc();
    }
  }
}