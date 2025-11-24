/**
 * @file tests/unit/deposits.test.ts
 * @description Unit tests for the Deposits resource module
 */

import { Deposits } from '../../src/resources/deposits';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('Deposits', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let deposits: Deposits;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Create the Deposits instance with the mock client
    deposits = new Deposits(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeposit', () => {
    const mockDepositId = 'dep_123456';
    const mockDepositResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        id: 'dep_123456',
        mid: 'mid_123456',
        amount: '1000.00',
        currency: 'USD',
        status: 'completed',
        deposit_date: '2023-01-01T12:00:00Z',
        settlement_date: '2023-01-02T12:00:00Z',
        batch_id: 'batch_123456',
        transaction_count: 10,
        transactions: [
          {
            transaction_id: 'txn_123456',
            amount: '100.00',
            currency: 'USD',
            type: 'sale',
            status: 'approved',
            created_at: '2023-01-01T10:00:00Z',
            reference_id: 'ref_123456',
          },
        ],
        metadata: {
          source: 'api',
        },
      },
    };

    it('should get a deposit successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositResponse);

      // Call the method
      const result = await deposits.getDeposit(mockDepositId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(`/deposits/${mockDepositId}`);

      // Verify the result
      expect(result).toEqual(mockDepositResponse);
      expect(result.data.id).toBe(mockDepositId);
      expect(result.data.amount).toBe('1000.00');
      expect(result.data.status).toBe('completed');
      expect(result.data.transactions).toBeDefined();
      expect(result.data.transactions!).toHaveLength(1);
    });

    it('should handle API errors when getting a deposit', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Deposit not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(deposits.getDeposit(mockDepositId)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(`/deposits/${mockDepositId}`);
    });
  });

  describe('listDeposits', () => {
    const mockYear = 2023;
    const mockStatus = 'completed';
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      mid: 'mid_123456',
      deposit_date_start: '2023-01-01',
      deposit_date_end: '2023-01-31',
    };

    const mockDepositListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        deposits: [
          {
            id: 'dep_123456',
            mid: 'mid_123456',
            amount: '1000.00',
            currency: 'USD',
            status: 'completed',
            deposit_date: '2023-01-01T12:00:00Z',
            settlement_date: '2023-01-02T12:00:00Z',
            batch_id: 'batch_123456',
            transaction_count: 10,
          },
          {
            id: 'dep_789012',
            mid: 'mid_123456',
            amount: '500.00',
            currency: 'USD',
            status: 'completed',
            deposit_date: '2023-01-15T12:00:00Z',
            settlement_date: '2023-01-16T12:00:00Z',
            batch_id: 'batch_789012',
            transaction_count: 5,
          },
        ],
        meta: {
          count: 2,
          limit: 10,
          offset: 0,
        },
      },
    };

    it('should list deposits successfully with year, status, and query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositListResponse);

      // Call the method with year, status, and query parameters
      const result = await deposits.listDeposits(
        mockYear,
        mockStatus,
        mockQueryParams
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/deposits/2023/completed', {
        ...mockQueryParams,
        status: mockStatus,
      });

      // Verify the result
      expect(result).toEqual(mockDepositListResponse);
      expect(result.data.deposits).toHaveLength(2);
      expect(result.data.deposits[0].id).toBe('dep_123456');
      expect(result.data.deposits[0].amount).toBe('1000.00');
      expect(result.data.meta.count).toBe(2);
    });

    it('should list deposits successfully with only year and status parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositListResponse);

      // Call the method with only year and status
      const result = await deposits.listDeposits(mockYear, mockStatus);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/deposits/2023/completed', {
        status: mockStatus,
      });

      // Verify the result
      expect(result).toEqual(mockDepositListResponse);
      expect(result.data.deposits).toHaveLength(2);
      expect(result.data.deposits[0].id).toBe('dep_123456');
      expect(result.data.deposits[0].amount).toBe('1000.00');
      expect(result.data.meta.count).toBe(2);
    });

    it('should handle API errors when listing deposits', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Access denied', 403, 'GW03');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        deposits.listDeposits(mockYear, mockStatus, mockQueryParams)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/deposits/2023/completed', {
        ...mockQueryParams,
        status: mockStatus,
      });
    });

    it('should handle empty deposit list', async () => {
      // Mock empty response
      const emptyResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          deposits: [],
          meta: {
            count: 0,
            limit: 10,
            offset: 0,
          },
        },
      };

      mockClient.get.mockResolvedValue(emptyResponse);

      // Call the method
      const result = await deposits.listDeposits(mockYear, mockStatus);

      // Verify the result
      expect(result).toEqual(emptyResponse);
      expect(result.data.deposits).toHaveLength(0);
      expect(result.data.meta.count).toBe(0);
    });

    it('should handle filtering by batch_id', async () => {
      const batchFilterParams = {
        batch_id: 'batch_123456',
        limit: 5,
      };

      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositListResponse);

      // Call the method with batch filter
      const result = await deposits.listDeposits(
        mockYear,
        mockStatus,
        batchFilterParams
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/deposits/2023/completed', {
        ...batchFilterParams,
        status: mockStatus,
      });

      // Verify the result
      expect(result).toEqual(mockDepositListResponse);
    });

    it('should handle sorting parameters', async () => {
      const sortParams = {
        sort_by: 'deposit_date',
        sort_order: 'desc' as const,
        limit: 20,
      };

      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositListResponse);

      // Call the method with sort parameters
      const result = await deposits.listDeposits(
        mockYear,
        mockStatus,
        sortParams
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/deposits/2023/completed', {
        ...sortParams,
        status: mockStatus,
      });

      // Verify the result
      expect(result).toEqual(mockDepositListResponse);
    });
  });

  describe('getDepositDetail', () => {
    const mockDepositId = 'dep_123456';
    const mockDepositDetailResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        id: 'dep_123456',
        mid: 'mid_123456',
        amount: '1000.00',
        currency: 'USD',
        status: 'completed',
        deposit_date: '2023-01-01T12:00:00Z',
        settlement_date: '2023-01-02T12:00:00Z',
        batch_id: 'batch_123456',
        transaction_count: 10,
        transactions: [
          {
            transaction_id: 'txn_123456',
            amount: '100.00',
            currency: 'USD',
            type: 'sale',
            status: 'approved',
            created_at: '2023-01-01T10:00:00Z',
            reference_id: 'ref_123456',
          },
          {
            transaction_id: 'txn_789012',
            amount: '200.00',
            currency: 'USD',
            type: 'sale',
            status: 'approved',
            created_at: '2023-01-01T11:00:00Z',
            reference_id: 'ref_789012',
          },
        ],
        metadata: {
          source: 'api',
          detailed: true,
        },
      },
    };

    it('should get deposit details successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositDetailResponse);

      // Call the method
      const result = await deposits.getDepositDetail(mockDepositId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/deposits/detail/${mockDepositId}`
      );

      // Verify the result
      expect(result).toEqual(mockDepositDetailResponse);
      expect(result.data.id).toBe(mockDepositId);
      expect(result.data.amount).toBe('1000.00');
      expect(result.data.status).toBe('completed');
      expect(result.data.transactions).toBeDefined();
      expect(result.data.transactions!).toHaveLength(2);
      expect(result.data.transactions![0].transaction_id).toBe('txn_123456');
      expect(result.data.transactions![1].transaction_id).toBe('txn_789012');
      expect(result.data.metadata?.detailed).toBe(true);
    });

    it('should handle API errors when getting deposit details', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Deposit not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(deposits.getDepositDetail(mockDepositId)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/deposits/detail/${mockDepositId}`
      );
    });

    it('should validate deposit ID parameter', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositDetailResponse);

      // Call the method with empty deposit ID (should throw validation error)
      await expect(deposits.getDepositDetail('')).rejects.toThrow();

      // Verify the client was not called due to validation error
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should handle deposit details with no transactions', async () => {
      // Mock response with no transactions
      const noTransactionsResponse = {
        ...mockDepositDetailResponse,
        data: {
          ...mockDepositDetailResponse.data,
          transactions: [],
          transaction_count: 0,
        },
      };

      mockClient.get.mockResolvedValue(noTransactionsResponse);

      // Call the method
      const result = await deposits.getDepositDetail(mockDepositId);

      // Verify the result
      expect(result).toEqual(noTransactionsResponse);
      expect(result.data.transactions).toEqual([]);
      expect(result.data.transaction_count).toBe(0);
    });
  });
});
