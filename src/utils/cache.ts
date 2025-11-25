/**
 * @file src/utils/cache.ts
 * @description Intelligent caching layer for QorPay SDK responses
 */

export interface CacheEntry<T = any> {
  value: T;
  expires: number;
  accessed: number;
  hits: number;
}

export interface CacheOptions {
  maxSize?: number;
  defaultTtl?: number;
  strategy?: 'lru' | 'lfu' | 'ttl';
}

export class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private defaultTtl: number;
  private strategy: 'lru' | 'lfu' | 'ttl';

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTtl = options.defaultTtl || 300000; // 5 minutes
    this.strategy = options.strategy || 'lru';
  }

  set<T>(key: string, value: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl || this.defaultTtl),
      accessed: Date.now(),
      hits: 0
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    // Update access info
    entry.accessed = Date.now();
    entry.hits++;

    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry && Date.now() <= entry.expires || false;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Cleanup expired entries
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expires) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  private evict(): void {
    let keyToEvict: string | null = null;
    let minScore = Infinity;

    for (const [key, entry] of this.cache) {
      let score = 0;

      switch (this.strategy) {
        case 'lru':
          score = entry.accessed;
          break;
        case 'lfu':
          score = entry.hits;
          break;
        case 'ttl':
          score = entry.expires;
          break;
      }

      if (this.strategy === 'lfu' || this.strategy === 'ttl') {
        if (score < minScore) {
          minScore = score;
          keyToEvict = key;
        }
      } else {
        if (score < minScore) {
          minScore = score;
          keyToEvict = key;
        }
      }
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  getStats(): CacheStats {
    const now = Date.now();
    let totalHits = 0;
    let expired = 0;

    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      if (now > entry.expires) expired++;
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      expired,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private calculateHitRate(): number {
    // This would need tracking of total requests
    // Simplified implementation
    const stats = this.getStats();
    return stats.totalHits / Math.max(stats.size, 1);
  }

  private estimateMemoryUsage(): number {
    // Rough estimation in bytes
    let size = 0;
    for (const [key, entry] of this.cache) {
      size += key.length * 2; // String characters
      size += JSON.stringify(entry.value).length * 2;
      size += 48; // Object overhead
    }
    return size;
  }
}

export interface CacheStats {
  size: number;
  maxSize: number;
  totalHits: number;
  expired: number;
  hitRate: number;
  memoryUsage: number;
}

/**
 * Specialized cache for different data types
 */
export class PaymentCache extends ResponseCache {
  constructor() {
    super({
      maxSize: 500,
      defaultTtl: 300000, // 5 minutes for payments
      strategy: 'lru'
    });
  }

  // Cache key generation for payments
  static paymentKey(id: string): string {
    return `payment:${id}`;
  }

  static transactionKey(id: string): string {
    return `transaction:${id}`;
  }

  static customerKey(id: string): string {
    return `customer:${id}`;
  }

  static listKey(endpoint: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as any);

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }
}

export class TokenCache extends ResponseCache {
  constructor() {
    super({
      maxSize: 1000,
      defaultTtl: 3600000, // 1 hour for tokens
      strategy: 'lfu'
    });
  }
}

export class ValidationCache extends ResponseCache {
  constructor() {
    super({
      maxSize: 2000,
      defaultTtl: 86400000, // 24 hours for validation results
      strategy: 'ttl'
    });
  }
}

/**
 * Cache decorator for memoizing function results
 */
export function memoize(
  cache: ResponseCache,
  keyGenerator?: (...args: any[]) => string,
  ttl?: number
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      // Try to get from cache
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute and cache result
      const result = originalMethod.apply(this, args);
      cache.set(key, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Distributed cache interface for multi-instance scenarios
 */
export interface DistributedCache {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

/**
 * Redis cache implementation (example)
 */
export class RedisCache implements DistributedCache {
  constructor(private client: any) {}

  async get(key: string): Promise<any> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl / 1000, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.client.del(key);
    return result > 0;
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }
}

/**
 * Cache warming utility
 */
export class CacheWarmer {
  constructor(private cache: ResponseCache, private qorpay: any) {}

  async warmCommonData(): Promise<void> {
    // Warm frequently accessed data
    const commonData = [
      // Recent transactions
      () => this.qorpay.transactions.list({ limit: 10 }),
      // Customer data
      () => this.qorpay.customers.list({ limit: 20 }),
      // Active plans
      () => this.qorpay.plans.list({ status: 'active' })
    ];

    await Promise.allSettled(
      commonData.map(async (fetchData, index) => {
        try {
          const data = await fetchData();
          const key = `warmup:${index}`;
          this.cache.set(key, data, 60000); // 1 minute
        } catch (error) {
          console.warn(`Failed to warm cache for index ${index}:`, error);
        }
      })
    );
  }
}

/**
 * Cache invalidation strategies
 */
export class CacheInvalidator {
  constructor(private cache: ResponseCache) {}

  invalidatePayment(paymentId: string): void {
    this.cache.delete(PaymentCache.paymentKey(paymentId));
    this.cache.delete(PaymentCache.transactionKey(paymentId));
  }

  invalidateCustomer(customerId: string): void {
    this.cache.delete(PaymentCache.customerKey(customerId));

    // Invalidate all list caches that might include this customer
    for (const [key] of this.cache as any) {
      if (key.startsWith('list:') && key.includes('customer')) {
        this.cache.delete(key);
      }
    }
  }

  invalidateType(type: string): void {
    for (const [key] of this.cache as any) {
      if (key.startsWith(`${type}:`)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}