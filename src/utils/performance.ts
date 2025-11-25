/**
 * @file src/utils/performance.ts
 * @description Performance monitoring utilities for tracking request metrics
 */

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  timestamp: number;
}

export interface PerformanceHeaders {
  'X-Request-Id': string;
  'X-Request-Start': string;
  'X-Client-SDK': string;
  'X-Client-SDK-Version': string;
  'X-Client-Platform': string;
}

export class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private sdkVersion: string;
  private platform: string;

  constructor(sdkVersion = '1.1.0', platform = 'node') {
    this.sdkVersion = sdkVersion;
    this.platform = platform;
  }

  /**
   * Generate a unique request ID
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start tracking a request
   */
  startRequest(
    method: string,
    url: string
  ): { requestId: string; headers: PerformanceHeaders } {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    const timestamp = startTime;

    const metrics: PerformanceMetrics = {
      requestId,
      method,
      url,
      startTime,
      timestamp,
    };

    this.metrics.set(requestId, metrics);

    const headers: PerformanceHeaders = {
      'X-Request-Id': requestId,
      'X-Request-Start': startTime.toString(),
      'X-Client-SDK': 'qorpay-v3-sdk',
      'X-Client-SDK-Version': this.sdkVersion,
      'X-Client-Platform': this.platform,
    };

    return { requestId, headers };
  }

  /**
   * End tracking a request and return the duration
   */
  endRequest(requestId: number): PerformanceMetrics | undefined {
    const metrics = this.metrics.get(requestId);
    if (!metrics) {
      return undefined;
    }

    const endTime = Date.now();
    const duration = endTime - metrics.startTime;

    const completedMetrics: PerformanceMetrics = {
      ...metrics,
      endTime,
      duration,
    };

    this.metrics.set(requestId, completedMetrics);
    return completedMetrics;
  }

  /**
   * Get metrics for a specific request
   */
  getMetrics(requestId: string): PerformanceMetrics | undefined {
    return this.metrics.get(requestId);
  }

  /**
   * Get all tracked metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get average response time for completed requests
   */
  getAverageResponseTime(): number {
    const completedMetrics = Array.from(this.metrics.values()).filter(
      (m) => m.duration !== undefined
    );

    if (completedMetrics.length === 0) {
      return 0;
    }

    const totalDuration = completedMetrics.reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );
    return totalDuration / completedMetrics.length;
  }

  /**
   * Clear old metrics (older than specified milliseconds)
   */
  clearOldMetrics(olderThanMs = 3600000): void {
    const cutoff = Date.now() - olderThanMs;
    for (const [requestId, metrics] of this.metrics.entries()) {
      if (metrics.timestamp < cutoff) {
        this.metrics.delete(requestId);
      }
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalRequests: number;
    completedRequests: number;
    averageResponseTime: number;
    slowestRequest?: PerformanceMetrics;
    fastestRequest?: PerformanceMetrics;
  } {
    const allMetrics = this.getAllMetrics();
    const completedMetrics = allMetrics.filter((m) => m.duration !== undefined);

    const summary = {
      totalRequests: allMetrics.length,
      completedRequests: completedMetrics.length,
      averageResponseTime: this.getAverageResponseTime(),
    };

    if (completedMetrics.length > 0) {
      const sortedByDuration = [...completedMetrics].sort(
        (a, b) => (a.duration || 0) - (b.duration || 0)
      );
      summary.fastestRequest = sortedByDuration[0];
      summary.slowestRequest = sortedByDuration[sortedByDuration.length - 1];
    }

    return summary;
  }
}

// Global performance tracker instance
export const performanceTracker = new PerformanceTracker();
