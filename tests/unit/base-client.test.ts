import axios from 'axios';
import { BaseClient } from '../../src/client/base-client';
import { 
  QorPayApiError, 
  QorPayNetworkError, 
  QorPayUnknownError 
} from '../../src/errors';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BaseClient', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });

      expect(client).toBeInstanceOf(BaseClient);
    });

    it('should initialize with sandbox environment by default', () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });

      // @ts-ignore - accessing private property for testing
      expect(client.baseURL).toContain('sandbox-api.qorcommerce.io');
    });

    it('should initialize with production environment when specified', () => {
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production'
      });

      // @ts-ignore - accessing private property for testing
      expect(client.baseURL).toContain('api.qorcommerce.io');
    });

    it('should use custom baseURL when provided', () => {
      const customUrl = 'https://custom-api.example.com';
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL: customUrl
      });

      // @ts-ignore - accessing private property for testing
      expect(client.baseURL).toBe(customUrl);
    });
  });

  describe('authentication headers', () => {
    it('should include authentication headers in requests', async () => {
      const appKey = 'test-app-key';
      const clientKey = 'test-client-key';
      const client = new BaseClient({ appKey, clientKey });

      mockedAxios.request.mockResolvedValueOnce({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      await client.get('/test');

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Qor-App-Key': appKey,
            'Qor-Client-Key': clientKey
          })
        })
      );
    });

    it('should merge custom headers with authentication headers', async () => {
      const appKey = 'test-app-key';
      const clientKey = 'test-client-key';
      const customHeader = 'custom-value';
      
      const client = new BaseClient({
        appKey,
        clientKey,
        headers: { 'Custom-Header': customHeader }
      });

      mockedAxios.request.mockResolvedValueOnce({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      await client.get('/test');

      expect(mockedAxios.request).toHaveBeenCalledWith(
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

    const mockSuccessResponse = {
      data: { 
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: { id: '123' }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    it('should make GET requests correctly', async () => {
      mockedAxios.request.mockResolvedValueOnce(mockSuccessResponse);

      const params = { key: 'value' };
      const result = await client.get('/test', params);

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/test'),
          params
        })
      );
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should make POST requests correctly', async () => {
      mockedAxios.request.mockResolvedValueOnce(mockSuccessResponse);

      const data = { name: 'Test' };
      const result = await client.post('/test', data);

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: expect.stringContaining('/test'),
          data
        })
      );
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should make PUT requests correctly', async () => {
      mockedAxios.request.mockResolvedValueOnce(mockSuccessResponse);

      const data = { name: 'Updated Test' };
      const result = await client.put('/test/123', data);

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: expect.stringContaining('/test/123'),
          data
        })
      );
      expect(result).toEqual(mockSuccessResponse.data);
    });

    it('should make DELETE requests correctly', async () => {
      mockedAxios.request.mockResolvedValueOnce(mockSuccessResponse);

      const params = { reason: 'test' };
      const result = await client.delete('/test/123', params);

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: expect.stringContaining('/test/123'),
          params
        })
      );
      expect(result).toEqual(mockSuccessResponse.data);
    });
  });

  describe('error handling', () => {
    const client = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    });

    it('should handle API errors with error status codes', async () => {
      const errorResponse = {
        response: {
          data: {
            status: 'error',
            code: 'GW01',
            message: 'Invalid request'
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {}
        }
      };

      mockedAxios.request.mockRejectedValueOnce(errorResponse);

      await expect(client.get('/test')).rejects.toThrow(QorPayApiError);
      await expect(client.get('/test')).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'GW01'
      });
    });

    it('should handle API errors with success status codes but error status in body', async () => {
      const errorResponse = {
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

      mockedAxios.request.mockResolvedValueOnce(errorResponse);

      await expect(client.get('/test')).rejects.toThrow(QorPayApiError);
      await expect(client.get('/test')).rejects.toMatchObject({
        errorCode: 'GW02'
      });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      
      mockedAxios.request.mockRejectedValueOnce(networkError);

      await expect(client.get('/test')).rejects.toThrow(QorPayNetworkError);
    });

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Unknown Error');
      
      mockedAxios.request.mockRejectedValueOnce(unknownError);

      await expect(client.get('/test')).rejects.toThrow(QorPayUnknownError);
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

      mockedAxios.request.mockResolvedValueOnce({
        data: responseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      const result = await client.get('/test');
      expect(result).toEqual(responseData);
    });

    it('should handle empty response bodies', async () => {
      mockedAxios.request.mockResolvedValueOnce({
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

      // Default timeout should be set
      // @ts-ignore - accessing private property for testing
      expect(client.timeout).toBeDefined();
    });

    it('should use custom timeout when specified', () => {
      const customTimeout = 60000; // 60 seconds
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        timeout: customTimeout
      });

      // @ts-ignore - accessing private property for testing
      expect(client.timeout).toBe(customTimeout);
    });

    it('should apply timeout to requests', async () => {
      const customTimeout = 60000; // 60 seconds
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        timeout: customTimeout
      });

      mockedAxios.request.mockResolvedValueOnce({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      await client.get('/test');

      expect(mockedAxios.request).toHaveBeenCalledWith(
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
        clientKey: 'test-client-key',
        baseURL: 'https://api.example.com'
      });

      mockedAxios.request.mockResolvedValue({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      });

      // Path with leading slash
      await client.get('/test');
      expect(mockedAxios.request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/test'
        })
      );

      // Path without leading slash
      await client.get('test');
      expect(mockedAxios.request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/test'
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

      // @ts-ignore - accessing method that might be private
      expect(client.getEnvironment()).toBe('production');
    });

    it('should return the correct base URL', () => {
      const baseURL = 'https://custom-api.example.com';
      const client = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL
      });

      // @ts-ignore - accessing method that might be private
      expect(client.getBaseURL()).toBe(baseURL);
    });
  });
});
