/**
 * @file tests/unit/base-client-coverage.test.ts
 * @description Additional BaseClient tests to achieve 100% coverage
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError, QorPayNetworkError } from '../../src/errors';

// Mock dependencies
jest.mock('axios');
jest.mock('axios-retry', () => ({
  __esModule: true,
  default: jest.fn(),
  isNetworkOrIdempotentRequestError: jest.fn(() => true),
  exponentialDelay: jest.fn(() => 100),
}));

jest.mock('../../src/client/interceptors', () => ({
  RequestInterceptor: {
    createHandler: jest.fn(() => (config: any) => config),
  },
  ResponseInterceptor: {
    createSuccessHandler: jest.fn(() => (response: any) => response),
    createErrorHandler: jest.fn(() => (error: any) => Promise.reject(error)),
  },
}));

jest.mock('../../src/utils/performance', () => ({
  performanceTracker: {
    startRequest: jest.fn(() => ({
      requestId: 123,
      headers: {
        'X-Request-Id': 'test-request-id',
        'X-Request-Start': '1234567890',
        'X-Client-SDK': 'qorpay-sdk',
        'X-Client-SDK-Version': '1.2.0',
        'X-Client-Platform': 'node',
      },
    })),
    endRequest: jest.fn(() => ({
      requestId: 123,
      method: 'GET',
      url: 'https://sandbox-api.qorcommerce.io/api/v3/test',
      startTime: Date.now() - 100,
      endTime: Date.now(),
      duration: 100,
    })),
    getPerformanceSummary: jest.fn(() => ({
      totalRequests: 5,
      completedRequests: 4,
      averageResponseTime: 150,
    })),
  },
}));

describe('BaseClient - Coverage Tests', () => {
  const defaultConfig = {
    appKey: 'test-app-key',
    clientKey: 'test-client-key',
    environment: 'sandbox' as const,
  };

  const mockAxiosInstance = {
    request: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.create as jest.Mock) = jest.fn(() => mockAxiosInstance);
    (axiosRetry as any) = jest.fn();

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();

    // Reset NODE_ENV
    delete process.env.NODE_ENV;
  });

  describe('Performance tracking coverage', () => {
    let client: BaseClient;

    beforeEach(() => {
      client = new BaseClient(defaultConfig);
    });

    it('should track performance metrics when making requests', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await client.get('/test');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/test',
          headers: expect.objectContaining({
            'X-Request-Id': 'test-request-id',
            'X-Request-Start': '1234567890',
            'X-Client-SDK': 'qorpay-sdk',
            'X-Client-SDK-Version': '1.2.0',
            'X-Client-Platform': 'node',
          }),
        })
      );
    });

    it('should log performance when enabled', async () => {
      client.enablePerformanceMetrics();

      const mockResponse = { data: { success: true } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await client.post('/api/data', { test: 'data' });

      expect(console.log).toHaveBeenCalledWith(
        '[QorPay SDK] POST https://sandbox-api.qorcommerce.io/api/v3/api/data - 100ms'
      );
    });

    it('should log performance errors when request fails', async () => {
      client.enablePerformanceMetrics();

      const error = new Error('Network error');
      mockAxiosInstance.request.mockRejectedValue(error);

      try {
        await client.get('/test');
      } catch (err) {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith(
        '[QorPay SDK] GET https://sandbox-api.qorcommerce.io/api/v3/test - FAILED after 100ms',
        error
      );
    });

    it('should not log performance when disabled', async () => {
      client.disablePerformanceMetrics();

      const mockResponse = { data: { success: true } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await client.get('/test');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should log performance in development environment', async () => {
      process.env.NODE_ENV = 'development';

      const mockResponse = { data: { success: true } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await client.get('/test');

      expect(console.log).toHaveBeenCalledWith(
        '[QorPay SDK] GET https://sandbox-api.qorcommerce.io/api/v3/test - 100ms'
      );
    });

    it('should handle performance tracking with null response data', async () => {
      const mockResponse = { data: null };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/test');

      expect(result).toBeNull();
      expect(mockAxiosInstance.request).toHaveBeenCalled();
    });

    it('should handle performance tracking with undefined response data', async () => {
      const mockResponse = { data: undefined };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/test');

      expect(result).toBeNull(); // BaseClient converts undefined to null
      expect(mockAxiosInstance.request).toHaveBeenCalled();
    });

    it('should handle performance tracking with empty string response data', async () => {
      const mockResponse = { data: '' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const result = await client.get('/test');

      expect(result).toBeNull();
      expect(mockAxiosInstance.request).toHaveBeenCalled();
    });

    it('should return performance metrics summary', () => {
      const { performanceTracker } = require('../../src/utils/performance');

      const metrics = client.getPerformanceMetrics();

      expect(performanceTracker.getPerformanceSummary).toHaveBeenCalled();
      expect(metrics).toEqual({
        totalRequests: 5,
        completedRequests: 4,
        averageResponseTime: 150,
      });
    });
  });

  describe('Request interceptor setup', () => {
    it('should set up request interceptors', () => {
      const { RequestInterceptor } = require('../../src/client/interceptors');

      new BaseClient(defaultConfig);

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(
        RequestInterceptor.createHandler()
      );
    });
  });

  describe('Response interceptor setup', () => {
    it('should set up response interceptors', () => {
      const { ResponseInterceptor } = require('../../src/client/interceptors');

      new BaseClient(defaultConfig);

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        ResponseInterceptor.createSuccessHandler(),
        ResponseInterceptor.createErrorHandler()
      );
    });
  });

  describe('axios retry configuration', () => {
    it('should configure axios retry with correct options', () => {
      const { isNetworkOrIdempotentRequestError } = require('axios-retry');

      new BaseClient(defaultConfig);

      expect(axiosRetry).toHaveBeenCalledWith(mockAxiosInstance, {
        retries: 3,
        retryDelay: expect.any(Function),
        retryCondition: expect.any(Function),
      });

      // Get the retry condition function
      const retryCondition = (axiosRetry as jest.Mock).mock.calls[0][1]
        .retryCondition;

      // Test retry condition with network error
      const networkError = { code: 'ECONNRESET' };
      expect(retryCondition(networkError)).toBe(true);

      // Test retry condition with 429 status
      const rateLimitError = {
        response: { status: 429 },
      };
      expect(retryCondition(rateLimitError)).toBe(true);

      // Test retry condition with client error (4xx except 429)
      const clientError = {
        response: { status: 400 },
      };
      expect(retryCondition(clientError)).toBe(false);

      // Test retry condition with server error (5xx)
      const serverError = {
        response: { status: 500 },
      };
      expect(retryCondition(serverError)).toBe(true);
    });
  });

  describe('Request path normalization', () => {
    let client: BaseClient;

    beforeEach(() => {
      client = new BaseClient(defaultConfig);
      mockAxiosInstance.request.mockResolvedValue({ data: {} });
    });

    it('should normalize path without leading slash', async () => {
      await client.get('api/users');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/users',
        })
      );
    });

    it('should preserve path with leading slash', async () => {
      await client.get('/api/users');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/users',
        })
      );
    });
  });

  describe('Complex request scenarios', () => {
    let client: BaseClient;

    beforeEach(() => {
      client = new BaseClient(defaultConfig);
    });

    it('should handle request with custom config and headers', async () => {
      const mockResponse = { data: { id: 1 } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const customConfig = {
        headers: {
          Authorization: 'Bearer token123',
          'X-Custom': 'custom-value',
        },
        timeout: 10000,
      };

      await client.post('/api/data', { name: 'Test' }, customConfig);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/api/data',
          data: { name: 'Test' },
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
            'X-Custom': 'custom-value',
            'X-Request-Id': 'test-request-id',
          }),
          params: undefined,
          timeout: 10000,
        })
      );
    });

    it('should merge custom headers with performance headers correctly', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const customConfig = {
        headers: {
          'X-Request-Id': 'override-request-id',
          'Content-Type': 'application/xml',
        },
      };

      await client.put('/api/resource/1', { data: 'value' }, customConfig);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Request-Id': 'override-request-id',
            'Content-Type': 'application/xml',
          }),
        })
      );
    });
  });
});
