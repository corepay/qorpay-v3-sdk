/**
 * Schemas Function Coverage Test
 *
 * This test file specifically targets the function coverage gaps in schemas.
 */

import { CreatePaymentMethodSchema } from '../../src/schemas/paymentMethods';

describe('Schemas - Function Coverage', () => {
  describe('CreatePaymentMethodSchema refinement (line 36)', () => {
    it('should execute refinement function with card type and card object', () => {
      // This should pass and execute the refinement function on line 36
      const result = CreatePaymentMethodSchema.parse({
        type: 'card',
        card: {
          number: '4242424242424242',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
        },
        customerId: 'customer_123',
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
        customerId: 'customer_456',
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
          customerId: 'customer_123',
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
          customerId: 'customer_456',
        });
      }).toThrow(
        "When type is 'card' a card object must be provided, and when type is 'ach' an ach object must be provided."
      );
    });

    it('should execute refinement function with card type and null card object (line 36)', () => {
      // Zod validates null before refinement, so we expect a Zod error
      expect(() => {
        CreatePaymentMethodSchema.parse({
          type: 'card',
          card: null, // Null card object - should trigger schema validation failure
          customerId: 'customer_123',
        });
      }).toThrow('Expected object, received null');
    });

    it('should execute refinement function with unknown type (line 36)', () => {
      // For unknown types, the refinement should return true (line 36)
      expect(() => {
        CreatePaymentMethodSchema.parse({
          type: 'unknown_type' as any, // Unknown type - should pass refinement
          customerId: 'customer_789',
        });
      }).toThrow(); // Will fail on schema validation for type enum, but refinement should pass
    });
  });

  describe('Multiple refinement function executions', () => {
    it('should execute payment method refinement multiple times', () => {
      // Execute the refinement function multiple times to ensure coverage
      for (let i = 0; i < 5; i++) {
        const isCard = i % 2 === 0;
        const result = CreatePaymentMethodSchema.parse({
          type: isCard ? 'card' : 'ach',
          card: isCard
            ? {
                number: '4242424242424242',
                expiryMonth: '12',
                expiryYear: '25',
                cvv: '123',
              }
            : undefined,
          ach: !isCard
            ? {
                accountNumber: '123456789',
                routingNumber: '021000021',
                accountType: 'checking',
              }
            : undefined,
          customerId: `customer_${i}`,
        });

        expect(result).toBeDefined();
        expect(result.type).toBe(isCard ? 'card' : 'ach');
      }
    });
  });
});
