/**
 * @file tests/unit/base-client.test.ts
 * @description Unit tests for BaseClient class
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError, QorPayNetworkError, QorPayUnknownError } from '../../src/errors';
import { performanceTracker } from '../../src/utils/performance';

// Mock dependencies
jest.mock('axios');
jest.mock('axios-retry', () => ({
  __esModule: true,
  default: jest.fn(),
  isNetworkOrIdempotentRequestError: jest.fn(() => true),
  exponentialDelay: jest.fn(() => 100),
}));
jest.mock('../../src/utils/performance', () => ({
  performanceTracker: {
    startRequest: jest.fn(() => ({
      requestId: 'test-request-id',
      headers: { 'x-request-id': 'test-request-id' },
    })),
    endRequest: jest.fn(() => ({ duration: 100 })),
    getPerformanceSummary: jest.fn(() => ({
      totalRequests: 1,
      averageResponseTime: 100,
      slowestRequest: { url: '/test', method: 'GET', duration: 100 },
    })),
  },
}));

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  jest.clearAllMocks();
});

describe('BaseClient', () => {
  const defaultConfig = {
    appKey: 'test-app-key',
    clientKey: 'test-client-key',
    environment: 'sandbox' as const,
  };

  const mockAxiosInstance = {
    request: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    (axios.create as jest.Mock) = jest.fn(() => mockAxiosInstance);
    (axiosRetry as any) = jest.fn();
  });

  describe('constructor', () => {
    it('should initialize with provided configuration', () => {
      const client = new BaseClient(defaultConfig);

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://sandbox-api.qorcommerce.io/api/v3',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Qor-App-Key': 'test-app-key',
          'Qor-Client-Key': 'test-client-key',
        },
      });

      expect(axiosRetry).toHaveBeenCalledWith(mockAxiosInstance, {
        retries: 3,
        retryDelay: expect.any(Function),
        retryCondition: expect.any(Function),
      });
    });

    it('should use custom baseURL when provided', () => {
      const config = {
        ...defaultConfig,
        baseURL: 'https://custom.api.example.com',
      };

      new BaseClient(config);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://custom.api.example.com',
        })
      );
    });

    it('should use custom timeout when provided', () => {
      const config = {
        ...defaultConfig,
        timeout: 60000,
      };

      new BaseClient(config);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 60000,
        })
      );
    });

    it('should merge custom headers with default headers', () => {
      const config = {
        ...defaultConfig,
        headers: {
          'User-Agent': 'Test-Agent/1.0',
          'X-Custom-Header': 'custom-value',
        },
      };

      new BaseClient(config);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Qor-App-Key': 'test-app-key',
            'Qor-Client-Key': 'test-client-key',
            'User-Agent': 'Test-Agent/1.0',
            'X-Custom-Header': 'custom-value',
          },
        })
      );
    });

    it('should set up response interceptors for error handling', () => {
      new BaseClient(defaultConfig);

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe('getBaseURL', () => {
    it('should return the configured base URL', () => {
      const client = new BaseClient(defaultConfig);
      expect(client.getBaseURL()).toBe('https://sandbox-api.qorcommerce.io/api/v3');
    });

    it('should return custom base URL when provided', () => {
      const config = {
        ...defaultConfig,
        baseURL: 'https://custom.example.com',
      };
      const client = new BaseClient(config);
      expect(client.getBaseURL()).toBe('https://custom.example.com');
    });
  });

  describe('getEnvironment', () => {
    it('should return the configured environment', () => {
      const client = new BaseClient(defaultConfig);
      expect(client.getEnvironment()).toBe('sandbox');
    });

    it('should return production environment when configured', () => {
      const config = { ...defaultConfig, environment: 'production' as const };
      const client = new BaseClient(config);
      expect(client.getEnvironment()).toBe('production');
    });
  });

  describe('HTTP methods', () => {
    let client: BaseClient;

    beforeEach(() => {
      client = new BaseClient(defaultConfig);
    });

    describe('get', () => {
      it('should make a GET request', async () => {
        const mockResponse = { data: { result: 'success' } };
        mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

        const result = await client.get('/test', { param: 'value' });

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/test',
          data: undefined,
          params: { param: 'value' },
          headers: { 'x-request-id': 'test-request-id' },
        });
        expect(result).toEqual({ result: 'success' });
      });
    });

    describe('post', () => {
      it('should make a POST request', async () => {
        const mockResponse = { data: { result: 'created' } };
        const postData = { name: 'Test Item' };
        mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

        const result = await client.post('/test', postData);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/test',
          data: postData,
          params: undefined,
          headers: { 'x-request-id': 'test-request-id' },
        });
        expect(result).toEqual({ result: 'created' });
      });
    });

    describe('put', () => {
      it('should make a PUT request', async () => {
        const mockResponse = { data: { result: 'updated' } };
        const putData = { id: 1, name: 'Updated Item' };
        mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

        const result = await client.put('/test/1', putData);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'PUT',
          url: '/test/1',
          data: putData,
          params: undefined,
          headers: { 'x-request-id': 'test-request-id' },
        });
        expect(result).toEqual({ result: 'updated' });
      });
    });

    describe('patch', () => {
      it('should make a PATCH request', async () => {
        const mockResponse = { data: { result: 'patched' } };
        const patchData = { name: 'Patched Item' };
        mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

        const result = await client.patch('/test/1', patchData);

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'PATCH',
          url: '/test/1',
          data: patchData,
          params: undefined,
          headers: { 'x-request-id': 'test-request-id' },
        });
        expect(result).toEqual({ result: 'patched' });
      });
    });

    describe('delete', () => {
      it('should make a DELETE request', async () => {
        const mockResponse = { data: { result: 'deleted' } };
        mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

        const result = await client.delete('/test/1', { force: true });

        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'DELETE',
          url: '/test/1',
          data: undefined,
          params: { force: true },
          headers: { 'x-request-id': 'test-request-id' },
        });
        expect(result).toEqual({ result: 'deleted' });
      });
    });

    describe('path normalization', () => {
      it('should normalize paths without leading slash', async () => {
        mockAxiosInstance.request.mockResolvedValueOnce({ data: {} });

        await client.get('test/path');

        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/test/path',
          })
        );
      });

      it('should preserve paths with leading slash', async () => {
        mockAxiosInstance.request.mockResolvedValueOnce({ data: {} });

        await client.get('/test/path');

        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/test/path',
          })
        );
      });
    });
  });

  describe('response handling', () => {
    let client: BaseClient;
    let responseInterceptor: any;

    beforeEach(() => {
      client = new BaseClient(defaultConfig);
      responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
    });

    describe('success response handler', () => {
      it('should pass through successful responses', () => {
        const response = { data: { status: 'success', result: 'ok' } };
        const result = responseInterceptor[0](response);

        expect(result).toEqual(response);
      });

      it('should reject responses with error status', async () => {
        const response = {
          data: {
            status: 'error',
            message: 'Something went wrong',
            code: 'ERROR_CODE',
          },
          status: 400,
        };

        await expect(responseInterceptor[0](response)).rejects.toThrow(
          QorPayApiError
        );
      });
    });

    describe('error response handler', () => {
      it('should handle axios response errors', async () => {
        const axiosError = {
          response: {
            status: 404,
            data: {
              message: 'Resource not found',
              code: 'NOT_FOUND',
            },
          },
        };

        await expect(responseInterceptor[1](axiosError)).rejects.toThrow(
          QorPayApiError
        );
      });

      it('should handle network errors', async () => {
        const networkError = {
          request: {},
          code: 'ECONNREFUSED',
          message: 'Connection refused',
        };

        await expect(responseInterceptor[1](networkError)).rejects.toThrow(
          QorPayNetworkError
        );
      });

      it('should handle unknown errors', async () => {
        const unknownError = new Error('Unknown error');

        await expect(responseInterceptor[1](unknownError)).rejects.toThrow(
          QorPayUnknownError
        );
      });

      it('should pass through existing QorPay errors', async () => {
        const qorPayError = new QorPayApiError('Test error', 400);

        await expect(responseInterceptor[1](qorPayError)).rejects.toThrow(
          QorPayApiError
        );
      });
    });
  });

  describe('performance metrics', () => {
    let client: BaseClient;

    beforeEach(() => {
      client = new BaseClient(defaultConfig);
      mockAxiosInstance.request.mockResolvedValue({ data: {} });
    });

    describe('enablePerformanceMetrics', () => {
      it('should enable performance logging', () => {
        client.enablePerformanceMetrics();

        // Make a request to trigger logging
        client.get('/test').then(() => {
          expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('[QorPay SDK] GET /test')
          );
        });
      });
    });

    describe('disablePerformanceMetrics', () => {
      it('should disable performance logging', () => {
        client.disablePerformanceMetrics();

        // Make a request
        client.get('/test').then(() => {
          expect(console.log).not.toHaveBeenCalled();
        });
      });
    });

    describe('getPerformanceMetrics', () => {
      it('should return performance summary', () => {
        const metrics = client.getPerformanceMetrics();

        expect(performanceTracker.getPerformanceSummary).toHaveBeenCalled();
        expect(metrics).toEqual({
          totalRequests: 1,
          averageResponseTime: 100,
          slowestRequest: { url: '/test', method: 'GET', duration: 100 },
        });
      });
    });

    describe('performance logging', () => {
      it('should log performance in development environment', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        return client.get('/test').then(() => {
          expect(console.log).toHaveBeenCalled();
          process.env.NODE_ENV = originalEnv;
        });
      });

      it('should log errors when request fails', async () => {
        client.enablePerformanceMetrics();
        mockAxiosInstance.request.mockRejectedValue(new Error('Test error'));

        try {
          await client.get('/test');
        } catch (error) {
          expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('[QorPay SDK] GET /test - FAILED'),
            expect.any(Error)
          );
        }
      });
    });
  });

  describe('response data handling', () => {
    let client: BaseClient;

    beforeEach(() => {
      client = new BaseClient(defaultConfig);
    });

    it('should handle null response data', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: null });

      const result = await client.get('/test');
      expect(result).toBeNull();
    });

    it('should handle undefined response data', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: undefined });

      const result = await client.get('/test');
      expect(result).toBeUndefined();
    });

    it('should handle empty string response data', async () => {
      mockAxiosInstance.request.mockResolvedValue({ data: '' });

      const result = await client.get('/test');
      expect(result).toBeNull();
    });

    it('should pass through valid response data', async () => {
      const testData = { id: 1, name: 'Test' };
      mockAxiosInstance.request.mockResolvedValue({ data: testData });

      const result = await client.get('/test');
      expect(result).toEqual(testData);
    });
  });

  describe('request configuration', () => {
    let client: BaseClient;

    beforeEach(() => {
      client = new BaseClient(defaultConfig);
      mockAxiosInstance.request.mockResolvedValue({ data: {} });
    });

    it('should merge custom headers with performance headers', async () => {
      const customConfig = {
        headers: {
          'Authorization': 'Bearer token',
          'X-Custom': 'value',
        },
      };

      await client.get('/test', {}, customConfig);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'x-request-id': 'test-request-id',
            'Authorization': 'Bearer token',
            'X-Custom': 'value',
          },
        })
      );
    });

    it('should allow custom headers to override performance headers', async () => {
      const customConfig = {
        headers: {
          'x-request-id': 'custom-request-id',
        },
      };

      await client.get('/test', {}, customConfig);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'x-request-id': 'custom-request-id',
          },
        })
      );
    });
  });
});