/**
 * @file tests/unit/paymentMethods-final-coverage.test.ts
 * @description Tests for paymentMethods resource class using real instances
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('PaymentMethods - Final Coverage Tests', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('toQorPayCreate method - valid schema testing', () => {
    it('should handle card payment method with valid data', async () => {
      // Create a request with valid card data that passes schema validation
      const request = {
        customerId: 'cust_123',
        type: 'card' as const,
        card: {
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          name: 'Test User',
        },
      };

      const mockResponse = {
        status: 'success',
        id: 'pm_card_123',
        customer_id: 'cust_123',
        created_at: '2025-01-25T12:00:00Z',
        type: 'card',
        card_brand: 'visa',
        card_last4: '4242',
      };

      mockSuccessfulResponse(mockResponse);

      // Call create method which internally calls toQorPayCreate
      await client.paymentMethods.create(request);

      // Verify it calls post with the transformed card data
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/methods',
          data: {
            customer_id: 'cust_123',
            type: 'card',
            card_number: '4242424242424242',
            exp_month: '12',
            exp_year: '25',
            cvv: '123',
            name: 'Test User',
          },
        })
      );
    });

    it('should handle ach payment method with valid data', async () => {
      // Create a request with valid ach data that passes schema validation
      const request = {
        customerId: 'cust_456',
        type: 'ach' as const,
        ach: {
          accountNumber: '123456789012345678',
          routingNumber: '123456789',
          accountType: 'checking' as const,
          name: 'Test User',
        },
      };

      const mockResponse = {
        status: 'success',
        id: 'pm_ach_456',
        customer_id: 'cust_456',
        created_at: '2025-01-25T12:00:00Z',
        type: 'ach',
        ach_account_type: 'checking',
        ach_last4: '5678',
        ach_routing_number: '123456789',
      };

      mockSuccessfulResponse(mockResponse);

      await client.paymentMethods.create(request);

      // Should call with transformed ach data
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/methods',
          data: {
            customer_id: 'cust_456',
            type: 'ach',
            ach_account_number: '123456789012345678',
            ach_routing_number: '123456789',
            ach_account_type: 'checking',
            name: 'Test User',
          },
        })
      );
    });

    it('should handle payment method with metadata', async () => {
      // Create a request with metadata to test edge cases
      const request = {
        customerId: 'cust_789',
        type: 'card' as const,
        card: {
          number: '5555555555554444',
          expiryMonth: '10',
          expiryYear: '26',
          name: 'Test User',
        },
        metadata: {
          description: 'Test payment method',
          internal_id: 'internal_123',
          tags: ['test', 'coverage'],
        },
      };

      const mockResponse = {
        status: 'success',
        id: 'pm_card_metadata',
        customer_id: 'cust_789',
        created_at: '2025-01-25T12:00:00Z',
        type: 'card',
        card_brand: 'mastercard',
        card_last4: '4444',
      };

      mockSuccessfulResponse(mockResponse);

      await client.paymentMethods.create(request);

      // Should call with transformed card data (metadata not included in toQorPayCreate)
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/methods',
          data: {
            customer_id: 'cust_789',
            type: 'card',
            card_number: '5555555555554444',
            exp_month: '10',
            exp_year: '26',
            name: 'Test User',
            // Note: metadata is not included in toQorPayCreate transformation
          },
        })
      );
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

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.get('pm_minimal_123');

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

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.get('pm_ach_minimal');

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
