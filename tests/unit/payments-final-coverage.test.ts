/**
 * @file tests/unit/payments-final-coverage.test.ts
 * @description Final coverage tests for Payments to reach 100%
 */

import { Payments } from '../../src/resources/payments';
import { BaseClient } from '../../src/client/base-client';
import type { PaymentSaleTokenRequestData } from '../../src/types';
import { QorPayApiError } from '../../src/errors';

// Mock BaseClient
jest.mock('../../src/client/base-client');

// Mock the schemas to control validation behavior
jest.mock('../../src/schemas/paymentMethods', () => ({
  PaymentSaleTokenRequestSchema: {
    parse: jest.fn(),
  },
  // Mock other schemas that are imported
  PaymentSaleManualRequestSchema: { parse: jest.fn() },
  PaymentSaleCashDiscountRequestSchema: { parse: jest.fn() },
  PaymentSaleSwipeRequestSchema: { parse: jest.fn() },
  PaymentRecurringSetupRequestSchema: { parse: jest.fn() },
  PaymentRecurringExistingRequestSchema: { parse: jest.fn() },
  PaymentRecurringMyRequestSchema: { parse: jest.fn() },
  PaymentAuthRequestSchema: { parse: jest.fn() },
  PaymentAuthTokenRequestSchema: { parse: jest.fn() },
  PaymentVoidRequestSchema: { parse: jest.fn() },
  PaymentRefundRequestSchema: { parse: jest.fn() },
  PaymentCaptureRequestSchema: { parse: jest.fn() },
}));

describe('Payments - Final Coverage Tests', () => {
  let payments: Payments;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    mockBaseClient = new BaseClient({
      appKey: 'test-key',
      clientKey: 'test-secret',
    }) as jest.Mocked<BaseClient>;

    payments = new Payments(mockBaseClient);

    // Mock client methods
    mockBaseClient.post = jest.fn();
  });

  describe('saleToken method - line 173 coverage', () => {
    it('should handle non-ZodError validation errors (line 173)', async () => {
      const {
        PaymentSaleTokenRequestSchema,
      } = require('../../src/schemas/paymentMethods');

      // Mock schema to throw a non-ZodError
      const customError = new Error('Custom validation error');
      customError.name = 'CustomError';
      PaymentSaleTokenRequestSchema.parse.mockImplementation(() => {
        throw customError;
      });

      const request: PaymentSaleTokenRequestData = {
        mid: 'test-mid',
        amount: '10.00',
        creditcard: 'tok_test123',
        customer_id: 'cust_123',
      };

      // The method should re-throw the non-ZodError (line 173)
      await expect(payments.saleToken(request)).rejects.toThrow(customError);
    });

    it('should handle ZodError validation errors properly', async () => {
      const {
        PaymentSaleTokenRequestSchema,
      } = require('../../src/schemas/paymentMethods');

      // Mock schema to throw a ZodError
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      PaymentSaleTokenRequestSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      const request: PaymentSaleTokenRequestData = {
        mid: 'test-mid',
        amount: '10.00',
        creditcard: 'tok_test123',
        customer_id: 'cust_123',
      };

      // The method should convert ZodError to QorPayApiError
      await expect(payments.saleToken(request)).rejects.toThrow(QorPayApiError);
    });

    it('should handle successful token payment', async () => {
      const {
        PaymentSaleTokenRequestSchema,
      } = require('../../src/schemas/paymentMethods');

      // Mock schema to pass validation
      PaymentSaleTokenRequestSchema.parse.mockImplementation((data) => data);

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_123456',
        amount: '10.00',
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      const request: PaymentSaleTokenRequestData = {
        mid: 'test-mid',
        amount: '10.00',
        creditcard: 'tok_test123',
        customer_id: 'cust_123',
      };

      const result = await payments.saleToken(request);

      expect(PaymentSaleTokenRequestSchema.parse).toHaveBeenCalledWith(request);
      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/sale/token', {
        transaction_data: request,
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('saleLvl2Lvl3 method - no schema validation', () => {
    it('should handle Lvl2/Lvl3 payment without schema validation', async () => {
      const request = {
        mid: 'test-mid',
        amount: '100.00',
        level2_data: {
          tax_amount: '8.00',
          customer_reference: 'REF123',
        },
        level3_data: {
          line_items: [
            {
              description: 'Test Item',
              quantity: 1,
              unit_price: '92.00',
            },
          ],
        },
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_lvl3_123',
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      const result = await payments.saleLvl2Lvl3(request);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payments/sale/lvl2_3',
        {
          transaction_data: request,
        }
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe('sale3DS method - no schema validation', () => {
    it('should handle 3DS payment without schema validation', async () => {
      const request = {
        mid: 'test-mid',
        amount: '50.00',
        three_d_secure: {
          verification_id: '3ds_123',
          authentication_response: 'success',
        },
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_3ds_123',
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      const result = await payments.sale3DS(request);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/sale/3ds', {
        transaction_data: request,
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('salePin method - no schema validation', () => {
    it('should handle PIN debit payment without schema validation', async () => {
      const request = {
        mid: 'test-mid',
        amount: '25.00',
        pin_block: 'encrypted_pin_data',
        ksn: 'key_serial_number',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_pin_123',
      };

      mockBaseClient.post.mockResolvedValue(mockResponse);

      const result = await payments.salePin(request);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/sale/pin', {
        transaction_data: request,
      });
      expect(result).toBe(mockResponse);
    });
  });
});
