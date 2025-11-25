/**
 * @file tests/unit/type-guards-final-coverage.test.ts
 * @description Final coverage tests for type-guards to hit remaining uncovered lines
 */

import {
  isValidExpiry,
  isValidEmail,
  isValidPhoneNumber,
  isValidAmount,
  isValidCurrency,
  isValidDate,
  isQorPayError,
  isValidTransactionId,
  isValidCustomerId,
  isValidPaymentMethodId,
} from '../../src/utils/type-guards';

describe('Type Guards - Final Coverage Tests', () => {
  describe('isValidExpiry - line 133', () => {
    it('should return false for non-string month (line 133)', () => {
      expect(isValidExpiry(12, '2025')).toBe(false);
    });

    it('should return false for non-string year (line 133)', () => {
      expect(isValidExpiry('12', 2025)).toBe(false);
    });

    it('should return false for null inputs (line 133)', () => {
      expect(isValidExpiry(null, null)).toBe(false);
    });

    it('should return false for undefined inputs (line 133)', () => {
      expect(isValidExpiry(undefined, undefined)).toBe(false);
    });
  });

  describe('isValidEmail - line 167', () => {
    it('should return false for non-string email (line 167)', () => {
      expect(isValidEmail(123)).toBe(false);
    });

    it('should return false for null email (line 167)', () => {
      expect(isValidEmail(null)).toBe(false);
    });

    it('should return false for undefined email (line 167)', () => {
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('should return false for object email (line 167)', () => {
      expect(isValidEmail({ email: 'test@example.com' })).toBe(false);
    });
  });

  describe('isValidPhoneNumber - line 177', () => {
    it('should return false for non-string phone (line 177)', () => {
      expect(isValidPhoneNumber(1234567890)).toBe(false);
    });

    it('should return false for null phone (line 177)', () => {
      expect(isValidPhoneNumber(null)).toBe(false);
    });

    it('should return false for undefined phone (line 177)', () => {
      expect(isValidPhoneNumber(undefined)).toBe(false);
    });

    it('should return false for object phone (line 177)', () => {
      expect(isValidPhoneNumber({ phone: '123-456-7890' })).toBe(false);
    });
  });

  describe('isValidAmount - line 200', () => {
    it('should return false for string amount (line 200)', () => {
      expect(isValidAmount('100')).toBe(false);
    });

    it('should return false for null amount (line 200)', () => {
      expect(isValidAmount(null)).toBe(false);
    });

    it('should return false for undefined amount (line 200)', () => {
      expect(isValidAmount(undefined)).toBe(false);
    });

    it('should return false for object amount (line 200)', () => {
      expect(isValidAmount({ amount: 100 })).toBe(false);
    });

    it('should return false for NaN amount (line 200)', () => {
      expect(isValidAmount(NaN)).toBe(false);
    });

    it('should return false for negative amount (line 200)', () => {
      expect(isValidAmount(-100)).toBe(false);
    });
  });

  describe('isValidCurrency - line 218', () => {
    it('should return false for non-string currency (line 218)', () => {
      expect(isValidCurrency(123)).toBe(false);
    });

    it('should return false for null currency (line 218)', () => {
      expect(isValidCurrency(null)).toBe(false);
    });

    it('should return false for undefined currency (line 218)', () => {
      expect(isValidCurrency(undefined)).toBe(false);
    });

    it('should return false for object currency (line 218)', () => {
      expect(isValidCurrency({ currency: 'USD' })).toBe(false);
    });

    it('should return false for empty string currency (line 218)', () => {
      expect(isValidCurrency('')).toBe(false);
    });

    it('should return false for invalid currency code (line 218)', () => {
      expect(isValidCurrency('XYZ')).toBe(false);
    });

    it('should return false for lowercase currency (line 218)', () => {
      expect(isValidCurrency('usd')).toBe(false);
    });

    it('should return false for currency with numbers (line 218)', () => {
      expect(isValidCurrency('USD1')).toBe(false);
    });
  });

  describe('isValidDate - line 246', () => {
    it('should return false for non-string date (line 246)', () => {
      expect(isValidDate(1234567890)).toBe(false);
    });

    it('should return false for null date (line 246)', () => {
      expect(isValidDate(null)).toBe(false);
    });

    it('should return false for undefined date (line 246)', () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    it('should return false for object date (line 246)', () => {
      expect(isValidDate(new Date())).toBe(false);
    });

    it('should return false for empty string date (line 246)', () => {
      expect(isValidDate('')).toBe(false);
    });

    it('should return false for invalid date string (line 246)', () => {
      expect(isValidDate('invalid-date')).toBe(false);
    });

    it('should return false for date with invalid format (line 246)', () => {
      expect(isValidDate('2023/01/01')).toBe(false);
    });
  });

  describe('isQorPayError - lines 338-339', () => {
    it('should return false for non-object error (line 338)', () => {
      expect(isQorPayError('error message')).toBe(false);
    });

    it('should return false for null error (line 338)', () => {
      expect(isQorPayError(null)).toBe(false);
    });

    it('should return false for undefined error (line 338)', () => {
      expect(isQorPayError(undefined)).toBe(false);
    });

    it('should return false for array error (line 338)', () => {
      expect(isQorPayError(['error'])).toBe(false);
    });

    it('should return false for number error (line 338)', () => {
      expect(isQorPayError(500)).toBe(false);
    });

    it('should return false for object without status property (line 339)', () => {
      expect(isQorPayError({ message: 'Error occurred' })).toBe(false);
    });

    it('should return false for object with null status (line 339)', () => {
      expect(isQorPayError({ status: null, message: 'Error' })).toBe(false);
    });

    it('should return false for object with undefined status (line 339)', () => {
      expect(isQorPayError({ status: undefined, message: 'Error' })).toBe(
        false
      );
    });

    it('should return false for object with number status (line 339)', () => {
      expect(isQorPayError({ status: 500, message: 'Error' })).toBe(false);
    });

    it('should return false for object with empty status string (line 339)', () => {
      expect(isQorPayError({ status: '', message: 'Error' })).toBe(false);
    });
  });

  describe('isValidTransactionId - lines 383-384', () => {
    it('should return false for non-string transactionId (line 383)', () => {
      expect(isValidTransactionId(123)).toBe(false);
    });

    it('should return false for null transactionId (line 383)', () => {
      expect(isValidTransactionId(null)).toBe(false);
    });

    it('should return false for undefined transactionId (line 383)', () => {
      expect(isValidTransactionId(undefined)).toBe(false);
    });

    it('should return false for object transactionId (line 383)', () => {
      expect(isValidTransactionId({ id: 'txn_123' })).toBe(false);
    });

    it('should return false for empty string transactionId (line 383)', () => {
      expect(isValidTransactionId('')).toBe(false);
    });

    it('should return false for transactionId without required prefix (line 384)', () => {
      expect(isValidTransactionId('1234567890')).toBe(false);
    });

    it('should return false for transactionId with wrong prefix (line 384)', () => {
      expect(isValidTransactionId('cus_1234567890')).toBe(false);
    });

    it('should return false for transactionId that is too short (line 384)', () => {
      expect(isValidTransactionId('txn_123')).toBe(false);
    });

    it('should return false for transactionId with special characters (line 384)', () => {
      expect(isValidTransactionId('txn_123-456!')).toBe(false);
    });

    it('should return false for transactionId with spaces (line 384)', () => {
      expect(isValidTransactionId('txn_123 456')).toBe(false);
    });
  });
});
