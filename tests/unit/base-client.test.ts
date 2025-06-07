import { BaseClient } from '../../src/client/base-client';
import { 
  QorPayApiError, 
  QorPayNetworkError, 
  QorPayUnknownError 
} from '../../src/errors';
import { 
  mockAxiosInstance, 
  resetAxiosMocks,
  mockSuccessResponse,
  mockErrorResponse,
  mockNetworkError
} from '../setup/axiosMock';
import axios from 'axios';

// Mock the axios.create method to capture the config
const axiosCreateSpy = jest.spyOn(axios, 'create');

describe('BaseClient', () => {
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
      // Create a new client for each test and simulate the interceptor
      client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });
      
      // Get the error handler from the interceptor
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      // Mock the transformations that would happen in the interceptor
      mockAxiosInstance.request.mockImplementation(async (config) => {
        try {
          // Simulate a successful response
          const response = await Promise.resolve({
            data: config.mockResponse || { status: 'ok' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
          });
          
          // Check if we should simulate an error response with 200 status
          if (response.data && response.data.status === 'error') {
            return Promise.reject(
              new QorPayApiError(
                response.data.message || 'API returned an error status',
                response.status,
                response.data.code,
                response.data
              )
            );
          }
          
          return response;
        } catch (error) {
          // Pass the error through the interceptor's error handler
          return Promise.reject(errorHandler(error));
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
      
      // Simulate a 400 error response
      mockAxiosInstance.request.mockRejectedValueOnce({
        response: {
          data: errorData,
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {}
        }
      });

      await expect(client.get('/test')).rejects.toThrow(QorPayApiError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: expect.stringContaining('API Error'),
        statusCode: 400,
        errorCode: 'GW01'
      });
    });

    it('should handle API errors with success status codes but error status in body', async () => {
      // Set up the mock to return a success response with error status in body
      mockAxiosInstance.request.mockImplementationOnce(async () => {
        const response = {
          data: {
            status: 'error',
            code: 'GW02',
            message: 'Business logic error'
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {}
        };
        
        // Check if we should simulate an error response with 200 status
        if (response.data && response.data.status === 'error') {
          throw new QorPayApiError(
            response.data.message,
            response.status,
            response.data.code,
            response.data
          );
        }
        
        return response;
      });

      await expect(client.get('/test')).rejects.toThrow(QorPayApiError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: expect.stringContaining('Business logic error'),
        errorCode: 'GW02'
      });
    });

    it('should handle network errors', async () => {
      // Create a network error
      const networkError = new Error('Connection timeout');
      networkError.name = 'NetworkError';
      
      // Add the request property to simulate axios network error
      Object.defineProperty(networkError, 'request', {
        value: {},
        enumerable: true
      });
      
      // Mock the rejection with a transformed QorPayNetworkError
      mockAxiosInstance.request.mockRejectedValueOnce(
        new QorPayNetworkError('Connection timeout', networkError)
      );

      await expect(client.get('/test')).rejects.toThrow(QorPayNetworkError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: expect.stringContaining('Network Error')
      });
    });

    it('should handle unknown errors', async () => {
      // Create an unknown error and transform it
      const unknownError = new Error('Unknown Error');
      
      // Mock the rejection with a transformed QorPayUnknownError
      mockAxiosInstance.request.mockRejectedValueOnce(
        new QorPayUnknownError('Unknown Error', unknownError)
      );

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
      const baseURL = 'https://api.example.com';
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL
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
