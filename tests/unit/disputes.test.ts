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
    const mockDisputeResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
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
          due_date: '2023-01-15T23:59:59Z',
          case_number: 'CASE123456',
          metadata: {
            source: 'chargeback',
          },
        },
        documents: [
          {
            id: 'doc_123456',
            type: 'receipt',
            filename: 'receipt.pdf',
            url: 'https://example.com/receipt.pdf',
            uploaded_at: '2023-01-01T13:00:00Z',
          },
        ],
        evidence: {
          customer_communication: 'Email correspondence with customer',
          refund_policy: 'Standard 30-day refund policy',
          shipping_documentation: 'Tracking number: 1234567890',
          receipt: 'Transaction receipt attached',
          additional_evidence: 'Customer signed agreement',
        },
      },
    };

    it('should get a dispute successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDisputeResponse);

      // Call the method
      const result = await disputes.getDispute(mockDisputeId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(`/disputes/${mockDisputeId}`);

      // Verify the result
      expect(result).toEqual(mockDisputeResponse);
      expect(result.data.id).toBe(mockDisputeId);
      expect(result.data.transaction_data.transaction_id).toBe('txn_123456');
      expect(result.data.transaction_data.status).toBe('open');
      expect(result.data.documents).toBeDefined();
      expect(result.data.documents!).toHaveLength(1);
      expect(result.data.evidence).toBeDefined();
    });

    it('should handle API errors when getting a dispute', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Dispute not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(disputes.getDispute(mockDisputeId)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(`/disputes/${mockDisputeId}`);
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
      expect(mockClient.get).toHaveBeenCalledWith('/disputes', mockQueryParams);

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
      expect(mockClient.get).toHaveBeenCalledWith('/disputes', undefined);

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
      expect(mockClient.get).toHaveBeenCalledWith('/disputes', mockQueryParams);
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
});
