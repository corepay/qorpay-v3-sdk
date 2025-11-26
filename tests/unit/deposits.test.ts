/**
 * @file tests/unit/deposits.test.ts
 * @description Tests for deposits resource class using real instances
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

describe('Deposits', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockDeposit = {
    deposit_id: 'dep_123',
    deposit_date: '2024-01-15',
    amount: 1000.0,
    currency: 'USD',
    status: 'completed',
    transaction_count: 25,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  };

  const mockDepositListResponse = {
    status: 'success',
    data: {
      deposits: [
        mockDeposit,
        { ...mockDeposit, deposit_id: 'dep_456', amount: 2000.0 },
      ],
      total_count: 2,
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
    it('should initialize deposits resource', () => {
      expect(client.deposits).toBeDefined();
      expect(typeof client.deposits.getDeposit).toBe('function');
      expect(typeof client.deposits.listDeposits).toBe('function');
      expect(typeof client.deposits.listDepositTransactions).toBe('function');
    });
  });

  describe('getDeposit', () => {
    it('should retrieve a deposit successfully', async () => {
      const depositId = 'dep_123';

      mockSuccessfulResponse(mockDeposit);

      const result = await client.deposits.getDeposit(depositId);

      expect(result).toEqual(mockDeposit);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/deposits/${depositId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Deposit not found', 404);

      await expect(
        client.deposits.getDeposit('invalid_deposit')
      ).rejects.toThrow();
    });

    it('should handle empty deposit ID', async () => {
      mockFailedResponse('Deposit ID is required', 400);

      await expect(client.deposits.getDeposit('')).rejects.toThrow();
    });
  });

  describe('listDeposits', () => {
    it('should list deposits with year and status parameters', async () => {
      const year = 2024;
      const status = 'completed';
      const params = {
        limit: 25,
        offset: 0,
      };

      mockSuccessfulResponse(mockDepositListResponse);

      const result = await client.deposits.listDeposits(year, status, params);

      expect(result.data.deposits).toHaveLength(2);
      expect(result.data.total_count).toBe(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/deposits/2024/completed',
          params: {
            ...params,
            status: 'completed',
          },
        })
      );
    });

    it('should list deposits without optional parameters', async () => {
      const year = 2024;
      const status = 'completed';

      mockSuccessfulResponse(mockDepositListResponse);

      const result = await client.deposits.listDeposits(year, status);

      expect(result.data.deposits).toHaveLength(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/deposits/2024/completed',
          params: {
            status: 'completed',
          },
        })
      );
    });

    it('should list deposits with additional filters', async () => {
      const year = 2024;
      const status = 'pending';
      const params = {
        limit: 50,
        offset: 10,
      };

      mockSuccessfulResponse({
        ...mockDepositListResponse,
        data: {
          deposits: [mockDeposit],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await client.deposits.listDeposits(year, status, params);

      expect(result.data.deposits).toHaveLength(1);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/deposits/2024/pending',
          params: {
            ...params,
            status: 'pending',
          },
        })
      );
    });

    it('should handle different status values', async () => {
      const year = 2023;
      const status = 'failed';

      mockSuccessfulResponse({
        status: 'success',
        data: { deposits: [], total_count: 0, has_more: false },
      });

      await client.deposits.listDeposits(year, status);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/deposits/2023/failed',
          params: {
            status: 'failed',
          },
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve deposits', 500);

      await expect(
        client.deposits.listDeposits(2024, 'completed')
      ).rejects.toThrow();
    });

    it('should handle empty list response', async () => {
      mockSuccessfulResponse({
        status: 'success',
        data: {
          deposits: [],
          total_count: 0,
          has_more: false,
        },
      });

      const result = await client.deposits.listDeposits(2024, 'completed');

      expect(result.data.deposits).toEqual([]);
      expect(result.data.total_count).toBe(0);
    });
  });

  describe('listDepositTransactions', () => {
    it('should list transactions for a deposit', async () => {
      const depositId = 'dep_123';
      const params = {
        limit: 10,
        offset: 0,
      };

      const mockTransactionsResponse = {
        status: 'success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_123',
              amount: '100.00',
              currency: 'USD',
              status: 'completed',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(mockTransactionsResponse);

      const result = await client.deposits.listDepositTransactions(
        depositId,
        params
      );

      expect(result.data.transactions).toHaveLength(1);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/deposits/${depositId}/transactions`,
          params,
        })
      );
    });

    it('should list transactions without parameters', async () => {
      const depositId = 'dep_123';

      const mockTransactionsResponse = {
        status: 'success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_123',
              amount: '100.00',
              currency: 'USD',
              status: 'completed',
            },
          ],
          total_count: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(mockTransactionsResponse);

      const result = await client.deposits.listDepositTransactions(depositId);

      expect(result.data.transactions).toHaveLength(1);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/deposits/${depositId}/transactions`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Deposit not found', 404);

      await expect(
        client.deposits.listDepositTransactions('invalid_deposit')
      ).rejects.toThrow();
    });

    it('should handle empty transactions list', async () => {
      const depositId = 'dep_123';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          transactions: [],
          total_count: 0,
          has_more: false,
        },
      });

      const result = await client.deposits.listDepositTransactions(depositId);

      expect(result.data.transactions).toEqual([]);
      expect(result.data.total_count).toBe(0);
    });

    it('should handle deposit ID with special characters', async () => {
      const depositId = 'dep_123/with/special-chars';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          transactions: [],
          total_count: 0,
          has_more: false,
        },
      });

      await client.deposits.listDepositTransactions(depositId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/deposits/${depositId}/transactions`,
        })
      );
    });
  });
});
