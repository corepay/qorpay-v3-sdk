/**
 * @file tests/unit/performance.test.ts
 * @description Tests for performance monitoring utilities
 */

import {
  performanceTracker,
  PerformanceTracker,
} from '../../src/utils/performance';

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker();
  });

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = tracker.generateRequestId();
      const id2 = tracker.generateRequestId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^req_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]{9}$/);
    });
  });

  describe('startRequest', () => {
    it('should start tracking a request and return headers', () => {
      const { requestId, headers } = tracker.startRequest('POST', '/test');

      expect(requestId).toBeDefined();
      expect(headers).toEqual({
        'X-Request-Id': requestId,
        'X-Request-Start': expect.stringMatching(/^\d+$/),
        'X-Client-SDK': 'qorpay-v3-sdk',
        'X-Client-SDK-Version': '1.1.0',
        'X-Client-Platform': 'node',
      });
    });

    it('should track multiple requests separately', () => {
      const req1 = tracker.startRequest('GET', '/api/test1');
      const req2 = tracker.startRequest('POST', '/api/test2');

      expect(req1.requestId).not.toBe(req2.requestId);
      expect(req1.headers['X-Request-Id']).toBe(req1.requestId);
      expect(req2.headers['X-Request-Id']).toBe(req2.requestId);
    });
  });

  describe('endRequest', () => {
    it('should end request tracking and calculate duration', async () => {
      const { requestId } = tracker.startRequest('GET', '/test');

      // Wait a bit to simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 10));

      const metrics = tracker.endRequest(requestId);

      expect(metrics).toBeDefined();
      expect(metrics?.requestId).toBe(requestId);
      expect(metrics?.duration).toBeGreaterThan(0);
      expect(metrics?.endTime).toBeDefined();
      expect(metrics?.startTime).toBeLessThan(metrics.endTime || 0);
    });

    it('should return undefined for non-existent request', () => {
      const metrics = tracker.endRequest('non-existent');
      expect(metrics).toBeUndefined();
    });
  });

  describe('getMetrics', () => {
    it('should return metrics for a specific request', () => {
      const { requestId } = tracker.startRequest('GET', '/test');
      tracker.endRequest(requestId);

      const metrics = tracker.getMetrics(requestId);

      expect(metrics).toBeDefined();
      expect(metrics?.requestId).toBe(requestId);
    });

    it('should return undefined for non-existent request', () => {
      const metrics = tracker.getMetrics('non-existent');
      expect(metrics).toBeUndefined();
    });
  });

  describe('getAllMetrics', () => {
    it('should return all tracked metrics', () => {
      const req1 = tracker.startRequest('GET', '/test1');
      const req2 = tracker.startRequest('POST', '/test2');

      tracker.endRequest(req1.requestId);
      // Leave req2 running

      const allMetrics = tracker.getAllMetrics();

      expect(allMetrics).toHaveLength(2);
      expect(
        allMetrics.find((m) => m.requestId === req1.requestId)?.duration
      ).toBeDefined();
      expect(
        allMetrics.find((m) => m.requestId === req2.requestId)?.duration
      ).toBeUndefined();
    });
  });

  describe('getAverageResponseTime', () => {
    it('should calculate average for completed requests', async () => {
      const req1 = tracker.startRequest('GET', '/test1');
      await new Promise((resolve) => setTimeout(resolve, 1)); // Ensure some duration
      tracker.endRequest(req1.requestId);

      const req2 = tracker.startRequest('GET', '/test2');
      await new Promise((resolve) => setTimeout(resolve, 1)); // Ensure some duration
      tracker.endRequest(req2.requestId);

      const avg = tracker.getAverageResponseTime();
      expect(avg).toBeGreaterThan(0);
    });

    it('should return 0 when no requests are completed', () => {
      tracker.startRequest('GET', '/test');
      // Don't end it

      const avg = tracker.getAverageResponseTime();
      expect(avg).toBe(0);
    });
  });

  describe('clearOldMetrics', () => {
    it('should remove old metrics', () => {
      const { requestId } = tracker.startRequest('GET', '/test');
      tracker.endRequest(requestId);

      // Mock old timestamp
      const metrics = tracker.getMetrics(requestId);
      if (metrics) {
        (metrics as any).timestamp = Date.now() - 4000000; // More than 1 hour ago
      }

      tracker.clearOldMetrics(3600000); // 1 hour

      expect(tracker.getMetrics(requestId)).toBeUndefined();
    });

    it('should keep recent metrics', () => {
      const { requestId } = tracker.startRequest('GET', '/test');
      tracker.endRequest(requestId);

      tracker.clearOldMetrics(3600000); // 1 hour

      expect(tracker.getMetrics(requestId)).toBeDefined();
    });
  });

  describe('getPerformanceSummary', () => {
    it('should return comprehensive performance summary', () => {
      const req1 = tracker.startRequest('GET', '/test1');
      const req2 = tracker.startRequest('POST', '/test2');
      tracker.startRequest('PUT', '/test3');

      tracker.endRequest(req1.requestId);
      tracker.endRequest(req2.requestId);
      // Leave req3 running

      const summary = tracker.getPerformanceSummary();

      expect(summary).toEqual({
        totalRequests: 3,
        completedRequests: 2,
        averageResponseTime: expect.any(Number),
        fastestRequest: expect.objectContaining({
          requestId: expect.any(String),
          duration: expect.any(Number),
        }),
        slowestRequest: expect.objectContaining({
          requestId: expect.any(String),
          duration: expect.any(Number),
        }),
      });
    });

    it('should return empty summary when no requests exist', () => {
      const summary = tracker.getPerformanceSummary();

      expect(summary).toEqual({
        totalRequests: 0,
        completedRequests: 0,
        averageResponseTime: 0,
      });
    });
  });
});

describe('Global performanceTracker', () => {
  it('should be a singleton instance', () => {
    expect(performanceTracker).toBeInstanceOf(PerformanceTracker);
  });

  it('should persist state across imports', () => {
    const { requestId } = performanceTracker.startRequest('GET', '/test');

    // The global performanceTracker should persist across imports
    const metrics = performanceTracker.getMetrics(requestId);

    expect(metrics).toBeDefined();
    expect(metrics?.requestId).toBe(requestId);
  });
});
