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
  isPaymentStatus,
  isTransactionType,
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  isValidEmail,
  isValidPhoneNumber,
  isValidAmount,
  isValidTransactionId,
  isValidCustomerId,
  isValidEnvironment,
  validatePaymentData,
  validateCustomerData,
} from '../../src/utils/type-guards';
import { QorPayApiError, QorPayNetworkError } from '../../src/errors';

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
      expect(isSuccessResponse({ status: 'success', data: { id: '123' } })).toBe(true);
    });

    it('should reject non-success responses', () => {
      expect(isSuccessResponse({ status: 'error' })).toBe(false);
      expect(isSuccessResponse({ status: 'pending' })).toBe(false);
    });
  });

  describe('isErrorResponse', () => {
    it('should identify error responses', () => {
      expect(isErrorResponse({ status: 'error' })).toBe(true);
      expect(isErrorResponse({ status: 'error', message: 'Failed' })).toBe(true);
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
      expect(isValidExpiry(currentMonth.toString().padStart(2, '0'), currentYear.toString())).toBe(true);

      // Future dates should be valid
      expect(isValidExpiry('12', '99')).toBe(true);
      if (currentMonth < 12) {
        expect(isValidExpiry((currentMonth + 1).toString().padStart(2, '0'), currentYear.toString())).toBe(true);
      }
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
      expect(isValidAmount(100.50)).toBe(true);
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