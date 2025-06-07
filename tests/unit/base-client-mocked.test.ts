/**
 * @file tests/unit/base-client-mocked.test.ts
 * @description Unit tests for the BaseClient class using mocked axios
 */

import { BaseClient } from '../../src/client/base-client';
import { 
  QorPayApiError, 
  QorPayNetworkError, 
  QorPayUnknownError 
} from '../../src/errors';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Mock axios module for this test file only
jest.mock('axios');

// Create mock response function type
type MockResponseFn = (config: AxiosRequestConfig) => Promise<AxiosResponse>;

// Create a type for our mock axios instance
interface MockAxiosInstance extends AxiosInstance {
  // Add mock implementation properties
  mockReset: () => void;
  mockResolvedValueOnce: (value: any) => MockAxiosInstance;
  mockRejectedValueOnce: (error: any) => MockAxiosInstance;
  mockResolvedValue: (value: any) => MockAxiosInstance;
  mockRejectedValue: (value: any) => MockAxiosInstance;
  mockImplementation: (fn: MockResponseFn) => MockAxiosInstance;
  mockImplementationOnce: (fn: MockResponseFn) => MockAxiosInstance;
}

// Create the mock response interceptor
const mockResponseInterceptorUse = jest.fn();
const mockRequestInterceptorUse = jest.fn();

// Create the mock axios instance
const mockAxiosInstance = {
  // HTTP methods
  request: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  
  // Interceptors
  interceptors: {
    request: {
      use: mockRequestInterceptorUse,
      eject: jest.fn()
    },
    response: {
      use: mockResponseInterceptorUse,
      eject: jest.fn()
    }
  },
  
  // Default headers and config
  defaults: {
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {}
    },
    timeout: 0,
    baseURL: ''
  },

  // Helper to reset all mocks
  mockReset() {
    jest.clearAllMocks();
    return this;
  }
} as unknown as MockAxiosInstance;

// Set up axios.create mock
const axiosCreateSpy = jest.spyOn(axios, 'create').mockReturnValue(mockAxiosInstance);

// Helper functions for mocking responses
function resetAxiosMocks(): void {
  mockAxiosInstance.request.mockClear();
  mockAxiosInstance.get.mockClear();
  mockAxiosInstance.post.mockClear();
  mockAxiosInstance.put.mockClear();
  mockAxiosInstance.delete.mockClear();
  mockAxiosInstance.patch.mockClear();
  mockResponseInterceptorUse.mockClear();
  mockRequestInterceptorUse.mockClear();
}

function mockSuccessResponse(responseData: any, status = 200): void {
  const response = {
    data: responseData,
    status,
    statusText: status === 200 ? 'OK' : 'Created',
    headers: {},
    config: {}
  };
  
  mockAxiosInstance.request.mockResolvedValue(response);
  mockAxiosInstance.get.mockResolvedValue(response);
  mockAxiosInstance.post.mockResolvedValue(response);
  mockAxiosInstance.put.mockResolvedValue(response);
  mockAxiosInstance.delete.mockResolvedValue(response);
  mockAxiosInstance.patch.mockResolvedValue(response);
}

function mockErrorResponse(errorData: any, status = 400): void {
  const error = {
    response: {
      data: errorData,
      status,
      statusText: 'Error',
      headers: {},
      config: {}
    }
  };
  
  mockAxiosInstance.request.mockRejectedValue(error);
  mockAxiosInstance.get.mockRejectedValue(error);
  mockAxiosInstance.post.mockRejectedValue(error);
  mockAxiosInstance.put.mockRejectedValue(error);
  mockAxiosInstance.delete.mockRejectedValue(error);
  mockAxiosInstance.patch.mockRejectedValue(error);
}

function mockNetworkError(message = 'Network Error'): void {
  const error = new Error(message);
  error.name = 'NetworkError';
  
  mockAxiosInstance.request.mockRejectedValue(error);
  mockAxiosInstance.get.mockRejectedValue(error);
  mockAxiosInstance.post.mockRejectedValue(error);
  mockAxiosInstance.put.mockRejectedValue(error);
  mockAxiosInstance.delete.mockRejectedValue(error);
  mockAxiosInstance.patch.mockRejectedValue(error);
}

describe('BaseClient (Mocked)', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetAxiosMocks();
    axiosCreateSpy.mockClear();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });

      expect(client).toBeInstanceOf(BaseClient);
      expect(axiosCreateSpy).toHaveBeenCalled();
    });

    it('should initialize with sandbox environment by default', () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });

      expect(axiosCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('sandbox-api.qorcommerce.io')
        })
      );
    });

    it('should initialize with production environment when specified', () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production'
      });

      expect(axiosCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('api.qorcommerce.io')
        })
      );
    });

    it('should use custom baseURL when provided', () => {
      const customUrl = 'https://custom-api.example.com';
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL: customUrl
      });

      expect(axiosCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: customUrl
        })
      );
    });
  });

  describe('authentication headers', () => {
    it('should include authentication headers in axios instance defaults', () => {
      const appKey = 'test-app-key';
      const clientKey = 'test-client-key';
      
      new BaseClient({ appKey, clientKey });

      expect(axiosCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Qor-App-Key': appKey,
            'Qor-Client-Key': clientKey
          })
        })
      );
    });

    it('should merge custom headers with authentication headers', () => {
      const appKey = 'test-app-key';
      const clientKey = 'test-client-key';
      const customHeader = 'custom-value';
      
      new BaseClient({
        appKey,
        clientKey,
        headers: { 'Custom-Header': customHeader }
      });

      expect(axiosCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Qor-App-Key': appKey,
            'Qor-Client-Key': clientKey,
            'Custom-Header': customHeader
          })
        })
      );
    });
  });

  describe('HTTP methods', () => {
    const client = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    });

    const mockSuccessData = { 
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: { id: '123' }
    };

    it('should make GET requests correctly', async () => {
      mockSuccessResponse(mockSuccessData);

      const params = { key: 'value' };
      const result = await client.get('/test', params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/test',
          params
        })
      );
      expect(result).toEqual(mockSuccessData);
    });

    it('should make POST requests correctly', async () => {
      mockSuccessResponse(mockSuccessData);

      const data = { name: 'Test' };
      const result = await client.post('/test', data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/test',
          data
        })
      );
      expect(result).toEqual(mockSuccessData);
    });

    it('should make PUT requests correctly', async () => {
      mockSuccessResponse(mockSuccessData);

      const data = { name: 'Updated Test' };
      const result = await client.put('/test/123', data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/test/123',
          data
        })
      );
      expect(result).toEqual(mockSuccessData);
    });

    it('should make DELETE requests correctly', async () => {
      mockSuccessResponse(mockSuccessData);

      const params = { reason: 'test' };
      const result = await client.delete('/test/123', params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/test/123',
          params
        })
      );
      expect(result).toEqual(mockSuccessData);
    });
  });

  describe('error handling', () => {
    let client: BaseClient;
    
    beforeEach(() => {
      client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });
      
      // Set up the interceptor
      const responseSuccessInterceptor = mockResponseInterceptorUse.mock.calls[0][0];
      const responseErrorInterceptor = mockResponseInterceptorUse.mock.calls[0][1];
      
      // Override request implementation to simulate the interceptor behavior
      mockAxiosInstance.request.mockImplementation(async (config) => {
        try {
          // Get the original mock implementation result
          const response = await Promise.resolve({
            data: config.mockResponse || { status: 'ok' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
          });
          
          // Pass through success interceptor
          return responseSuccessInterceptor(response);
        } catch (error) {
          // Pass through error interceptor
          return responseErrorInterceptor(error);
        }
      });
    });

    it('should handle API errors with error status codes', async () => {
      // Set up the mock to return an error response
      const errorData = {
        status: 'error',
        code: 'GW01',
        message: 'Invalid request'
      };
      
      mockErrorResponse(errorData, 400);

      await expect(client.get('/test')).rejects.toThrow(QorPayApiError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: expect.stringContaining('Invalid request'),
        statusCode: 400,
        errorCode: 'GW01'
      });
    });

    it('should handle API errors with success status codes but error status in body', async () => {
      // Set up the mock to return a success response with error status in body
      const errorData = {
        status: 'error',
        code: 'GW02',
        message: 'Business logic error'
      };
      
      // Use mockSuccessResponse but with error data
      // The response interceptor should detect the error status and reject
      mockSuccessResponse(errorData, 200);

      await expect(client.get('/test')).rejects.toThrow(QorPayApiError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: expect.stringContaining('Business logic error'),
        errorCode: 'GW02'
      });
    });

    it('should handle network errors', async () => {
      // Use the mockNetworkError utility
      mockNetworkError('Connection timeout');

      await expect(client.get('/test')).rejects.toThrow(QorPayNetworkError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: expect.stringContaining('Network Error')
      });
    });

    it('should handle unknown errors', async () => {
      // Create an unknown error (no response or request property)
      const error = new Error('Unknown Error');
      mockAxiosInstance.request.mockRejectedValueOnce(error);

      await expect(client.get('/test')).rejects.toThrow(QorPayUnknownError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: expect.stringContaining('Unknown Error')
      });
    });
  });

  describe('response handling', () => {
    const client = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    });

    it('should return the response data directly', async () => {
      const responseData = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: { id: '123', name: 'Test' }
      };

      mockSuccessResponse(responseData);

      const result = await client.get('/test');
      expect(result).toEqual(responseData);
    });

    it('should handle empty response bodies', async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: {}
      });

      const result = await client.delete('/test/123');
      expect(result).toBeNull();
    });
  });

  describe('timeout configuration', () => {
    it('should use default timeout when not specified', () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });

      // Default timeout should be set in axios instance
      expect(axiosCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000 // Default is 30 seconds
        })
      );
    });

    it('should use custom timeout when specified', () => {
      const customTimeout = 60000; // 60 seconds
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        timeout: customTimeout
      });

      // Custom timeout should be set in axios instance
      expect(axiosCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: customTimeout
        })
      );
    });
  });

  describe('URL handling', () => {
    it('should handle paths with or without leading slash', async () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });

      mockSuccessResponse({ status: 'ok' });

      // Path with leading slash
      await client.get('/test');
      expect(mockAxiosInstance.request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: '/test' // BaseClient should normalize this
        })
      );

      // Path without leading slash
      await client.get('test');
      expect(mockAxiosInstance.request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: '/test' // BaseClient should normalize this
        })
      );
    });
  });

  describe('environment and base URL methods', () => {
    it('should return the correct environment', () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production'
      });

      expect(client.getEnvironment()).toBe('production');
    });

    it('should return the correct base URL', () => {
      const baseURL = 'https://custom-api.example.com';
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL
      });

      expect(client.getBaseURL()).toBe(baseURL);
    });
  });
});
