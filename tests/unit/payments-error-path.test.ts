/**
 * @file tests/unit/payments-error-path.test.ts
 * @description Tests for payments error path coverage using real instances
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import { QorPayApiError } from '../../src/errors';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
  expectApiCall,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

// Mock BaseClient properly

describe('Payments - Error Path Coverage', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('saleToken method - error handling', () => {
    it('should handle ZodError validation correctly', async () => {
      const saleTokenData = {
        amount: 'invalid-amount', // Invalid format - should match regex /^\d+(\.\d{1,2})?$/
        creditcard: 'tok_test123',
        customer_id: 123, // Invalid type - should be string
      };

      // This should be caught and converted to QorPayApiError due to schema validation
      await expect(client.payments.saleToken(saleTokenData)).rejects.toThrow(
        QorPayApiError
      );

      const error = await client.payments
        .saleToken(saleTokenData)
        .catch((e) => e);
      expect(error).toBeInstanceOf(QorPayApiError);
      expect(error.message).toContain('Validation failed:');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');

      // Verify post was NOT called since validation failed
      expect(mockAxiosInstance.request).not.toHaveBeenCalled();
    });

    it('should handle required field validation error', async () => {
      const saleTokenData = {
        amount: '10.00',
        // Missing required creditcard field
        customer_id: 'cust_test456',
      };

      // This should fail due to missing required field
      await expect(client.payments.saleToken(saleTokenData)).rejects.toThrow(
        QorPayApiError
      );

      const error = await client.payments
        .saleToken(saleTokenData)
        .catch((e) => e);
      expect(error).toBeInstanceOf(QorPayApiError);
      expect(error.message).toContain('Validation failed:');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');

      // Verify post was NOT called since validation failed
      expect(mockAxiosInstance.request).not.toHaveBeenCalled();
    });

    it('should handle network errors correctly', async () => {
      const saleTokenData = {
        amount: '10.00',
        creditcard: 'tok_test123',
        customer_id: 'cust_test456',
      };

      // Mock a network error response - the BaseClient should convert it to QorPayApiError
      mockFailedResponse('Network error', 500);

      // Should handle network errors properly through BaseClient error handling
      await expect(client.payments.saleToken(saleTokenData)).rejects.toThrow();

      // Verify post was called since validation passed
      expect(mockAxiosInstance.request).toHaveBeenCalled();
    });

    it('should handle valid request successfully', async () => {
      const saleTokenData = {
        amount: '10.00',
        creditcard: 'tok_test123',
        customer_id: 'cust_test456',
      };

      const expectedRequestData = {
        transaction_data: saleTokenData,
      };

      const mockResponse = {
        id: 'sale_123',
        amount: '10.00',
        creditcard: 'tok_test123',
        customer_id: 'cust_test456',
        status: 'completed',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.saleToken(saleTokenData);

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/sale/token',
          data: expectedRequestData,
        })
      );
    });
  });
});
