/**
 * @file tests/unit/payment-methods.test.ts
 * @description Unit tests for the PaymentMethods resource module
 */

import { PaymentMethods } from '../../src/resources/paymentMethods';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import type {
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from '../../src/types/paymentMethods';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('PaymentMethods', () => {
  let paymentMethods: PaymentMethods;
  let mockClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Create the PaymentMethods instance with the mock client
    paymentMethods = new PaymentMethods(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCardRequest: CreatePaymentMethodRequest = {
      customerId: 'cust_123456',
      type: 'card',
      card: {
        number: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
        name: 'John Doe',
      },
    };

    const createAchRequest: CreatePaymentMethodRequest = {
      customerId: 'cust_123456',
      type: 'ach',
      ach: {
        accountNumber: '123456789',
        routingNumber: '021000021',
        accountType: 'checking',
        name: 'Jane Doe',
      },
    };

    const mockCardResponse = {
      status: 'success',
      code: 'GW00',
      message: 'Payment method created successfully',
      reference_id: 'ref_123',
      id: 'pm_card_123',
      type: 'card',
      customer_id: 'cust_123456',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      card_brand: 'visa',
      card_last4: '1111',
      exp_month: '12',
      exp_year: '25',
      metadata: { source: 'web' },
    };

    const mockAchResponse = {
      status: 'success',
      code: 'GW00',
      message: 'Payment method created successfully',
      reference_id: 'ref_124',
      id: 'pm_ach_123',
      type: 'ach',
      customer_id: 'cust_123456',
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
      ach_account_type: 'checking',
      ach_account_last4: '6789',
      ach_routing_number: '021000021',
      ach_bank_name: 'JPMORGAN CHASE',
      metadata: { source: 'web' },
    };

    it('should create a card payment method successfully', async () => {
      mockClient.post.mockResolvedValue(mockCardResponse);

      const result = await paymentMethods.create(createCardRequest);

      expect(mockClient.post).toHaveBeenCalledWith('/payment/methods', {
        customer_id: 'cust_123456',
        type: 'card',
        card_number: '4111111111111111',
        exp_month: '12',
        exp_year: '25',
        cvv: '123',
        name: 'John Doe',
      });

      expect(result.id).toBe('pm_card_123');
      expect(result.type).toBe('card');
      expect(result.customerId).toBe('cust_123456');
      expect(result.card?.brand).toBe('visa');
      expect(result.card?.last4).toBe('1111');
      expect(result.card?.expiryMonth).toBe('12');
      expect(result.card?.expiryYear).toBe('25');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.metadata).toEqual({ source: 'web' });
    });

    it('should create an ACH payment method successfully', async () => {
      mockClient.post.mockResolvedValue(mockAchResponse);

      const result = await paymentMethods.create(createAchRequest);

      expect(mockClient.post).toHaveBeenCalledWith('/payment/methods', {
        customer_id: 'cust_123456',
        type: 'ach',
        ach_account_number: '123456789',
        ach_routing_number: '021000021',
        ach_account_type: 'checking',
        name: 'Jane Doe',
      });

      expect(result.id).toBe('pm_ach_123');
      expect(result.type).toBe('ach');
      expect(result.customerId).toBe('cust_123456');
      expect(result.ach?.accountType).toBe('checking');
      expect(result.ach?.last4).toBe('6789');
      expect(result.ach?.routingNumber).toBe('021000021');
      expect(result.ach?.bankName).toBe('JPMORGAN CHASE');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.metadata).toEqual({ source: 'web' });
    });

    it('should handle API errors when creating a payment method', async () => {
      const apiError = new QorPayApiError(
        'Invalid payment method data',
        400,
        'INVALID_PAYMENT_METHOD'
      );
      mockClient.post.mockRejectedValue(apiError);

      await expect(paymentMethods.create(createCardRequest)).rejects.toThrow(
        QorPayApiError
      );
    });

    it('should validate request data', async () => {
      const invalidRequest = {
        customerId: '', // Empty string should fail validation
        type: 'invalid_type' as any,
      };

      // Zod validation should throw before the API call
      await expect(paymentMethods.create(invalidRequest)).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    const mockResponse = {
      status: 'success',
      code: 'GW00',
      message: 'Payment method retrieved successfully',
      reference_id: 'ref_125',
      id: 'pm_card_456',
      type: 'card',
      customer_id: 'cust_789',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T11:00:00Z',
      card_brand: 'mastercard',
      card_last4: '2222',
      exp_month: '09',
      exp_year: '26',
    };

    it('should get a payment method successfully', async () => {
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await paymentMethods.get('pm_card_456');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/methods/pm_card_456'
      );
      expect(result.id).toBe('pm_card_456');
      expect(result.type).toBe('card');
      expect(result.customerId).toBe('cust_789');
      expect(result.card?.brand).toBe('mastercard');
      expect(result.card?.last4).toBe('2222');
      expect(result.card?.expiryMonth).toBe('09');
      expect(result.card?.expiryYear).toBe('26');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle API errors when getting a payment method', async () => {
      const apiError = new QorPayApiError(
        'Payment method not found',
        404,
        'NOT_FOUND'
      );
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentMethods.get('pm_invalid')).rejects.toThrow(
        QorPayApiError
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/methods/pm_invalid'
      );
    });
  });

  describe('list', () => {
    const mockResponse = {
      status: 'success',
      code: 'GW00',
      message: 'Payment methods retrieved successfully',
      reference_id: 'ref_126',
      data: {
        methods: [
          {
            id: 'pm_card_1',
            type: 'card',
            customer_id: 'cust_123',
            created_at: '2024-01-15T10:30:00Z',
            card_brand: 'visa',
            card_last4: '1111',
            exp_month: '12',
            exp_year: '25',
          },
          {
            id: 'pm_ach_2',
            type: 'ach',
            customer_id: 'cust_123',
            created_at: '2024-01-15T11:00:00Z',
            ach_account_type: 'checking',
            ach_account_last4: '6789',
            ach_routing_number: '021000021',
            ach_bank_name: 'JPMORGAN CHASE',
          },
        ],
        total: 2,
        has_more: false,
      },
    };

    it('should list payment methods for a customer', async () => {
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await paymentMethods.list('cust_123');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/methods/cust_123',
        undefined
      );
      expect(result.data).toHaveLength(2);
      expect(result.status).toBe('success');
      expect(result.pagination.limit).toBe(50); // Default limit
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.hasMore).toBe(false);

      // Check first payment method (card)
      const cardMethod = result.data[0];
      expect(cardMethod.id).toBe('pm_card_1');
      expect(cardMethod.type).toBe('card');
      expect(cardMethod.card?.brand).toBe('visa');
      expect(cardMethod.card?.last4).toBe('1111');

      // Check second payment method (ACH)
      const achMethod = result.data[1];
      expect(achMethod.id).toBe('pm_ach_2');
      expect(achMethod.type).toBe('ach');
      expect(achMethod.ach?.accountType).toBe('checking');
      expect(achMethod.ach?.last4).toBe('6789');
      expect(achMethod.ach?.routingNumber).toBe('021000021');
    });

    it('should list payment methods with pagination parameters', async () => {
      mockClient.get.mockResolvedValue(mockResponse);

      const params = { limit: 10, offset: 20 };
      await paymentMethods.list('cust_123', params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/methods/cust_123',
        params
      );
    });

    it('should handle empty payment methods list', async () => {
      const emptyResponse = {
        status: 'success',
        code: 'GW00',
        message: 'Payment methods retrieved successfully',
        reference_id: 'ref_127',
        data: {
          methods: [],
          total: 0,
          has_more: false,
        },
      };

      mockClient.get.mockResolvedValue(emptyResponse);

      const result = await paymentMethods.list('cust_empty');

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should handle missing data gracefully', async () => {
      const missingDataResponse = {
        status: 'success',
        code: 'GW00',
        message: 'Payment methods retrieved successfully',
        reference_id: 'ref_128',
        // No data field
      };

      mockClient.get.mockResolvedValue(missingDataResponse);

      const result = await paymentMethods.list('cust_missing');

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should handle API errors when listing payment methods', async () => {
      const apiError = new QorPayApiError(
        'Customer not found',
        404,
        'CUSTOMER_NOT_FOUND'
      );
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentMethods.list('cust_invalid')).rejects.toThrow(
        QorPayApiError
      );
    });
  });

  describe('update', () => {
    const updateRequest: UpdatePaymentMethodRequest = {
      id: 'pm_card_123',
      card: {
        expiryMonth: '12',
        expiryYear: '26',
        name: 'John Updated',
      },
    };

    const mockResponse = {
      status: 'success',
      code: 'GW00',
      message: 'Payment method updated successfully',
      reference_id: 'ref_129',
      id: 'pm_card_123',
      type: 'card',
      customer_id: 'cust_123456',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T12:00:00Z',
      card_brand: 'visa',
      card_last4: '1111',
      exp_month: '12',
      exp_year: '26',
      metadata: { source: 'web' },
    };

    it('should update a payment method successfully', async () => {
      mockClient.patch.mockResolvedValue(mockResponse);

      const result = await paymentMethods.update(updateRequest);

      expect(mockClient.patch).toHaveBeenCalledWith(
        '/payment/methods/pm_card_123',
        {
          id: 'pm_card_123',
          exp_month: '12',
          exp_year: '26',
          name: 'John Updated',
        }
      );

      expect(result.id).toBe('pm_card_123');
      expect(result.card?.expiryMonth).toBe('12');
      expect(result.card?.expiryYear).toBe('26');
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should update ACH payment method name', async () => {
      const achUpdateRequest: UpdatePaymentMethodRequest = {
        id: 'pm_ach_123',
        ach: {
          name: 'Jane Updated',
        },
      };

      const achResponse = {
        ...mockResponse,
        id: 'pm_ach_123',
        type: 'ach',
        ach_account_type: 'checking',
        ach_account_last4: '6789',
        ach_routing_number: '021000021',
        ach_bank_name: 'JPMORGAN CHASE',
      };

      mockClient.patch.mockResolvedValue(achResponse);

      await paymentMethods.update(achUpdateRequest);

      expect(mockClient.patch).toHaveBeenCalledWith(
        '/payment/methods/pm_ach_123',
        {
          id: 'pm_ach_123',
          name: 'Jane Updated',
        }
      );
    });

    it('should update payment method metadata', async () => {
      const metadataUpdateRequest: UpdatePaymentMethodRequest = {
        id: 'pm_card_123',
        metadata: { tags: ['premium'], source: 'mobile' },
      };

      const responseWithMetadata = {
        ...mockResponse,
        metadata: { tags: ['premium'], source: 'mobile' },
      };

      mockClient.patch.mockResolvedValue(responseWithMetadata);

      await paymentMethods.update(metadataUpdateRequest);

      expect(mockClient.patch).toHaveBeenCalledWith(
        '/payment/methods/pm_card_123',
        {
          id: 'pm_card_123',
          metadata: { tags: ['premium'], source: 'mobile' },
        }
      );
    });

    it('should handle API errors when updating a payment method', async () => {
      const apiError = new QorPayApiError(
        'Payment method not found',
        404,
        'NOT_FOUND'
      );
      mockClient.patch.mockRejectedValue(apiError);

      await expect(paymentMethods.update(updateRequest)).rejects.toThrow(
        QorPayApiError
      );
    });

    it('should validate update request data', async () => {
      const invalidRequest = {
        id: null as any, // null should fail validation
      };

      await expect(paymentMethods.update(invalidRequest)).rejects.toThrow();
      expect(mockClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a payment method successfully', async () => {
      const mockResponse = {
        status: 'success',
        code: 'GW00',
        message: 'Payment method deleted successfully',
        reference_id: 'ref_130',
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      await paymentMethods.delete('pm_card_123');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/payment/methods/pm_card_123'
      );
    });

    it('should handle API errors when deleting a payment method', async () => {
      const apiError = new QorPayApiError(
        'Payment method not found',
        404,
        'NOT_FOUND'
      );
      mockClient.delete.mockRejectedValue(apiError);

      await expect(paymentMethods.delete('pm_invalid')).rejects.toThrow(
        QorPayApiError
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/payment/methods/pm_invalid'
      );
    });
  });

  describe('listExpiring', () => {
    const mockResponse = {
      status: 'success',
      code: 'GW00',
      message: 'Expiring payment methods retrieved successfully',
      reference_id: 'ref_131',
      data: {
        methods: [
          {
            id: 'pm_card_1',
            type: 'card',
            customer_id: 'cust_123',
            created_at: '2024-01-15T10:30:00Z',
            card_brand: 'visa',
            card_last4: '1111',
            exp_month: '02',
            exp_year: '25',
          },
          {
            id: 'pm_card_2',
            type: 'card',
            customer_id: 'cust_456',
            created_at: '2024-01-15T11:00:00Z',
            card_brand: 'mastercard',
            card_last4: '2222',
            exp_month: '03',
            exp_year: '25',
          },
        ],
        total: 2,
        has_more: false,
      },
    };

    it('should list expiring payment methods', async () => {
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await paymentMethods.listExpiring();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/methods/expiring',
        undefined
      );
      expect(result.data).toHaveLength(2);
      expect(result.status).toBe('success');
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.hasMore).toBe(false);

      // Verify both payment methods are cards and are expiring
      result.data.forEach((method) => {
        expect(method.type).toBe('card');
        expect(method.card).toBeDefined();
        expect(['02', '03']).toContain(method.card?.expiryMonth);
        expect(method.card?.expiryYear).toBe('25');
      });
    });

    it('should list expiring payment methods with parameters', async () => {
      const params = {
        withinMonths: 3,
        limit: 25,
        offset: 0,
      };

      mockClient.get.mockResolvedValue(mockResponse);

      await paymentMethods.listExpiring(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/methods/expiring',
        params
      );
    });

    it('should handle empty expiring methods list', async () => {
      const emptyResponse = {
        status: 'success',
        code: 'GW00',
        message: 'Expiring payment methods retrieved successfully',
        reference_id: 'ref_132',
        data: {
          methods: [],
          total: 0,
          has_more: false,
        },
      };

      mockClient.get.mockResolvedValue(emptyResponse);

      const result = await paymentMethods.listExpiring();

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should handle API errors when listing expiring payment methods', async () => {
      const apiError = new QorPayApiError(
        'Invalid parameters',
        400,
        'INVALID_PARAMETERS'
      );
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentMethods.listExpiring()).rejects.toThrow(
        QorPayApiError
      );
    });

    it('should validate listExpiring parameters', async () => {
      const invalidParams = {
        withinMonths: -1, // Negative months should fail validation
      };

      await expect(
        paymentMethods.listExpiring(invalidParams)
      ).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });

  describe('transformation methods', () => {
    it('should handle partial payment method data in fromQorPay', async () => {
      const partialResponse = {
        status: 'success',
        code: 'GW00',
        message: 'Payment method retrieved successfully',
        reference_id: 'ref_133',
        id: 'pm_partial',
        type: 'card',
        customer_id: 'cust_partial',
        created_at: '2024-01-15T10:30:00Z',
        // Only some fields present
        card_brand: 'visa',
        card_last4: '1111',
        // exp_month and exp_year missing
      };

      mockClient.get.mockResolvedValue(partialResponse);

      const result = await paymentMethods.get('pm_partial');

      expect(result.id).toBe('pm_partial');
      expect(result.type).toBe('card');
      expect(result.card?.brand).toBe('visa');
      expect(result.card?.last4).toBe('1111');
      // Note: The transformation sets empty strings as defaults for missing fields
      expect(result.card?.expiryMonth).toBe('');
      expect(result.card?.expiryYear).toBe('');
    });

    it('should handle payment method without optional fields', async () => {
      const minimalResponse = {
        status: 'success',
        code: 'GW00',
        message: 'Payment method retrieved successfully',
        reference_id: 'ref_134',
        id: 'pm_minimal',
        type: 'ach',
        customer_id: 'cust_minimal',
        created_at: '2024-01-15T10:30:00Z',
        // No optional fields
      };

      mockClient.get.mockResolvedValue(minimalResponse);

      const result = await paymentMethods.get('pm_minimal');

      expect(result.id).toBe('pm_minimal');
      expect(result.type).toBe('ach');
      // Note: The transformation always creates card/ach objects with default values
      expect(result.ach).toBeDefined();
      expect(result.ach?.accountType).toBe('checking'); // Default value
      expect(result.ach?.last4).toBe(''); // Default empty string
      expect(result.ach?.routingNumber).toBe(''); // Default empty string
      expect(result.ach?.bankName).toBeUndefined();
      expect(result.metadata).toBeUndefined();
    });
  });
});
