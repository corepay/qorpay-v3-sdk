/**
 * @file tests/unit/transactions.test.ts
 * @description Unit tests for the Transactions resource module
 */

import { Transactions } from '../../src/resources/transactions';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('Transactions', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let transactions: Transactions;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    }) as jest.Mocked<BaseClient>;

    // Create the Transactions instance with the mock client
    transactions = new Transactions(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransaction', () => {
    const mockTransactionId = 'txn_123456';
    const mockTransactionResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        transaction_id: 'txn_123456',
        amount: '100.00',
        currency: 'USD',
        status: 'approved',
        created_at: '2023-01-01T12:00:00Z',
        payment_method: {
          type: 'card',
          card: {
            brand: 'visa',
            last4: '1111',
            exp_month: '12',
            exp_year: '25'
          }
        }
      }
    };

    it('should get a transaction successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionResponse);

      // Call the method
      const result = await transactions.getTransaction(mockTransactionId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/transactions/${mockTransactionId}`
      );

      // Verify the result
      expect(result).toEqual(mockTransactionResponse);
      expect(result.data.transaction_id).toBe(mockTransactionId);
      expect(result.data.amount).toBe('100.00');
    });

    it('should handle API errors when getting a transaction', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Transaction not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(transactions.getTransaction(mockTransactionId)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/transactions/${mockTransactionId}`
      );
    });
  });

  describe('listTransactions', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      start_date: '2023-01-01',
      end_date: '2023-01-31',
      status: 'approved'
    };

    const mockTransactionListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        transactions: [
          {
            transaction_id: 'txn_123456',
            amount: '100.00',
            currency: 'USD',
            status: 'approved',
            created_at: '2023-01-01T12:00:00Z'
          },
          {
            transaction_id: 'txn_789012',
            amount: '50.00',
            currency: 'USD',
            status: 'approved',
            created_at: '2023-01-02T12:00:00Z'
          }
        ],
        count: 2,
        total: 2,
        limit: 10,
        offset: 0
      }
    };

    it('should list transactions successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionListResponse);

      // Call the method with query parameters
      const result = await transactions.listTransactions(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/transactions',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockTransactionListResponse);
      expect(result.data.transactions.length).toBe(2);
      expect(result.data.transactions[0].transaction_id).toBe('txn_123456');
    });

    it('should list transactions successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionListResponse);

      // Call the method without query parameters
      const result = await transactions.listTransactions();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/transactions',
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockTransactionListResponse);
    });

    it('should handle API errors when listing transactions', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid query parameters',
        400,
        'GW01'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(transactions.listTransactions(mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/transactions',
        mockQueryParams
      );
    });
  });

  describe('listTransactionsByProfile', () => {
    const mockProfileId = 'profile_123456';
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      status: 'approved'
    };

    const mockTransactionListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        transactions: [
          {
            transaction_id: 'txn_123456',
            amount: '100.00',
            currency: 'USD',
            status: 'approved',
            created_at: '2023-01-01T12:00:00Z',
            profile_id: 'profile_123456'
          },
          {
            transaction_id: 'txn_789012',
            amount: '50.00',
            currency: 'USD',
            status: 'approved',
            created_at: '2023-01-02T12:00:00Z',
            profile_id: 'profile_123456'
          }
        ],
        count: 2,
        total: 2,
        limit: 10,
        offset: 0
      }
    };

    it('should list transactions by profile successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionListResponse);

      // Call the method with query parameters
      const result = await transactions.listTransactionsByProfile(mockProfileId, mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/profiles/${mockProfileId}/transactions`,
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockTransactionListResponse);
      expect(result.data.transactions.length).toBe(2);
      expect(result.data.transactions[0].profile_id).toBe(mockProfileId);
    });

    it('should list transactions by profile successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionListResponse);

      // Call the method without query parameters
      const result = await transactions.listTransactionsByProfile(mockProfileId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/profiles/${mockProfileId}/transactions`,
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockTransactionListResponse);
    });

    it('should handle API errors when listing transactions by profile', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Profile not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(transactions.listTransactionsByProfile(mockProfileId, mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/profiles/${mockProfileId}/transactions`,
        mockQueryParams
      );
    });
  });

  describe('listTransactionsByBatch', () => {
    const mockBatchId = 'batch_123456';
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      status: 'approved'
    };

    const mockTransactionListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        transactions: [
          {
            transaction_id: 'txn_123456',
            amount: '100.00',
            currency: 'USD',
            status: 'approved',
            created_at: '2023-01-01T12:00:00Z',
            batch_id: 'batch_123456'
          },
          {
            transaction_id: 'txn_789012',
            amount: '50.00',
            currency: 'USD',
            status: 'approved',
            created_at: '2023-01-02T12:00:00Z',
            batch_id: 'batch_123456'
          }
        ],
        count: 2,
        total: 2,
        limit: 10,
        offset: 0
      }
    };

    it('should list transactions by batch successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionListResponse);

      // Call the method with query parameters
      const result = await transactions.listTransactionsByBatch(mockBatchId, mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/batches/${mockBatchId}/transactions`,
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockTransactionListResponse);
      expect(result.data.transactions.length).toBe(2);
      expect(result.data.transactions[0].batch_id).toBe(mockBatchId);
    });

    it('should list transactions by batch successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionListResponse);

      // Call the method without query parameters
      const result = await transactions.listTransactionsByBatch(mockBatchId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/batches/${mockBatchId}/transactions`,
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockTransactionListResponse);
    });

    it('should handle API errors when listing transactions by batch', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Batch not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(transactions.listTransactionsByBatch(mockBatchId, mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/batches/${mockBatchId}/transactions`,
        mockQueryParams
      );
    });
  });

  describe('getAchTransaction', () => {
    const mockTransactionId = 'ach_txn_123456';
    const mockAchTransactionResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        transaction_id: 'ach_txn_123456',
        amount: '100.00',
        currency: 'USD',
        status: 'pending',
        created_at: '2023-01-01T12:00:00Z',
        payment_method: {
          type: 'ach',
          ach: {
            account_type: 'checking',
            last4: '6789',
            routing: '021000021'
          }
        },
        estimated_settlement_date: '2023-01-04T12:00:00Z'
      }
    };

    it('should get an ACH transaction successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockAchTransactionResponse);

      // Call the method
      const result = await transactions.getAchTransaction(mockTransactionId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/ach/transactions/${mockTransactionId}`
      );

      // Verify the result
      expect(result).toEqual(mockAchTransactionResponse);
      expect(result.data.transaction_id).toBe(mockTransactionId);
      expect(result.data.payment_method.type).toBe('ach');
    });

    it('should handle API errors when getting an ACH transaction', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Transaction not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(transactions.getAchTransaction(mockTransactionId)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/ach/transactions/${mockTransactionId}`
      );
    });
  });

  describe('listAchTransactions', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      start_date: '2023-01-01',
      end_date: '2023-01-31',
      status: 'pending'
    };

    const mockAchTransactionListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        transactions: [
          {
            transaction_id: 'ach_txn_123456',
            amount: '100.00',
            currency: 'USD',
            status: 'pending',
            created_at: '2023-01-01T12:00:00Z',
            payment_method: {
              type: 'ach',
              ach: {
                account_type: 'checking',
                last4: '6789'
              }
            }
          },
          {
            transaction_id: 'ach_txn_789012',
            amount: '50.00',
            currency: 'USD',
            status: 'completed',
            created_at: '2023-01-02T12:00:00Z',
            payment_method: {
              type: 'ach',
              ach: {
                account_type: 'savings',
                last4: '1234'
              }
            }
          }
        ],
        count: 2,
        total: 2,
        limit: 10,
        offset: 0
      }
    };

    it('should list ACH transactions successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockAchTransactionListResponse);

      // Call the method with query parameters
      const result = await transactions.listAchTransactions(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/ach/transactions',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockAchTransactionListResponse);
      expect(result.data.transactions.length).toBe(2);
      expect(result.data.transactions[0].transaction_id).toBe('ach_txn_123456');
      expect(result.data.transactions[0].payment_method.type).toBe('ach');
    });

    it('should list ACH transactions successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockAchTransactionListResponse);

      // Call the method without query parameters
      const result = await transactions.listAchTransactions();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/ach/transactions',
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockAchTransactionListResponse);
    });

    it('should handle API errors when listing ACH transactions', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid query parameters',
        400,
        'GW01'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(transactions.listAchTransactions(mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/ach/transactions',
        mockQueryParams
      );
    });
  });
});
