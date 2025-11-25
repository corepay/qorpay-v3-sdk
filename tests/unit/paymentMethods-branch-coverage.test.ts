/**
 * @file tests/unit/paymentMethods-branch-coverage.test.ts
 * @description PaymentMethods branch coverage tests for lines 88,92,130,134
 */

import { PaymentMethods } from '../../src/resources/paymentMethods';
import { BaseClient } from '../../src/client/base-client';

// Mock BaseClient properly
jest.mock('../../src/client/base-client');

describe('PaymentMethods - Branch Coverage Tests', () => {
  let paymentMethods: PaymentMethods;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    mockBaseClient = new BaseClient({
      appKey: 'test-key',
      clientKey: 'test-secret',
    }) as jest.Mocked<BaseClient>;

    paymentMethods = new PaymentMethods(mockBaseClient);

    // Mock the client methods
    mockBaseClient.get = jest.fn();
  });

  describe('list method - branch coverage for lines 88, 92', () => {
    it('should handle undefined resp.data.methods (line 88 null coalescing)', async () => {
      // Mock response with undefined methods array
      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_123',
        data: {
          // methods field is undefined - should trigger null coalescing
          total: 5,
          has_more: false,
        },
      });

      const result = await paymentMethods.list('customer_123');

      expect(result.data).toEqual([]); // Should be empty array due to ?? []
      expect(result.pagination.total).toBe(5); // Should use the total from data
    });

    it('should handle null resp.data.methods (line 88 null coalescing)', async () => {
      // Mock response with null methods array
      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_123',
        data: {
          methods: null, // Explicitly null - should trigger null coalescing
          total: 10,
          has_more: true,
        },
      });

      const result = await paymentMethods.list('customer_123');

      expect(result.data).toEqual([]); // Should be empty array due to ?? []
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.hasMore).toBe(true);
    });

    it('should handle non-number resp.data.total (line 92 type checking)', async () => {
      // Mock response with non-numeric total
      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_123',
        data: {
          methods: [
            {
              id: 'pm_123',
              type: 'card',
              created_at: '2023-01-01T00:00:00Z',
              last_used_at: '2023-01-01T01:00:00Z',
              is_preferred: false,
              expiration_date: '2024-12-31',
              status: 'active',
              customer_id: 'cust_123',
              description: 'Test Card',
              card: {
                first6: '424242',
                last4: '4242',
                brand: 'Visa',
                card_type: 'credit',
                category: 'consumer',
                issuer: 'Test Bank',
                country: 'US',
              },
            },
          ],
          total: 'not-a-number', // String instead of number - should trigger fallback to 0
          has_more: false,
        },
      });

      const result = await paymentMethods.list('customer_123');

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(0); // Should fallback to 0 for non-number total
    });

    it('should handle undefined resp.data.total (line 92 type checking)', async () => {
      // Mock response with undefined total
      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_123',
        data: {
          methods: [
            {
              id: 'pm_456',
              type: 'card',
              created_at: '2023-01-01T00:00:00Z',
              last_used_at: '2023-01-01T01:00:00Z',
              is_preferred: true,
              expiration_date: '2025-12-31',
              status: 'active',
              customer_id: 'cust_456',
              description: 'Another Card',
              card: {
                first6: '555555',
                last4: '4444',
                brand: 'Mastercard',
                card_type: 'credit',
                category: 'consumer',
                issuer: 'Another Bank',
                country: 'US',
              },
            },
          ],
          // total field is undefined - should trigger fallback to 0
          has_more: true,
        },
      });

      const result = await paymentMethods.list('customer_456');

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(0); // Should fallback to 0 for undefined total
      expect(result.pagination.hasMore).toBe(true);
    });
  });

  describe('listExpiring method - branch coverage for lines 130, 134', () => {
    it('should handle undefined resp.data.methods (line 130 null coalescing)', async () => {
      // Mock response with undefined methods array for expiring cards
      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_456',
        data: {
          // methods field is undefined - should trigger null coalescing
          total: 0,
          has_more: false,
        },
      });

      const result = await paymentMethods.listExpiring({ days: 30 });

      expect(result.data).toEqual([]); // Should be empty array due to ?? []
      expect(result.pagination.total).toBe(0);
    });

    it('should handle null resp.data.methods (line 130 null coalescing)', async () => {
      // Mock response with null methods array for expiring cards
      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_789',
        data: {
          methods: null, // Explicitly null - should trigger null coalescing
          total: 3,
          has_more: true,
        },
      });

      const result = await paymentMethods.listExpiring({ days: 60 });

      expect(result.data).toEqual([]); // Should be empty array due to ?? []
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.hasMore).toBe(true);
    });

    it('should handle non-number resp.data.total (line 134 type checking)', async () => {
      // Mock response with non-numeric total for expiring cards
      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_999',
        data: {
          methods: [
            {
              id: 'pm_789',
              type: 'card',
              created_at: '2023-01-01T00:00:00Z',
              last_used_at: '2023-01-01T01:00:00Z',
              is_preferred: false,
              expiration_date: '2024-06-30', // Expiring soon
              status: 'active',
              customer_id: 'cust_789',
              description: 'Expiring Card',
              card: {
                first6: '378282',
                last4: '5556',
                brand: 'American Express',
                card_type: 'credit',
                category: 'consumer',
                issuer: 'Amex Bank',
                country: 'US',
              },
            },
          ],
          total: 'invalid', // String instead of number - should trigger fallback to 0
          has_more: false,
        },
      });

      const result = await paymentMethods.listExpiring({ days: 90 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(0); // Should fallback to 0 for non-number total
    });

    it('should handle undefined resp.data.total (line 134 type checking)', async () => {
      // Mock response with undefined total for expiring cards
      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_000',
        data: {
          methods: [
            {
              id: 'pm_000',
              type: 'card',
              created_at: '2023-01-01T00:00:00Z',
              last_used_at: '2023-01-01T01:00:00Z',
              is_preferred: true,
              expiration_date: '2024-03-31', // Expiring very soon
              status: 'active',
              customer_id: 'cust_000',
              description: 'Soon to Expire Card',
              card: {
                first6: '601111',
                last4: '0000',
                brand: 'Discover',
                card_type: 'credit',
                category: 'consumer',
                issuer: 'Discover Bank',
                country: 'US',
              },
            },
          ],
          // total field is undefined - should trigger fallback to 0
          has_more: true,
        },
      });

      const result = await paymentMethods.listExpiring({ days: 120 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(0); // Should fallback to 0 for undefined total
      expect(result.pagination.hasMore).toBe(true);
    });
  });
});
