/**
 * @file tests/unit/paymentMethods-coverage.test.ts
 * @description Coverage tests for PaymentMethods resource to achieve 100% coverage
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

describe('PaymentMethods - Coverage Tests', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('create with card method', () => {
    it('should create card payment method with all fields', async () => {
      const request = {
        customerId: 'cust_123',
        type: 'card' as const,
        card: {
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '26',
          cvv: '123',
          name: 'John Doe',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_card_123',
          type: 'card',
          customer_id: 'cust_123',
          created_at: '2025-01-25T12:00:00Z',
          card_brand: 'visa',
          card_last4: '4242',
          exp_month: '12',
          exp_year: '26',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.create(request);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/methods',
          data: {
            customer_id: 'cust_123',
            type: 'card',
            card_number: '4242424242424242',
            exp_month: '12',
            exp_year: '26',
            cvv: '123',
            name: 'John Doe',
          },
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('create with ACH method', () => {
    it('should create ACH payment method with all fields', async () => {
      const request = {
        customerId: 'cust_456',
        type: 'ach' as const,
        ach: {
          accountNumber: '123456789',
          routingNumber: '021000021',
          accountType: 'checking' as const,
          name: 'John Doe',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_ach_456',
          type: 'ach',
          customer_id: 'cust_456',
          created_at: '2025-01-25T12:00:00Z',
          ach_account_type: 'checking',
          ach_account_last4: '6789',
          ach_routing_number: '021000021',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.create(request);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/methods',
          data: {
            customer_id: 'cust_456',
            type: 'ach',
            ach_account_number: '123456789',
            ach_routing_number: '021000021',
            ach_account_type: 'checking',
            name: 'John Doe',
          },
        })
      );
      expect(result).toBeDefined();
    });

    it('should create ACH payment method without optional name', async () => {
      const request = {
        customerId: 'cust_789',
        type: 'ach' as const,
        ach: {
          accountNumber: '987654321',
          routingNumber: '021000021',
          accountType: 'savings' as const,
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_ach_789',
          type: 'ach',
          customer_id: 'cust_789',
          created_at: '2025-01-25T12:00:00Z',
          ach_account_type: 'savings',
          ach_account_last4: '4321',
          ach_routing_number: '021000021',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.create(request);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/methods',
          data: {
            customer_id: 'cust_789',
            type: 'ach',
            ach_account_number: '987654321',
            ach_routing_number: '021000021',
            ach_account_type: 'savings',
          },
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('list method', () => {
    it('should list payment methods for a customer', async () => {
      const customerId = 'cust_123';

      const mockResponse = {
        status: 'success',
        data: {
          methods: [
            {
              id: 'pm_123',
              type: 'card',
              customer_id: 'cust_123',
              created_at: '2025-01-25T12:00:00Z',
              card_brand: 'visa',
              card_last4: '4242',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.list(customerId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/methods/${customerId}`,
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('update method', () => {
    it('should update a payment method', async () => {
      const updateData = {
        id: 'pm_123',
        card: {
          expiryMonth: '12',
          expiryYear: '28',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_123',
          type: 'card',
          customer_id: 'cust_123',
          created_at: '2025-01-25T12:00:00Z',
          updated_at: '2025-01-25T12:30:00Z',
          exp_month: '12',
          exp_year: '28',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.update(updateData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/payments/methods/pm_123',
          data: {
            id: 'pm_123',
            exp_month: '12',
            exp_year: '28',
          },
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('delete method', () => {
    it('should delete a payment method', async () => {
      const paymentMethodId = 'pm_123';

      const mockResponse = {
        status: 'success',
        message: 'Payment method deleted successfully',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.delete(paymentMethodId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: `/payments/methods/${paymentMethodId}`,
        })
      );
      expect(result).toBeUndefined();
    });
  });

  describe('get method', () => {
    it('should get a payment method by ID', async () => {
      const paymentMethodId = 'pm_123';

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_123',
          type: 'card',
          customer_id: 'cust_123',
          created_at: '2025-01-25T12:00:00Z',
          card_brand: 'visa',
          card_last4: '4242',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.paymentMethods.get(paymentMethodId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/methods/${paymentMethodId}`,
        })
      );
      expect(result).toBeDefined();
    });
  });
});
