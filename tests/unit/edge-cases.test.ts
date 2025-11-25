/**
 * @file tests/unit/edge-cases.test.ts
 * @description Comprehensive edge case tests to achieve 100% coverage
 */

import {
  QorPayClient,
  BaseClient,
  Payments,
  Customers,
  AchPayments,
} from '../../src';
import { VALID_CARD_NUMBERS, INVALID_CARD_NUMBERS } from '../utils/mock-data';
import {
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError,
} from '../../src/errors';

describe('Edge Cases - Missing Keys and Type Validation', () => {
  let client: QorPayClient;

  beforeEach(() => {
    client = new QorPayClient({
      appKey: 'test-key',
      clientKey: 'test-secret',
    });
  });

  describe('missing API keys', () => {
    it('should handle missing appKey', () => {
      expect(() => {
        new QorPayClient({
          clientKey: 'test-secret',
          environment: 'sandbox',
        } as any);
      }).not.toThrow(); // Should not throw at construction time
    });

    it('should handle missing clientKey', () => {
      expect(() => {
        new QorPayClient({
          appKey: 'test-key',
          environment: 'sandbox',
        } as any);
      }).not.toThrow();
    });

    it('should handle empty keys', () => {
      expect(() => {
        new QorPayClient({
          appKey: '',
          clientKey: '',
        });
      }).not.toThrow();
    });

    it('should handle null/undefined keys', () => {
      expect(() => {
        new QorPayClient({
          appKey: null as any,
          clientKey: undefined as any,
        });
      }).not.toThrow();
    });
  });

  describe('type validation failures', () => {
    describe('payment data validation', () => {
      it('should handle missing amount', async () => {
        // This should fail at API level, not at SDK level
        const mockBaseClient = {
          post: jest.fn().mockRejectedValue(new Error('Amount is required')),
        };

        const payments = new Payments(mockBaseClient as any);

        await expect(
          payments.create({
            creditcard: VALID_CARD_NUMBERS[0],
            month: '12',
            year: '2025',
            cvv: '123',
          } as any)
        ).rejects.toThrow('Amount is required');
      });

      it('should handle invalid amount formats', async () => {
        const mockBaseClient = {
          post: jest.fn().mockRejectedValue(new Error('Invalid amount format')),
        };

        const payments = new Payments(mockBaseClient as any);

        const invalidAmounts = [
          'not-a-number',
          '-10.00',
          '0',
          '999999999999.99',
          '10.123',
          '',
          null,
          undefined,
        ];

        for (const amount of invalidAmounts) {
          await expect(
            payments.create({
              amount,
              creditcard: VALID_CARD_NUMBERS[0],
              month: '12',
              year: '2025',
              cvv: '123',
            } as any)
          ).rejects.toThrow();
        }
      });

      it('should handle missing card number', async () => {
        const mockBaseClient = {
          post: jest
            .fn()
            .mockRejectedValue(new Error('Card number is required')),
        };

        const payments = new Payments(mockBaseClient as any);

        await expect(
          payments.create({
            amount: '10.00',
            month: '12',
            year: '2025',
            cvv: '123',
          } as any)
        ).rejects.toThrow('Card number is required');
      });

      it('should handle all invalid card numbers', async () => {
        const mockBaseClient = {
          post: jest.fn().mockRejectedValue(new Error('Invalid card number')),
        };

        const payments = new Payments(mockBaseClient as any);

        for (const cardNumber of INVALID_CARD_NUMBERS) {
          await expect(
            payments.create({
              amount: '10.00',
              creditcard: cardNumber,
              month: '12',
              year: '2025',
              cvv: '123',
            } as any)
          ).rejects.toThrow('Invalid card number');
        }
      });

      it('should handle invalid expiry dates', async () => {
        const mockBaseClient = {
          post: jest.fn().mockRejectedValue(new Error('Invalid expiry date')),
        };

        const payments = new Payments(mockBaseClient as any);

        const invalidExpiries = [
          { month: '00', year: '2025' },
          { month: '13', year: '2025' },
          { month: '12', year: '2020' }, // Past year
          { month: '01', year: '2024' }, // Past month current year
          { month: '', year: '2025' },
          { month: '12', year: '' },
          { month: 'abc', year: '2025' },
          { month: '12', year: 'abc' },
        ];

        for (const expiry of invalidExpiries) {
          await expect(
            payments.create({
              amount: '10.00',
              creditcard: VALID_CARD_NUMBERS[0],
              month: expiry.month,
              year: expiry.year,
              cvv: '123',
            } as any)
          ).rejects.toThrow('Invalid expiry date');
        }
      });

      it('should handle invalid CVV', async () => {
        const mockBaseClient = {
          post: jest.fn().mockRejectedValue(new Error('Invalid CVV')),
        };

        const payments = new Payments(mockBaseClient as any);

        const invalidCvvValues = ['', '12', '12345', 'abc', null, undefined];

        for (const cvv of invalidCvvValues) {
          await expect(
            payments.create({
              amount: '10.00',
              creditcard: VALID_CARD_NUMBERS[0],
              month: '12',
              year: '2025',
              cvv,
            } as any)
          ).rejects.toThrow('Invalid CVV');
        }
      });
    });

    describe('customer data validation', () => {
      it('should handle invalid email formats', async () => {
        const mockBaseClient = {
          post: jest.fn().mockRejectedValue(new Error('Invalid email')),
        };

        const customers = new Customers(mockBaseClient as any);

        const invalidEmails = [
          '',
          'not-an-email',
          '@domain.com',
          'user@',
          'user..name@domain.com',
          'user@domain.',
          'user name@domain.com',
        ];

        for (const email of invalidEmails) {
          await expect(
            customers.create({
              first_name: 'John',
              last_name: 'Doe',
              email,
            } as any)
          ).rejects.toThrow('Invalid email');
        }
      });

      it('should handle invalid phone numbers', async () => {
        const mockBaseClient = {
          post: jest.fn().mockRejectedValue(new Error('Invalid phone number')),
        };

        const customers = new Customers(mockBaseClient as any);

        const invalidPhones = [
          '',
          '123',
          'abc',
          '12345678901234567890',
          '+',
          '+()',
        ];

        for (const phone of invalidPhones) {
          await expect(
            customers.create({
              first_name: 'John',
              last_name: 'Doe',
              phone,
            } as any)
          ).rejects.toThrow('Invalid phone number');
        }
      });

      it('should handle invalid postal codes', async () => {
        const mockBaseClient = {
          post: jest.fn().mockRejectedValue(new Error('Invalid postal code')),
        };

        const customers = new Customers(mockBaseClient as any);

        const invalidPostalCodes = [
          '',
          '1234',
          '123456',
          'abcde',
          null,
          undefined,
        ];

        for (const postalCode of invalidPostalCodes) {
          await expect(
            customers.create({
              first_name: 'John',
              last_name: 'Doe',
              address: {
                address1: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                postal_code: postalCode,
                country: 'US',
              },
            } as any)
          ).rejects.toThrow('Invalid postal code');
        }
      });
    });
  });

  describe('API response validation', () => {
    it('should handle malformed JSON responses', async () => {
      const mockBaseClient = {
        get: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      };

      const payments = new Payments(mockBaseClient as any);

      await expect(payments.get('txn_123')).rejects.toThrow('Unexpected token');
    });

    it('should handle null responses', async () => {
      const mockBaseClient = {
        get: jest.fn().mockResolvedValue(null),
      };

      const payments = new Payments(mockBaseClient as any);

      // Should handle gracefully
      const result = await payments.get('txn_123');
      expect(result).toBeNull();
    });

    it('should handle undefined responses', async () => {
      const mockBaseClient = {
        get: jest.fn().mockResolvedValue(undefined),
      };

      const payments = new Payments(mockBaseClient as any);

      // Should handle gracefully
      const result = await payments.get('txn_123');
      expect(result).toBeUndefined();
    });

    it('should handle empty string responses', async () => {
      const mockBaseClient = {
        get: jest.fn().mockResolvedValue(''),
      };

      const payments = new Payments(mockBaseClient as any);

      // Should handle gracefully
      const result = await payments.get('txn_123');
      expect(result).toBe('');
    });

    it('should handle responses without status field', async () => {
      const mockBaseClient = {
        get: jest.fn().mockResolvedValue({
          data: { test: 'data' },
          code: '000',
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      // Should still return the response
      const result = await payments.get('txn_123');
      expect(result).toEqual({
        data: { test: 'data' },
        code: '000',
      });
    });

    it('should handle responses with invalid status', async () => {
      const mockBaseClient = {
        get: jest.fn().mockResolvedValue({
          status: 'invalid',
          data: null,
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      // Should still return the response
      const result = await payments.get('txn_123');
      expect(result.status).toBe('invalid');
    });
  });

  describe('network edge cases', () => {
    it('should handle timeout errors', async () => {
      const mockBaseClient = {
        get: jest.fn().mockRejectedValue({
          code: 'ECONNABORTED',
          message: 'timeout of 30000ms exceeded',
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      await expect(payments.get('txn_123')).rejects.toMatchObject({
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      });
    });

    it('should handle DNS resolution errors', async () => {
      const mockBaseClient = {
        get: jest.fn().mockRejectedValue({
          code: 'ENOTFOUND',
          message: 'getaddrinfo ENOTFOUND api.qorcommerce.io',
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      await expect(payments.get('txn_123')).rejects.toMatchObject({
        code: 'ENOTFOUND',
      });
    });

    it('should handle connection reset errors', async () => {
      const mockBaseClient = {
        get: jest.fn().mockRejectedValue({
          code: 'ECONNRESET',
          message: 'read ECONNRESET',
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      await expect(payments.get('txn_123')).rejects.toMatchObject({
        code: 'ECONNRESET',
      });
    });

    it('should handle SSL certificate errors', async () => {
      const mockBaseClient = {
        get: jest.fn().mockRejectedValue({
          code: 'CERT_HAS_EXPIRED',
          message: 'certificate has expired',
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      await expect(payments.get('txn_123')).rejects.toMatchObject({
        code: 'CERT_HAS_EXPIRED',
      });
    });
  });

  describe('extreme data values', () => {
    it('should handle very long strings', async () => {
      const longString = 'a'.repeat(10000);
      const mockBaseClient = {
        post: jest.fn().mockResolvedValue({
          status: 'success',
          data: { id: 'test', value: longString },
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      const result = await payments.create({
        amount: '10.00',
        creditcard: VALID_CARD_NUMBERS[0],
        month: '12',
        year: '2025',
        cvv: '123',
        description: longString,
      } as any);

      expect(result.data.value).toBe(longString);
    });

    it('should handle maximum numbers', async () => {
      const maxNumber = Number.MAX_SAFE_INTEGER;
      const mockBaseClient = {
        post: jest.fn().mockResolvedValue({
          status: 'success',
          data: { id: 'test', value: maxNumber },
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      const result = await payments.create({
        amount: maxNumber.toString(),
        creditcard: VALID_CARD_NUMBERS[0],
        month: '12',
        year: '2025',
        cvv: '123',
      } as any);

      expect(result.data.value).toBe(maxNumber);
    });

    it('should handle deeply nested objects', async () => {
      const nestedObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'deep value',
              },
            },
          },
        },
      };

      const mockBaseClient = {
        post: jest.fn().mockResolvedValue({
          status: 'success',
          data: { id: 'test', metadata: nestedObject },
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      const result = await payments.create({
        amount: '10.00',
        creditcard: VALID_CARD_NUMBERS[0],
        month: '12',
        year: '2025',
        cvv: '123',
        metadata: nestedObject,
      } as any);

      expect(result.data.metadata).toEqual(nestedObject);
    });

    it('should handle arrays with many items', async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: `item-${i}`,
      }));

      const mockBaseClient = {
        post: jest.fn().mockResolvedValue({
          status: 'success',
          data: { id: 'test', items: largeArray },
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      const result = await payments.create({
        amount: '10.00',
        creditcard: VALID_CARD_NUMBERS[0],
        month: '12',
        year: '2025',
        cvv: '123',
        items: largeArray,
      } as any);

      expect(result.data.items).toHaveLength(1000);
    });
  });

  describe('special characters and Unicode', () => {
    it('should handle Unicode characters in names', async () => {
      const unicodeNames = [
        'José García',
        '北京',
        'Москва',
        'العربية',
        '東京',
        '🚀 Rocket',
        'Müller',
        'Ævar Arnfjörð',
      ];

      for (const name of unicodeNames) {
        const mockBaseClient = {
          post: jest.fn().mockResolvedValue({
            status: 'success',
            data: { customer_id: 'cust_123', first_name: name },
          }),
        };

        const customers = new Customers(mockBaseClient as any);

        const result = await customers.create({
          first_name: name,
          last_name: 'Doe',
        } as any);

        expect(result.data.first_name).toBe(name);
      }
    });

    it('should handle special characters in descriptions', async () => {
      const specialChars = '!@#$%^&*()[]{}|\\:";\'<>?,./`~';

      const mockBaseClient = {
        post: jest.fn().mockResolvedValue({
          status: 'success',
          data: { transaction_id: 'txn_123', description: specialChars },
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      const result = await payments.create({
        amount: '10.00',
        creditcard: VALID_CARD_NUMBERS[0],
        month: '12',
        year: '2025',
        cvv: '123',
        description: specialChars,
      } as any);

      expect(result.data.description).toBe(specialChars);
    });

    it('should handle newlines and tabs in text fields', async () => {
      const textWithWhitespace = 'Line 1\nLine 2\tIndented\n\nDouble newline';

      const mockBaseClient = {
        post: jest.fn().mockResolvedValue({
          status: 'success',
          data: { transaction_id: 'txn_123', notes: textWithWhitespace },
        }),
      };

      const payments = new Payments(mockBaseClient as any);

      const result = await payments.create({
        amount: '10.00',
        creditcard: VALID_CARD_NUMBERS[0],
        month: '12',
        year: '2025',
        cvv: '123',
        notes: textWithWhitespace,
      } as any);

      expect(result.data.notes).toBe(textWithWhitespace);
    });
  });
});
