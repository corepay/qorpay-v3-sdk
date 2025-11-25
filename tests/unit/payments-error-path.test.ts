/**
 * @file tests/unit/payments-error-path.test.ts
 * @description Payments error path coverage test for line 173 (non-ZodError fallback)
 */

import { Payments } from '../../src/resources/payments';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import { PaymentSaleTokenRequestSchema } from '../../src/schemas/payments';

// Mock BaseClient properly
jest.mock('../../src/client/base-client');

describe('Payments - Error Path Coverage', () => {
  let payments: Payments;
  let mockBaseClient: jest.Mocked<BaseClient>;
  let originalParse: typeof PaymentSaleTokenRequestSchema.parse;

  beforeEach(() => {
    mockBaseClient = new BaseClient({
      appKey: 'test-key',
      clientKey: 'test-secret',
    }) as jest.Mocked<BaseClient>;

    payments = new Payments(mockBaseClient);

    // Mock the client methods
    mockBaseClient.post = jest.fn();

    // Store the original parse method
    originalParse = PaymentSaleTokenRequestSchema.parse;
  });

  afterEach(() => {
    // Restore the original parse method after each test
    PaymentSaleTokenRequestSchema.parse = originalParse;
  });

  describe('saleToken method - non-ZodError path (line 173)', () => {
    it('should throw non-ZodError as-is (line 173 fallback)', async () => {
      // Override the schema parse method to throw a custom non-ZodError
      PaymentSaleTokenRequestSchema.parse = jest.fn(() => {
        throw new Error('Custom validation error that is not ZodError');
      });

      const saleTokenData = {
        amount: 1000,
        creditcard: 'tok_test123',
        customer_id: 'cust_test456',
      };

      // The method should re-throw the custom error (line 173)
      await expect(payments.saleToken(saleTokenData)).rejects.toThrow(
        'Custom validation error that is not ZodError'
      );

      // Verify the parse method was called
      expect(PaymentSaleTokenRequestSchema.parse).toHaveBeenCalledWith(saleTokenData);

      // Verify post was NOT called since validation failed
      expect(mockBaseClient.post).not.toHaveBeenCalled();
    });

    it('should handle TypeError thrown from schema parse (line 173 fallback)', async () => {
      // Override the schema parse method to throw a TypeError
      PaymentSaleTokenRequestSchema.parse = jest.fn(() => {
        throw new TypeError('Invalid data type provided');
      });

      const saleTokenData = {
        amount: 'invalid-amount', // This would normally cause an error
        creditcard: 'tok_test123',
        customer_id: 'cust_test456',
      };

      // The method should re-throw the TypeError (line 173)
      await expect(payments.saleToken(saleTokenData)).rejects.toThrow(
        TypeError
      );

      await expect(payments.saleToken(saleTokenData)).rejects.toThrow(
        'Invalid data type provided'
      );

      // Verify the parse method was called
      expect(PaymentSaleTokenRequestSchema.parse).toHaveBeenCalledWith(saleTokenData);

      // Verify post was NOT called since validation failed
      expect(mockBaseClient.post).not.toHaveBeenCalled();
    });

    it('should handle RangeError thrown from schema parse (line 173 fallback)', async () => {
      // Override the schema parse method to throw a RangeError
      PaymentSaleTokenRequestSchema.parse = jest.fn(() => {
        throw new RangeError('Amount out of valid range');
      });

      const saleTokenData = {
        amount: -1000, // This would normally cause an error
        creditcard: 'tok_test123',
        customer_id: 'cust_test456',
      };

      // The method should re-throw the RangeError (line 173)
      await expect(payments.saleToken(saleTokenData)).rejects.toThrow(
        RangeError
      );

      await expect(payments.saleToken(saleTokenData)).rejects.toThrow(
        'Amount out of valid range'
      );

      // Verify the parse method was called
      expect(PaymentSaleTokenRequestSchema.parse).toHaveBeenCalledWith(saleTokenData);

      // Verify post was NOT called since validation failed
      expect(mockBaseClient.post).not.toHaveBeenCalled();
    });

    it('should still handle ZodError correctly (contrast with line 173)', async () => {
      // Create a ZodError (this should NOT trigger line 173)
      const { ZodError } = require('zod');

      PaymentSaleTokenRequestSchema.parse = jest.fn(() => {
        const zodError = new ZodError([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: ['customer_id'],
            message: 'Expected string, received number',
          },
        ]);
        throw zodError;
      });

      const saleTokenData = {
        amount: 1000,
        creditcard: 'tok_test123',
        customer_id: 123, // Invalid type
      };

      // This should be caught and converted to QorPayApiError (lines 166-171)
      await expect(payments.saleToken(saleTokenData)).rejects.toThrow(
        QorPayApiError
      );

      const error = await payments.saleToken(saleTokenData).catch(e => e);
      expect(error).toBeInstanceOf(QorPayApiError);
      expect(error.message).toContain('Validation failed:');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');

      // Verify the parse method was called
      expect(PaymentSaleTokenRequestSchema.parse).toHaveBeenCalledWith(saleTokenData);

      // Verify post was NOT called since validation failed
      expect(mockBaseClient.post).not.toHaveBeenCalled();
    });
  });
});