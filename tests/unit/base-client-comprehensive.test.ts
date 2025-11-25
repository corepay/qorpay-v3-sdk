/**
 * @file tests/unit/base-client-comprehensive.test.ts
 * @description Comprehensive tests for BaseClient to achieve 100% coverage
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { BaseClient } from '../../src/client/base-client';
import {
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError,
} from '../../src/errors';
import {
  createMockAxiosError,
  createMockAxiosResponse,
} from '../utils/test-helpers';

// Mock dependencies properly
jest.mock('axios');
jest.mock('axios-retry', () => ({
  __esModule: true,
  default: jest.fn(),
  isNetworkOrIdempotentRequestError: jest.fn(() => true),
  exponentialDelay: {
    bind: jest.fn(() => 100),
  },
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

// Create a mock axios instance
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn(),
      handlers: [],
    },
    response: {
      use: jest.fn(),
      handlers: [],
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

// Mock axios.create to return our mock instance
(axios.create as jest.Mock) = jest.fn(() => mockAxiosInstance);

describe('BaseClient - Comprehensive Coverage Tests', () => {
  let baseClient: BaseClient;
  let mockConfig: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
      environment: 'sandbox' as const,
    };

    baseClient = new BaseClient(mockConfig);

    // Set up interceptor handlers for testing
    mockAxiosInstance.interceptors.request.use.mockImplementation(
      (onFulfilled: any) => {
        mockAxiosInstance.interceptors.request.handlers.push({
          fulfilled: onFulfilled,
        });
      }
    );

    mockAxiosInstance.interceptors.response.use.mockImplementation(
      (onFulfilled: any, onRejected: any) => {
        mockAxiosInstance.interceptors.response.handlers.push({
          fulfilled: onFulfilled,
          rejected: onRejected,
        });
      }
    );
  });

  describe('Constructor Configuration', () => {
    it('should set up axios retry with correct configuration', () => {
      expect(axiosRetry).toHaveBeenCalledWith(
        mockAxiosInstance,
        expect.objectContaining({
          retries: 3,
          retryDelay: expect.any(Function),
          retryCondition: expect.any(Function),
        })
      );
    });

    it('should configure request interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(
        1
      );
    });

    it('should configure response interceptors', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Request Interceptor', () => {
    it('should add performance headers to requests', () => {
      const requestConfig = {
        method: 'GET',
        url: '/test',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Get the request interceptor handler
      const requestHandler =
        mockAxiosInstance.interceptors.request.handlers[0].fulfilled;

      // Apply the interceptor
      const result = requestHandler(requestConfig);

      expect(result.headers).toHaveProperty('x-request-id');
      expect(result.headers).toHaveProperty('x-request-start');
    });

    it('should merge custom headers with default headers', () => {
      const requestConfig = {
        method: 'POST',
        url: '/test',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'text/plain',
        },
      };

      const requestHandler =
        mockAxiosInstance.interceptors.request.handlers[0].fulfilled;
      const result = requestHandler(requestConfig);

      expect(result.headers['Qor-App-Key']).toBe('test-app-key');
      expect(result.headers['Qor-Client-Key']).toBe('test-client-key');
      expect(result.headers['Authorization']).toBe('Bearer token');
      expect(result.headers['Content-Type']).toBe('text/plain');
    });
  });

  describe('Response Interceptor - Success Handling', () => {
    it('should pass through successful responses', () => {
      const successResponse = createMockAxiosResponse({
        status: 'success',
        data: { test: 'data' },
      });

      const responseHandler =
        mockAxiosInstance.interceptors.response.handlers[0].fulfilled;
      const result = responseHandler(successResponse);

      expect(result).toEqual(successResponse);
    });

    it('should handle empty responses correctly', () => {
      const emptyResponse = createMockAxiosResponse('');

      const responseHandler =
        mockAxiosInstance.interceptors.response.handlers[0].fulfilled;
      const result = responseHandler(emptyResponse);

      expect(result).toEqual(emptyResponse);
    });

    it('should handle null response data', () => {
      const nullResponse = createMockAxiosResponse(null);

      const responseHandler =
        mockAxiosInstance.interceptors.response.handlers[0].fulfilled;
      const result = responseHandler(nullResponse);

      expect(result).toEqual(nullResponse);
    });
  });

  describe('Response Interceptor - Error Status in Body', () => {
    it('should reject with QorPayApiError when status: error in body', async () => {
      const errorResponse = createMockAxiosResponse({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid data',
        errors: [{ field: 'amount', message: 'Invalid amount' }],
      });

      const responseHandler =
        mockAxiosInstance.interceptors.response.handlers[0].fulfilled;

      try {
        await responseHandler(errorResponse);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect(error.message).toBe('Invalid data');
        expect(error.statusCode).toBe(200);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.details).toEqual({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'Invalid data',
          errors: [{ field: 'amount', message: 'Invalid amount' }],
        });
      }
    });

    it('should use default message when error status has no message', async () => {
      const errorResponse = createMockAxiosResponse({
        status: 'error',
        data: null,
      });

      const responseHandler =
        mockAxiosInstance.interceptors.response.handlers[0].fulfilled;

      try {
        await responseHandler(errorResponse);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('API returned an error status');
      }
    });

    it('should handle numeric error codes', async () => {
      const errorResponse = createMockAxiosResponse({
        status: 'error',
        code: 400,
        message: 'Bad Request',
      });

      const responseHandler =
        mockAxiosInstance.interceptors.response.handlers[0].fulfilled;

      try {
        await responseHandler(errorResponse);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(400);
      }
    });
  });

  describe('Response Interceptor - HTTP Errors', () => {
    it('should transform 400 errors to QorPayApiError', async () => {
      const axiosError = createMockAxiosError('Bad Request', 400, {
        message: 'Invalid request data',
        code: 'INVALID_DATA',
      });

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(axiosError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect(error.message).toBe('Invalid request data');
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('INVALID_DATA');
      }
    });

    it('should transform 401 errors to QorPayApiError', async () => {
      const axiosError = createMockAxiosError('Unauthorized', 401, {
        message: 'Invalid credentials',
      });

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(axiosError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
        expect(error.statusCode).toBe(401);
      }
    });

    it('should transform 404 errors to QorPayApiError', async () => {
      const axiosError = createMockAxiosError('Not Found', 404, {
        message: 'Resource not found',
      });

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(axiosError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Resource not found');
        expect(error.statusCode).toBe(404);
      }
    });

    it('should transform 429 rate limit errors to QorPayApiError', async () => {
      const axiosError = createMockAxiosError('Too Many Requests', 429, {
        message: 'Rate limit exceeded',
      });

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(axiosError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Rate limit exceeded');
        expect(error.statusCode).toBe(429);
      }
    });

    it('should transform 500 errors to QorPayApiError', async () => {
      const axiosError = createMockAxiosError('Internal Server Error', 500, {
        message: 'Server error',
      });

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(axiosError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Server error');
        expect(error.statusCode).toBe(500);
      }
    });

    it('should handle errors without response body', async () => {
      const axiosError = createMockAxiosError('Service Unavailable', 503);

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(axiosError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Request failed with status code 503');
        expect(error.statusCode).toBe(503);
      }
    });

    it('should handle errors with non-object response data', async () => {
      const axiosError = createMockAxiosError(
        'Bad Request',
        400,
        'plain error message'
      );

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(axiosError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('plain error message');
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe('Response Interceptor - Network Errors', () => {
    it('should transform network errors to QorPayNetworkError', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).isAxiosError = true;
      (networkError as any).request = { url: '/test' };
      (networkError as any).code = 'NETWORK_ERROR';

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(networkError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayNetworkError);
      }
    });

    it('should transform timeout errors to QorPayNetworkError', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      (timeoutError as any).isAxiosError = true;
      (timeoutError as any).code = 'ECONNABORTED';

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(timeoutError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayNetworkError);
      }
    });

    it('should transform DNS errors to QorPayNetworkError', async () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND api.qorcommerce.io');
      (dnsError as any).isAxiosError = true;
      (dnsError as any).code = 'ENOTFOUND';

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(dnsError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayNetworkError);
      }
    });
  });

  describe('Response Interceptor - Unknown Errors', () => {
    it('should pass through QorPayError instances unchanged', async () => {
      const qorError = new QorPayApiError('Already a QorPay error', 400);

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(qorError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBe(qorError);
      }
    });

    it('should transform other errors to QorPayUnknownError', async () => {
      const genericError = new TypeError('Cannot read property of undefined');
      (genericError as any).isAxiosError = false;

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(genericError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayUnknownError);
      }
    });

    it('should handle configuration errors', async () => {
      const configError = new Error('Missing configuration');
      (configError as any).isAxiosError = false;

      const errorHandler =
        mockAxiosInstance.interceptors.response.handlers[0].rejected;

      try {
        await errorHandler(configError);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayUnknownError);
      }
    });
  });

  describe('HTTP Methods', () => {
    it('should make GET requests with headers and params', async () => {
      const mockResponse = createMockAxiosResponse({ success: true });
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params = { limit: 10, offset: 0 };
      const headers = { 'X-Custom': 'value' };

      const result = await baseClient.get('/test', params, headers);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/test',
        params,
        headers
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make POST requests with data', async () => {
      const mockResponse = createMockAxiosResponse({ success: true });
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const data = { amount: '100.00' };
      const headers = { 'X-Custom': 'value' };

      const result = await baseClient.post('/test', data, headers);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/test',
        data,
        headers
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make PUT requests with data', async () => {
      const mockResponse = createMockAxiosResponse({ success: true });
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const data = { amount: '100.00' };

      const result = await baseClient.put('/test', data);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', data);
      expect(result).toEqual(mockResponse);
    });

    it('should make PATCH requests with data', async () => {
      const mockResponse = createMockAxiosResponse({ success: true });
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const data = { amount: '100.00' };

      const result = await baseClient.patch('/test', data);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test', data);
      expect(result).toEqual(mockResponse);
    });

    it('should make DELETE requests', async () => {
      const mockResponse = createMockAxiosResponse({ success: true });
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await baseClient.delete('/test');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('axios retry configuration', () => {
    it('should configure retry condition to include rate limit', () => {
      const { retryCondition } = (axiosRetry as jest.Mock).mock.calls[0][1];

      const networkError = createMockAxiosError('Network Error');
      networkError.code = 'ECONNRESET';

      expect(retryCondition(networkError)).toBe(true);
    });

    it('should configure retry condition for 429 errors', () => {
      const { retryCondition } = (axiosRetry as jest.Mock).mock.calls[0][1];

      const rateLimitError = createMockAxiosError('Rate Limit', 429);

      expect(retryCondition(rateLimitError)).toBe(true);
    });

    it('should not retry on client errors (4xx except 429)', () => {
      const { retryCondition } = (axiosRetry as jest.Mock).mock.calls[0][1];

      const badRequestError = createMockAxiosError('Bad Request', 400);

      expect(retryCondition(badRequestError)).toBe(false);
    });

    it('should not retry on server errors (5xx)', () => {
      const { retryCondition } = (axiosRetry as jest.Mock).mock.calls[0][1];

      const serverError = createMockAxiosError('Server Error', 500);

      expect(retryCondition(serverError)).toBe(false);
    });
  });
});
