/**
 * @file tests/unit/transactions-coverage.test.ts
 * @description Tests for transactionsCoverage resource class WITHOUT internal mocks
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import { QorPayApiError } from '../../src/errors';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
  expectApiCall,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

/**
 * @file tests/unit/transactions-coverage.test.ts
 * @description Coverage tests for Transactions resource to achieve 100% coverage
 */

import { Transactions } from '../../src/resources/transactions';

import type {
  UpdateProofOfDeliveryRequest,
  BatchId,
  TransactionQueryParams,
} from '../../src/types/transactions';

// Mock BaseClient

describe('Transactions - Coverage Tests', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('updateProofOfDelivery', () => {
    it('should handle Date object for deliveryDate', async () => {
      const date = new Date('2025-01-25T12:00:00Z');
      const data = {
        id: 'txn_123',
        deliveryDate: date,
        recipientName: 'John Doe',
        notes: 'Delivered at front door',
      } as UpdateProofOfDeliveryRequest & { id: string };

      const mockResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          id: 'pod_123',
          transaction_id: 'txn_123',
          delivery_date: '2025-01-25T12:00:00Z',
          recipient_name: 'John Doe',
          notes: 'Delivered at front door',
          created_at: '2025-01-25T12:00:00Z',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.transactions.updateProofOfDelivery(data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/payments/transaction/proof_of_delivery/',
          data: {
            id: 'txn_123',
            delivery_date: date.toISOString(),
            recipient_name: 'John Doe',
            notes: 'Delivered at front door',
          },
        })
      );
      expect(result.status).toBe('success');
    });

    it('should handle string date for deliveryDate', async () => {
      const dateString = '2025-01-25T12:00:00Z';
      const data = {
        id: 'txn_123',
        deliveryDate: dateString,
        recipientName: 'John Doe',
      } as UpdateProofOfDeliveryRequest & { id: string };

      const mockResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          id: 'pod_123',
          transaction_id: 'txn_123',
          delivery_date: dateString,
          recipient_name: 'John Doe',
          created_at: '2025-01-25T12:00:00Z',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.transactions.updateProofOfDelivery(data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/payments/transaction/proof_of_delivery/',
          data: {
            id: 'txn_123',
            delivery_date: dateString,
            recipient_name: 'John Doe',
          },
        })
      );
      expect(result.status).toBe('success');
    });
  });

  describe('listByBatch', () => {
    it('should list transactions for a batch', async () => {
      const batchId = 'batch_123' as BatchId;
      const params: TransactionQueryParams = {
        limit: 10,
        offset: 0,
      };

      const rawResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_123',
              batch_id: 'batch_123',
              amount: '100.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2025-01-25T12:00:00Z',
              updated_at: '2025-01-25T12:00:00Z',
              cfirstname: 'John',
              clastname: 'Doe',
              cemail: 'john@example.com',
              marketplace_merchant_id: 'merch_456',
              marketplace_fee: '5.00',
              net_amount: '95.00',
            },
          ],
          total: 1,
          has_more: false,
          limit: 10,
          offset: 0,
        },
      };

      mockSuccessfulResponse(rawResponse);

      const result = await client.transactions.listByBatch(batchId, params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/transactions/batch/batch_123',
          params,
        })
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('txn_123');
    });

    it('should handle batch without customer info', async () => {
      const batchId = 'batch_123' as BatchId;
      const rawResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_456',
              batch_id: 'batch_123',
              amount: '50.00',
              currency: 'USD',
              status: 'pending',
              type: 'sale',
              created_at: '2025-01-25T12:00:00Z',
              updated_at: '2025-01-25T12:00:00Z',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(rawResponse);

      const result = await client.transactions.listByBatch(batchId);

      expect(result.data[0].customer).toBeUndefined();
    });
  });

  describe('listMarketPlaceByBatch', () => {
    it('should list marketplace transactions for a batch', async () => {
      const batchId = 'batch_123' as BatchId;
      const params: TransactionQueryParams = {
        limit: 5,
      };

      const rawResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_789',
              batch_id: 'batch_123',
              amount: '200.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2025-01-25T12:00:00Z',
              updated_at: '2025-01-25T12:00:00Z',
              marketplace_merchant_id: 'merch_789',
              marketplace_fee: '10.00',
              net_amount: '190.00',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(rawResponse);

      const result = await client.transactions.listMarketPlaceByBatch(
        batchId,
        params
      );

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/payments/transactions/mp/batch/batch_123',
          params,
        })
      );
      expect(result.data[0].id).toBe('txn_789');
    });
  });

  describe('list transactions', () => {
    it('should list transactions with customer info', async () => {
      const rawResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_with_customer_id',
              amount: '100.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2025-01-25T12:00:00Z',
              updated_at: '2025-01-25T12:00:00Z',
              cfirstname: 'Jane',
              clastname: 'Smith',
              customer_id: 'cust_123',
              cemail: 'jane@example.com',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(rawResponse);

      const result = await client.transactions.list();
      expect(result.data[0].customer?.id).toBe('cust_123');
      expect(result.data[0].customer?.name).toBe('Jane Smith');
      expect(result.data[0].customer?.email).toBe('jane@example.com');
    });

    it('should return undefined when no customer info exists', async () => {
      const rawResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_no_customer',
              amount: '50.00',
              currency: 'USD',
              status: 'pending',
              type: 'sale',
              created_at: '2025-01-25T12:00:00Z',
              updated_at: '2025-01-25T12:00:00Z',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(rawResponse);

      const result = await client.transactions.list();
      expect(result.data[0].customer).toBeUndefined();
    });

    it('should handle missing last name', async () => {
      const rawResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_no_last',
              amount: '75.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2025-01-25T12:00:00Z',
              updated_at: '2025-01-25T12:00:00Z',
              cfirstname: 'John',
              cemail: 'john@example.com',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(rawResponse);

      const result = await client.transactions.list();
      expect(result.data[0].customer?.name).toBe('John undefined');
    });

    it('should handle missing first name', async () => {
      const rawResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_no_first',
              amount: '75.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2025-01-25T12:00:00Z',
              updated_at: '2025-01-25T12:00:00Z',
              clastname: 'Doe',
              cemail: 'john@example.com',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(rawResponse);

      const result = await client.transactions.list();
      expect(result.data[0].customer?.name).toBe('undefined Doe');
    });

    it('should handle empty names', async () => {
      const rawResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          transactions: [
            {
              transaction_id: 'txn_empty_names',
              amount: '25.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2025-01-25T12:00:00Z',
              updated_at: '2025-01-25T12:00:00Z',
              cfirstname: '',
              clastname: '',
              cemail: 'test@example.com',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(rawResponse);

      const result = await client.transactions.list();
      // Empty strings are falsy, so customer info is undefined
      expect(result.data[0].customer).toBeUndefined();
    });
  });

  describe('Proof of Delivery operations', () => {
    it('should create proof of delivery', async () => {
      const data = {
        transactionId: 'txn_123',
        deliveryDate: new Date('2025-01-25T12:00:00Z'),
        recipientName: 'John Doe',
        notes: 'Delivered successfully',
      };

      const mockResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          id: 'pod_123',
          transaction_id: 'txn_123',
          delivery_date: '2025-01-25T12:00:00Z',
          recipient_name: 'John Doe',
          notes: 'Delivered successfully',
          created_at: '2025-01-25T12:00:00Z',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.transactions.createProofOfDelivery(data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/transaction/proof_of_delivery/',
          data: expect.objectContaining({
            transaction_id: 'txn_123',
            recipient_name: 'John Doe',
          }),
        })
      );
      expect(result.status).toBe('success');
    });

    it('should list proof of delivery records', async () => {
      const mockResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          records: [
            {
              id: 'pod_1',
              transaction_id: 'txn_1',
              delivery_date: '2025-01-25T12:00:00Z',
              recipient_name: 'John Doe',
              created_at: '2025-01-25T12:00:00Z',
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.transactions.listProofOfDelivery();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('pod_1');
    });

    it('should get a single proof of delivery record', async () => {
      const mockResponse = {
        status: 'success',
        code: '200',
        message: 'Success',
        data: {
          id: 'pod_1',
          transaction_id: 'txn_1',
          delivery_date: '2025-01-25T12:00:00Z',
          recipient_name: 'John Doe',
          created_at: '2025-01-25T12:00:00Z',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.transactions.getProofOfDelivery('pod_1');

      expect(result.data.id).toBe('pod_1');
      expect(result.data.transactionId).toBe('txn_1');
    });

    it('should delete a proof of delivery record', async () => {
      mockSuccessfulResponse({ status: 'success' });

      await client.transactions.deleteProofOfDelivery('pod_1');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/payments/transaction/proof_of_delivery/pod_1',
        })
      );
    });
  });
});
