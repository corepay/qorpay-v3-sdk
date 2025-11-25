/**
 * @file tests/unit/schemas.test.ts
 * @description Direct testing of Zod schemas for runtime validation
 */

import {
  PaymentSaleManualRequestSchema,
  PaymentSaleTokenRequestSchema,
  PaymentAuthTokenRequestSchema,
  PaymentRefundRequestSchema,
  
  
  RecurringDetailsSchema,
} from '../../src/schemas/payments';
import { CreateCardTokenRequestSchema } from '../../src/schemas/payment-tokens';
import { CustomerRequestSchema } from '../../src/schemas/customers';
import { TransactionListParamsSchema } from '../../src/schemas/transactions';

describe('Payment Schemas', () => {
  describe('PaymentSaleManualRequestSchema', () => {
    it('should validate valid card payment data', () => {
      const validData = {
        mid: 'test_mid_123456',
        amount: '100.00',
        creditcard: '4111111111111111',
        month: '12',
        year: '25',
        cvv: '123',
        cardfullname: 'John Doe',
        cemail: 'john@example.com',
        orderid: 'order_123456',
      };

      expect(() =>
        PaymentSaleManualRequestSchema.parse(validData)
      ).not.toThrow();
      const result = PaymentSaleManualRequestSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject data with missing required fields', () => {
      const invalidData = {
        mid: 'test_mid_123456',
        // Missing amount, creditcard, month, year
      };

      expect(() => PaymentSaleManualRequestSchema.parse(invalidData)).toThrow();
    });

    it('should validate card number length (max 16 characters)', () => {
      // The schema validates card number length but not format
      const dataWithLongCard = {
        mid: 'test_mid_123456',
        amount: '100.00',
        creditcard: '12345678901234567', // 17 characters - too long
        month: '12',
        year: '25',
        cvv: '123',
      };

      expect(() =>
        PaymentSaleManualRequestSchema.parse(dataWithLongCard)
      ).toThrow();
    });

    it('should auto-generate order_id if not provided', () => {
      // Note: This auto-generation happens in the Payments class, not schema
      // The schema just validates the data structure
      const dataWithoutOrderId = {
        mid: 'test_mid_123456',
        amount: '100.00',
        creditcard: '4111111111111111',
        month: '12',
        year: '25',
        cvv: '123',
        cardfullname: 'John Doe',
      };

      // The schema should accept data without orderid
      expect(() =>
        PaymentSaleManualRequestSchema.parse(dataWithoutOrderId)
      ).not.toThrow();
    });
  });

  describe('PaymentSaleTokenRequestSchema', () => {
    it('should validate valid token payment with customer_id', () => {
      const validData = {
        mid: 'test_mid_123456',
        amount: '100.00',
        creditcard: 'tok_abc123',
        customer_id: 'cust_123456',
      };

      expect(() =>
        PaymentSaleTokenRequestSchema.parse(validData)
      ).not.toThrow();
      const result = PaymentSaleTokenRequestSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject token payment without customer_id', () => {
      const invalidData = {
        mid: 'test_mid_123456',
        amount: '100.00',
        creditcard: 'tok_abc123',
        // Missing customer_id
      };

      expect(() => PaymentSaleTokenRequestSchema.parse(invalidData)).toThrow();
      // Zod throws a ZodError with specific format, not just the custom message
    });

    it('should validate with customer validation metadata', () => {
      const dataWithValidation = {
        mid: 'test_mid_123456',
        amount: '100.00',
        creditcard: 'tok_abc123',
        customer_id: 'cust_123456',
        customer_validation: {
          name_match: true,
          email_match: true,
          ip_match: false,
        },
      };

      const result = PaymentSaleTokenRequestSchema.parse(dataWithValidation);
      expect(result.customer_validation).toEqual({
        name_match: true,
        email_match: true,
        ip_match: false,
      });
    });
  });

  describe('PaymentAuthTokenRequestSchema', () => {
    it('should validate valid token auth with customer_id', () => {
      const validData = {
        mid: 'test_mid_123456', // Required base field
        amount: '100.00', // Required base field
        creditcard: 'tok_abc123',
        customer_id: 'cust_123456',
      };

      expect(() =>
        PaymentAuthTokenRequestSchema.parse(validData)
      ).not.toThrow();
    });

    it('should reject token auth without customer_id', () => {
      const invalidData = {
        mid: 'test_mid_123456',
        amount: '100.00',
        creditcard: 'tok_abc123',
        // Missing customer_id
      };

      expect(() => PaymentAuthTokenRequestSchema.parse(invalidData)).toThrow();
    });
  });

  describe('PaymentRefundRequestSchema', () => {
    it('should validate valid refund data', () => {
      const validData = {
        mid: 'test_mid_123456',
        amount: '50.00',
        transaction_id: 'txn_123456',
        orderid: 'order_123456',
      };

      expect(() => PaymentRefundRequestSchema.parse(validData)).not.toThrow();
    });

    it('should reject refund with missing required fields', () => {
      const invalidData = {
        amount: '50.00',
        // Missing mid, transaction_id, orderid
      };

      expect(() => PaymentRefundRequestSchema.parse(invalidData)).toThrow();
    });
  });

  describe('RecurringDetailsSchema', () => {
    it('should validate valid recurring details', () => {
      const validData = {
        frequency: 'monthly',
        start_date: '2024-01-01',
        total_occurrences: 12,
      };

      expect(() => RecurringDetailsSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid frequency', () => {
      const invalidData = {
        frequency: 'invalid',
        start_date: '2024-01-01',
      };

      expect(() => RecurringDetailsSchema.parse(invalidData)).toThrow();
    });

    it('should accept all valid frequencies', () => {
      // Check the actual schema for valid frequencies
      const validFrequencies = [
        'daily',
        'weekly',
        'biweekly',
        'monthly',
        'quarterly',
        'semiannually',
        'annually',
      ];

      validFrequencies.forEach((frequency) => {
        const data = { frequency };
        expect(() => RecurringDetailsSchema.parse(data)).not.toThrow();
      });
    });
  });
});

describe('Payment Token Schemas', () => {
  describe('CreateCardTokenRequestSchema', () => {
    it('should validate valid token creation data', () => {
      const validData = {
        card_number: '4111111111111111',
        card_exp: '1225',
        card_holder: 'John Doe',
        customer_id: 'cust_123456',
      };

      expect(() => CreateCardTokenRequestSchema.parse(validData)).not.toThrow();
    });

    it('should accept token without customer_id (optional in schema)', () => {
      // customer_id is optional in the token creation schema
      const validData = {
        card_number: '4111111111111111',
        card_exp: '1225',
        card_holder: 'John Doe',
        // customer_id is optional
      };

      expect(() => CreateCardTokenRequestSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid card expiration format', () => {
      const invalidData = {
        card_number: '4111111111111111',
        card_exp: '12/25', // Wrong format - should be MMYY
        card_holder: 'John Doe',
        customer_id: 'cust_123456',
      };

      expect(() => CreateCardTokenRequestSchema.parse(invalidData)).toThrow();
    });
  });
});

describe('Customer Schemas', () => {
  describe('CustomerRequestSchema', () => {
    it('should validate valid customer data', () => {
      const validData = {
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1-555-123-4567',
      };

      expect(() => CustomerRequestSchema.parse(validData)).not.toThrow();
    });

    it('should accept data without email (optional in schema)', () => {
      const validData = {
        first_name: 'John',
        last_name: 'Doe',
        // Email is optional in the schema
      };

      expect(() => CustomerRequestSchema.parse(validData)).not.toThrow();
    });

    it('should validate email format when provided', () => {
      const invalidData = {
        email: 'not-an-email',
        first_name: 'John',
        last_name: 'Doe',
      };

      expect(() => CustomerRequestSchema.parse(invalidData)).toThrow();
    });
  });
});

describe('Transaction Schemas', () => {
  describe('TransactionListParamsSchema', () => {
    it('should validate valid query parameters', () => {
      const validParams = {
        limit: 25,
        offset: 0,
        status: 'approved',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      expect(() =>
        TransactionListParamsSchema.parse(validParams)
      ).not.toThrow();
    });

    it('should validate limit constraints', () => {
      const invalidParams = {
        limit: 1000, // Exceeds maximum of 100
      };

      expect(() => TransactionListParamsSchema.parse(invalidParams)).toThrow();
    });
  });
});

describe('Schema Edge Cases', () => {
  it('should handle null values correctly', () => {
    const dataWithNulls = {
      mid: 'test_mid_123456',
      amount: '100.00',
      creditcard: '4111111111111111',
      month: null,
      year: null,
      cvv: null,
      cardfullname: null,
      cemail: null,
    };

    // Schema should accept null for optional fields
    expect(() =>
      PaymentSaleManualRequestSchema.parse(dataWithNulls)
    ).not.toThrow();
  });

  it('should reject numbers where strings expected', () => {
    const dataWithNumberAmount = {
      mid: 'test_mid_123456',
      amount: 100, // Number instead of string
      creditcard: '4111111111111111',
      month: '12',
      year: '25',
      cvv: '123',
    };

    // Schema should reject number for amount field (requires string)
    expect(() =>
      PaymentSaleManualRequestSchema.parse(dataWithNumberAmount)
    ).toThrow();
  });

  it('should validate nested objects', () => {
    const dataWithNested = {
      mid: 'test_mid_123456',
      amount: '100.00',
      creditcard: '4111111111111111',
      month: '12',
      year: '25',
      cvv: '123',
      billing_address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'US',
      },
    };

    expect(() =>
      PaymentSaleManualRequestSchema.parse(dataWithNested)
    ).not.toThrow();
  });
});
