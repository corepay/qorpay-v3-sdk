/**
 * @file tests/unit/deposits.test.ts
 * @description Unit tests for Deposits resource class
 */

import { Deposits } from '../../src/resources/deposits';
import { BaseClient } from '../../src/client/base-client';
import type {
  Deposit,
  ListDepositsQueryParams,
  ListDepositsResponsePayload,
  GetDepositResponsePayload,
} from '../../src/types';
import type { TransactionListResponse } from '../../src/types/transactions';
import type { QueryParams } from '../../src/types/common';

// Mock dependencies
jest.mock('../../src/client/base-client');
jest.mock('../../src/schemas', () => ({
  ListDepositsParamsSchema: {
    parse: jest.fn((data) => data),
  },
  DepositIdParamSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('Deposits', () => {
  let deposits: Deposits;
  let mockClient: jest.Mocked<BaseClient>;

  const mockDeposit: Deposit = {
    deposit_id: 'dep_123',
    deposit_date: '2024-01-15',
    amount: 1000.00,
    currency: 'USD',
    status: 'completed',
    transaction_count: 25,
    created_at: '2024-01-15T00:00:00Z',
  };

  const mockDepositResponse: GetDepositResponsePayload = {
    status: 'success',
    data: mockDeposit,
  };

  const mockDepositsListResponse: ListDepositsResponsePayload = {
    status: 'success',
    data: {
      deposits: [mockDeposit],
      total_count: 1,
      has_more: false,
    },
  };

  beforeEach(() => {
    mockClient = new BaseClient({ appKey: 'test', clientKey: 'test' }) as jest.Mocked<BaseClient>;
    deposits = new Deposits(mockClient);
    jest.clearAllMocks();
  });

  describe('getDeposit', () => {
    it('should fetch a specific deposit by ID', async () => {
      const depositId = 'dep_123';

      mockClient.get.mockResolvedValue(mockDepositResponse);

      const result = await deposits.getDeposit(depositId);

      const { DepositIdParamSchema } = require('../../src/schemas');
      expect(DepositIdParamSchema.parse).toHaveBeenCalledWith(depositId);
      expect(mockClient.get).toHaveBeenCalledWith('/deposits/dep_123');
      expect(result).toEqual(mockDepositResponse);
    });

    it('should handle deposit ID with special characters', async () => {
      const depositId = 'dep/with/special-chars_123';

      mockClient.get.mockResolvedValue(mockDepositResponse);

      await deposits.getDeposit(depositId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/deposits/${depositId}`
      );
    });
  });

  describe('listDeposits', () => {
    it('should list deposits for a specific year and status', async () => {
      const year = 2024;
      const status = 'completed';

      mockClient.get.mockResolvedValue(mockDepositsListResponse);

      const result = await deposits.listDeposits(year, status);

      const { ListDepositsParamsSchema } = require('../../src/schemas');
      expect(ListDepositsParamsSchema.parse).toHaveBeenCalledWith({
        year,
        status,
        queryParams: undefined,
      });
      expect(mockClient.get).toHaveBeenCalledWith(
        '/deposits/2024/completed',
        { status: 'completed' }
      );
      expect(result).toEqual(mockDepositsListResponse);
    });

    it('should list deposits with additional query parameters', async () => {
      const year = 2024;
      const status = 'pending';
      const params: Omit<ListDepositsQueryParams, 'status'> = {
        limit: 50,
        offset: 0,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          deposits: [mockDeposit],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await deposits.listDeposits(year, status, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/deposits/2024/pending',
        {
          ...params,
          status: 'pending',
        }
      );
    });

    it('should handle different status values', async () => {
      const year = 2023;
      const status = 'failed';

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: { deposits: [], total_count: 0, has_more: false },
      });

      await deposits.listDeposits(year, status);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/deposits/2023/failed',
        { status: 'failed' }
      );
    });
  });

  describe('getDepositDetail', () => {
    it('should fetch detailed deposit information', async () => {
      const depositId = 'dep_456';
      const detailedResponse: GetDepositResponsePayload = {
        status: 'success',
        data: {
          ...mockDeposit,
          deposit_id: depositId,
          transactions: [
            {
              transaction_id: 'txn_123',
              amount: 50.00,
              date: '2024-01-15',
            },
            {
              transaction_id: 'txn_456',
              amount: 75.00,
              date: '2024-01-15',
            },
          ],
        },
      };

      mockClient.get.mockResolvedValue(detailedResponse);

      const result = await deposits.getDepositDetail(depositId);

      const { DepositIdParamSchema } = require('../../src/schemas');
      expect(DepositIdParamSchema.parse).toHaveBeenCalledWith(depositId);
      expect(mockClient.get).toHaveBeenCalledWith('/deposits/detail/dep_456');
      expect(result).toEqual(detailedResponse);
    });

    it('should handle empty transactions list', async () => {
      const depositId = 'dep_empty';

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          ...mockDeposit,
          deposit_id: depositId,
          transactions: [],
        },
      });

      const result = await deposits.getDepositDetail(depositId);

      expect(result.data.transactions).toHaveLength(0);
    });
  });

  describe('listDepositTransactions', () => {
    it('should list transactions for a specific deposit', async () => {
      const depositId = 'dep_789';
      const mockTransactionsResponse: TransactionListResponse = {
        status: 'success',
        data: [
          {
            id: 'txn_123',
            amount: 100.00,
            currency: 'USD',
            status: 'approved',
            type: 'sale',
            created_at: '2024-01-15T10:00:00Z',
          },
          {
            id: 'txn_456',
            amount: 25.00,
            currency: 'USD',
            status: 'approved',
            type: 'sale',
            created_at: '2024-01-15T11:00:00Z',
          },
        ],
        pagination: {
          total: 2,
          hasMore: false,
          limit: 50,
          offset: 0,
        },
      };

      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      const result = await deposits.listDepositTransactions(depositId);

      const { DepositIdParamSchema } = require('../../src/schemas');
      expect(DepositIdParamSchema.parse).toHaveBeenCalledWith(depositId);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/deposits/dep_789/transactions',
        undefined
      );
      expect(result).toEqual(mockTransactionsResponse);
    });

    it('should list transactions with query parameters', async () => {
      const depositId = 'dep_999';
      const params: QueryParams = {
        limit: 25,
        offset: 10,
        status: 'approved',
      };

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: [],
        pagination: {
          total: 0,
          hasMore: false,
          limit: 25,
          offset: 10,
        },
      });

      await deposits.listDepositTransactions(depositId, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/deposits/dep_999/transactions',
        params
      );
    });

    it('should handle empty transactions list', async () => {
      const depositId = 'dep_empty';

      mockClient.get.mockResolvedValue({
        status: 'success',
        data: [],
        pagination: {
          total: 0,
          hasMore: false,
          limit: 50,
          offset: 0,
        },
      });

      const result = await deposits.listDepositTransactions(depositId);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors from getDeposit', async () => {
      const depositId = 'nonexistent';

      const apiError = new Error('Deposit not found');
      mockClient.get.mockRejectedValue(apiError);

      await expect(deposits.getDeposit(depositId)).rejects.toThrow(apiError);
    });

    it('should propagate API errors from listDeposits', async () => {
      const year = 2024;
      const status = 'completed';

      const apiError = new Error('Failed to list deposits');
      mockClient.get.mockRejectedValue(apiError);

      await expect(deposits.listDeposits(year, status)).rejects.toThrow(apiError);
    });

    it('should propagate API errors from getDepositDetail', async () => {
      const depositId = 'dep_error';

      const apiError = new Error('Deposit details unavailable');
      mockClient.get.mockRejectedValue(apiError);

      await expect(deposits.getDepositDetail(depositId)).rejects.toThrow(apiError);
    });

    it('should propagate API errors from listDepositTransactions', async () => {
      const depositId = 'dep_txn_error';

      const apiError = new Error('Failed to list deposit transactions');
      mockClient.get.mockRejectedValue(apiError);

      await expect(deposits.listDepositTransactions(depositId)).rejects.toThrow(apiError);
    });
  });

  describe('Parameter validation', () => {
    it('should validate deposit ID format', async () => {
      const depositId = 'invalid-format';

      // Set up API error for invalid deposit ID
      const apiError = new QorPayApiError('Invalid deposit ID format', 400);
      mockClient.get.mockRejectedValue(apiError);

      await expect(deposits.getDeposit(depositId)).rejects.toThrow(apiError);
      await expect(deposits.getDepositDetail(depositId)).rejects.toThrow(apiError);
      await expect(deposits.listDepositTransactions(depositId)).rejects.toThrow(apiError);
    });

    it('should validate list deposits parameters', async () => {
      const year = 2024;
      const status = 'invalid-status';

      // Set up API error for invalid parameters
      const apiError = new QorPayApiError('Invalid status parameter', 400);
      mockClient.get.mockRejectedValue(apiError);

      await expect(deposits.listDeposits(year, status)).rejects.toThrow(apiError);
    });
  });

  describe('URL construction', () => {
    it('should construct correct endpoints for all operations', async () => {
      const depositId = 'dep_test_123';

      // Set up mock responses
      mockClient.get.mockResolvedValue(mockDepositResponse);
      mockClient.get.mockResolvedValue(mockDepositDetailResponse);
      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      // Test all endpoints
      await deposits.getDeposit(depositId);
      await deposits.getDepositDetail(depositId);
      await deposits.listDepositTransactions(depositId);

      expect(mockClient.get).toHaveBeenCalledWith(`/deposits/${depositId}`);
      expect(mockClient.get).toHaveBeenCalledWith(`/deposits/detail/${depositId}`);
      expect(mockClient.get).toHaveBeenCalledWith(`/deposits/${depositId}/transactions`);
    });

    it('should construct correct URL for listDeposits', async () => {
      const year = 2024;
      const status = 'pending';

      mockClient.get.mockResolvedValue(mockDepositsResponse);

      await deposits.listDeposits(year, status);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/deposits/${year}/${status}`,
        { status: 'pending' }
      );
    });
  });
});