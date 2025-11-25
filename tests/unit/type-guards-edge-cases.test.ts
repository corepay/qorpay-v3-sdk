/**
 * @file tests/unit/type-guards-edge-cases.test.ts
 * @description Edge case tests for type guards to achieve 100% coverage
 */

import {
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  isValidPostalCode,
  isValidAmount,
  isValidDateString,
  isDateInRange,
  validatePaymentData,
  validateCustomerData,
} from '../../src/utils/type-guards';

describe('Type Guards - Edge Cases for Full Coverage', () => {
  describe('isValidCardNumber', () => {
    it('should handle Luhn check edge cases', () => {
      // Test cards that pass format but fail Luhn
      expect(isValidCardNumber('1234567812345670')).toBe(false); // 16 digits, fails Luhn
      expect(isValidCardNumber('1111111111111111')).toBe(false); // All 1s, fails Luhn

      // Test valid Luhn examples
      expect(isValidCardNumber('4532015112830366')).toBe(true); // Visa
      expect(isValidCardNumber('5555555555554444')).toBe(true); // Mastercard
      expect(isValidCardNumber('378282246310005')).toBe(true); // Amex (15 digits)
      expect(isValidCardNumber('6011111111111117')).toBe(true); // Discover
    });

    it('should handle edge cases for length', () => {
      expect(isValidCardNumber('1234567890123')).toBe(false); // 13 digits, could be valid but fails Luhn
      expect(isValidCardNumber('1234567890123456789')).toBe(false); // 19 digits, could be valid but fails Luhn
    });
  });

  describe('isValidExpiry', () => {
    it('should handle edge cases for date validation', () => {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      // Edge case: last month of previous year
      expect(isValidExpiry('12', (currentYear - 1).toString())).toBe(false);

      // Edge case: first month of current year (if not January)
      if (currentMonth > 1) {
        expect(isValidExpiry('01', currentYear.toString())).toBe(true);
      }

      // Edge case: December of current year
      expect(isValidExpiry('12', currentYear.toString())).toBe(true);

      // Edge case: January of next year
      expect(isValidExpiry('01', (currentYear + 1).toString())).toBe(true);

      // Edge case: invalid months
      expect(isValidExpiry('00', currentYear.toString())).toBe(false);
      expect(isValidExpiry('13', currentYear.toString())).toBe(false);
    });
  });

  describe('isValidCVV', () => {
    it('should handle various CVV edge cases', () => {
      // Valid CVVs
      expect(isValidCVV('123')).toBe(true); // 3 digits
      expect(isValidCVV('1234')).toBe(true); // 4 digits (for Amex)
      expect(isValidCVV('000')).toBe(true); // All zeros
      expect(isValidCVV('9999')).toBe(true); // All nines

      // Invalid CVVs
      expect(isValidCVV('12')).toBe(false); // Too short
      expect(isValidCVV('12345')).toBe(false); // Too long
      expect(isValidCVV('12a')).toBe(false); // Contains letter
      expect(isValidCVV('abc')).toBe(false); // All letters
      expect(isValidCVV('12-34')).toBe(false); // Contains special char
    });
  });

  describe('isValidPostalCode', () => {
    it('should handle various country postal codes', () => {
      // US edge cases
      expect(isValidPostalCode('12345', 'US')).toBe(true);
      expect(isValidPostalCode('12345-6789', 'US')).toBe(true);
      expect(isValidPostalCode('00123', 'US')).toBe(true); // Leading zeros
      expect(isValidPostalCode('1234', 'US')).toBe(false); // Too short
      expect(isValidPostalCode('123456', 'US')).toBe(false); // Too long
      expect(isValidPostalCode('1234-5678', 'US')).toBe(false); // Invalid format

      // Canada edge cases
      expect(isValidPostalCode('K1A 0A1', 'CA')).toBe(true);
      expect(isValidPostalCode('k1a0a1', 'CA')).toBe(true); // Lowercase
      expect(isValidPostalCode('K1A0A1', 'CA')).toBe(true); // No space
      expect(isValidPostalCode('K1A-0A1', 'CA')).toBe(true); // Dash
      expect(isValidPostalCode('A1A1A1', 'CA')).toBe(false); // Invalid format

      // UK edge cases
      expect(isValidPostalCode('SW1A 0AA', 'GB')).toBe(true);
      expect(isValidPostalCode('sw1a 0aa', 'GB')).toBe(true); // Lowercase
      expect(isValidPostalCode('SW1A0AA', 'GB')).toBe(false); // Missing space
      expect(isValidPostalCode('SW1A0A', 'GB')).toBe(false); // Too short

      // Generic case (no country specified)
      expect(isValidPostalCode('12345')).toBe(true); // Generic
      expect(isValidPostalCode('ABC-123')).toBe(true); // Generic
      expect(isValidPostalCode('AB')).toBe(false); // Too short
      expect(isValidPostalCode('ABCDEFGHIJK')).toBe(false); // Too long

      // Non-string input
      expect(isValidPostalCode(12345 as any, 'US')).toBe(false);
      expect(isValidPostalCode(null as any, 'US')).toBe(false);
      expect(isValidPostalCode(undefined as any, 'US')).toBe(false);
    });

    it('should handle case-insensitive country codes', () => {
      expect(isValidPostalCode('12345', 'us')).toBe(true);
      expect(isValidPostalCode('12345', 'US')).toBe(true);
      expect(isValidPostalCode('SW1A 0AA', 'gb')).toBe(true);
      expect(isValidPostalCode('SW1A 0AA', 'GB')).toBe(true);
      expect(isValidPostalCode('K1A 0A1', 'ca')).toBe(true);
      expect(isValidPostalCode('K1A 0A1', 'CA')).toBe(true);
    });
  });

  describe('isValidAmount', () => {
    it('should handle numeric amounts', () => {
      // Valid numbers
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(100.5)).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
      expect(isValidAmount(999999.99)).toBe(true);

      // Invalid numbers
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(-0.01)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
      expect(isValidAmount(-Infinity)).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
    });

    it('should handle string amounts', () => {
      // Valid strings
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount('100.50')).toBe(true);
      expect(isValidAmount('0.01')).toBe(true);
      expect(isValidAmount('.50')).toBe(false); // No leading zero
      expect(isValidAmount('100.')).toBe(false); // Trailing decimal
      expect(isValidAmount('100.999')).toBe(false); // Too many decimal places

      // Invalid strings
      expect(isValidAmount('0')).toBe(false);
      expect(isValidAmount('-100')).toBe(false);
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('100abc')).toBe(false);
      expect(isValidAmount('')).toBe(false);
      expect(isValidAmount('100.50.25')).toBe(false);
    });

    it('should handle edge cases for decimal places', () => {
      expect(isValidAmount('100.0')).toBe(true); // One decimal place
      expect(isValidAmount('100.00')).toBe(true); // Two decimal places
      expect(isValidAmount('100.5')).toBe(true); // One decimal place
      expect(isValidAmount('100.55')).toBe(true); // Two decimal places
      expect(isValidAmount('100.555')).toBe(false); // Three decimal places
      expect(isValidAmount('100.5555')).toBe(false); // Four decimal places
    });
  });

  describe('isValidDateString', () => {
    it('should validate ISO date strings properly', () => {
      // Valid dates
      expect(isValidDateString('2024-01-01')).toBe(true);
      expect(isValidDateString('2024-12-31')).toBe(true);
      expect(isValidDateString('0001-01-01')).toBe(true);
      expect(isValidDateString('9999-12-31')).toBe(true);

      // Invalid dates
      expect(isValidDateString('2024-13-01')).toBe(false); // Invalid month
      expect(isValidDateString('2024-00-01')).toBe(false); // Invalid month
      expect(isValidDateString('2024-02-30')).toBe(true); // JavaScript accepts this
      expect(isValidDateString('2024-04-31')).toBe(true); // JavaScript accepts this
      expect(isValidDateString('2024-1-1')).toBe(false); // Not zero-padded
      expect(isValidDateString('24-01-01')).toBe(false); // Wrong year format
      expect(isValidDateString('2024/01/01')).toBe(false); // Wrong separator
      expect(isValidDateString('2024-01')).toBe(false); // Incomplete
      expect(isValidDateString('2024-01-01T00:00:00Z')).toBe(false); // Has time part
    });

    it('should handle invalid inputs', () => {
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString('invalid')).toBe(false);
      expect(isValidDateString(null as any)).toBe(false);
      expect(isValidDateString(undefined as any)).toBe(false);
      expect(isValidDateString(20240101 as any)).toBe(false);
      expect(isValidDateString(new Date() as any)).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    it('should handle null/undefined dates', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      expect(isDateInRange(null as any, startDate, endDate)).toBe(false);
      expect(isDateInRange(undefined as any, startDate, endDate)).toBe(false);
      expect(isDateInRange('invalid-date', startDate, endDate)).toBe(false);
    });

    it('should handle open date ranges', () => {
      const middleDate = new Date('2024-06-15');

      // Open start date
      expect(isDateInRange(middleDate, undefined, new Date('2024-12-31'))).toBe(
        true
      );
      expect(
        isDateInRange(new Date('2025-01-01'), undefined, new Date('2024-12-31'))
      ).toBe(false);

      // Open end date
      expect(isDateInRange(middleDate, new Date('2024-01-01'), undefined)).toBe(
        true
      );
      expect(
        isDateInRange(new Date('2023-12-31'), new Date('2024-01-01'), undefined)
      ).toBe(false);

      // Both open
      expect(isDateInRange(new Date(), undefined, undefined)).toBe(true);
    });

    it('should handle invalid date inputs', () => {
      expect(isDateInRange('2024-06-15', 'invalid-start', '2024-12-31')).toBe(
        false
      );
      expect(isDateInRange('2024-06-15', '2024-01-01', 'invalid-end')).toBe(
        false
      );
      expect(isDateInRange('invalid', '2024-01-01', '2024-12-31')).toBe(false);
    });
  });

  describe('validatePaymentData', () => {
    it('should validate card numbers with Luhn check', () => {
      const validData = {
        amount: '100.00',
        creditcard: '4532015112830366', // Valid Luhn
        month: '12',
        year: '25',
        cvv: '123',
      };

      expect(validatePaymentData(validData).isValid).toBe(true);

      const invalidCardData = {
        ...validData,
        creditcard: '1234567812345670', // Invalid Luhn
      };

      expect(validatePaymentData(invalidCardData).isValid).toBe(false);
    });
  });

  describe('validateCustomerData', () => {
    it('should validate postal codes by country', () => {
      const usData = {
        email: 'test@example.com',
        postal_code: '12345',
        country: 'US',
      };

      expect(validateCustomerData(usData).isValid).toBe(true);

      const caData = {
        email: 'test@example.com',
        postal_code: 'K1A 0A1',
        country: 'CA',
      };

      expect(validateCustomerData(caData).isValid).toBe(true);

      const invalidUSData = {
        email: 'test@example.com',
        postal_code: '1234',
        country: 'US',
      };

      expect(validateCustomerData(invalidUSData).isValid).toBe(false);
    });
  });
});
