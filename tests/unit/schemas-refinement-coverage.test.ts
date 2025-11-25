/**
 * @file tests/unit/schemas-refinement-coverage.test.ts
 * @description Schema refinement coverage tests for lines 166, 36
 */

import { CreatePaymentTokenRequestSchema } from '../../src/schemas/payment-tokens';
import { CreatePaymentMethodSchema } from '../../src/schemas/paymentMethods';

describe('Schemas - Refinement Coverage Tests', () => {
  describe('CreatePaymentTokenRequestSchema - line 166 (date validation)', () => {
    it('should trigger start_date <= end_date refinement (line 166)', () => {
      // This should trigger the refinement validation on line 166
      const invalidData = {
        type: 'card',
        start_date: '2024-12-31',
        end_date: '2024-01-01', // End date before start date - should fail validation
        card: {
          number: '4242424242424242',
          expiry: '12/25',
          cvv: '123',
        },
      };

      // This should trigger the refinement and throw a ZodError
      expect(() => {
        CreatePaymentTokenRequestSchema.parse(invalidData);
      }).toThrow();
    });

    it('should pass start_date <= end_date refinement when valid', () => {
      // This should pass the refinement validation on line 166
      const validData = {
        type: 'card',
        start_date: '2024-01-01',
        end_date: '2024-12-31', // End date after start date - should pass validation
        card: {
          number: '4242424242424242',
          expiry: '12/25',
          cvv: '123',
        },
      };

      // This should pass the refinement and not throw
      const result = CreatePaymentTokenRequestSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should pass when start_date equals end_date (line 166)', () => {
      // This should pass the refinement validation on line 166
      const validData = {
        type: 'card',
        start_date: '2024-12-31',
        end_date: '2024-12-31', // Same dates - should pass validation
        card: {
          number: '4242424242424242',
          expiry: '12/25',
          cvv: '123',
        },
      };

      const result = CreatePaymentTokenRequestSchema.parse(validData);
      expect(result).toEqual(validData);
    });
  });

  describe('CreatePaymentMethodSchema - line 36 (type-specific object validation)', () => {
    it('should trigger type refinement for card without card object (line 36)', () => {
      // This should trigger the refinement validation on line 36
      const invalidData = {
        customerId: 'cust_123',
        type: 'card',
        ach: {
          routingNumber: '123456789',
          accountNumber: '123456789',
          accountType: 'checking',
        }, // ACH object provided but type is 'card' - should fail validation
      };

      // This should trigger the refinement and throw a ZodError
      expect(() => {
        CreatePaymentMethodSchema.parse(invalidData);
      }).toThrow();
    });

    it('should trigger type refinement for ach without ach object (line 36)', () => {
      // This should trigger the refinement validation on line 36
      const invalidData = {
        customerId: 'cust_123',
        type: 'ach',
        card: {
          number: '4242424242424242',
          expiry: '12/25',
          cvv: '123',
        }, // Card object provided but type is 'ach' - should fail validation
      };

      // This should trigger the refinement and throw a ZodError
      expect(() => {
        CreatePaymentMethodSchema.parse(invalidData);
      }).toThrow();
    });

    it('should pass refinement for card with card object (line 36)', () => {
      // This should pass the refinement validation on line 36
      const validData = {
        customerId: 'cust_123',
        type: 'card',
        card: {
          number: '4242424242424242',
          expiry: '12/25',
          cvv: '123',
        }, // Card object provided and type is 'card' - should pass validation
      };

      const result = CreatePaymentMethodSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should pass refinement for ach with ach object (line 36)', () => {
      // This should pass the refinement validation on line 36
      const validData = {
        customerId: 'cust_123',
        type: 'ach',
        ach: {
          routingNumber: '123456789',
          accountNumber: '123456789',
          accountType: 'checking',
        }, // ACH object provided and type is 'ach' - should pass validation
      };

      const result = CreatePaymentMethodSchema.parse(validData);
      expect(result).toEqual(validData);
    });
  });
});
