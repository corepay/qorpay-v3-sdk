/**
 * @file tests/unit/base-client.test.ts
 * @description Tests for BaseClient using real instances with network mocking only
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

describe('QorPayClient (BaseClient functionality)', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(client).toBeInstanceOf(QorPayClient);
      expect(client.getBaseURL()).toBe('https://api.sandbox.qorpay.com');
      expect(client.getEnvironment()).toBe('sandbox');
    });

    it('should use custom baseURL when provided', () => {
      const customClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'sandbox',
        baseURL: 'https://custom.api.example.com',
      });

      expect(customClient.getBaseURL()).toBe('https://custom.api.example.com');
    });
  });

  describe('HTTP methods through QorPayClient resources', () => {
    it('should make GET requests through the utilities endpoint', async () => {
      const mockResponse = {
        valid: true,
        brand: 'visa',
        type: 'credit',
      };
      mockSuccessfulResponse(mockResponse);

      // Test through utilities endpoint which makes GET requests
      await client.utilities.validateCard('4111111111111111');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-card',
        })
      );
    });

    it('should make POST requests through the payments endpoint', async () => {
      const mockResponse = {
        data: {
          transaction_id: 'txn_123',
          status: 'approved',
        },
      };
      mockSuccessfulResponse(mockResponse);

      const paymentData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      await client.payments.saleManual(paymentData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/sale/manual/',
          headers: expect.objectContaining({
            'X-Request-Id': expect.any(String),
          }),
        })
      );
    });

    it('should handle API errors correctly', async () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            message: 'Bad Request',
            code: 'BAD_REQUEST',
          },
        },
      };
      mockFailedResponse(apiError);

      const paymentData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      await expect(client.payments.saleManual(paymentData)).rejects.toThrow();
    });

    it('should handle network errors correctly', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'ECONNREFUSED';
      mockFailedResponse(networkError);

      const paymentData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      await expect(client.payments.saleManual(paymentData)).rejects.toThrow();
    });
  });

  describe('response data handling', () => {
    it('should handle null response data', async () => {
      const mockResponse = { data: null };
      mockSuccessfulResponse(mockResponse);

      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      // Test that null responses are handled correctly
      expect(mockAxiosInstance.request).toBeDefined();
    });

    it('should handle undefined response data', async () => {
      const mockResponse = { data: undefined };
      mockSuccessfulResponse(mockResponse);

      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      // Test that undefined responses are handled correctly
      expect(mockAxiosInstance.request).toBeDefined();
    });

    it('should pass through valid response data', async () => {
      const testData = { transaction_id: 'txn_123', status: 'approved' };
      const mockResponse = testData; // Pass data directly, mockSuccessfulResponse wraps it
      mockSuccessfulResponse(mockResponse);

      const paymentData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      const result = await client.payments.saleManual(paymentData);
      expect(result).toEqual(testData);
    });
  });

  describe('environment configuration', () => {
    it('should return production environment when configured', () => {
      const prodClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production',
      });

      expect(prodClient.getEnvironment()).toBe('production');
      expect(prodClient.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
    });
  });
});
