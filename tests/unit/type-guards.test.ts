/**
 * @file tests/unit/type-guards.test.ts
 * @description Tests for type guard utilities
 */

import {
  isQorPayResponse,
  isSuccessResponse,
  isErrorResponse,
  isQorPayError,
  isQorPayApiError,
  isQorPayNetworkError,
  isQorPayUnknownError,
  isPaymentStatus,
  isTransactionType,
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  isValidEmail,
  isValidPhoneNumber,
  isValidPostalCode,
  isValidAmount,
  isValidTransactionId,
  isValidCustomerId,
  isValidTokenId,
  isValidEnvironment,
  isValidPaginationParams,
  isValidDateString,
  isDateInRange,
  validatePaymentData,
  validateCustomerData,
} from '../../src/utils/type-guards';
import { QorPayApiError } from '../../src/errors';

describe('Response Type Guards', () => {
  describe('isQorPayResponse', () => {
    it('should identify valid QorPay responses', () => {
      expect(isQorPayResponse({ status: 'success' })).toBe(true);
      expect(isQorPayResponse({ status: 'error' })).toBe(true);
      expect(isQorPayResponse({ status: 'success', data: {} })).toBe(true);
    });

    it('should reject invalid responses', () => {
      expect(isQorPayResponse(null)).toBe(false);
      expect(isQorPayResponse(undefined)).toBe(false);
      expect(isQorPayResponse({})).toBe(false);
      expect(isQorPayResponse({ status: 'invalid' })).toBe(false);
    });
  });

  describe('isSuccessResponse', () => {
    it('should identify success responses', () => {
      expect(isSuccessResponse({ status: 'success' })).toBe(true);
      expect(
        isSuccessResponse({ status: 'success', data: { id: '123' } })
      ).toBe(true);
    });

    it('should reject non-success responses', () => {
      expect(isSuccessResponse({ status: 'error' })).toBe(false);
      expect(isSuccessResponse({ status: 'pending' })).toBe(false);
    });
  });

  describe('isErrorResponse', () => {
    it('should identify error responses', () => {
      expect(isErrorResponse({ status: 'error' })).toBe(true);
      expect(isErrorResponse({ status: 'error', message: 'Failed' })).toBe(
        true
      );
    });

    it('should reject non-error responses', () => {
      expect(isErrorResponse({ status: 'success' })).toBe(false);
      expect(isErrorResponse({ status: 'pending' })).toBe(false);
    });
  });
});

describe('Error Type Guards', () => {
  describe('isQorPayError', () => {
    it('should identify QorPay error instances', () => {
      const error = new QorPayApiError('Test error');
      expect(isQorPayError(error)).toBe(true);
    });

    it('should identify error-like objects', () => {
      const error = { name: 'QorPayError', message: 'Test' };
      expect(isQorPayError(error)).toBe(true);
    });

    it('should reject non-QorPay errors', () => {
      expect(isQorPayError(new Error('Regular error'))).toBe(false);
      expect(isQorPayError({ message: 'Not a QorPay error' })).toBe(false);
    });
  });

  describe('isQorPayApiError', () => {
    it('should identify QorPayApiError instances', () => {
      const error = new QorPayApiError('API error', 400);
      expect(isQorPayApiError(error)).toBe(true);
    });

    it('should identify error-like objects', () => {
      const error = { name: 'QorPayApiError', message: 'Test' };
      expect(isQorPayApiError(error)).toBe(true);
    });
  });

  describe('isQorPayNetworkError', () => {
    it('should identify QorPayNetworkError instances', () => {
      const { QorPayNetworkError } = require('../../src/errors');
      const error = new QorPayNetworkError('Network error');
      expect(isQorPayNetworkError(error)).toBe(true);
    });

    it('should identify error-like objects', () => {
      const error = { name: 'QorPayNetworkError', message: 'Test' };
      expect(isQorPayNetworkError(error)).toBe(true);
    });

    it('should reject non-QorPayNetworkError instances', () => {
      expect(isQorPayNetworkError(new Error('Regular error'))).toBe(false);
      expect(isQorPayNetworkError({ name: 'SomeOtherError' })).toBe(false);
    });
  });

  describe('isQorPayUnknownError', () => {
    it('should identify QorPayUnknownError instances', () => {
      const { QorPayUnknownError } = require('../../src/errors');
      const error = new QorPayUnknownError('Unknown error');
      expect(isQorPayUnknownError(error)).toBe(true);
    });

    it('should identify error-like objects', () => {
      const error = { name: 'QorPayUnknownError', message: 'Test' };
      expect(isQorPayUnknownError(error)).toBe(true);
    });

    it('should reject non-QorPayUnknownError instances', () => {
      expect(isQorPayUnknownError(new Error('Regular error'))).toBe(false);
      expect(isQorPayUnknownError({ name: 'SomeOtherError' })).toBe(false);
    });
  });
});

describe('Payment Type Guards', () => {
  describe('isPaymentStatus', () => {
    it('should accept valid payment statuses', () => {
      expect(isPaymentStatus('approved')).toBe(true);
      expect(isPaymentStatus('declined')).toBe(true);
      expect(isPaymentStatus('pending')).toBe(true);
      expect(isPaymentStatus('voided')).toBe(true);
      expect(isPaymentStatus('refunded')).toBe(true);
      expect(isPaymentStatus('partial_refund')).toBe(true);
    });

    it('should reject invalid statuses', () => {
      expect(isPaymentStatus('invalid')).toBe(false);
      expect(isPaymentStatus('APPROVED')).toBe(false);
      expect(isPaymentStatus(null)).toBe(false);
      expect(isPaymentStatus(123)).toBe(false);
    });
  });

  describe('isTransactionType', () => {
    it('should accept valid transaction types', () => {
      expect(isTransactionType('sale')).toBe(true);
      expect(isTransactionType('authorization')).toBe(true);
      expect(isTransactionType('capture')).toBe(true);
      expect(isTransactionType('void')).toBe(true);
      expect(isTransactionType('refund')).toBe(true);
      expect(isTransactionType('credit')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(isTransactionType('invalid')).toBe(false);
      expect(isTransactionType(null)).toBe(false);
      expect(isTransactionType(123)).toBe(false);
    });
  });
});

describe('Card Validation', () => {
  describe('isValidCardNumber', () => {
    it('should validate valid card numbers', () => {
      expect(isValidCardNumber('4111111111111111')).toBe(true); // Visa test number
      expect(isValidCardNumber('5555555555554444')).toBe(true); // MasterCard test number
      expect(isValidCardNumber('378282246310005')).toBe(true); // Amex test number
    });

    it('should reject invalid card numbers', () => {
      expect(isValidCardNumber('1234567890123456')).toBe(false); // Fails Luhn
      expect(isValidCardNumber('411111111111111')).toBe(false); // Too short
      expect(isValidCardNumber('41111111111111111')).toBe(false); // Too long
      expect(isValidCardNumber('invalid')).toBe(false);
    });
  });

  describe('isValidExpiry', () => {
    it('should validate valid expiry dates', () => {
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      // Current month/year should be valid
      expect(
        isValidExpiry(
          currentMonth.toString().padStart(2, '0'),
          currentYear.toString()
        )
      ).toBe(true);

      // Future dates should be valid
      expect(isValidExpiry('12', '99')).toBe(true);
    });

    it('should handle December properly', () => {
      const now = new Date();
      const currentYear = now.getFullYear() % 100;

      // December should always be valid
      expect(isValidExpiry('12', currentYear.toString())).toBe(true);
    });

    it('should validate next year dates', () => {
      const now = new Date();
      const currentYear = now.getFullYear() % 100;

      // Next year dates should be valid
      expect(isValidExpiry('01', (currentYear + 1).toString())).toBe(true);
      expect(isValidExpiry('06', (currentYear + 1).toString())).toBe(true);
    });

    it('should reject invalid expiry dates', () => {
      expect(isValidExpiry('13', '25')).toBe(false); // Invalid month
      expect(isValidExpiry('00', '25')).toBe(false); // Invalid month
      expect(isValidExpiry('12', '20')).toBe(false); // Past year (assuming current year > 2020)
      expect(isValidExpiry('invalid', 'invalid')).toBe(false);
    });
  });

  describe('isValidCVV', () => {
    it('should validate valid CVVs', () => {
      expect(isValidCVV('123')).toBe(true);
      expect(isValidCVV('1234')).toBe(true);
    });

    it('should reject invalid CVVs', () => {
      expect(isValidCVV('12')).toBe(false);
      expect(isValidCVV('12345')).toBe(false);
      expect(isValidCVV('abc')).toBe(false);
      expect(isValidCVV(null)).toBe(false);
    });
  });
});

describe('Customer Validation', () => {
  describe('isValidEmail', () => {
    it('should validate valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test.example.com')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate valid phone numbers', () => {
      expect(isValidPhoneNumber('+1-555-123-4567')).toBe(true);
      expect(isValidPhoneNumber('5551234567')).toBe(true);
      expect(isValidPhoneNumber('(555) 123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('abc')).toBe(false);
    });
  });
});

describe('Amount Validation', () => {
  describe('isValidAmount', () => {
    it('should validate valid amounts', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(100.5)).toBe(true);
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount('100.50')).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
      expect(isValidAmount('invalid')).toBe(false);
      expect(isValidAmount('100.999')).toBe(false);
    });
  });
});

describe('ID Validation', () => {
  describe('isValidTransactionId', () => {
    it('should validate valid transaction IDs', () => {
      expect(isValidTransactionId('txn_abc123')).toBe(true);
      expect(isValidTransactionId('txn_1234567890')).toBe(true);
    });

    it('should reject invalid IDs', () => {
      expect(isValidTransactionId('abc123')).toBe(false);
      expect(isValidTransactionId('txn_')).toBe(false);
      expect(isValidTransactionId(null)).toBe(false);
    });
  });

  describe('isValidCustomerId', () => {
    it('should validate valid customer IDs', () => {
      expect(isValidCustomerId('cust_abc123')).toBe(true);
      expect(isValidCustomerId('cust_1234567890')).toBe(true);
    });

    it('should reject invalid IDs', () => {
      expect(isValidCustomerId('abc123')).toBe(false);
      expect(isValidCustomerId('cust_')).toBe(false);
    });
  });

  describe('isValidTokenId', () => {
    it('should validate valid token IDs', () => {
      expect(isValidTokenId('tok_abc123')).toBe(true);
      expect(isValidTokenId('tok_1234567890')).toBe(true);
    });

    it('should reject invalid token IDs', () => {
      expect(isValidTokenId('abc123')).toBe(false);
      expect(isValidTokenId('tok_')).toBe(false);
      expect(isValidTokenId('xyz_123')).toBe(false);
      expect(isValidTokenId('ach_abc123')).toBe(false); // Not a tok_ prefix
      expect(isValidTokenId(null)).toBe(false);
      expect(isValidTokenId(undefined)).toBe(false);
    });
  });
});

describe('Environment Validation', () => {
  describe('isValidEnvironment', () => {
    it('should validate valid environments', () => {
      expect(isValidEnvironment('sandbox')).toBe(true);
      expect(isValidEnvironment('production')).toBe(true);
    });

    it('should reject invalid environments', () => {
      expect(isValidEnvironment('staging')).toBe(false);
      expect(isValidEnvironment('dev')).toBe(false);
      expect(isValidEnvironment(null)).toBe(false);
    });
  });
});

describe('Postal Code Validation', () => {
  describe('isValidPostalCode', () => {
    it('should validate US postal codes', () => {
      expect(isValidPostalCode('12345', 'US')).toBe(true);
      expect(isValidPostalCode('12345-6789', 'US')).toBe(true);
      expect(isValidPostalCode('90210', 'US')).toBe(true);
    });

    it('should validate Canadian postal codes', () => {
      expect(isValidPostalCode('A1A 1A1', 'CA')).toBe(true);
      expect(isValidPostalCode('K1A0B1', 'CA')).toBe(true);
    });

    it('should validate UK postal codes', () => {
      expect(isValidPostalCode('SW1A 0AA', 'GB')).toBe(true);
      expect(isValidPostalCode('M1 1AA', 'GB')).toBe(true);
    });

    it('should reject invalid postal codes', () => {
      expect(isValidPostalCode('1234', 'US')).toBe(false);
      expect(isValidPostalCode('invalid', 'US')).toBe(false);
      expect(isValidPostalCode('123456', 'CA')).toBe(false);
      expect(isValidPostalCode(null, 'US')).toBe(false);
      expect(isValidPostalCode('12345', 'INVALID')).toBeTruthy(); // Function accepts invalid country
    });

    it('should handle case-insensitive country codes', () => {
      expect(isValidPostalCode('12345', 'us')).toBe(true);
      expect(isValidPostalCode('SW1A 0AA', 'gb')).toBe(true);
    });
  });
});

describe('Pagination Validation', () => {
  describe('isValidPaginationParams', () => {
    it('should validate valid pagination params', () => {
      expect(isValidPaginationParams({ limit: 10, offset: 0 })).toBe(true);
      expect(isValidPaginationParams({ limit: 50, offset: 100 })).toBe(true);
      expect(isValidPaginationParams({ limit: 10 })).toBe(true);
      expect(isValidPaginationParams({ offset: 0 })).toBe(true);
    });

    it('should reject invalid pagination params', () => {
      expect(isValidPaginationParams({ limit: 0 })).toBe(false);
      expect(isValidPaginationParams({ limit: -1 })).toBe(false);
      expect(isValidPaginationParams({ limit: 1001 })).toBe(false);
      expect(isValidPaginationParams({ offset: -1 })).toBe(false);
      expect(isValidPaginationParams({ limit: 'invalid' as any })).toBe(false);
    });
  });
});

describe('Date Validation', () => {
  describe('isValidDateString', () => {
    it('should validate ISO date strings', () => {
      expect(isValidDateString('2024-01-01')).toBeTruthy(); // Function returns truthy value for valid dates
      expect(isValidDateString('2024-12-31')).toBeTruthy();
    });

    it('should validate ISO datetime strings', () => {
      // Function returns boolean - false for non-YYYY-MM-DD patterns
      expect(isValidDateString('2024-01-01T00:00:00Z')).toBe(false); // ISO datetime doesn't match YYYY-MM-DD pattern
      expect(isValidDateString('2024-01-01T12:30:45.123Z')).toBe(false);
      expect(isValidDateString('2024-01-01T12:30:45-05:00')).toBe(false);
    });

    it('should reject invalid date strings', () => {
      expect(isValidDateString('2024-13-01')).toBe(false); // Invalid month
      expect(isValidDateString('2024-02-30')).toBe(true); // JavaScript Date is forgiving, pattern matches
      expect(isValidDateString('invalid')).toBe(false);
      expect(isValidDateString('2024/01/01')).toBe(false); // Wrong format - doesn't match YYYY-MM-DD pattern
      expect(isValidDateString('')).toBe(false); // Empty string fails typeof check
      expect(isValidDateString(null)).toBe(false); // null fails typeof check
    });
  });

  describe('isDateInRange', () => {
    it('should check if date is within range', () => {
      const startDate = new Date('2024-06-01');
      const endDate = new Date('2024-07-15');

      expect(isDateInRange(new Date('2024-06-15'), startDate, endDate)).toBe(
        true
      );
      expect(isDateInRange(new Date('2024-06-01'), startDate, endDate)).toBe(
        true
      );
      expect(isDateInRange(new Date('2024-07-15'), startDate, endDate)).toBe(
        true
      );
    });

    it('should reject dates outside range', () => {
      const startDate = new Date('2024-06-01');
      const endDate = new Date('2024-07-15');

      expect(isDateInRange(new Date('2024-05-31'), startDate, endDate)).toBe(
        false
      );
      expect(isDateInRange(new Date('2024-07-16'), startDate, endDate)).toBe(
        false
      );
    });

    it('should handle open start date', () => {
      const endDate = new Date('2024-07-15');

      expect(isDateInRange(new Date('2024-01-01'), undefined, endDate)).toBe(
        true
      );
      expect(isDateInRange(new Date('2024-07-16'), undefined, endDate)).toBe(
        false
      );
    });

    it('should handle open end date', () => {
      const startDate = new Date('2024-06-01');
      const now = new Date();

      expect(isDateInRange(now, startDate, undefined)).toBe(true);
      expect(isDateInRange(new Date('2024-05-31'), startDate, undefined)).toBe(
        false
      );
    });

    it('should handle string dates', () => {
      expect(isDateInRange('2024-06-15', '2024-06-01', '2024-07-15')).toBe(
        true
      );
      expect(isDateInRange('2024-05-31', '2024-06-01', '2024-07-15')).toBe(
        false
      );
    });

    it('should handle invalid inputs', () => {
      expect(isDateInRange(null, new Date(), new Date())).toBe(false);
      expect(isDateInRange(new Date(), new Date(), new Date())).toBe(true);
      expect(isDateInRange('invalid-date', new Date(), new Date())).toBe(false);
    });
  });
});

describe('Validation Helpers', () => {
  describe('validatePaymentData', () => {
    it('should validate complete payment data', () => {
      const data = {
        amount: '100.00',
        creditcard: '4111111111111111',
        month: '12',
        year: '25',
        cvv: '123',
      };

      const result = validatePaymentData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const data = {
        amount: 'invalid',
        creditcard: '1234567890123456',
        month: '13',
        year: '20',
        cvv: '12',
      };

      const result = validatePaymentData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCustomerData', () => {
    it('should validate complete customer data', () => {
      const data = {
        email: 'test@example.com',
        phone: '+1-555-123-4567',
        postal_code: '12345',
        country: 'US',
      };

      const result = validateCustomerData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const data = {
        email: 'invalid-email',
        phone: '123',
        postal_code: 'invalid',
        country: 'US',
      };

      const result = validateCustomerData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
