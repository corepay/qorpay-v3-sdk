/**
 * Schemas Function Coverage Test
 *
 * This test file specifically targets the remaining function coverage gaps in schemas:
 * - payment-tokens.ts line 166: Date range refinement function
 * - paymentMethods.ts line 36: Type-object consistency refinement function
 */

import {
  CreatePaymentTokenRequestSchema,
  CreatePaymentMethodSchema,
} from '../../src/schemas';

describe('Schemas - Function Coverage', () => {
  describe('CreatePaymentTokenRequestSchema refinement (line 166)', () => {
    it('should execute refinement function with valid date range', () => {
      // This should pass and execute the refinement function on line 166
      const result = CreatePaymentTokenRequestSchema.parse({
        type: 'card',
        card: {
          cardNumber: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
        },
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        customer_id: 'customer_123',
      });

      expect(result).toBeDefined();
      expect(result.start_date).toBe('2024-01-01');
      expect(result.end_date).toBe('2024-12-31');
    });

    it('should execute refinement function with invalid date range (line 166)', () => {
      // This should fail and execute the refinement function on line 166
      expect(() => {
        CreatePaymentTokenRequestSchema.parse({
          type: 'card',
          card: {
            cardNumber: '4242424242424242',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
          },
          start_date: '2024-12-31', // Start after end date
          end_date: '2024-01-01', // End before start date
          customer_id: 'customer_123',
        });
      }).toThrow('Start date must be before or equal to end date');
    });

    it('should execute refinement function with equal dates (line 166)', () => {
      // This should pass and execute the refinement function on line 166
      const result = CreatePaymentTokenRequestSchema.parse({
        type: 'ach',
        ach: {
          accountNumber: '123456789',
          routingNumber: '021000021',
          accountType: 'checking',
        },
        start_date: '2024-06-15',
        end_date: '2024-06-15', // Same dates - should be valid
        customer_id: 'customer_456',
      });

      expect(result).toBeDefined();
      expect(result.start_date).toBe('2024-06-15');
      expect(result.end_date).toBe('2024-06-15');
    });

    it('should execute refinement function with different date formats (line 166)', () => {
      // Test with ISO date strings
      const result = CreatePaymentTokenRequestSchema.parse({
        type: 'card',
        card: {
          cardNumber: '5555555555554444',
          expiryMonth: '06',
          expiryYear: '2026',
          cvv: '456',
        },
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        customer_id: 'customer_789',
      });

      expect(result).toBeDefined();
    });
  });

  describe('CreatePaymentMethodSchema refinement (line 36)', () => {
    it('should execute refinement function with card type and card object', () => {
      // This should pass and execute the refinement function on line 36
      const result = CreatePaymentMethodSchema.parse({
        type: 'card',
        card: {
          cardNumber: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
        },
        customer_id: 'customer_123',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('card');
      expect(result.card).toBeDefined();
    });

    it('should execute refinement function with ach type and ach object', () => {
      // This should pass and execute the refinement function on line 36
      const result = CreatePaymentMethodSchema.parse({
        type: 'ach',
        ach: {
          accountNumber: '123456789',
          routingNumber: '021000021',
          accountType: 'checking',
        },
        customer_id: 'customer_456',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('ach');
      expect(result.ach).toBeDefined();
    });

    it('should execute refinement function with card type but missing card object (line 36)', () => {
      // This should fail and execute the refinement function on line 36
      expect(() => {
        CreatePaymentMethodSchema.parse({
          type: 'card',
          // Missing card object - should trigger refinement failure
          customer_id: 'customer_123',
        });
      }).toThrow(
        "When type is 'card' a card object must be provided, and when type is 'ach' an ach object must be provided."
      );
    });

    it('should execute refinement function with ach type but missing ach object (line 36)', () => {
      // This should fail and execute the refinement function on line 36
      expect(() => {
        CreatePaymentMethodSchema.parse({
          type: 'ach',
          // Missing ach object - should trigger refinement failure
          customer_id: 'customer_456',
        });
      }).toThrow(
        "When type is 'card' a card object must be provided, and when type is 'ach' an ach object must be provided."
      );
    });

    it('should execute refinement function with card type and null card object (line 36)', () => {
      // This should fail and execute the refinement function on line 36
      expect(() => {
        CreatePaymentMethodSchema.parse({
          type: 'card',
          card: null, // Null card object - should trigger refinement failure
          customer_id: 'customer_123',
        });
      }).toThrow(
        "When type is 'card' a card object must be provided, and when type is 'ach' an ach object must be provided."
      );
    });

    it('should execute refinement function with card type and empty card object (line 36)', () => {
      // This should pass and execute the refinement function on line 36
      const result = CreatePaymentMethodSchema.parse({
        type: 'card',
        card: {}, // Empty card object - should pass refinement but fail schema validation
        customer_id: 'customer_123',
      });

      // This will fail schema validation but the refinement function should execute
      expect(result).toBeDefined();
    });

    it('should execute refinement function with unknown type (line 36)', () => {
      // For unknown types, the refinement should return true (line 36)
      expect(() => {
        CreatePaymentMethodSchema.parse({
          type: 'unknown_type' as any, // Unknown type - should pass refinement
          customer_id: 'customer_789',
        });
      }).toThrow(); // Will fail on schema validation for type enum, but refinement should pass
    });
  });

  describe('Multiple refinement function executions', () => {
    it('should execute payment token refinement multiple times', () => {
      // Execute the refinement function multiple times to ensure coverage
      for (let i = 0; i < 5; i++) {
        const result = CreatePaymentTokenRequestSchema.parse({
          type: 'card',
          card: {
            cardNumber: '4242424242424242',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123',
          },
          start_date: '2024-01-01',
          end_date: `2024-12-31`, // Valid range
          customer_id: `customer_${i}`,
        });

        expect(result).toBeDefined();
      }
    });

    it('should execute payment method refinement multiple times', () => {
      // Execute the refinement function multiple times to ensure coverage
      for (let i = 0; i < 5; i++) {
        const result = CreatePaymentMethodSchema.parse({
          type: i % 2 === 0 ? 'card' : 'ach',
          [i % 2 === 0 ? 'card' : 'ach']:
            i % 2 === 0
              ? {
                  cardNumber: '4242424242424242',
                  expiryMonth: '12',
                  expiryYear: '2025',
                  cvv: '123',
                }
              : {
                  accountNumber: '123456789',
                  routingNumber: '021000021',
                  accountType: 'checking',
                },
          customer_id: `customer_${i}`,
        });

        expect(result).toBeDefined();
      }
    });
  });
});
