/**
 * Transactions Branch Coverage Test
 *
 * This test file specifically targets the remaining branch coverage gaps in Transactions:
 * - Line 153: Date handling edge cases in proof of delivery
 * - Lines 234-238: Array mapping with null/undefined records
 * - Line 240: Pagination limit fallback
 * - Line 460: ACH routing number fallback
 */

import { Transactions } from '../../src/resources/transactions';
import type { BaseClient } from '../../src/client/base-client';

describe('Transactions - Branch Coverage', () => {
  let transactions: Transactions;
  let mockClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    mockClient = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    transactions = new Transactions(mockClient);
  });

  describe('Proof of Delivery creation - line 153 (date handling)', () => {
    it('should handle null delivery date (line 153 fallback)', async () => {
      const mockResponse = {
        status: 'success' as const,
        code: 200,
        message: 'Proof of delivery created successfully',
        data: {
          delivery_id: 'pod_123',
          transaction_id: 'txn_456',
          status: 'uploaded',
          created_at: '2024-01-15T10:30:00Z',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await transactions.createProofOfDelivery({
        transactionId: 'txn_456',
        deliveryDate: null, // This should trigger the fallback on line 153
        recipientName: 'John Doe',
        recipientSignature:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/transaction/proof_of_delivery/',
        expect.objectContaining({
          transaction_id: 'txn_456',
          delivery_date: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          ), // Fallback to current date
          recipient_name: 'John Doe',
        })
      );
    });

    it('should handle undefined delivery date (line 153 fallback)', async () => {
      const mockResponse = {
        status: 'success' as const,
        code: 200,
        message: 'Proof of delivery created successfully',
        data: {
          delivery_id: 'pod_123',
          transaction_id: 'txn_456',
          status: 'uploaded',
          created_at: '2024-01-15T10:30:00Z',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await transactions.createProofOfDelivery({
        transactionId: 'txn_456',
        deliveryDate: undefined, // This should trigger the fallback on line 153
        recipientName: 'Jane Smith',
        recipientSignature:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/transaction/proof_of_delivery/',
        expect.objectContaining({
          transaction_id: 'txn_456',
          delivery_date: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          ), // Fallback to current date
          recipient_name: 'Jane Smith',
        })
      );
    });

    it('should handle Date object delivery date (line 153-155 conversion)', async () => {
      const mockResponse = {
        status: 'success' as const,
        code: 200,
        message: 'Proof of delivery created successfully',
        data: {
          delivery_id: 'pod_123',
          transaction_id: 'txn_456',
          status: 'uploaded',
          created_at: '2024-01-15T10:30:00Z',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const testDate = new Date('2024-01-20T14:30:00Z');
      const result = await transactions.createProofOfDelivery({
        transactionId: 'txn_456',
        deliveryDate: testDate, // This should trigger Date.toISOString() conversion on lines 153-155
        recipientName: 'Bob Johnson',
        recipientSignature:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/transaction/proof_of_delivery/',
        expect.objectContaining({
          transaction_id: 'txn_456',
          delivery_date: '2024-01-20T14:30:00.000Z', // Converted to ISO string
          recipient_name: 'Bob Johnson',
        })
      );
    });
  });

  describe('Proof of Delivery listing - lines 234-238 (array mapping)', () => {
    it('should handle null data.records (lines 234-236)', async () => {
      const mockResponse = {
        status: 'success' as const,
        code: 200,
        message: 'Proof of delivery records retrieved',
        data: null, // This should trigger the fallback on lines 234-236
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await transactions.listProofOfDelivery();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle undefined data.records (lines 234-236)', async () => {
      const mockResponse = {
        status: 'success' as const,
        code: 200,
        message: 'Proof of delivery records retrieved',
        data: {
          total: 5,
          has_more: true,
          limit: 10,
          offset: 0,
          records: undefined, // This should trigger the fallback on lines 234-236
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await transactions.listProofOfDelivery();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(5);
    });

    it('should handle empty records array (lines 234-236)', async () => {
      const mockResponse = {
        status: 'success' as const,
        code: 200,
        message: 'Proof of delivery records retrieved',
        data: {
          total: 0,
          has_more: false,
          limit: 10,
          offset: 0,
          records: [], // Empty array should be handled correctly
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await transactions.listProofOfDelivery();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('Proof of Delivery listing - line 240 (pagination limit fallback)', () => {
    it('should handle missing params.limit and missing data.limit (line 240 fallback)', async () => {
      const mockResponse = {
        status: 'success' as const,
        code: 200,
        message: 'Proof of delivery records retrieved',
        data: {
          total: 0,
          has_more: false,
          offset: 0,
          // Missing limit field - should trigger fallback on line 240
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await transactions.listProofOfDelivery();

      expect(result.pagination.limit).toBe(50); // Default fallback value
    });

    it('should use params.limit when provided (line 240 priority)', async () => {
      const mockResponse = {
        status: 'success' as const,
        code: 200,
        message: 'Proof of delivery records retrieved',
        data: {
          total: 0,
          has_more: false,
          limit: 100, // This should be overridden by params.limit
          offset: 0,
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await transactions.listProofOfDelivery({ limit: 25 });

      expect(result.pagination.limit).toBe(25); // params.limit takes priority
    });
  });

  describe('ACH payment method extraction - line 460 (routing number fallback)', () => {
    it('should handle missing ach_routing (line 460 fallback)', async () => {
      // Create a mock transaction with missing ach_routing
      const mockTransaction = {
        transaction_id: 'txn_ach_123',
        payment_method: {
          type: 'ach',
          ach_account_last4: '6789',
          ach_account_type: 'checking' as const,
          ach_bank_name: 'Test Bank',
          // Missing ach_routing - should trigger fallback on line 460
        },
      };

      // Access the private method through reflection for testing
      const extractPaymentMethod = (
        transactions as any
      ).extractPaymentMethod.bind(transactions);
      const result = extractPaymentMethod(mockTransaction);

      expect(result).toEqual({
        type: 'ach',
        ach: {
          last4: '6789',
          routingNumber: '', // Fallback to empty string
          accountType: 'checking',
          bankName: 'Test Bank',
        },
      });
    });

    it('should handle null ach_routing (line 460 fallback)', async () => {
      const mockTransaction = {
        transaction_id: 'txn_ach_456',
        payment_method: {
          type: 'ach',
          ach_account_last4: '1234',
          ach_account_type: 'savings' as const,
          ach_bank_name: 'Another Bank',
          ach_routing: null, // Null routing should trigger fallback
        },
      };

      const extractPaymentMethod = (
        transactions as any
      ).extractPaymentMethod.bind(transactions);
      const result = extractPaymentMethod(mockTransaction);

      expect(result).toEqual({
        type: 'ach',
        ach: {
          last4: '1234',
          routingNumber: '', // Fallback to empty string
          accountType: 'savings',
          bankName: 'Another Bank',
        },
      });
    });
  });

  describe('Transaction status normalization - line 153 (status mapping)', () => {
    it('should handle unknown transaction status (line 153 fallback to pending)', async () => {
      // Create a mock transaction with unknown status
      const mockTransaction = {
        transaction_id: 'txn_unknown_123',
        status: 'completely_unknown_status', // This should trigger fallback on line 153
        amount: 1000,
        currency: 'USD',
        created_at: '2024-01-15T10:30:00Z',
      };

      // Access the private method through reflection for testing
      const normalizeStatus = (transactions as any).normalizeStatus.bind(
        transactions
      );
      const result = normalizeStatus(mockTransaction.status);

      expect(result).toBe('pending'); // Fallback to 'pending'
    });

    it('should handle null/undefined status (line 153 fallback to pending)', async () => {
      const normalizeStatus = (transactions as any).normalizeStatus.bind(
        transactions
      );

      expect(normalizeStatus(null)).toBe('pending');
      expect(normalizeStatus(undefined)).toBe('pending');
      expect(normalizeStatus('')).toBe('pending');
    });

    it('should handle case-insensitive status mapping (line 153)', async () => {
      const normalizeStatus = (transactions as any).normalizeStatus.bind(
        transactions
      );

      expect(normalizeStatus('APPROVED')).toBe('approved');
      expect(normalizeStatus('DECLINED')).toBe('declined');
      expect(normalizeStatus('PENDING')).toBe('pending');
      expect(normalizeStatus('SETTLED')).toBe('approved'); // Mapped to approved
      expect(normalizeStatus('COMPLETED')).toBe('approved'); // Mapped to approved
    });
  });
});
