/**
 * @file tests/unit/interceptors/request-interceptor.test.ts
 * @description Tests for RequestInterceptor
 */

import { RequestInterceptor } from '../../../src/client/interceptors/request-interceptor';
import { performanceTracker } from '../../../src/utils/performance';

describe('RequestInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onRequest', () => {
    it('should add performance headers to requests', () => {
      const config = {
        method: 'GET',
        url: '/test',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      };

      const result = RequestInterceptor.onRequest(config);

      // Verify that performance headers were added
      expect(result.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
        'X-Request-Id': expect.any(String),
        'X-Request-Start': expect.any(String),
        'X-Client-SDK': 'qorpay-v3-sdk',
        'X-Client-SDK-Version': expect.any(String),
        'X-Client-Platform': 'node',
      });

      // Verify the request ID format
      expect(result.headers['X-Request-Id']).toMatch(/^req_\d+_[a-z0-9]+$/);
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

      expect(result.headers).toEqual({
        'Content-Type': 'application/json',
        ...customHeaders,
      });
    });

    it('should handle requests without existing headers', () => {
      const config = {
        method: 'GET',
        url: '/test',
      };

      const result = RequestInterceptor.onRequest(config);

      // Should have performance headers even without existing headers
      expect(result.headers).toEqual({
        'X-Request-Id': expect.any(String),
        'X-Request-Start': expect.any(String),
        'X-Client-SDK': 'qorpay-v3-sdk',
        'X-Client-SDK-Version': expect.any(String),
        'X-Client-Platform': 'node',
      });

      // Verify the request ID format
      expect(result.headers['X-Request-Id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should handle requests with method in uppercase', () => {
      const config = {
        method: 'get',
        url: '/test',
        headers: {},
      };

      const result = RequestInterceptor.onRequest(config);

      // Should still add performance headers and convert method to uppercase
      expect(result.headers).toEqual({
        'X-Request-Id': expect.any(String),
        'X-Request-Start': expect.any(String),
        'X-Client-SDK': 'qorpay-v3-sdk',
        'X-Client-SDK-Version': expect.any(String),
        'X-Client-Platform': 'node',
      });

      // Verify the request ID format
      expect(result.headers['X-Request-Id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should add performance headers when no custom headers provided', () => {
      const config = {
        method: 'GET',
        url: '/test',
        headers: {
          'Existing-Header': 'existing-value',
        },
      };

      const result = RequestInterceptor.onRequest(config);

      expect(result.headers).toEqual({
        'Existing-Header': 'existing-value',
        'X-Request-Id': expect.any(String),
        'X-Request-Start': expect.any(String),
        'X-Client-SDK': 'qorpay-v3-sdk',
        'X-Client-SDK-Version': expect.any(String),
        'X-Client-Platform': 'node',
      });

      // Verify the request ID format
      expect(result.headers['X-Request-Id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should merge headers correctly when both existing and performance headers exist', () => {
      const config = {
        method: 'POST',
        url: '/api/data',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
          'X-Request-Id': 'existing-id', // Should be overwritten
        },
      };

      const result = RequestInterceptor.onRequest(config);

      // Performance headers should merge with existing, overwriting conflicts
      expect(result.headers).toEqual({
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
        'X-Request-Id': expect.any(String), // Performance header should overwrite
        'X-Request-Start': expect.any(String),
        'X-Client-SDK': 'qorpay-v3-sdk',
        'X-Client-SDK-Version': expect.any(String),
        'X-Client-Platform': 'node',
      });

      // The new request ID should not be the old one
      expect(result.headers['X-Request-Id']).not.toBe('existing-id');
      expect(result.headers['X-Request-Id']).toMatch(/^req_\d+_[a-z0-9]+$/);
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
        'X-Request-Id': expect.any(String),
        'X-Request-Start': expect.any(String),
        'X-Client-SDK': 'qorpay-v3-sdk',
        'X-Client-SDK-Version': expect.any(String),
        'X-Client-Platform': 'node',
      });
    });
  });
});
