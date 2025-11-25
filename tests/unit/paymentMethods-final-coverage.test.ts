/**
 * @file tests/unit/paymentMethods-final-coverage.test.ts
 * @description Final coverage tests for PaymentMethods to reach 100%
 */

import { PaymentMethods } from '../../src/resources/paymentMethods';
import { BaseClient } from '../../src/client/base-client';
import type { CreatePaymentMethodRequest } from '../../src/types';

// Mock BaseClient properly
jest.mock('../../src/client/base-client');

// Mock the schemas to avoid validation errors
jest.mock('../../src/schemas/paymentMethods', () => ({
  CreatePaymentMethodSchema: {
    parse: jest.fn((data) => data), // Just return the data as-is
  },
  UpdatePaymentMethodSchema: {
    parse: jest.fn((data) => data),
  },
  ListExpiringPaymentMethodsSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('PaymentMethods - Final Coverage Tests', () => {
  let paymentMethods: PaymentMethods;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    mockBaseClient = new BaseClient({
      appKey: 'test-key',
      clientKey: 'test-secret',
    }) as jest.Mocked<BaseClient>;

    paymentMethods = new PaymentMethods(mockBaseClient);

    // Mock the client methods
    mockBaseClient.post = jest.fn();
    mockBaseClient.get = jest.fn();
    mockBaseClient.patch = jest.fn();
    mockBaseClient.delete = jest.fn();
  });

  describe('toQorPayCreate method - line 174 coverage', () => {
    it('should handle unknown payment method type (line 174 fallback)', async () => {
      // Create a request with an unknown type that doesn't match card or ach
      const request: CreatePaymentMethodRequest = {
        customerId: 'cust_123',
        type: 'unknown' as any, // Force an unknown type
      };

      const mockResponse = {
        status: 'success',
        id: 'pm_unknown_123',
        customer_id: 'cust_123',
        created_at: '2025-01-25T12:00:00Z',
        type: 'unknown',
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      // Call create method which internally calls toQorPayCreate
      await paymentMethods.create(request);

      // Verify it calls post with just the base payload (line 174)
      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/methods', {
        customer_id: 'cust_123',
        type: 'unknown',
      });
    });

    it('should handle request with type but no card or ach data', async () => {
      // Create a request with card type but no card object
      const request: CreatePaymentMethodRequest = {
        customerId: 'cust_456',
        type: 'card',
        // No card property provided
      };

      const mockResponse = {
        status: 'success',
        id: 'pm_card_no_data',
        customer_id: 'cust_456',
        created_at: '2025-01-25T12:00:00Z',
        type: 'card',
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      await paymentMethods.create(request);

      // Should fall back to base payload (line 174)
      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/methods', {
        customer_id: 'cust_456',
        type: 'card',
      });
    });

    it('should handle request with ach type but no ach data', async () => {
      // Create a request with ach type but no ach object
      const request: CreatePaymentMethodRequest = {
        customerId: 'cust_789',
        type: 'ach',
        // No ach property provided
      };

      const mockResponse = {
        status: 'success',
        id: 'pm_ach_no_data',
        customer_id: 'cust_789',
        created_at: '2025-01-25T12:00:00Z',
        type: 'ach',
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      await paymentMethods.create(request);

      // Should fall back to base payload (line 174)
      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/methods', {
        customer_id: 'cust_789',
        type: 'ach',
      });
    });
  });

  describe('fromQorPay method edge cases', () => {
    it('should handle payment method with missing optional fields', async () => {
      const mockResponse = {
        status: 'success',
        id: 'pm_minimal_123',
        customer_id: 'cust_123',
        created_at: '2025-01-25T12:00:00Z',
        type: 'card',
        // Missing optional fields like card_brand, card_last4, etc.
      };

      mockBaseClient.get.mockResolvedValue(mockResponse);

      const result = await paymentMethods.get('pm_minimal_123');

      expect(result).toEqual({
        id: 'pm_minimal_123',
        customerId: 'cust_123',
        createdAt: new Date('2025-01-25T12:00:00Z'),
        type: 'card',
        card: {
          brand: '',
          last4: '',
          expiryMonth: '',
          expiryYear: '',
        },
      });
    });

    it('should handle ACH payment method with all fields missing', async () => {
      const mockResponse = {
        status: 'success',
        id: 'pm_ach_minimal',
        customer_id: 'cust_456',
        created_at: '2025-01-25T12:00:00Z',
        type: 'ach',
        // All ACH fields are optional and missing
      };

      mockBaseClient.get.mockResolvedValue(mockResponse);

      const result = await paymentMethods.get('pm_ach_minimal');

      expect(result).toEqual({
        id: 'pm_ach_minimal',
        customerId: 'cust_456',
        createdAt: new Date('2025-01-25T12:00:00Z'),
        type: 'ach',
        ach: {
          accountType: 'checking',
          last4: '',
          routingNumber: '',
          bankName: undefined,
        },
      });
    });
  });
});
