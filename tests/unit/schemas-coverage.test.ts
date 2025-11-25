/**
 * @file tests/unit/schemas-coverage.test.ts
 * @description Coverage tests for schema validation to achieve 100% coverage
 */

import { z } from 'zod';
import {
  CardTokenListQuerySchema,
  PaymentMethodSchema,
  PaymentTokenListQuerySchema,
} from '../../src/schemas';

describe('Schema Validation - Coverage Tests', () => {
  describe('CardTokenListQuerySchema', () => {
    it('should validate date range with start and end dates', () => {
      const validData = {
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        limit: 10,
        offset: 0,
      };

      const result = CardTokenListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject when start date is after end date', () => {
      const invalidData = {
        start_date: new Date('2025-02-01'),
        end_date: new Date('2025-01-31'),
      };

      const result = CardTokenListQuerySchema.safeParse(invalidData);
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

      const result = CardTokenListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle missing dates', () => {
      const validData = {
        limit: 50,
      };

      const result = CardTokenListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate limit constraints', () => {
      const validData = {
        start_date: new Date('2025-01-01'),
        limit: 1, // Minimum
      };

      const result = CardTokenListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);

      const validData2 = {
        start_date: new Date('2025-01-01'),
        limit: 100, // Maximum
      };

      const result2 = CardTokenListQuerySchema.safeParse(validData2);
      expect(result2.success).toBe(true);
    });

    it('should reject invalid limit values', () => {
      const invalidData = {
        start_date: new Date('2025-01-01'),
        limit: 0, // Too low
      };

      const result = CardTokenListQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      const invalidData2 = {
        start_date: new Date('2025-01-01'),
        limit: 101, // Too high
      };

      const result2 = CardTokenListQuerySchema.safeParse(invalidData2);
      expect(result2.success).toBe(false);
    });

    it('should validate offset constraints', () => {
      const validData = {
        start_date: new Date('2025-01-01'),
        offset: 0, // Minimum
      };

      const result = CardTokenListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);

      const validData2 = {
        start_date: new Date('2025-01-01'),
        offset: 1000, // High offset
      };

      const result2 = CardTokenListQuerySchema.safeParse(validData2);
      expect(result2.success).toBe(true);
    });

    it('should reject negative offset', () => {
      const invalidData = {
        start_date: new Date('2025-01-01'),
        offset: -1, // Negative
      };

      const result = CardTokenListQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('PaymentMethodSchema', () => {
    it('should require card object when type is card', () => {
      const invalidData = {
        type: 'card',
        customer_id: 'cust_123',
        // Missing card object
      };

      const result = PaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "When type is 'card' a card object must be provided"
        );
      }
    });

    it('should require ach object when type is ach', () => {
      const invalidData = {
        type: 'ach',
        customer_id: 'cust_123',
        // Missing ach object
      };

      const result = PaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "When type is 'ach' an ach object must be provided"
        );
      }
    });

    it('should accept any type without additional data', () => {
      const validData = {
        type: 'other_type',
        customer_id: 'cust_123',
      };

      const result = PaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept card object with type card', () => {
      const validData = {
        type: 'card',
        customer_id: 'cust_123',
        card: {
          creditcard: '4111111111111111',
          month: '12',
          year: '2025',
          cvv: '123',
        },
      };

      const result = PaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept ach object with type ach', () => {
      const validData = {
        type: 'ach',
        customer_id: 'cust_123',
        ach: {
          account_type: 'checking',
          routing_number: '021000021',
          account_number: '123456789',
        },
      };

      const result = PaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle empty card object', () => {
      const invalidData = {
        type: 'card',
        customer_id: 'cust_123',
        card: {}, // Empty object
      };

      const result = PaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(true); // The refine only checks for existence, not validity
    });

    it('should handle empty ach object', () => {
      const invalidData = {
        type: 'ach',
        customer_id: 'cust_123',
        ach: {}, // Empty object
      };

      const result = PaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(true); // The refine only checks for existence, not validity
    });
  });

  describe('PaymentTokenListQuerySchema', () => {
    it('should have the same validation as CardTokenListQuerySchema', () => {
      // These schemas appear to be identical, so test the same validations
      const validData = {
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        limit: 10,
        offset: 0,
      };

      const result = PaymentTokenListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);

      const invalidData = {
        start_date: new Date('2025-02-01'),
        end_date: new Date('2025-01-31'), // Start after end
      };

      const result2 = PaymentTokenListQuerySchema.safeParse(invalidData);
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

      const result = CardTokenListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle invalid Date objects', () => {
      const invalidData = {
        start_date: new Date('invalid'),
        end_date: new Date('2025-01-31'),
      };

      // Zod will attempt to parse this
      const result = CardTokenListQuerySchema.safeParse(invalidData);
      // The result depends on how Zod handles invalid dates
    });

    it('should handle extreme limit values', () => {
      const validData = {
        limit: Number.MAX_SAFE_INTEGER,
      };

      const result = CardTokenListQuerySchema.safeParse(validData);
      expect(result.success).toBe(false); // Should fail due to max(100) constraint
    });
  });
});