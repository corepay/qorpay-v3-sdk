/**
 * @file tests/unit/payment-methods.test.ts
 * @description Tests for PaymentMethods resource class using real instances
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

describe('PaymentMethods', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockPaymentMethodResponse = {
    status: 'success',
    code: '200',
    message: 'Payment method created successfully',
    reference_id: 'ref_123',
    id: 'pm_123',
    type: 'card',
    customer_id: 'cust_123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    card_brand: 'visa',
    card_last4: '4242',
    exp_month: '12',
    exp_year: '25',
  };

  const mockAchPaymentMethodResponse = {
    status: 'success',
    code: '200',
    message: 'Payment method created successfully',
    reference_id: 'ref_123',
    id: 'pm_ach_123',
    type: 'ach',
    customer_id: 'cust_123',
    created_at: '2023-01-01T00:00:00Z',
    ach_account_type: 'checking',
    ach_account_last4: '6789',
    ach_routing_number: '021000021',
    ach_bank_name: 'Test Bank',
  };

  const mockPaymentMethodsListResponse = {
    status: 'success',
    code: '200',
    message: 'Payment methods retrieved successfully',
    reference_id: 'ref_123',
    data: {
      methods: [
        {
          id: 'pm_123',
          type: 'card',
          customer_id: 'cust_123',
          created_at: '2023-01-01T00:00:00Z',
          card_brand: 'visa',
          card_last4: '4242',
          exp_month: '12',
          exp_year: '25',
        },
        {
          id: 'pm_456',
          type: 'ach',
          customer_id: 'cust_456',
          created_at: '2023-01-01T00:00:00Z',
          ach_account_type: 'checking',
          ach_account_last4: '6789',
          ach_routing_number: '021000021',
        },
      ],
      total: 2,
      has_more: false,
    },
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize payment methods resource', () => {
      expect(client.paymentMethods).toBeDefined();
      expect(typeof client.paymentMethods.create).toBe('function');
      expect(typeof client.paymentMethods.get).toBe('function');
      expect(typeof client.paymentMethods.list).toBe('function');
      expect(typeof client.paymentMethods.update).toBe('function');
      expect(typeof client.paymentMethods.delete).toBe('function');
    });
  });

  describe('create', () => {
    it('should create a card payment method successfully', async () => {
      const methodData = {
        customerId: 'cust_123',
        type: 'card' as const,
        card: {
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '25', // 2-digit format for validation
          cvv: '123',
        },
      };

      mockSuccessfulResponse(mockPaymentMethodResponse);

      const result = await client.paymentMethods.create(methodData);

      // Check that the result is properly transformed
      expect(result.id).toBe('pm_123');
      expect(result.type).toBe('card');
      expect(result.customerId).toBe('cust_123');
      expect(result.card?.brand).toBe('visa');
      expect(result.card?.last4).toBe('4242');
      expect(result.card?.expiryMonth).toBe('12');
      expect(result.card?.expiryYear).toBe('25');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/methods',
          data: expect.objectContaining({
            customer_id: 'cust_123',
            type: 'card',
            card_number: '4242424242424242',
            exp_month: '12',
            exp_year: '25',
          }),
        })
      );
    });

    it('should create an ACH payment method successfully', async () => {
      const methodData = {
        customerId: 'cust_123',
        type: 'ach' as const,
        ach: {
          accountNumber: '123456789',
          routingNumber: '021000021',
          accountType: 'checking',
        },
      };

      mockSuccessfulResponse(mockAchPaymentMethodResponse);

      const result = await client.paymentMethods.create(methodData);

      // Check that the result is properly transformed
      expect(result.id).toBe('pm_ach_123');
      expect(result.type).toBe('ach');
      expect(result.customerId).toBe('cust_123');
      expect(result.ach?.accountType).toBe('checking');
      expect(result.ach?.last4).toBe('6789');
      expect(result.ach?.routingNumber).toBe('021000021');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/methods',
          data: expect.objectContaining({
            customer_id: 'cust_123',
            type: 'ach',
            ach_account_number: '123456789',
            ach_routing_number: '021000021',
            ach_account_type: 'checking',
          }),
        })
      );
    });

    it('should throw ZodError when validation fails', async () => {
      const invalidData = {
        customerId: 'cust_123',
        type: 'invalid_type',
        // Missing required fields
      };

      await expect(
        client.paymentMethods.create(invalidData as any)
      ).rejects.toThrow();
    });

    it('should propagate API errors', async () => {
      const methodData = {
        customerId: 'cust_123',
        type: 'card' as const,
        card: {
          number: 'invalid_card',
          expiryMonth: '12',
          expiryYear: '25',
        },
      };

      mockFailedResponse('Invalid card number', 400);

      await expect(client.paymentMethods.create(methodData)).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should retrieve a payment method successfully', async () => {
      const methodId = 'pm_123';

      mockSuccessfulResponse(mockPaymentMethodResponse);

      const result = await client.paymentMethods.get(methodId);

      // Check that the result is properly transformed
      expect(result.id).toBe('pm_123');
      expect(result.type).toBe('card');
      expect(result.customerId).toBe('cust_123');
      expect(result.card?.brand).toBe('visa');
      expect(result.card?.last4).toBe('4242');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/methods/${methodId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Payment method not found', 404);

      await expect(
        client.paymentMethods.get('invalid-method')
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list payment methods for a customer', async () => {
      const customerId = 'cust_123';

      mockSuccessfulResponse(mockPaymentMethodsListResponse);

      const result = await client.paymentMethods.list(customerId);

      // Check that the result is properly transformed
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('pm_123');
      expect(result.data[0].type).toBe('card');
      expect(result.data[1].id).toBe('pm_456');
      expect(result.data[1].type).toBe('ach');
      expect(result.pagination.total).toBe(2);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/methods/${customerId}`,
        })
      );
    });

    it('should use default pagination when no params provided', async () => {
      const customerId = 'cust_123';
      mockSuccessfulResponse(mockPaymentMethodsListResponse);

      const result = await client.paymentMethods.list(customerId);

      expect(result.pagination.limit).toBe(50);
      expect(result.pagination.offset).toBe(0);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/methods/${customerId}`,
        })
      );
    });

    it('should handle empty methods array', async () => {
      const emptyResponse = {
        status: 'success',
        data: { methods: [], total: 0, has_more: false },
      };

      mockSuccessfulResponse(emptyResponse);

      const result = await client.paymentMethods.list('cust_123');

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve payment methods', 500);

      await expect(client.paymentMethods.list('cust_123')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a card payment method successfully', async () => {
      const updateData = {
        id: 'pm_123',
        card: {
          expiryMonth: '06',
          expiryYear: '26',
        },
      };

      // Mock response with updated data
      const updatedResponse = {
        ...mockPaymentMethodResponse,
        exp_month: '06',
        exp_year: '26',
      };

      mockSuccessfulResponse(updatedResponse);

      const result = await client.paymentMethods.update(updateData);

      // Check that the result is properly transformed
      expect(result.id).toBe('pm_123');
      expect(result.type).toBe('card');
      expect(result.card?.expiryMonth).toBe('06');
      expect(result.card?.expiryYear).toBe('26');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: `/payments/methods/${updateData.id}`,
          data: expect.objectContaining({
            id: 'pm_123',
            exp_month: '06',
            exp_year: '26',
          }),
        })
      );
    });

    it('should update an ACH payment method name successfully', async () => {
      const updateData = {
        id: 'pm_ach_123',
        ach: {
          name: 'John Doe',
        },
      };

      mockSuccessfulResponse(mockAchPaymentMethodResponse);

      const result = await client.paymentMethods.update(updateData);

      // Check that the result is properly transformed
      expect(result.id).toBe('pm_ach_123');
      expect(result.type).toBe('ach');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: `/payments/methods/${updateData.id}`,
          data: expect.objectContaining({
            id: 'pm_ach_123',
            name: 'John Doe',
          }),
        })
      );
    });

    it('should throw ZodError when validation fails', async () => {
      const invalidData = {
        // Missing required id field
        card: {
          expiryMonth: '06',
        },
      };

      await expect(
        client.paymentMethods.update(invalidData as any)
      ).rejects.toThrow();
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Payment method not found', 404);

      const updateData = {
        id: 'invalid-method',
        card: {
          expiryMonth: '06',
        },
      };

      await expect(client.paymentMethods.update(updateData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a payment method successfully', async () => {
      const methodId = 'pm_123';

      // delete returns void, so we mock a simple success response
      mockSuccessfulResponse({
        status: 'success',
        message: 'Payment method deleted',
      });

      const result = await client.paymentMethods.delete(methodId);

      // delete method returns void, so result should be undefined
      expect(result).toBeUndefined();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: `/payments/methods/${methodId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Cannot delete payment method', 400);

      await expect(client.paymentMethods.delete('pm_123')).rejects.toThrow();
    });
  });

  describe('listExpiring', () => {
    it('should list expiring payment methods with params', async () => {
      const params = {
        withinMonths: 3,
        limit: 25,
      };

      mockSuccessfulResponse(mockPaymentMethodsListResponse);

      const result = await client.paymentMethods.listExpiring(params);

      // Check that the result is properly transformed
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('pm_123');
      expect(result.data[0].type).toBe('card');
      expect(result.pagination.limit).toBe(25);
      expect(result.pagination.total).toBe(2);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/methods/expiring',
          params: expect.objectContaining({
            withinMonths: 3,
            limit: 25,
          }),
        })
      );
    });

    it('should list expiring payment methods without params', async () => {
      mockSuccessfulResponse(mockPaymentMethodsListResponse);

      const result = await client.paymentMethods.listExpiring();

      // Check that the result is properly transformed
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(2);
      expect(result.pagination.limit).toBe(50); // default limit

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/methods/expiring',
        })
      );
    });

    it('should throw ZodError when params validation fails', async () => {
      const invalidParams = {
        withinMonths: 25, // exceeds max of 24
      };

      await expect(
        client.paymentMethods.listExpiring(invalidParams as any)
      ).rejects.toThrow();
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve expiring payment methods', 500);

      await expect(client.paymentMethods.listExpiring()).rejects.toThrow();
    });
  });

  describe('transformation helpers', () => {
    it('should handle payment method response without optional fields', async () => {
      const minimalResponse = {
        status: 'success',
        code: '200',
        message: 'Payment method retrieved successfully',
        id: 'pm_123',
        type: 'card',
        customer_id: 'cust_123',
        created_at: '2023-01-01T00:00:00Z',
        // Missing optional card fields
      };

      mockSuccessfulResponse(minimalResponse);

      const result = await client.paymentMethods.get('pm_123');

      expect(result.id).toBe('pm_123');
      expect(result.type).toBe('card');
      expect(result.customerId).toBe('cust_123');
      expect(result.card?.brand).toBe('');
      expect(result.card?.last4).toBe('');
    });

    it('should handle payment method response with ACH type', async () => {
      mockSuccessfulResponse(mockAchPaymentMethodResponse);

      const result = await client.paymentMethods.get('pm_ach_123');

      expect(result.type).toBe('ach');
      expect(result.ach?.accountType).toBe('checking');
      expect(result.ach?.last4).toBe('6789');
      expect(result.ach?.routingNumber).toBe('021000021');
      expect(result.ach?.bankName).toBe('Test Bank');
    });
  });
});
