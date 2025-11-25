/**
 * @file tests/unit/transactions-coverage.test.ts
 * @description Coverage tests for Transactions resource to achieve 100% coverage
 */

import { Transactions } from '../../src/resources/transactions';
import { BaseClient } from '../../src/client/base-client';
import type {
  UpdateProofOfDeliveryRequest,
  BatchId,
  TransactionQueryParams,
} from '../../src/types';

// Mock BaseClient
jest.mock('../../src/client/base-client');

describe('Transactions - Coverage Tests', () => {
  let transactions: Transactions;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    mockBaseClient = new BaseClient({
      appKey: 'test-key',
      clientKey: 'test-secret',
    }) as jest.Mocked<BaseClient>;

    transactions = new Transactions(mockBaseClient);
  });

  describe('updateProofOfDelivery with undefined data', () => {
    it('should handle undefined data gracefully', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          id: 'txn_123',
          delivery_status: 'delivered',
          delivery_date: '2025-01-25T12:00:00Z',
        },
      };

      mockBaseClient.put.mockResolvedValue(mockResponse);

      // Pass undefined data (as mentioned in the comment at line 186)
      const result = await (transactions as any).updateProofOfDelivery(undefined);

      expect(mockBaseClient.put).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

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
        data: {
          id: 'txn_123',
          delivery_status: 'delivered',
          delivery_date: date.toISOString(),
          recipient_name: 'John Doe',
          notes: 'Delivered at front door',
        },
      };

      mockBaseClient.put.mockResolvedValue(mockResponse);

      const result = await transactions.updateProofOfDelivery(data);

      expect(mockBaseClient.put).toHaveBeenCalledWith('/payments/transactions/txn_123/proof-delivery', {
        id: 'txn_123',
        delivery_date: date.toISOString(),
        recipient_name: 'John Doe',
        notes: 'Delivered at front door',
      });
      expect(result).toEqual(mockResponse);
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
        data: {
          id: 'txn_123',
          delivery_date: dateString,
          recipient_name: 'John Doe',
        },
      };

      mockBaseClient.put.mockResolvedValue(mockResponse);

      const result = await transactions.updateProofOfDelivery(data);

      expect(mockBaseClient.put).toHaveBeenCalledWith('/payments/transactions/txn_123/proof-delivery', {
        id: 'txn_123',
        delivery_date: dateString,
        recipient_name: 'John Doe',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listByBatch with transformation', () => {
    it('should transform raw QorPay response to SDK format', async () => {
      const batchId = 'batch_123' as BatchId;
      const params: TransactionQueryParams = {
        limit: 10,
        offset: 0,
      };

      const rawResponse = {
        status: 'success',
        data: [
          {
            transaction_id: 'txn_123',
            batch_id: 'batch_123',
            amount: '100.00',
            currency: 'USD',
            status: 'approved',
            created_at: '2025-01-25T12:00:00Z',
            cfirstname: 'John',
            clastname: 'Doe',
            cemail: 'john@example.com',
            marketplace_merchant_id: 'merch_456',
            marketplace_fee: '5.00',
            net_amount: '95.00',
          },
        ],
        meta: {
          total: 1,
          limit: 10,
          offset: 0,
          has_more: false,
        },
      };

      const expectedTransformedResponse = {
        status: 'success',
        data: [
          {
            id: 'txn_123',
            batchId: 'batch_123',
            amount: '100.00',
            currency: 'USD',
            status: 'approved',
            createdAt: '2025-01-25T12:00:00Z',
            customer: {
              id: undefined,
              name: 'John Doe',
              email: 'john@example.com',
            },
            marketplace: {
              merchantId: 'merch_456',
              fee: '5.00',
              netAmount: '95.00',
            },
          },
        ],
        pagination: {
          total: 1,
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      };

      mockBaseClient.get.mockResolvedValue(rawResponse);

      const result = await transactions.listByBatch(batchId, params);

      expect(mockBaseClient.get).toHaveBeenCalledWith(
        '/payments/transactions/batch/batch_123',
        params
      );
      expect(result).toEqual(expectedTransformedResponse);
    });

    it('should handle batch without customer info', async () => {
      const batchId = 'batch_123' as BatchId;
      const rawResponse = {
        status: 'success',
        data: [
          {
            transaction_id: 'txn_456',
            batch_id: 'batch_123',
            amount: '50.00',
            currency: 'USD',
            status: 'pending',
            created_at: '2025-01-25T12:00:00Z',
            // No customer fields
          },
        ],
      };

      mockBaseClient.get.mockResolvedValue(rawResponse);

      const result = await transactions.listByBatch(batchId);

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
        data: [
          {
            transaction_id: 'txn_789',
            batch_id: 'batch_123',
            amount: '200.00',
            currency: 'USD',
            status: 'approved',
            created_at: '2025-01-25T12:00:00Z',
            marketplace_merchant_id: 'merch_789',
            marketplace_fee: '10.00',
            net_amount: '190.00',
          },
        ],
      };

      mockBaseClient.get.mockResolvedValue(rawResponse);

      const result = await transactions.listMarketPlaceByBatch(batchId, params);

      expect(mockBaseClient.get).toHaveBeenCalledWith(
        '/payments/transactions/marketplace/batch/batch_123',
        params
      );
      expect(result.data[0].marketplace?.merchantId).toBe('merch_789');
    });
  });

  describe('extractCustomerInfo edge cases', () => {
    it('should return undefined when no customer info exists', async () => {
      const rawResponse = {
        status: 'success',
        data: [
          {
            transaction_id: 'txn_no_customer',
            // No cfirstname or clastname
          },
        ],
      };

      mockBaseClient.get.mockResolvedValue(rawResponse);

      const result = await transactions.list();
      expect(result.data[0].customer).toBeUndefined();
    });

    it('should handle missing last name', async () => {
      const rawResponse = {
        status: 'success',
        data: [
          {
            transaction_id: 'txn_no_last',
            cfirstname: 'John',
            // No clastname
            cemail: 'john@example.com',
          },
        ],
      };

      mockBaseClient.get.mockResolvedValue(rawResponse);

      const result = await transactions.list();
      expect(result.data[0].customer?.name).toBe('John ');
    });

    it('should handle missing first name', async () => {
      const rawResponse = {
        status: 'success',
        data: [
          {
            transaction_id: 'txn_no_first',
            // No cfirstname
            clastname: 'Doe',
            cemail: 'john@example.com',
          },
        ],
      };

      mockBaseClient.get.mockResolvedValue(rawResponse);

      const result = await transactions.list();
      expect(result.data[0].customer?.name).toBe(' Doe');
    });

    it('should handle empty names', async () => {
      const rawResponse = {
        status: 'success',
        data: [
          {
            transaction_id: 'txn_empty_names',
            cfirstname: '',
            clastname: '',
            cemail: 'test@example.com',
          },
        ],
      };

      mockBaseClient.get.mockResolvedValue(rawResponse);

      const result = await transactions.list();
      expect(result.data[0].customer?.name).toBe(' ');
    });

    it('should handle customer ID presence', async () => {
      const rawResponse = {
        status: 'success',
        data: [
          {
            transaction_id: 'txn_with_customer_id',
            cfirstname: 'Jane',
            clastname: 'Smith',
            customer_id: 'cust_123',
            cemail: 'jane@example.com',
          },
        ],
      };

      mockBaseClient.get.mockResolvedValue(rawResponse);

      const result = await transactions.list();
      expect(result.data[0].customer?.id).toBe('cust_123');
    });
  });
});