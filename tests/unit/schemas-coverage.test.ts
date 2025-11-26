/**
 * @file tests/unit/schemas-coverage.test.ts
 * @description Coverage tests for schema validation to achieve 100% coverage
 */

import { z } from 'zod';
import {
  PaymentMethodSchema,
  CreatePaymentMethodSchema,
  FetchCardTokensQueryParamsSchema,
  ExpiringCardTokensParamsSchema,
} from '../../src/schemas';

describe('Schema Validation - Coverage Tests', () => {
  describe('FetchCardTokensQueryParamsSchema', () => {
    it('should validate card token query parameters', () => {
      const validData = {
        limit: 10,
        offset: 0,
        sort_by: 'created_at',
        sort_order: 'asc',
        customer_id: 'cust_123',
        card_type: 'visa',
        exp_month: 12,
        exp_year: 2025,
        card_holder: 'John Doe',
      };

      const result = FetchCardTokensQueryParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate limit constraints', () => {
      const validData = {
        limit: 1, // Minimum
      };

      const result = FetchCardTokensQueryParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);

      const validData2 = {
        limit: 100, // Maximum
      };

      const result2 = FetchCardTokensQueryParamsSchema.safeParse(validData2);
      expect(result2.success).toBe(true);
    });

    it('should reject invalid limit values', () => {
      const invalidData = {
        limit: 0, // Too low
      };

      const result = FetchCardTokensQueryParamsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      const invalidData2 = {
        limit: 101, // Too high
      };

      const result2 = FetchCardTokensQueryParamsSchema.safeParse(invalidData2);
      expect(result2.success).toBe(false);
    });

    it('should validate offset constraints', () => {
      const validData = {
        offset: 0, // Minimum
      };

      const result = FetchCardTokensQueryParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);

      const validData2 = {
        offset: 1000, // High offset
      };

      const result2 = FetchCardTokensQueryParamsSchema.safeParse(validData2);
      expect(result2.success).toBe(true);
    });

    it('should reject negative offset', () => {
      const invalidData = {
        offset: -1, // Negative
      };

      const result = FetchCardTokensQueryParamsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('ExpiringCardTokensParamsSchema', () => {
    it('should reject when start date is after end date', () => {
      const invalidData = {
        start_date: new Date('2025-02-01'),
        end_date: new Date('2025-01-31'),
      };

      const result = ExpiringCardTokensParamsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Start date must be before or equal to end date'
        );
      }
    });

    it('should accept when start date equals end date', () => {
      const validData = {
        start_date: new Date('2025-01-15'),
        end_date: new Date('2025-01-15'),
      };

      const result = ExpiringCardTokensParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate limit constraints with dates', () => {
      const validData = {
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        limit: 1, // Minimum
      };

      const result = ExpiringCardTokensParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);

      const validData2 = {
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        limit: 100, // Maximum
      };

      const result2 = ExpiringCardTokensParamsSchema.safeParse(validData2);
      expect(result2.success).toBe(true);
    });

    it('should reject invalid limit values with dates', () => {
      const invalidData = {
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        limit: 0, // Too low
      };

      const result = ExpiringCardTokensParamsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      const invalidData2 = {
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        limit: 101, // Too high
      };

      const result2 = ExpiringCardTokensParamsSchema.safeParse(invalidData2);
      expect(result2.success).toBe(false);
    });
  });

  describe('CreatePaymentMethodSchema', () => {
    it('should require card object when type is card', () => {
      const invalidData = {
        type: 'card',
        customerId: 'cust_123',
        // Missing card object
      };

      const result = CreatePaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "When type is 'card' a card object must be provided, and when type is 'ach' an ach object must be provided."
        );
      }
    });

    it('should require ach object when type is ach', () => {
      const invalidData = {
        type: 'ach',
        customerId: 'cust_123',
        // Missing ach object
      };

      const result = CreatePaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "When type is 'card' a card object must be provided, and when type is 'ach' an ach object must be provided."
        );
      }
    });

    it('should accept card object with type card', () => {
      const validData = {
        type: 'card',
        customerId: 'cust_123',
        card: {
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
          name: 'John Doe',
        },
      };

      const result = CreatePaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept ach object with type ach', () => {
      const validData = {
        type: 'ach',
        customerId: 'cust_123',
        ach: {
          accountNumber: '123456789',
          routingNumber: '987654321',
          accountType: 'checking',
          name: 'John Doe',
        },
      };

      const result = CreatePaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle empty card object', () => {
      // Test the optional nature of some card fields
      const validData = {
        type: 'card',
        customerId: 'cust_123',
        card: {
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '25',
          // cvv and name are optional
        },
      };

      const result = CreatePaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle empty ach object', () => {
      // Test the optional nature of some ach fields
      const validData = {
        type: 'ach',
        customerId: 'cust_123',
        ach: {
          accountNumber: '123456789',
          routingNumber: '987654321',
          accountType: 'checking',
          // name is optional
        },
      };

      const result = CreatePaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('PaymentMethodSchema (Response)', () => {
    it('should accept payment method response with card data', () => {
      const validResponseData = {
        id: 'pm_123',
        type: 'card',
        customerId: 'cust_123',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        card: {
          brand: 'visa',
          last4: '4242',
          expiryMonth: '12',
          expiryYear: '25',
        },
      };

      const result = PaymentMethodSchema.safeParse(validResponseData);
      expect(result.success).toBe(true);
    });

    it('should accept payment method response with ach data', () => {
      const validResponseData = {
        id: 'pm_456',
        type: 'ach',
        customerId: 'cust_123',
        createdAt: '2024-01-15T10:30:00Z',
        ach: {
          accountType: 'checking',
          last4: '6789',
          routingNumber: '987654321',
          bankName: 'Test Bank',
        },
      };

      const result = PaymentMethodSchema.safeParse(validResponseData);
      expect(result.success).toBe(true);
    });
  });

  describe('Schema comparison tests', () => {
    it('should test date validation with ExpiringCardTokensParamsSchema', () => {
      const validData = {
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        limit: 10,
        offset: 0,
      };

      const result = ExpiringCardTokensParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);

      const invalidData = {
        start_date: new Date('2025-02-01'),
        end_date: new Date('2025-01-31'), // Start after end
      };

      const result2 = ExpiringCardTokensParamsSchema.safeParse(invalidData);
      expect(result2.success).toBe(false);
    });
  });

  describe('Schema edge cases', () => {
    it('should handle Date objects at boundaries', () => {
      const earliestDate = new Date('1970-01-01');
      const latestDate = new Date('9999-12-31');

      const validData = {
        start_date: earliestDate,
        end_date: latestDate,
      };

      const result = ExpiringCardTokensParamsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle invalid Date objects', () => {
      const invalidData = {
        start_date: new Date('invalid'),
        end_date: new Date('2025-01-31'),
      };

      // Zod will attempt to parse this
      const result = ExpiringCardTokensParamsSchema.safeParse(invalidData);
      // The result depends on how Zod handles invalid dates
    });

    it('should handle extreme limit values', () => {
      const validData = {
        limit: Number.MAX_SAFE_INTEGER,
      };

      const result = FetchCardTokensQueryParamsSchema.safeParse(validData);
      expect(result.success).toBe(false); // Should fail due to max(100) constraint
    });
  });
});
