/**
 * @file tests/unit/paymentMethods-coverage.test.ts
 * @description Coverage tests for PaymentMethods resource to achieve 100% coverage
 */

import { PaymentMethods } from '../../src/resources/paymentMethods';
import { BaseClient } from '../../src/client/base-client';
import type {
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from '../../src/types';

// Mock BaseClient
jest.mock('../../src/client/base-client');

describe('PaymentMethods - Coverage Tests', () => {
  let paymentMethods: PaymentMethods;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    mockBaseClient = new BaseClient({
      appKey: 'test-key',
      clientKey: 'test-secret',
    }) as jest.Mocked<BaseClient>;

    paymentMethods = new PaymentMethods(mockBaseClient);
  });

  describe('transformResponse with ACH method', () => {
    it('should return base response for ACH method (line 174)', async () => {
      const rawQorPayResponse = {
        status: 'success',
        data: {
          id: 'pm_123',
          method: 'ach',
          created_at: '2025-01-25T12:00:00Z',
          ach: {
            account_type: 'checking',
            routing_number: '123456789',
            account_last4: '6789',
            name: 'John Doe',
          },
        },
      };

      // Access private method through type assertion for testing
      const transformResponse = (paymentMethods as any).transformResponse.bind(paymentMethods);
      const result = transformResponse(rawQorPayResponse);

      // For ACH, should return just the base response without the ach field
      expect(result).toEqual({
        status: 'success',
        data: {
          id: 'pm_123',
          method: 'ach',
          createdAt: '2025-01-25T12:00:00Z',
        },
      });
    });

    it('should transform ACH method without name', async () => {
      const rawQorPayResponse = {
        status: 'success',
        data: {
          id: 'pm_456',
          method: 'ach',
          created_at: '2025-01-25T12:00:00Z',
          ach: {
            account_type: 'savings',
            routing_number: '987654321',
            account_last4: '4321',
            // No name field
          },
        },
      };

      const transformResponse = (paymentMethods as any).transformResponse.bind(paymentMethods);
      const result = transformResponse(rawQorPayResponse);

      expect(result.data.method).toBe('ach');
    });
  });

  describe('create with ACH method', () => {
    it('should create ACH payment method with all fields', async () => {
      const request: CreatePaymentMethodRequest = {
        customerId: 'cust_123',
        method: 'ach',
        ach: {
          accountType: 'checking',
          routingNumber: '021000021',
          accountNumber: '123456789',
          name: 'John Doe',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_ach_123',
          method: 'ach',
          created_at: '2025-01-25T12:00:00Z',
        },
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      const result = await paymentMethods.create(request);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payment-methods', {
        customer_id: 'cust_123',
        method: 'ach',
        ach: {
          account_type: 'checking',
          routing_number: '021000021',
          account_number: '123456789',
          name: 'John Doe',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should create ACH payment method without optional name', async () => {
      const request: CreatePaymentMethodRequest = {
        customerId: 'cust_456',
        method: 'ach',
        ach: {
          accountType: 'savings',
          routingNumber: '021000021',
          accountNumber: '987654321',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_ach_456',
          method: 'ach',
          created_at: '2025-01-25T12:00:00Z',
        },
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      const result = await paymentMethods.create(request);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payment-methods', {
        customer_id: 'cust_456',
        method: 'ach',
        ach: {
          account_type: 'savings',
          routing_number: '021000021',
          account_number: '987654321',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update with card expiry', () => {
    it('should update only expiry month', async () => {
      const request: UpdatePaymentMethodRequest = {
        id: 'pm_123',
        card: {
          expiryMonth: '12',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_123',
          method: 'card',
          updated_at: '2025-01-25T12:00:00Z',
        },
      };

      mockBaseClient.put.mockResolvedValue(mockResponse);

      const result = await paymentMethods.update(request);

      expect(mockBaseClient.put).toHaveBeenCalledWith('/payment-methods/pm_123', {
        id: 'pm_123',
        exp_month: '12',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update only expiry year', async () => {
      const request: UpdatePaymentMethodRequest = {
        id: 'pm_456',
        card: {
          expiryYear: '2026',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_456',
          method: 'card',
          updated_at: '2025-01-25T12:00:00Z',
        },
      };

      mockBaseClient.put.mockResolvedValue(mockResponse);

      const result = await paymentMethods.update(request);

      expect(mockBaseClient.put).toHaveBeenCalledWith('/payment-methods/pm_456', {
        id: 'pm_456',
        exp_year: '2026',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update both expiry month and year', async () => {
      const request: UpdatePaymentMethodRequest = {
        id: 'pm_789',
        card: {
          expiryMonth: '06',
          expiryYear: '2027',
        },
      };

      const mockResponse = {
        status: 'success',
        data: {
          id: 'pm_789',
          method: 'card',
          updated_at: '2025-01-25T12:00:00Z',
        },
      };

      mockBaseClient.put.mockResolvedValue(mockResponse);

      const result = await paymentMethods.update(request);

      expect(mockBaseClient.put).toHaveBeenCalledWith('/payment-methods/pm_789', {
        id: 'pm_789',
        exp_month: '06',
        exp_year: '2027',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('transformResponse method private testing', () => {
    it('should handle unknown payment method types', async () => {
      const rawQorPayResponse = {
        status: 'success',
        data: {
          id: 'pm_unknown',
          method: 'unknown_method',
          created_at: '2025-01-25T12:00:00Z',
        },
      };

      const transformResponse = (paymentMethods as any).transformResponse.bind(paymentMethods);
      const result = transformResponse(rawQorPayResponse);

      expect(result).toEqual({
        status: 'success',
        data: {
          id: 'pm_unknown',
          method: 'unknown_method',
          createdAt: '2025-01-25T12:00:00Z',
        },
      });
    });

    it('should handle response without created_at', async () => {
      const rawQorPayResponse = {
        status: 'success',
        data: {
          id: 'pm_no_date',
          method: 'card',
          // No created_at field
        },
      };

      const transformResponse = (paymentMethods as any).transformResponse.bind(paymentMethods);
      const result = transformResponse(rawQorPayResponse);

      expect(result.data.createdAt).toBeUndefined();
    });
  });
});