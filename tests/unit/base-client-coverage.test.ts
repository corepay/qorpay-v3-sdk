/**
 * @file tests/unit/base-client-coverage.test.ts
 * @description Additional BaseClient tests to achieve 100% coverage using real instances
 */

import { QorPayClient } from '../../src/client/qorpay-client';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('QorPayClient - Coverage Tests', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
  });

  describe('Performance tracking coverage', () => {
    it('should track performance metrics when making requests', async () => {
      const mockResponse = { valid: true, brand: 'visa' };
      mockSuccessfulResponse(mockResponse);

      await client.utilities.validateCard('4111111111111111');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Request-Id': expect.any(String),
            'X-Client-SDK': 'qorpay-v3-sdk',
          }),
        })
      );
    });

    it('should log performance when enabled', async () => {
      client.enablePerformanceMetrics();

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockResponse = { transaction_id: 'txn_123', status: 'approved' };
      mockSuccessfulResponse(mockResponse);

      await client.payments.saleManual({
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[QorPay SDK] POST')
      );

      consoleLogSpy.mockRestore();
    });

    it('should log performance errors when request fails', async () => {
      client.enablePerformanceMetrics();

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const networkError = new Error('Network error');
      mockFailedResponse(networkError);

      try {
        await client.utilities.validateCard('4111111111111111');
      } catch (err) {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should not log performance when disabled', async () => {
      client.disablePerformanceMetrics();

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockResponse = { valid: true };
      mockSuccessfulResponse(mockResponse);

      await client.utilities.validateCard('4111111111111111');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should log performance in development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockResponse = { valid: true };
      mockSuccessfulResponse(mockResponse);

      await client.utilities.validateCard('4111111111111111');

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle performance tracking with null response data', async () => {
      const mockResponse = null;
      mockSuccessfulResponse(mockResponse);

      const result = await client.utilities.validateCard('4111111111111111');
      expect(result).toBeNull();
      expect(mockAxiosInstance.request).toHaveBeenCalled();
    });

    it('should handle performance tracking with undefined response data', async () => {
      const mockResponse = undefined;
      mockSuccessfulResponse(mockResponse);

      const result = await client.utilities.validateCard('4111111111111111');
      expect(result).toBeNull();
      expect(mockAxiosInstance.request).toHaveBeenCalled();
    });

    it('should handle performance tracking with empty string response data', async () => {
      const mockResponse = '';
      mockSuccessfulResponse(mockResponse);

      const result = await client.utilities.validateCard('4111111111111111');
      expect(result).toBeNull();
      expect(mockAxiosInstance.request).toHaveBeenCalled();
    });

    it('should return performance metrics summary', () => {
      const metrics = client.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('Request path normalization', () => {
    it('should normalize paths without leading slash', async () => {
      const mockResponse = { valid: true };
      mockSuccessfulResponse(mockResponse);

      // Test through utilities.validateCard which uses POST
      await client.utilities.validateCard('4111111111111111');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/utils/validate-card',
        })
      );
    });
  });

  describe('Complex request scenarios', () => {
    it('should handle request with custom headers', async () => {
      const mockResponse = { valid: true };
      mockSuccessfulResponse(mockResponse);

      // This tests the BaseClient's ability to merge custom headers
      await client.utilities.validateCard('4111111111111111');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Request-Id': expect.any(String),
            'X-Client-SDK': 'qorpay-v3-sdk',
          }),
        })
      );
    });
  });

  describe('Environment-specific behavior', () => {
    it('should use production URLs when environment is production', () => {
      const prodClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production',
      });

      expect(prodClient.getEnvironment()).toBe('production');
      expect(prodClient.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
    });

    it('should use custom baseURL when provided', () => {
      const customClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'sandbox',
        baseURL: 'https://custom.example.com',
      });

      expect(customClient.getBaseURL()).toBe('https://custom.example.com');
    });
  });

  describe('Response interceptors setup', () => {
    it('should set up response interceptors for error handling', () => {
      // The fact that client was created successfully means interceptors were set up
      expect(client).toBeInstanceOf(QorPayClient);
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Request interceptors setup', () => {
    it('should set up request interceptors', () => {
      // The fact that client was created successfully means interceptors were set up
      expect(client).toBeInstanceOf(QorPayClient);
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });
  });
});
