/**
 * @file tests/unit/disputes.test.ts
 * @description Tests for disputes resource class using real instances
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('Disputes', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockDisputeResponse = {
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

  const mockAchDisputeResponse = {
    status: 'success',
    data: {
      disputes: [
        {
          dispute_id: 'disp_ach_123',
          transaction_id: 'txn_ach_456',
          amount: 50.0,
          currency: 'USD',
          status: 'under_review',
          reason: 'unauthorized',
          created_at: '2024-01-01T00:00:00Z',
          due_date: '2024-01-15T00:00:00Z',
        },
      ],
      total_count: 1,
      has_more: false,
    },
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize disputes resource', () => {
      expect(client.disputes).toBeDefined();
      expect(typeof client.disputes.listDisputes).toBe('function');
      expect(typeof client.disputes.listAchDisputes).toBe('function');
      expect(typeof client.disputes.listDisputesByTransaction).toBe('function');
      expect(typeof client.disputes.getDispute).toBe('function');
    });
  });

  describe('getDispute (deprecated)', () => {
    it('should reject with empty dispute ID', async () => {
      await expect(client.disputes.getDispute('')).rejects.toThrow(
        'Dispute ID is required'
      );
      await expect(client.disputes.getDispute('   ')).rejects.toThrow(
        'Dispute ID is required'
      );
      await expect(client.disputes.getDispute(null as any)).rejects.toThrow(
        'Dispute ID is required'
      );
      await expect(
        client.disputes.getDispute(undefined as any)
      ).rejects.toThrow('Dispute ID is required');
    });

    it('should reject with deprecation error', async () => {
      const disputeId = 'disp_123';

      await expect(client.disputes.getDispute(disputeId)).rejects.toThrow(
        'Individual dispute retrieval is not supported by the QorPay API. ' +
          'Use listDisputes() with transaction_id filter to find specific disputes.'
      );
    });
  });

  describe('listDisputes', () => {
    it('should list all disputes without parameters', async () => {
      mockSuccessfulResponse(mockDisputeResponse);

      const result = await client.disputes.listDisputes();

      expect(result).toEqual(mockDisputeResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/disputes',
        })
      );
    });

    it('should list disputes with query parameters', async () => {
      const params = {
        limit: 50,
        offset: 0,
        status: 'open',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      mockSuccessfulResponse({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      const result = await client.disputes.listDisputes(params);

      expect(result.data.disputes).toHaveLength(0);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/disputes',
          params: expect.objectContaining({
            limit: 50,
            offset: 0,
            status: 'open',
          }),
        })
      );
    });

    it('should handle different status filters', async () => {
      const params = { status: 'needs_response' };

      mockSuccessfulResponse({
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

      const result = await client.disputes.listDisputes(params);

      expect(result.data.disputes[0].status).toBe('needs_response');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/disputes',
          params,
        })
      );
    });

    it('should handle pagination parameters', async () => {
      const params = { limit: 25, offset: 50 };

      mockSuccessfulResponse({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      await client.disputes.listDisputes(params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/disputes',
          params,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve disputes', 500);

      await expect(client.disputes.listDisputes()).rejects.toThrow();
    });
  });

  describe('listAchDisputes', () => {
    it('should list ACH disputes without parameters', async () => {
      mockSuccessfulResponse(mockAchDisputeResponse);

      const result = await client.disputes.listAchDisputes();

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/ach/disputes',
        })
      );
    });

    it('should list ACH disputes with query parameters', async () => {
      const params = {
        limit: 20,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      mockSuccessfulResponse({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      await client.disputes.listAchDisputes(params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/ach/disputes',
          params: expect.objectContaining({
            limit: 20,
          }),
        })
      );
    });

    it('should filter ACH disputes by date range', async () => {
      const params = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      mockSuccessfulResponse({
        status: 'success',
        data: {
          disputes: [
            {
              dispute_id: 'disp_ach_date',
              created_at: '2024-01-15T00:00:00Z',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await client.disputes.listAchDisputes(params);

      expect(result.data.disputes).toHaveLength(1);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/ach/disputes',
          params: {},
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve ACH disputes', 500);

      await expect(client.disputes.listAchDisputes()).rejects.toThrow();
    });
  });

  describe('listDisputesByTransaction', () => {
    it('should list disputes for a specific transaction', async () => {
      const transactionId = 'txn_123';
      const mockResponse = {
        status: 'success',
        data: {
          disputes: [
            {
              dispute_id: 'disp_456',
              transaction_id: transactionId,
              status: 'open',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result =
        await client.disputes.listDisputesByTransaction(transactionId);

      expect(result.data.disputes[0].transaction_id).toBe(transactionId);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/transactions/${transactionId}/disputes`,
        })
      );
    });

    it('should list disputes for transaction with parameters', async () => {
      const transactionId = 'txn_456';
      const params = { limit: 10 };

      mockSuccessfulResponse({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      await client.disputes.listDisputesByTransaction(transactionId, params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/transactions/${transactionId}/disputes`,
          params,
        })
      );
    });

    it('should handle transaction ID with special characters', async () => {
      const transactionId = 'txn_123/with/special-chars';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      await client.disputes.listDisputesByTransaction(transactionId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/transactions/${transactionId}/disputes`,
        })
      );
    });

    it('should handle transaction with multiple disputes', async () => {
      const transactionId = 'txn_multi';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          disputes: [
            { dispute_id: 'disp_1', transaction_id: transactionId },
            { dispute_id: 'disp_2', transaction_id: transactionId },
            { dispute_id: 'disp_3', transaction_id: transactionId },
          ],
          total_count: 3,
          has_more: false,
        },
      });

      const result =
        await client.disputes.listDisputesByTransaction(transactionId);

      expect(result.data.disputes).toHaveLength(3);
      expect(result.data.total_count).toBe(3);
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Transaction not found', 404);

      await expect(
        client.disputes.listDisputesByTransaction('invalid-txn')
      ).rejects.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockFailedResponse('Network error', 500);

      await expect(client.disputes.listDisputes()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockFailedResponse('Request timeout', 408);

      await expect(client.disputes.listAchDisputes()).rejects.toThrow();
    });
  });

  describe('Parameter validation', () => {
    it('should validate listDisputes parameters', async () => {
      const invalidParams = {
        limit: -1, // Invalid limit
        status: 'invalid_status', // Invalid status
      };

      await expect(
        client.disputes.listDisputes(invalidParams as any)
      ).rejects.toThrow();
    });

    it('should handle empty dispute list response', async () => {
      mockSuccessfulResponse({
        status: 'success',
        data: {
          disputes: [],
          total_count: 0,
          has_more: false,
        },
      });

      const result = await client.disputes.listDisputes();

      expect(result.data.disputes).toEqual([]);
      expect(result.data.total_count).toBe(0);
    });
  });
});
