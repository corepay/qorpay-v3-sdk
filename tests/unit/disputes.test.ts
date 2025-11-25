/**
 * @file tests/unit/disputes.test.ts
 * @description Unit tests for Disputes resource class
 */

import { Disputes } from '../../src/resources/disputes';
import { BaseClient } from '../../src/client/base-client';
import type {
  ListDisputesQueryParams,
  ListDisputesResponsePayload,
  GetDisputeResponsePayload,
} from '../../src/types';
import type { DisputeId, TransactionId } from '../../src/types';

// Mock dependencies
jest.mock('../../src/client/base-client');
jest.mock('../../src/schemas', () => ({
  ListDisputesQueryParamsSchema: {
    parse: jest.fn((data) => data),
  },
  DisputeIdParamSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('Disputes', () => {
  let disputes: Disputes;
  let mockClient: jest.Mocked<BaseClient>;

  const mockDisputeResponse: ListDisputesResponsePayload = {
    status: 'success',
    data: {
      disputes: [
        {
          dispute_id: 'disp_123',
          transaction_id: 'txn_456',
          amount: 100.0,
          currency: 'USD',
          status: 'open',
          reason: 'fraudulent',
          created_at: '2024-01-01T00:00:00Z',
          due_date: '2024-01-15T00:00:00Z',
        },
      ],
      total_count: 1,
      has_more: false,
    },
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    disputes = new Disputes(mockClient);
    jest.clearAllMocks();
  });

  describe('getDispute (deprecated)', () => {
    it('should reject with empty dispute ID', async () => {
      await expect(disputes.getDispute('')).rejects.toThrow(
        'Dispute ID is required'
      );
      await expect(disputes.getDispute('   ')).rejects.toThrow(
        'Dispute ID is required'
      );
      await expect(disputes.getDispute(null as any)).rejects.toThrow(
        'Dispute ID is required'
      );
      await expect(disputes.getDispute(undefined as any)).rejects.toThrow(
        'Dispute ID is required'
      );
    });

    it('should reject with deprecation error', async () => {
      const disputeId = 'disp_123';

      await expect(disputes.getDispute(disputeId)).rejects.toThrow(
        'Individual dispute retrieval is not supported by the QorPay API. ' +
          'Use listDisputes() with transaction_id filter to find specific disputes.'
      );
    });

    it('should validate dispute ID before throwing deprecation error', async () => {
      const disputeId = 'invalid-format';

      // Mock the schema to throw an error
      const { DisputeIdParamSchema } = require('../../src/schemas');
      DisputeIdParamSchema.parse.mockImplementation(() => {
        throw new Error('Invalid dispute ID format');
      });

      await expect(disputes.getDispute(disputeId)).rejects.toThrow(
        'Invalid dispute ID format'
      );
    });
  });

  describe('listDisputes', () => {
    it('should list all disputes without parameters', async () => {
      mockClient.get.mockResolvedValue(mockDisputeResponse);

      const result = await disputes.listDisputes();

      const { ListDisputesQueryParamsSchema } = require('../../src/schemas');
      expect(ListDisputesQueryParamsSchema.parse).toHaveBeenCalledWith({});
      expect(mockClient.get).toHaveBeenCalledWith('/payments/disputes', {});
      expect(result).toEqual(mockDisputeResponse);
    });

    it('should list disputes with query parameters', async () => {
      const params: ListDisputesQueryParams = {
        limit: 50,
        offset: 0,
        status: 'open',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      const result = await disputes.listDisputes(params);

      const { ListDisputesQueryParamsSchema } = require('../../src/schemas');
      expect(ListDisputesQueryParamsSchema.parse).toHaveBeenCalledWith(params);
      expect(mockClient.get).toHaveBeenCalledWith('/payments/disputes', params);
      expect(result.data.disputes).toHaveLength(0);
    });

    it('should handle different status filters', async () => {
      const params = { status: 'needs_response' };

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [
            {
              dispute_id: 'disp_789',
              status: 'needs_response',
              reason: 'product_not_received',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await disputes.listDisputes(params);

      expect(result.data.disputes[0].status).toBe('needs_response');
    });

    it('should handle pagination parameters', async () => {
      const params = {
        limit: 25,
        offset: 100,
      };

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [mockDisputeResponse.data.disputes[0]],
          total_count: 150,
          has_more: true,
        },
      });

      const result = await disputes.listDisputes(params);

      expect(result.data.has_more).toBe(true);
      expect(result.data.total_count).toBe(150);
    });
  });

  describe('listAchDisputes', () => {
    it('should list ACH disputes without parameters', async () => {
      const achDisputesResponse = {
        status: 'success',
        data: {
          disputes: [
            {
              dispute_id: 'ach_disp_123',
              transaction_id: 'ach_txn_456',
              amount: 500.0,
              currency: 'USD',
              status: 'open',
              reason: 'unauthorized',
              type: 'ach',
              created_at: '2024-01-01T00:00:00Z',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      };

      mockClient.get.mockResolvedValue(achDisputesResponse);

      const result = await disputes.listAchDisputes();

      const { ListDisputesQueryParamsSchema } = require('../../src/schemas');
      expect(ListDisputesQueryParamsSchema.parse).toHaveBeenCalledWith({});
      expect(mockClient.get).toHaveBeenCalledWith('/payments/ach/disputes', {});
      expect(result.data.disputes[0].type).toBe('ach');
    });

    it('should list ACH disputes with query parameters', async () => {
      const params: ListDisputesQueryParams = {
        limit: 20,
        status: 'resolved',
        reason: 'unauthorized',
      };

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      await disputes.listAchDisputes(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/ach/disputes',
        params
      );
    });

    it('should filter ACH disputes by date range', async () => {
      const params = {
        start_date: '2024-01-01',
        end_date: '2024-03-31',
      };

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [
            {
              dispute_id: 'ach_disp_q1',
              created_at: '2024-02-15T00:00:00Z',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await disputes.listAchDisputes(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/ach/disputes',
        params
      );
      expect(result.data.disputes).toHaveLength(1);
    });
  });

  describe('listDisputesByTransaction', () => {
    it('should list disputes for a specific transaction', async () => {
      const transactionId: TransactionId = 'txn_123456';

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [
            {
              dispute_id: 'disp_456',
              transaction_id: transactionId,
              amount: 100.0,
              status: 'under_review',
              created_at: '2024-01-10T00:00:00Z',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await disputes.listDisputesByTransaction(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/transactions/${transactionId}/disputes`,
        undefined
      );
      expect(result.data.disputes[0].transaction_id).toBe(transactionId);
    });

    it('should list disputes for transaction with parameters', async () => {
      const transactionId: TransactionId = 'txn_789';
      const params: ListDisputesQueryParams = {
        limit: 10,
        status: 'open',
      };

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      await disputes.listDisputesByTransaction(transactionId, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/transactions/${transactionId}/disputes`,
        params
      );
    });

    it('should handle transaction ID with special characters', async () => {
      const transactionId = 'txn/with/special/chars';

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      await disputes.listDisputesByTransaction(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/transactions/${transactionId}/disputes`,
        undefined
      );
    });

    it('should handle transaction with multiple disputes', async () => {
      const transactionId: TransactionId = 'txn_multi_disp';

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          disputes: [
            {
              dispute_id: 'disp_1',
              transaction_id: transactionId,
              reason: 'fraudulent',
            },
            {
              dispute_id: 'disp_2',
              transaction_id: transactionId,
              reason: 'duplicate',
            },
          ],
          total_count: 2,
          has_more: false,
        },
      });

      const result = await disputes.listDisputesByTransaction(transactionId);

      expect(result.data.disputes).toHaveLength(2);
      expect(result.data.total_count).toBe(2);
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors from listDisputes', async () => {
      const apiError = new Error('Failed to fetch disputes');
      mockClient.get.mockRejectedValue(apiError);

      await expect(disputes.listDisputes()).rejects.toThrow(apiError);
    });

    it('should propagate API errors from listAchDisputes', async () => {
      const apiError = new Error('Failed to fetch ACH disputes');
      mockClient.get.mockRejectedValue(apiError);

      await expect(disputes.listAchDisputes()).rejects.toThrow(apiError);
    });

    it('should propagate API errors from listDisputesByTransaction', async () => {
      const transactionId = 'invalid_txn';
      const apiError = new Error('Transaction not found');
      mockClient.get.mockRejectedValue(apiError);

      await expect(
        disputes.listDisputesByTransaction(transactionId)
      ).rejects.toThrow(apiError);
    });
  });

  describe('Parameter validation', () => {
    it('should validate listDisputes parameters', async () => {
      const params = {
        limit: -1, // Invalid
        status: 'invalid_status',
      };

      // Mock the schema to throw an error
      const { ListDisputesQueryParamsSchema } = require('../../src/schemas');
      ListDisputesQueryParamsSchema.parse.mockImplementation(() => {
        throw new Error('Invalid parameters');
      });

      await expect(disputes.listDisputes(params)).rejects.toThrow(
        'Invalid parameters'
      );
      await expect(disputes.listAchDisputes(params)).rejects.toThrow(
        'Invalid parameters'
      );
    });
  });

  describe('URL construction', () => {
    it('should construct correct endpoints for all operations', async () => {
      // Set up mock responses
      mockClient.get.mockResolvedValue({
        status: 'success',
        data: { disputes: [], total_count: 0, has_more: false },
      });

      // Test all endpoints
      await disputes.listDisputes();
      await disputes.listAchDisputes();
      await disputes.listDisputesByTransaction('test_txn');

      expect(mockClient.get).toHaveBeenCalledWith('/payments/disputes', {});
      expect(mockClient.get).toHaveBeenCalledWith('/payments/ach/disputes', {});
      expect(mockClient.get).toHaveBeenCalledWith(
        '/transactions/test_txn/disputes',
        undefined
      );
    });
  });

  describe('Dispute data structure', () => {
    it('should handle complete dispute object', async () => {
      const completeDisputeResponse = {
        status: 'success',
        data: {
          disputes: [
            {
              dispute_id: 'disp_complete',
              transaction_id: 'txn_complete',
              amount: 250.0,
              currency: 'USD',
              status: 'needs_response',
              reason: 'fraudulent',
              evidence: [
                {
                  type: 'receipt',
                  url: 'https://example.com/receipt.pdf',
                },
                {
                  type: 'proof_of_delivery',
                  url: 'https://example.com/pod.jpg',
                },
              ],
              documents: [
                {
                  id: 'doc_123',
                  type: 'customer_communication',
                  filename: 'email.pdf',
                },
              ],
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-05T00:00:00Z',
              due_date: '2024-01-20T00:00:00Z',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      };

      mockClient.get.mockResolvedValue(completeDisputeResponse);

      const result = await disputes.listDisputes();

      const dispute = result.data.disputes[0];
      expect(dispute.evidence).toHaveLength(2);
      expect(dispute.documents).toHaveLength(1);
      expect(dispute.due_date).toBe('2024-01-20T00:00:00Z');
    });
  });
});
