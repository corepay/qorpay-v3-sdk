/**
 * @file tests/unit/interceptors/request-interceptor.test.ts
 * @description Tests for RequestInterceptor
 */

import { RequestInterceptor } from '../../../src/client/interceptors/request-interceptor';
import { performanceTracker } from '../../../src/utils/performance';

// Mock performance tracker
jest.mock('../../../src/utils/performance', () => ({
  performanceTracker: {
    startRequest: jest.fn(),
  },
}));

describe('RequestInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onRequest', () => {
    it('should add performance headers to requests', () => {
      const mockPerformanceHeaders = {
        'X-Request-Id': 'test-request-id',
        'X-Request-Start': '1234567890',
        'X-Client-SDK': 'qorpay-sdk',
        'X-Client-SDK-Version': '1.2.0',
        'X-Client-Platform': 'node',
      };

      (performanceTracker.startRequest as jest.Mock).mockReturnValue({
        requestId: 'test-request-id',
        headers: mockPerformanceHeaders,
      });

      const config = {
        method: 'GET',
        url: '/test',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      };

      const result = RequestInterceptor.onRequest(config);

      expect(performanceTracker.startRequest).toHaveBeenCalledWith('GET', '/test');
      expect(result.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
        ...mockPerformanceHeaders,
      });
    });

    it('should use provided performance headers when given', () => {
      const customHeaders = {
        'X-Custom-Header': 'custom-value',
      };

      const config = {
        method: 'POST',
        url: '/api/test',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const result = RequestInterceptor.onRequest(config, customHeaders);

      expect(performanceTracker.startRequest).not.toHaveBeenCalled();
      expect(result.headers).toEqual({
        'Content-Type': 'application/json',
        ...customHeaders,
      });
    });

    it('should handle requests without existing headers', () => {
      const mockPerformanceHeaders = {
        'X-Request-Id': 'test-request-id',
        'X-Request-Start': '1234567890',
      };

      (performanceTracker.startRequest as jest.Mock).mockReturnValue({
        requestId: 'test-request-id',
        headers: mockPerformanceHeaders,
      });

      const config = {
        method: 'GET',
        url: '/test',
      };

      const result = RequestInterceptor.onRequest(config);

      expect(result.headers).toEqual(mockPerformanceHeaders);
    });

    it('should handle requests with method in uppercase', () => {
      const mockPerformanceHeaders = {
        'X-Request-Id': 'test-request-id',
      };

      (performanceTracker.startRequest as jest.Mock).mockReturnValue({
        requestId: 'test-request-id',
        headers: mockPerformanceHeaders,
      });

      const config = {
        method: 'get',
        url: '/test',
        headers: {},
      };

      const result = RequestInterceptor.onRequest(config);

      expect(performanceTracker.startRequest).toHaveBeenCalledWith('GET', '/test');
    });

    it('should add performance headers when no custom headers provided', () => {
      const config = {
        method: 'GET',
        url: '/test',
        headers: {
          'Existing-Header': 'existing-value',
        },
      };

      const mockPerformanceHeaders = {
        'X-Request-Id': 'test-request-id',
        'X-Request-Start': '1234567890',
      };

      (performanceTracker.startRequest as jest.Mock).mockReturnValue({
        requestId: 'test-request-id',
        headers: mockPerformanceHeaders,
      });

      const result = RequestInterceptor.onRequest(config);

      expect(result.headers).toEqual({
        'Existing-Header': 'existing-value',
        ...mockPerformanceHeaders,
      });
    });

    it('should merge headers correctly when both existing and performance headers exist', () => {
      const mockPerformanceHeaders = {
        'X-Request-Id': 'test-request-id',
        'X-Request-Start': '1234567890',
      };

      (performanceTracker.startRequest as jest.Mock).mockReturnValue({
        requestId: 'test-request-id',
        headers: mockPerformanceHeaders,
      });

      const config = {
        method: 'POST',
        url: '/api/data',
        headers: {
          'Authorization': 'Bearer token',
          'Content-Type': 'application/json',
          'X-Request-Id': 'existing-id', // Should be overwritten
        },
      };

      const result = RequestInterceptor.onRequest(config);

      expect(result.headers).toEqual({
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json',
        'X-Request-Id': 'test-request-id', // Performance header should overwrite
        'X-Request-Start': '1234567890',
      });
    });
  });

  describe('createHandler', () => {
    it('should return a function that calls onRequest', () => {
      const mockConfig = {
        method: 'GET',
        url: '/test',
        headers: {},
      };

      const handler = RequestInterceptor.createHandler();
      expect(typeof handler).toBe('function');

      // Mock the static method to verify it's called
      const onRequestSpy = jest.spyOn(RequestInterceptor, 'onRequest');
      onRequestSpy.mockReturnValue(mockConfig);

      const result = handler(mockConfig);

      expect(onRequestSpy).toHaveBeenCalledWith(mockConfig);
      expect(result).toBe(mockConfig);

      onRequestSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty config object', () => {
      const config = {};
      const result = RequestInterceptor.onRequest(config);

      expect(result).toEqual({});
    });

    it('should handle config with null headers', () => {
      const config = {
        method: 'GET',
        url: '/test',
        headers: null,
      };

      // Should not throw error
      expect(() => {
        RequestInterceptor.onRequest(config);
      }).not.toThrow();
    });

    it('should handle config with undefined headers', () => {
      const config = {
        method: 'GET',
        url: '/test',
        headers: undefined,
      };

      // Should not throw error
      expect(() => {
        RequestInterceptor.onRequest(config);
      }).not.toThrow();
    });

    it('should preserve config properties other than headers', () => {
      const mockPerformanceHeaders = {
        'X-Request-Id': 'test-id',
      };

      (performanceTracker.startRequest as jest.Mock).mockReturnValue({
        requestId: 'test-id',
        headers: mockPerformanceHeaders,
      });

      const config = {
        method: 'POST',
        url: '/api/test',
        data: { test: 'data' },
        params: { page: 1 },
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      };

      const result = RequestInterceptor.onRequest(config);

      expect(result.method).toBe('POST');
      expect(result.url).toBe('/api/test');
      expect(result.data).toEqual({ test: 'data' });
      expect(result.params).toEqual({ page: 1 });
      expect(result.timeout).toBe(5000);
      expect(result.headers).toEqual({
        'Content-Type': 'application/json',
        ...mockPerformanceHeaders,
      });
    });
  });
});