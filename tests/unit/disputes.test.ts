/**
 * @file tests/unit/disputes.test.ts
 * @description Unit tests for the Disputes resource module
 */

import { Disputes } from '../../src/resources/disputes';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('Disputes', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let disputes: Disputes;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Create the Disputes instance with the mock client
    disputes = new Disputes(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDispute', () => {
    const mockDisputeId = 'disp_123456';

    it('should throw a deprecation error when calling getDispute', async () => {
      // Expect the method to throw a deprecation error
      await expect(disputes.getDispute(mockDisputeId)).rejects.toThrow(
        'Individual dispute retrieval is not supported by the QorPay API. ' +
          'Use listDisputes() with transaction_id filter to find specific disputes.'
      );

      // Verify the client was not called due to the deprecation error
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should validate dispute ID parameter even when throwing deprecation error', async () => {
      // Expect the method to throw a validation error for empty ID
      await expect(disputes.getDispute('')).rejects.toThrow();

      // Verify the client was not called due to validation error
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });

  describe('listDisputes', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      mid: 'mid_123456',
      status: 'open',
      reason_code: 'fraud',
      created_start: '2023-01-01',
      created_end: '2023-01-31',
    };

    const mockDisputeListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        disputes: [
          {
            id: 'disp_123456',
            transaction_data: {
              transaction_id: 'txn_123456',
              mid: 'mid_123456',
              amount: '100.00',
              currency: 'USD',
              reason_code: 'fraud',
              reason_description: 'Fraudulent transaction',
              status: 'open',
              created_at: '2023-01-01T12:00:00Z',
              updated_at: '2023-01-01T12:00:00Z',
            },
          },
          {
            id: 'disp_789012',
            transaction_data: {
              transaction_id: 'txn_789012',
              mid: 'mid_123456',
              amount: '50.00',
              currency: 'USD',
              reason_code: 'authorization',
              reason_description: 'Authorization issue',
              status: 'open',
              created_at: '2023-01-15T12:00:00Z',
              updated_at: '2023-01-15T12:00:00Z',
            },
          },
        ],
        meta: {
          count: 2,
          limit: 10,
          offset: 0,
        },
      },
    };

    it('should list disputes successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDisputeListResponse);

      // Call the method with query parameters
      const result = await disputes.listDisputes(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/disputes',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockDisputeListResponse);
      expect(result.data.disputes).toHaveLength(2);
      expect(result.data.disputes[0].id).toBe('disp_123456');
      expect(result.data.disputes[0].transaction_data.amount).toBe('100.00');
      expect(result.data.meta.count).toBe(2);
    });

    it('should list disputes successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDisputeListResponse);

      // Call the method without query parameters
      const result = await disputes.listDisputes();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/payment/disputes', {});

      // Verify the result
      expect(result).toEqual(mockDisputeListResponse);
    });

    it('should handle API errors when listing disputes', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Access denied', 403, 'GW03');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(disputes.listDisputes(mockQueryParams)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/disputes',
        mockQueryParams
      );
    });
  });

  describe('listDisputesByTransaction', () => {
    const mockTransactionId = 'txn_123456';
    const mockQueryParams = {
      limit: 5,
      offset: 0,
    };

    const mockTransactionDisputesResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        disputes: [
          {
            id: 'disp_123456',
            transaction_data: {
              transaction_id: 'txn_123456',
              mid: 'mid_123456',
              amount: '100.00',
              currency: 'USD',
              reason_code: 'fraud',
              reason_description: 'Fraudulent transaction',
              status: 'open',
              created_at: '2023-01-01T12:00:00Z',
              updated_at: '2023-01-01T12:00:00Z',
            },
          },
        ],
        meta: {
          count: 1,
          limit: 5,
          offset: 0,
        },
      },
    };

    it('should list disputes by transaction successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionDisputesResponse);

      // Call the method
      const result = await disputes.listDisputesByTransaction(
        mockTransactionId,
        mockQueryParams
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/transactions/${mockTransactionId}/disputes`,
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockTransactionDisputesResponse);
      expect(result.data.disputes).toHaveLength(1);
      expect(result.data.disputes[0].transaction_data.transaction_id).toBe(
        mockTransactionId
      );
    });

    it('should list disputes by transaction without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionDisputesResponse);

      // Call the method without query parameters
      const result =
        await disputes.listDisputesByTransaction(mockTransactionId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/transactions/${mockTransactionId}/disputes`,
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockTransactionDisputesResponse);
    });

    it('should handle API errors when listing disputes by transaction', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Transaction not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        disputes.listDisputesByTransaction(mockTransactionId, mockQueryParams)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/transactions/${mockTransactionId}/disputes`,
        mockQueryParams
      );
    });

    it('should handle empty disputes list for transaction', async () => {
      // Mock empty response
      const emptyResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [],
          meta: {
            count: 0,
            limit: 5,
            offset: 0,
          },
        },
      };

      mockClient.get.mockResolvedValue(emptyResponse);

      // Call the method
      const result = await disputes.listDisputesByTransaction(
        mockTransactionId,
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(emptyResponse);
      expect(result.data.disputes).toHaveLength(0);
      expect(result.data.meta.count).toBe(0);
    });
  });

  describe('listAchDisputes', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      mid: 'mid_123456',
      status: 'open',
      created_start: '2023-01-01',
      created_end: '2023-01-31',
    };

    const mockAchDisputeListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        disputes: [
          {
            id: 'disp_ach_123456',
            transaction_data: {
              transaction_id: 'ach_txn_123456',
              mid: 'mid_123456',
              amount: '500.00',
              currency: 'USD',
              reason_code: 'unauthorized',
              reason_description: 'Unauthorized ACH transaction',
              status: 'open',
              created_at: '2023-01-01T12:00:00Z',
              updated_at: '2023-01-01T12:00:00Z',
            },
          },
          {
            id: 'disp_ach_789012',
            transaction_data: {
              transaction_id: 'ach_txn_789012',
              mid: 'mid_123456',
              amount: '250.00',
              currency: 'USD',
              reason_code: 'fraud',
              reason_description: 'Suspicious ACH activity',
              status: 'under_review',
              created_at: '2023-01-15T12:00:00Z',
              updated_at: '2023-01-16T09:00:00Z',
            },
          },
        ],
        meta: {
          count: 2,
          limit: 10,
          offset: 0,
        },
      },
    };

    it('should list ACH disputes successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockAchDisputeListResponse);

      // Call the method with query parameters
      const result = await disputes.listAchDisputes(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/ach/disputes',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockAchDisputeListResponse);
      expect(result.data.disputes).toHaveLength(2);
      expect(result.data.disputes[0].id).toBe('disp_ach_123456');
      expect(result.data.disputes[0].transaction_data.amount).toBe('500.00');
      expect(result.data.disputes[0].transaction_data.reason_code).toBe(
        'unauthorized'
      );
      expect(result.data.disputes[1].transaction_data.status).toBe(
        'under_review'
      );
      expect(result.data.meta.count).toBe(2);
    });

    it('should list ACH disputes successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockAchDisputeListResponse);

      // Call the method without query parameters
      const result = await disputes.listAchDisputes();

      // Verify the client was called with the correct parameters (empty object for validation)
      expect(mockClient.get).toHaveBeenCalledWith('/payment/ach/disputes', {});

      // Verify the result
      expect(result).toEqual(mockAchDisputeListResponse);
      expect(result.data.disputes).toHaveLength(2);
    });

    it('should handle API errors when listing ACH disputes', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Access denied', 403, 'GW03');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(disputes.listAchDisputes(mockQueryParams)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/ach/disputes',
        mockQueryParams
      );
    });

    it('should handle empty ACH disputes list', async () => {
      // Mock empty response
      const emptyResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [],
          meta: {
            count: 0,
            limit: 10,
            offset: 0,
          },
        },
      };

      mockClient.get.mockResolvedValue(emptyResponse);

      // Call the method
      const result = await disputes.listAchDisputes(mockQueryParams);

      // Verify the result
      expect(result).toEqual(emptyResponse);
      expect(result.data.disputes).toHaveLength(0);
      expect(result.data.meta.count).toBe(0);
    });

    it('should handle filtering by transaction ID for ACH disputes', async () => {
      const transactionFilterParams = {
        transaction_id: 'ach_txn_123456',
        limit: 5,
      };

      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockAchDisputeListResponse);

      // Call the method with transaction filter
      const result = await disputes.listAchDisputes(transactionFilterParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/ach/disputes',
        transactionFilterParams
      );

      // Verify the result
      expect(result).toEqual(mockAchDisputeListResponse);
    });
  });
});
