/**
 * @file tests/unit/type-guards-final-coverage.test.ts
 * @description Final coverage tests for type-guards to hit remaining uncovered lines
 */

import {
  isValidExpiry,
  isValidEmail,
  isValidPhoneNumber,
  isValidAmount,
  isValidDateString,
  isQorPayError,
  isValidTransactionId,
  isValidCustomerId,
  isValidTokenId,
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
    it('should return true for valid string amount (line 200)', () => {
      expect(isValidAmount('100')).toBe(true);
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

  describe('isValidTokenId - line 231', () => {
    it('should return false for non-string tokenId (line 231)', () => {
      expect(isValidTokenId(123)).toBe(false);
    });

    it('should return false for null tokenId (line 231)', () => {
      expect(isValidTokenId(null)).toBe(false);
    });

    it('should return false for undefined tokenId (line 231)', () => {
      expect(isValidTokenId(undefined)).toBe(false);
    });

    it('should return false for object tokenId (line 231)', () => {
      expect(isValidTokenId({ token: 'tok_123' })).toBe(false);
    });

    it('should return false for empty string tokenId (line 231)', () => {
      expect(isValidTokenId('')).toBe(false);
    });

    it('should return false for tokenId without token prefix (line 231)', () => {
      expect(isValidTokenId('12345')).toBe(false);
    });

    it('should return true for valid tokenId (line 231)', () => {
      expect(isValidTokenId('tok_12345')).toBe(true);
    });
  });

  describe('isValidDateString - line 272', () => {
    it('should return false for non-string date (line 272)', () => {
      expect(isValidDateString(1234567890)).toBe(false);
    });

    it('should return false for null date (line 272)', () => {
      expect(isValidDateString(null)).toBe(false);
    });

    it('should return false for undefined date (line 272)', () => {
      expect(isValidDateString(undefined)).toBe(false);
    });

    it('should return false for object date (line 272)', () => {
      expect(isValidDateString(new Date())).toBe(false);
    });

    it('should return false for empty string date (line 272)', () => {
      expect(isValidDateString('')).toBe(false);
    });

    it('should return false for invalid date string (line 272)', () => {
      expect(isValidDateString('invalid-date')).toBe(false);
    });

    it('should return false for date with invalid format (line 272)', () => {
      expect(isValidDateString('2023/01/01')).toBe(false);
    });

    it('should return true for valid ISO date string (line 272)', () => {
      expect(isValidDateString('2023-01-01')).toBe(true);
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

    it('should return true for transactionId with minimal length (line 384)', () => {
      expect(isValidTransactionId('txn_123')).toBe(true);
    });

    it('should return false for transactionId with special characters (line 384)', () => {
      expect(isValidTransactionId('txn_123-456!')).toBe(false);
    });

    it('should return false for transactionId with spaces (line 384)', () => {
      expect(isValidTransactionId('txn_123 456')).toBe(false);
    });
  });
});
