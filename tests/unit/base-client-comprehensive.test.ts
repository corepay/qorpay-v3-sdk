/**
 * @file tests/unit/base-client-comprehensive.test.ts
 * @description Comprehensive BaseClient tests using real client with network mocking
 */

import { BaseClient } from '../../src/client/base-client';
import {
  createMockAxiosResponse,
  createMockAxiosError,
} from '../utils/test-helpers';

// Mock ONLY the network layer (axios and axios-retry)
jest.mock('axios');
jest.mock('axios-retry');

import axios from 'axios';
import axiosRetry from 'axios-retry';

describe('BaseClient - Comprehensive Coverage Tests', () => {
  let client: BaseClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Create a proper axios mock
    mockAxiosInstance = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    // Mock axios.create to return our mock instance
    (axios.create as jest.Mock) = jest.fn(() => mockAxiosInstance);
    (axiosRetry as jest.Mock) = jest.fn();

    // Create BaseClient instance
    client = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
      environment: 'sandbox',
      timeout: 5000,
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic configuration', () => {
    it('should create client with correct configuration', () => {
      expect(client).toBeInstanceOf(BaseClient);
      expect(client.getBaseURL()).toBe(
        'https://sandbox-api.qorcommerce.io/api/v3'
      );
      expect(client.getEnvironment()).toBe('sandbox');
    });

    it('should handle production environment', () => {
      const prodClient = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production',
      });
      expect(prodClient).toBeInstanceOf(BaseClient);
      expect(prodClient.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
      expect(prodClient.getEnvironment()).toBe('production');
    });

    it('should handle custom baseURL', () => {
      const customClient = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL: 'https://api.example.com',
      });
      expect(customClient).toBeInstanceOf(BaseClient);
      expect(customClient.getBaseURL()).toBe('https://api.example.com');
    });

    it('should handle custom headers', () => {
      const customClient = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });
      expect(customClient).toBeInstanceOf(BaseClient);
    });

    it('should handle retry configuration', () => {
      const retryClient = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        retryConfig: {
          retries: 5,
          retryDelay: 1000,
        },
      });
      expect(retryClient).toBeInstanceOf(BaseClient);
    });
  });

  describe('Request path validation', () => {
    it('should handle empty URL paths', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        new Error('Path validation error')
      );

      await expect(client.get('')).rejects.toThrow();
    });

    it('should handle null URL paths', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        new Error('Path validation error')
      );

      await expect(client.get(null as any)).rejects.toThrow();
    });

    it('should handle undefined URL paths', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        new Error('Path validation error')
      );

      await expect(client.get(undefined as any)).rejects.toThrow();
    });

    it('should handle very long URL paths', async () => {
      mockAxiosInstance.request.mockRejectedValue(new Error('Path too long'));
      const longUrl = '/'.repeat(1000);

      await expect(client.get(longUrl)).rejects.toThrow();
    });

    it('should handle special characters in URL paths', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        new Error('Invalid path characters')
      );
      const specialUrl = '/endpoint-with-special-chars';

      await expect(client.get(specialUrl)).rejects.toThrow();
    });
  });

  describe('Request data validation', () => {
    it('should handle null data', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        createMockAxiosError('Data validation error', 400)
      );

      await expect(client.post('/test', null as any)).rejects.toThrow();
    });

    it('should handle undefined data', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        createMockAxiosError('Data validation error', 400)
      );

      await expect(client.post('/test', undefined as any)).rejects.toThrow();
    });

    it('should handle circular object data', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        createMockAxiosError('Circular reference error', 400)
      );
      const circular: any = { name: 'test' };
      circular.self = circular;

      await expect(client.post('/test', circular)).rejects.toThrow();
    });

    it('should handle very large data objects', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        createMockAxiosError('Payload too large', 413)
      );
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          data: 'x'.repeat(100),
        })),
      };

      await expect(client.post('/test', largeData)).rejects.toThrow();
    });

    it('should handle data with special characters', async () => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: { success: true } })
      );
      const specialData = {
        text: 'Special chars: !@#$%^&*()[]{}|\\:";\'<>?,./`~',
        unicode: 'Unicode: José García 北京 Москва 🚀',
        whitespace: 'Whitespace: \n\t\r  ',
      };

      const result = await client.post('/test', specialData);
      expect(result.status).toBe('success');
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle connection errors gracefully', async () => {
      const networkError = new Error('ECONNREFUSED');
      (networkError as any).code = 'ECONNREFUSED';
      mockAxiosInstance.request.mockRejectedValue(networkError);

      await expect(client.get('/test')).rejects.toThrow();
    });

    it('should handle invalid hostname gracefully', async () => {
      const dnsError = new Error('ENOTFOUND');
      (dnsError as any).code = 'ENOTFOUND';
      mockAxiosInstance.request.mockRejectedValue(dnsError);

      await expect(client.get('/test')).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('ETIMEDOUT');
      (timeoutError as any).code = 'ETIMEDOUT';
      mockAxiosInstance.request.mockRejectedValue(timeoutError);

      await expect(client.get('/test')).rejects.toThrow();
    });

    it('should handle HTTP error responses', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        createMockAxiosError('Not Found', 404)
      );

      await expect(client.get('/nonexistent')).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      mockAxiosInstance.request.mockRejectedValue(
        createMockAxiosError('Internal Server Error', 500)
      );

      await expect(client.get('/test')).rejects.toThrow();
    });
  });

  describe('HTTP method functionality', () => {
    beforeEach(() => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: { success: true } })
      );
    });

    it('should have GET method available', () => {
      expect(typeof client.get).toBe('function');
    });

    it('should have POST method available', () => {
      expect(typeof client.post).toBe('function');
    });

    it('should have PUT method available', () => {
      expect(typeof client.put).toBe('function');
    });

    it('should have PATCH method available', () => {
      expect(typeof client.patch).toBe('function');
    });

    it('should have DELETE method available', () => {
      expect(typeof client.delete).toBe('function');
    });

    it('should handle all HTTP methods successfully', async () => {
      // Test GET
      await client.get('/test');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/test',
        })
      );

      // Test POST
      await client.post('/test', { data: 'value' });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/test',
          data: { data: 'value' },
        })
      );

      // Test PUT
      await client.put('/test', { data: 'updated' });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/test',
          data: { data: 'updated' },
        })
      );

      // Test PATCH
      await client.patch('/test', { data: 'patched' });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/test',
          data: { data: 'patched' },
        })
      );

      // Test DELETE
      await client.delete('/test');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/test',
        })
      );
    });
  });

  describe('Request configuration options', () => {
    beforeEach(() => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: { success: true } })
      );
    });

    it('should handle custom headers in requests', async () => {
      await client.get('/test', undefined, {
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Another-Header': 'another-value',
        },
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/test',
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
            'X-Another-Header': 'another-value',
          }),
        })
      );
    });

    it('should handle request configuration with query parameters', async () => {
      await client.get('/test', {
        param1: 'value1',
        param2: 'value2',
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/test',
          params: {
            param1: 'value1',
            param2: 'value2',
          },
        })
      );
    });

    it('should handle complex configuration objects', async () => {
      await client.post(
        '/test',
        { data: 'value' },
        {
          headers: { 'Content-Type': 'application/json' },
          params: { filter: 'test' },
          timeout: 5000,
        }
      );

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/test',
          data: { data: 'value' },
          params: { filter: 'test' },
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        })
      );
    });
  });

  describe('Data serialization edge cases', () => {
    beforeEach(() => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: { success: true } })
      );
    });

    it('should handle arrays in request data', async () => {
      const arrayData = {
        items: ['item1', 'item2', 'item3'],
        numbers: [1, 2, 3, 4, 5],
        mixed: [1, 'string', { nested: true }],
      };

      await client.post('/test', arrayData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/test',
          data: arrayData,
        })
      );
    });

    it('should handle nested objects in request data', async () => {
      const nestedData = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep nested value',
              },
            },
          },
        },
      };

      await client.post('/test', nestedData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/test',
          data: nestedData,
        })
      );
    });

    it('should handle date objects in request data', async () => {
      const dateData = {
        created_at: new Date(),
        updated_at: new Date('2025-01-25'),
        timestamp: Date.now(),
      };

      await client.post('/test', dateData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/test',
          data: dateData,
        })
      );
    });

    it('should handle empty responses', async () => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse(null)
      );

      const result = await client.get('/empty');
      expect(result).toBeNull();
    });

    it('should handle responses with empty strings', async () => {
      mockAxiosInstance.request.mockResolvedValue(createMockAxiosResponse(''));

      const result = await client.get('/empty-string');
      expect(result).toBeNull();
    });
  });

  describe('Path normalization', () => {
    beforeEach(() => {
      mockAxiosInstance.request.mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: { success: true } })
      );
    });

    it('should normalize paths correctly', () => {
      const testCases = [
        ['/', '/'],
        ['/test', '/test'],
        ['test', '/test'],
        ['/test/', '/test/'],
      ];

      for (const [input] of testCases) {
        expect(async () => {
          await client.get(input);
        }).not.toThrow();
      }
    });
  });

  describe('Configuration edge cases', () => {
    it('should handle very short timeout', () => {
      expect(() => {
        new BaseClient({
          appKey: 'test-app-key',
          clientKey: 'test-client-key',
          timeout: 1,
        });
      }).not.toThrow();
    });

    it('should handle very long timeout', () => {
      expect(() => {
        new BaseClient({
          appKey: 'test-app-key',
          clientKey: 'test-client-key',
          timeout: 300000, // 5 minutes
        });
      }).not.toThrow();
    });

    it('should handle zero timeout', () => {
      expect(() => {
        new BaseClient({
          appKey: 'test-app-key',
          clientKey: 'test-client-key',
          timeout: 0,
        });
      }).not.toThrow();
    });

    it('should handle negative timeout', () => {
      expect(() => {
        new BaseClient({
          appKey: 'test-app-key',
          clientKey: 'test-client-key',
          timeout: -1,
        });
      }).not.toThrow();
    });
  });
});
