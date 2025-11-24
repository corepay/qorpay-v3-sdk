/**
 * @file tests/integration/payment-methods.integration.test.ts
 * @description Integration tests for the PaymentMethods module using MSW
 */

import { QorPayClient, QorPayApiError } from '../../src';
import mswServer from './setup/msw-server';

// Test credentials (from README)
const TEST_APP_KEY = 'T6554252567241061980';
const TEST_CLIENT_KEY = '01dffeb784c64d098c8c691ea589eb82';

describe('PaymentMethods Integration Tests', () => {
  let qorpay: QorPayClient;

  // Set up the MSW server before all tests
  beforeAll(() => {
    mswServer.start();
  });

  // Reset handlers between tests
  beforeEach(() => {
    mswServer.reset();

    // Create a new client for each test
    qorpay = new QorPayClient({
      appKey: TEST_APP_KEY,
      clientKey: TEST_CLIENT_KEY,
      environment: 'sandbox',
      // Set a short timeout for faster test failures
      timeout: 3000,
    });
  });

  // Stop the server after all tests
  afterAll(() => {
    mswServer.stop();
  });

  describe('Create Payment Method', () => {
    it('should create a card payment method with full transformation', async () => {
      // Mock the POST /payment/methods endpoint
      const paymentMethodId = 'pm_card_' + Date.now();

      mswServer.mockEndpoint('post', '/payment/methods', {
        data: {
          status: 'success',
          code: 'GW00',
          message: 'Payment method created successfully',
          reference_id: 'ref_create_card_123',
          id: paymentMethodId,
          type: 'card',
          customer_id: 'cust_123456',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          card_brand: 'visa',
          card_last4: '1111',
          exp_month: '12',
          exp_year: '25',
          metadata: { source: 'web', version: '1.0' },
        },
      });

      const createRequest = {
        customerId: 'cust_123456',
        type: 'card' as const,
        card: {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          name: 'John Doe',
        },
        metadata: { source: 'web', version: '1.0' },
      };

      const result = await qorpay.paymentMethods.create(createRequest);

      expect(result.id).toMatch(/^pm_card_\d+$/);
      expect(result.type).toBe('card');
      expect(result.customerId).toBe('cust_123456');
      expect(result.card?.brand).toBe('visa');
      expect(result.card?.last4).toBe('1111');
      expect(result.card?.expiryMonth).toBe('12');
      expect(result.card?.expiryYear).toBe('25');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.metadata).toEqual({ source: 'web', version: '1.0' });
    });

    it('should create an ACH payment method with full transformation', async () => {
      const paymentMethodId = 'pm_ach_' + Date.now();

      mswServer.mockEndpoint('post', '/payment/methods', {
        data: {
          status: 'success',
          code: 'GW00',
          message: 'Payment method created successfully',
          reference_id: 'ref_create_ach_124',
          id: paymentMethodId,
          type: 'ach',
          customer_id: 'cust_123456',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ach_account_type: 'checking',
          ach_account_last4: '6789',
          ach_routing_number: '021000021',
          ach_bank_name: 'JPMORGAN CHASE BANK',
          metadata: {},
        },
      });

      const createRequest = {
        customerId: 'cust_123456',
        type: 'ach' as const,
        ach: {
          accountNumber: '123456789',
          routingNumber: '021000021',
          accountType: 'checking' as const,
          name: 'Jane Doe',
        },
      };

      const result = await qorpay.paymentMethods.create(createRequest);

      expect(result.id).toMatch(/^pm_ach_\d+$/);
      expect(result.type).toBe('ach');
      expect(result.customerId).toBe('cust_123456');
      expect(result.ach?.accountType).toBe('checking');
      expect(result.ach?.last4).toBe('6789');
      expect(result.ach?.routingNumber).toBe('021000021');
      expect(result.ach?.bankName).toBe('JPMORGAN CHASE BANK');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should handle validation errors gracefully', async () => {
      mswServer.mockEndpoint('post', '/payment/methods', {
        status: 400,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Invalid card number format',
      });

      const invalidRequest = {
        customerId: 'cust_123456',
        type: 'card' as const,
        card: {
          number: 'invalid', // Invalid card number
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          name: 'John Doe',
        },
      };

      await expect(
        qorpay.paymentMethods.create(invalidRequest)
      ).rejects.toThrow(QorPayApiError);
    });
  });

  describe('Get Payment Method', () => {
    it('should retrieve a payment method with proper transformation', async () => {
      const paymentMethodId = 'pm_card_123456';

      mswServer.mockEndpoint('get', `/payment/methods/${paymentMethodId}`, {
        data: {
          status: 'success',
          code: 'GW00',
          message: 'Payment method retrieved successfully',
          reference_id: 'ref_get_123',
          id: paymentMethodId,
          type: 'card',
          customer_id: 'cust_789',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-16T11:00:00Z',
          card_brand: 'visa',
          card_last4: '1111',
          exp_month: '12',
          exp_year: '25',
          metadata: { tags: ['premium'] },
        },
      });

      const result = await qorpay.paymentMethods.get(paymentMethodId);

      expect(result.id).toBe(paymentMethodId);
      expect(result.type).toBe('card');
      expect(result.customerId).toBe('cust_789');
      expect(result.card?.brand).toBe('visa');
      expect(result.card?.last4).toBe('1111');
      expect(result.card?.expiryMonth).toBe('12');
      expect(result.card?.expiryYear).toBe('25');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.metadata).toEqual({ tags: ['premium'] });
    });

    it('should handle not found errors', async () => {
      const invalidId = 'pm_invalid_123';

      mswServer.mockEndpoint('get', `/payment/methods/${invalidId}`, {
        status: 404,
        errorCode: 'NOT_FOUND',
        errorMessage: 'Payment method not found',
      });

      await expect(qorpay.paymentMethods.get(invalidId)).rejects.toThrow(
        QorPayApiError
      );
    });
  });

  describe('List Payment Methods', () => {
    it('should list payment methods with pagination', async () => {
      const customerId = 'cust_list_123';

      mswServer.mockEndpoint('get', `/payment/methods/${customerId}`, {
        data: {
          status: 'success',
          code: 'GW00',
          message: 'Payment methods retrieved successfully',
          reference_id: 'ref_list_123',
          data: {
            methods: [
              {
                id: 'pm_card_1',
                type: 'card',
                customer_id: customerId,
                created_at: '2024-01-15T10:30:00Z',
                card_brand: 'visa',
                card_last4: '1111',
                exp_month: '12',
                exp_year: '25',
              },
              {
                id: 'pm_ach_2',
                type: 'ach',
                customer_id: customerId,
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
        },
      });

      const result = await qorpay.paymentMethods.list(customerId, {
        limit: 10,
        offset: 0,
      });

      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(2);
      expect(result.pagination.limit).toBe(10);
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
      expect(achMethod.ach?.routingNumber).toBe('021000021');
    });

    it('should handle empty payment method lists', async () => {
      const customerId = 'cust_empty_123';

      mswServer.mockEndpoint('get', `/payment/methods/${customerId}`, {
        data: {
          status: 'success',
          code: 'GW00',
          message: 'Payment methods retrieved successfully',
          reference_id: 'ref_empty_123',
          data: {
            methods: [],
            total: 0,
            has_more: false,
          },
        },
      });

      const result = await qorpay.paymentMethods.list(customerId);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe('Update Payment Method', () => {
    it('should update a payment method successfully', async () => {
      const paymentMethodId = 'pm_card_update_123';

      mswServer.mockEndpoint('patch', `/payment/methods/${paymentMethodId}`, {
        data: {
          status: 'success',
          code: 'GW00',
          message: 'Payment method updated successfully',
          reference_id: 'ref_update_123',
          id: paymentMethodId,
          type: 'card',
          customer_id: 'cust_update_123',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: new Date().toISOString(),
          card_brand: 'visa',
          card_last4: '1111',
          exp_month: '12',
          exp_year: '26',
          metadata: { source: 'mobile' },
        },
      });

      const updateRequest = {
        id: paymentMethodId,
        card: {
          expiryMonth: '12',
          expiryYear: '26',
          name: 'John Updated',
        },
        metadata: { source: 'mobile' },
      };

      const result = await qorpay.paymentMethods.update(updateRequest);

      expect(result.id).toBe(paymentMethodId);
      expect(result.card?.expiryMonth).toBe('12');
      expect(result.card?.expiryYear).toBe('26');
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.metadata).toEqual({ source: 'mobile' });
    });
  });

  describe('Delete Payment Method', () => {
    it('should delete a payment method successfully', async () => {
      const paymentMethodId = 'pm_card_delete_123';

      mswServer.mockEndpoint('delete', `/payment/methods/${paymentMethodId}`, {
        data: {
          status: 'success',
          code: 'GW00',
          message: 'Payment method deleted successfully',
          reference_id: 'ref_delete_123',
        },
      });

      // The delete method should not throw if successful
      await expect(
        qorpay.paymentMethods.delete(paymentMethodId)
      ).resolves.toBeUndefined();
    });

    it('should handle delete errors', async () => {
      const invalidId = 'pm_invalid_delete';

      mswServer.mockEndpoint('delete', `/payment/methods/${invalidId}`, {
        status: 404,
        errorCode: 'NOT_FOUND',
        errorMessage: 'Payment method not found',
      });

      await expect(qorpay.paymentMethods.delete(invalidId)).rejects.toThrow(
        QorPayApiError
      );
    });
  });

  describe('List Expiring Payment Methods', () => {
    it('should list expiring payment methods with proper parameters', async () => {
      mswServer.mockEndpoint('get', '/payment/methods/expiring', {
        data: {
          status: 'success',
          code: 'GW00',
          message: 'Expiring payment methods retrieved successfully',
          reference_id: 'ref_expiring_123',
          data: {
            methods: [
              {
                id: 'pm_card_exp1',
                type: 'card',
                customer_id: 'cust_exp_1',
                created_at: '2024-01-15T10:30:00Z',
                card_brand: 'visa',
                card_last4: '1111',
                exp_month: '02',
                exp_year: '25',
              },
              {
                id: 'pm_card_exp2',
                type: 'card',
                customer_id: 'cust_exp_2',
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
        },
      });

      const result = await qorpay.paymentMethods.listExpiring({
        withinMonths: 6,
        limit: 25,
      });

      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);

      // Verify all methods are cards with expiring dates
      result.data.forEach((method) => {
        expect(method.type).toBe('card');
        expect(method.card).toBeDefined();
        expect(['02', '03']).toContain(method.card?.expiryMonth);
        expect(method.card?.expiryYear).toBe('25');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors across all endpoints', async () => {
      // Test multiple endpoints with invalid credentials
      const invalidClient = new QorPayClient({
        appKey: 'invalid_key',
        clientKey: 'invalid_key',
        environment: 'sandbox',
      });

      // Mock authentication failure for get endpoint
      mswServer.mockEndpoint('get', '/payment/methods/test', {
        status: 401,
        errorCode: 'AUTH_001',
        errorMessage: 'Invalid API credentials',
      });

      await expect(invalidClient.paymentMethods.get('test')).rejects.toThrow(
        QorPayApiError
      );
    });

    it('should handle rate limiting errors', async () => {
      mswServer.mockEndpoint('get', '/payment/methods/rate_limit', {
        status: 429,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        errorMessage: 'Too many requests. Please try again later.',
      });

      await expect(qorpay.paymentMethods.get('rate_limit')).rejects.toThrow(
        QorPayApiError
      );
    });

    it('should handle network timeouts', async () => {
      // Create client with very short timeout
      const timeoutClient = new QorPayClient({
        appKey: TEST_APP_KEY,
        clientKey: TEST_CLIENT_KEY,
        environment: 'sandbox',
        timeout: 1, // 1ms timeout
      });

      // Mock a slow response
      mswServer.mockEndpoint('get', '/payment/methods/slow', {
        delay: 100, // 100ms delay
        data: { status: 'success' },
      });

      await expect(timeoutClient.paymentMethods.get('slow')).rejects.toThrow();
    });
  });
});
