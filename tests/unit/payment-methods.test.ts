/**
 * @file tests/unit/payment-methods.test.ts
 * @description Unit tests for PaymentMethods resource class
 */

import { PaymentMethods } from '../../src/resources/paymentMethods';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import type {
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
  PaymentMethod,
  PaymentMethodListResponse,
  ListExpiringPaymentMethodsParams,
} from '../../src/types/paymentMethods';

// Mock dependencies
jest.mock('../../src/client/base-client');
jest.mock('../../src/schemas', () => ({
  CreatePaymentMethodSchema: {
    parse: jest.fn((data) => data),
  },
  UpdatePaymentMethodSchema: {
    parse: jest.fn((data) => data),
  },
  ListExpiringPaymentMethodsSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('PaymentMethods', () => {
  let paymentMethods: PaymentMethods;
  let mockClient: jest.Mocked<BaseClient>;

  const mockPaymentMethodResponse = {
    id: 'pm_123456',
    type: 'card',
    customer_id: 'cust_789',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    card_brand: 'visa',
    card_last4: '4242',
    exp_month: '12',
    exp_year: '25',
    metadata: { custom_field: 'value' },
  };

  const mockPaymentMethodListResponse = {
    status: 'success',
    code: '200',
    message: 'Payment methods retrieved',
    reference_id: 'ref_123',
    data: {
      methods: [mockPaymentMethodResponse],
      total: 1,
      has_more: false,
    },
  };

  beforeEach(() => {
    mockClient = new BaseClient({ appKey: 'test', clientKey: 'test' }) as jest.Mocked<BaseClient>;
    paymentMethods = new PaymentMethods(mockClient);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with BaseClient instance', () => {
      expect(paymentMethods['client']).toBe(mockClient);
    });
  });

  describe('create', () => {
    it('should create a card payment method successfully', async () => {
      const cardData: CreatePaymentMethodRequest = {
        customerId: 'cust_789',
        type: 'card',
        card: {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          name: 'John Doe',
        },
      };

      mockClient.post.mockResolvedValue(mockPaymentMethodResponse);

      const result = await paymentMethods.create(cardData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/methods', {
        customer_id: 'cust_789',
        type: 'card',
        card_number: '4111111111111111',
        exp_month: '12',
        exp_year: '25',
        cvv: '123',
        name: 'John Doe',
      });
      expect(result).toEqual({
        id: 'pm_123456',
        type: 'card',
        customerId: 'cust_789',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        card: {
          brand: 'visa',
          last4: '4242',
          expiryMonth: '12',
          expiryYear: '25',
        },
        metadata: { custom_field: 'value' },
      });
    });

    it('should create an ACH payment method successfully', async () => {
      const achData: CreatePaymentMethodRequest = {
        customerId: 'cust_789',
        type: 'ach',
        ach: {
          accountNumber: '123456789',
          routingNumber: '021000021',
          accountType: 'checking',
          name: 'Jane Doe',
        },
      };

      const achResponse = {
        ...mockPaymentMethodResponse,
        type: 'ach',
        ach_account_type: 'checking',
        ach_account_last4: '6789',
        ach_routing_number: '021000021',
        ach_bank_name: 'Chase Bank',
      };

      mockClient.post.mockResolvedValue(achResponse);

      const result = await paymentMethods.create(achData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/methods', {
        customer_id: 'cust_789',
        type: 'ach',
        ach_account_number: '123456789',
        ach_routing_number: '021000021',
        ach_account_type: 'checking',
        name: 'Jane Doe',
      });
      expect(result).toEqual({
        id: 'pm_123456',
        type: 'ach',
        customerId: 'cust_789',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        ach: {
          accountType: 'checking',
          last4: '6789',
          routingNumber: '021000021',
          bankName: 'Chase Bank',
        },
        metadata: { custom_field: 'value' },
      });
    });

    it('should throw ZodError when validation fails', async () => {
      const invalidData: CreatePaymentMethodRequest = {
        customerId: 'cust_789',
        type: 'card',
        // Missing required card object
      };

      let error: Error;
      try {
        await paymentMethods.create(invalidData);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ZodError');
    });

    it('should propagate API errors', async () => {
      const cardData: CreatePaymentMethodRequest = {
        customerId: 'cust_789',
        type: 'card',
        card: {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '25',
        },
      };

      const apiError = new QorPayApiError('Payment method creation failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(paymentMethods.create(cardData)).rejects.toThrow(apiError);
    });
  });

  describe('get', () => {
    it('should retrieve a payment method successfully', async () => {
      const paymentMethodId = 'pm_123456';

      mockClient.get.mockResolvedValue(mockPaymentMethodResponse);

      const result = await paymentMethods.get(paymentMethodId);

      expect(mockClient.get).toHaveBeenCalledWith('/payments/methods/pm_123456');
      expect(result).toEqual({
        id: 'pm_123456',
        type: 'card',
        customerId: 'cust_789',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        card: {
          brand: 'visa',
          last4: '4242',
          expiryMonth: '12',
          expiryYear: '25',
        },
        metadata: { custom_field: 'value' },
      });
    });

    it('should propagate API errors', async () => {
      const paymentMethodId = 'pm_invalid';

      const apiError = new QorPayApiError('Payment method not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentMethods.get(paymentMethodId)).rejects.toThrow(apiError);
    });
  });

  describe('list', () => {
    it('should list payment methods for a customer', async () => {
      const customerId = 'cust_789';
      const params = { limit: 10, offset: 0 };

      mockClient.get.mockResolvedValue(mockPaymentMethodListResponse);

      const result = await paymentMethods.list(customerId, params);

      expect(mockClient.get).toHaveBeenCalledWith('/payments/methods/cust_789', params);
      expect(result).toEqual({
        status: 'success',
        code: '200',
        message: 'Payment methods retrieved',
        reference_id: 'ref_123',
        data: [{
          id: 'pm_123456',
          type: 'card',
          customerId: 'cust_789',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          card: {
            brand: 'visa',
            last4: '4242',
            expiryMonth: '12',
            expiryYear: '25',
          },
          metadata: { custom_field: 'value' },
        }],
        pagination: {
          limit: 10,
          offset: 0,
          total: 1,
          hasMore: false,
        },
      });
    });

    it('should use default pagination when no params provided', async () => {
      const customerId = 'cust_789';

      mockClient.get.mockResolvedValue(mockPaymentMethodListResponse);

      await paymentMethods.list(customerId);

      expect(mockClient.get).toHaveBeenCalledWith('/payments/methods/cust_789', undefined);
    });

    it('should handle empty methods array', async () => {
      const customerId = 'cust_empty';
      const emptyResponse = {
        ...mockPaymentMethodListResponse,
        data: { methods: [], total: 0, has_more: false },
      };

      mockClient.get.mockResolvedValue(emptyResponse);

      const result = await paymentMethods.list(customerId);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should propagate API errors', async () => {
      const customerId = 'cust_invalid';

      const apiError = new QorPayApiError('Customer not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentMethods.list(customerId)).rejects.toThrow(apiError);
    });
  });

  describe('update', () => {
    it('should update a card payment method successfully', async () => {
      const updateData: UpdatePaymentMethodRequest = {
        id: 'pm_123456',
        card: {
          expiryMonth: '12',
          expiryYear: '26',
          name: 'John Smith',
        },
        metadata: { updated: true },
      };

      const updatedResponse = {
        ...mockPaymentMethodResponse,
        updated_at: '2024-01-02T00:00:00Z',
        exp_month: '12',
        exp_year: '26',
      };

      mockClient.patch.mockResolvedValue(updatedResponse);

      const result = await paymentMethods.update(updateData);

      expect(mockClient.patch).toHaveBeenCalledWith('/payments/methods/pm_123456', {
        id: 'pm_123456',
        exp_month: '12',
        exp_year: '26',
        name: 'John Smith',
        metadata: { updated: true },
      });
      expect(result).toEqual({
        id: 'pm_123456',
        type: 'card',
        customerId: 'cust_789',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        card: {
          brand: 'visa',
          last4: '4242',
          expiryMonth: '12',
          expiryYear: '26',
        },
        metadata: { custom_field: 'value' },
      });
    });

    it('should update an ACH payment method name successfully', async () => {
      const updateData: UpdatePaymentMethodRequest = {
        id: 'pm_123456',
        ach: {
          name: 'Jane Smith',
        },
      };

      mockClient.patch.mockResolvedValue(mockPaymentMethodResponse);

      await paymentMethods.update(updateData);

      expect(mockClient.patch).toHaveBeenCalledWith('/payments/methods/pm_123456', {
        id: 'pm_123456',
        name: 'Jane Smith',
      });
    });

    it('should throw ZodError when validation fails', async () => {
      const invalidData = {
        id: undefined as any, // Invalid undefined ID
      };

      let error: Error;
      try {
        await paymentMethods.update(invalidData);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ZodError');
    });

    it('should propagate API errors', async () => {
      const updateData: UpdatePaymentMethodRequest = {
        id: 'pm_invalid',
      };

      const apiError = new QorPayApiError('Payment method not found', 404);
      mockClient.patch.mockRejectedValue(apiError);

      await expect(paymentMethods.update(updateData)).rejects.toThrow(apiError);
    });
  });

  describe('delete', () => {
    it('should delete a payment method successfully', async () => {
      const paymentMethodId = 'pm_123456';

      mockClient.delete.mockResolvedValue({ status: 'success' });

      await paymentMethods.delete(paymentMethodId);

      expect(mockClient.delete).toHaveBeenCalledWith('/payments/methods/pm_123456');
    });

    it('should propagate API errors', async () => {
      const paymentMethodId = 'pm_invalid';

      const apiError = new QorPayApiError('Payment method not found', 404);
      mockClient.delete.mockRejectedValue(apiError);

      await expect(paymentMethods.delete(paymentMethodId)).rejects.toThrow(apiError);
    });
  });

  describe('listExpiring', () => {
    it('should list expiring payment methods with params', async () => {
      const params: ListExpiringPaymentMethodsParams = {
        limit: 20,
        offset: 0,
        withinMonths: 3,
      };

      mockClient.get.mockResolvedValue(mockPaymentMethodListResponse);

      const result = await paymentMethods.listExpiring(params);

      expect(mockClient.get).toHaveBeenCalledWith('/payments/methods/expiring', params);
      expect(result).toEqual({
        status: 'success',
        code: '200',
        message: 'Payment methods retrieved',
        reference_id: 'ref_123',
        data: [{
          id: 'pm_123456',
          type: 'card',
          customerId: 'cust_789',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          card: {
            brand: 'visa',
            last4: '4242',
            expiryMonth: '12',
            expiryYear: '25',
          },
          metadata: { custom_field: 'value' },
        }],
        pagination: {
          limit: 20,
          offset: 0,
          total: 1,
          hasMore: false,
        },
      });
    });

    it('should list expiring payment methods without params', async () => {
      mockClient.get.mockResolvedValue(mockPaymentMethodListResponse);

      await paymentMethods.listExpiring();

      expect(mockClient.get).toHaveBeenCalledWith('/payments/methods/expiring', undefined);
    });

    it('should throw ZodError when params validation fails', async () => {
      const invalidParams = {
        withinMonths: -1, // Invalid negative value
      };

      let error: Error;
      try {
        await paymentMethods.listExpiring(invalidParams);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ZodError');
    });

    it('should propagate API errors', async () => {
      const params: ListExpiringPaymentMethodsParams = {
        limit: 10,
      };

      const apiError = new QorPayApiError('Failed to list expiring methods', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentMethods.listExpiring(params)).rejects.toThrow(apiError);
    });
  });

  describe('transformation helpers', () => {
    it('should handle payment method response without optional fields', async () => {
      const minimalResponse = {
        id: 'pm_minimal',
        type: 'card',
        customer_id: 'cust_minimal',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockClient.get.mockResolvedValue(minimalResponse);

      const result = await paymentMethods.get('pm_minimal');

      expect(result).toEqual({
        id: 'pm_minimal',
        type: 'card',
        customerId: 'cust_minimal',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: undefined,
        card: {
          brand: '',
          last4: '',
          expiryMonth: '',
          expiryYear: '',
        },
      });
    });

    it('should handle payment method response with ACH type', async () => {
      const achResponse = {
        id: 'pm_ach',
        type: 'ach',
        customer_id: 'cust_ach',
        created_at: '2024-01-01T00:00:00Z',
        ach_account_type: 'savings',
        ach_account_last4: '1234',
        ach_routing_number: '987654321',
        ach_bank_name: 'Bank of America',
      };

      mockClient.get.mockResolvedValue(achResponse);

      const result = await paymentMethods.get('pm_ach');

      expect(result).toEqual({
        id: 'pm_ach',
        type: 'ach',
        customerId: 'cust_ach',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: undefined,
        ach: {
          accountType: 'savings',
          last4: '1234',
          routingNumber: '987654321',
          bankName: 'Bank of America',
        },
      });
    });
  });
});