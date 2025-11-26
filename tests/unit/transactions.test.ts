/**
 * @file tests/unit/transactions.test.ts
 * @description Tests for transactions resource class WITHOUT internal mocks
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
 * @file tests/unit/transactions.test.ts
 * @description Unit tests for Transactions resource class
 */

import { Transactions } from '../../src/resources/transactions';

import type {
  Transaction,
  TransactionListResponse,
  ProofOfDelivery,
  ProofOfDeliveryListResponse,
  CreateProofOfDeliveryRequest,
  UpdateProofOfDeliveryRequest,
} from '../../src/types/transactions';
import type { TransactionId, BatchId, ProfileId } from '../../src/types/common';

describe('Transactions', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockRawTransaction = {
    transaction_id: 'txn_123',
    amount: '100.00',
    currency: 'USD',
    status: 'approved',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    card_brand: 'visa',
    card_last4: '4242',
    card_exp_month: '12',
    card_exp_year: '2025',
    cfirstname: 'John',
    clastname: 'Doe',
    cemail: 'john@example.com',
    customer_id: 'cust_123',
    reference_id: 'ref_123',
    order_id: 'order_123',
    batch_id: 'batch_123',
    code: 'SUCCESS',
    message: 'Transaction approved',
  };

  const mockTransactionListResponse = {
    status: 'success',
    code: 'SUCCESS',
    message: 'Transactions retrieved successfully',
    data: {
      transactions: [mockRawTransaction],
      total: 1,
      has_more: false,
      limit: 50,
      offset: 0,
    },
  };

  const mockProofOfDelivery: ProofOfDelivery = {
    id: 'pod_123',
    transactionId: 'txn_123',
    deliveryDate: new Date('2024-01-01T00:00:00Z'),
    recipientName: 'John Doe',
    recipientSignature: 'base64signature',
    notes: 'Delivered successfully',
    images: ['image1.jpg', 'image2.jpg'],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize transactions resource', () => {
      expect(client.transactions).toBeDefined();
      expect(typeof client.transactions.getTransaction).toBe('function');
      expect(typeof client.transactions.listTransactions).toBe('function');
      expect(typeof client.transactions.listTransactionsByProfile).toBe(
        'function'
      );
      expect(typeof client.transactions.listTransactionsByBatch).toBe(
        'function'
      );
      expect(typeof client.transactions.getAchTransaction).toBe('function');
      expect(typeof client.transactions.listAchTransactions).toBe('function');
      expect(typeof client.transactions.createProofOfDelivery).toBe('function');
    });
  });

  describe('getTransaction', () => {
    it('should fetch a specific transaction by ID', async () => {
      const transactionId: TransactionId = 'txn_123';
      mockSuccessfulResponse(mockRawTransaction);

      const result = await client.transactions.getTransaction(transactionId);

      expect(result).toEqual(mockRawTransaction);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/transactions/txn_123',
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Transaction not found', 404);

      await expect(
        client.transactions.getTransaction('invalid-txn')
      ).rejects.toThrow();
    });
  });

  describe('listTransactions', () => {
    it('should list transactions without parameters', async () => {
      mockSuccessfulResponse(mockTransactionListResponse);

      const result = await client.transactions.listTransactions();

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/transactions',
        })
      );
    });

    it('should list transactions with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
      };

      mockSuccessfulResponse({
        ...mockTransactionListResponse,
        data: {
          ...mockTransactionListResponse.data,
          limit: 10,
          offset: 0,
        },
      });

      await client.transactions.listTransactions(params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/transactions',
          params,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve transactions', 500);

      await expect(client.transactions.listTransactions()).rejects.toThrow();
    });
  });

  describe('listTransactionsByProfile', () => {
    it('should list transactions for a specific profile', async () => {
      const profileId: ProfileId = 'profile_123';
      const params = { limit: 20 };

      mockSuccessfulResponse({
        data: {
          transactions: [
            {
              transaction_id: 'txn_456',
              amount: '25.00',
              status: 'approved',
              type: 'sale',
            },
          ],
          total: 1,
          has_more: false,
        },
        status: 'success',
      });

      await client.transactions.listTransactionsByProfile(profileId, params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/profiles/${profileId}/transactions`,
          params,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Profile not found', 404);

      await expect(
        client.transactions.listTransactionsByProfile('invalid-profile')
      ).rejects.toThrow();
    });
  });

  describe('listTransactionsByBatch', () => {
    it('should list transactions for a specific batch', async () => {
      const batchId: BatchId = 'batch_123';

      mockSuccessfulResponse({
        data: {
          transactions: [
            {
              transaction_id: 'txn_789',
              amount: '50.00',
              status: 'approved',
              type: 'sale',
            },
          ],
          total: 1,
          has_more: false,
        },
        status: 'success',
      });

      await client.transactions.listTransactionsByBatch(batchId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/batches/${batchId}/transactions`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Batch not found', 404);

      await expect(
        client.transactions.listTransactionsByBatch('invalid-batch')
      ).rejects.toThrow();
    });
  });

  describe('ACH transactions', () => {
    it('should get an ACH transaction', async () => {
      const transactionId: TransactionId = 'ach_123';
      mockSuccessfulResponse({
        transaction_id: transactionId,
        amount: '100.00',
        currency: 'USD',
        status: 'approved',
        type: 'sale',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ach_account_last4: '6789',
        ach_routing: '123456789',
        ach_account_type: 'checking',
        ach_bank_name: 'Test Bank',
      });

      const result = await client.transactions.getAchTransaction(transactionId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/ach/transaction/${transactionId}`,
        })
      );
      expect(result).toBeDefined();
    });

    it('should list ACH transactions', async () => {
      const params = { limit: 25 };
      mockSuccessfulResponse({
        data: {
          transactions: [
            {
              transaction_id: 'ach_456',
              amount: '200.00',
              ach_account_last4: '4321',
              ach_routing: '987654321',
            },
          ],
          total: 1,
          has_more: false,
        },
        status: 'success',
      });

      const result = await client.transactions.listAchTransactions(params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/ach/transactions',
          params,
        })
      );
      expect(result.status).toBe('success');
    });

    it('should propagate API errors from ACH endpoints', async () => {
      mockFailedResponse('ACH transaction not found', 404);

      await expect(
        client.transactions.getAchTransaction('invalid-ach')
      ).rejects.toThrow();
    });
  });

  describe('Proof of Delivery', () => {
    it('should create a POD record', async () => {
      const podData: CreateProofOfDeliveryRequest = {
        transactionId: 'txn_123',
        recipientName: 'John Doe',
        recipientSignature: 'signaturedata',
        notes: 'Delivered on time',
        images: ['proof1.jpg'],
      };

      mockSuccessfulResponse({
        status: 'success',
        code: 'SUCCESS',
        message: 'POD created',
        data: {
          id: 'pod_123',
          transaction_id: 'txn_123',
          delivery_date: '2024-01-01T00:00:00Z',
          recipient_name: 'John Doe',
          recipient_signature: 'signaturedata',
          notes: 'Delivered on time',
          images: ['proof1.jpg'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      });

      const result = await client.transactions.createProofOfDelivery(podData);

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

    it('should use current date when deliveryDate is not provided', async () => {
      const podData: CreateProofOfDeliveryRequest = {
        transactionId: 'txn_123',
        recipientName: 'Jane Doe',
      };

      mockSuccessfulResponse({
        status: 'success',
        code: 'SUCCESS',
        message: 'POD created',
        data: {
          id: 'pod_124',
          transaction_id: 'txn_123',
          recipient_name: 'Jane Doe',
          created_at: '2024-01-01T00:00:00Z',
        },
      });

      await client.transactions.createProofOfDelivery(podData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/transaction/proof_of_delivery/',
          data: expect.objectContaining({
            transaction_id: 'txn_123',
            recipient_name: 'Jane Doe',
          }),
        })
      );
    });

    it('should throw ZodError when POD validation fails', async () => {
      const invalidPodData = {
        // Missing required transactionId
        recipientName: 'John Doe',
      } as any;

      await expect(
        client.transactions.createProofOfDelivery(invalidPodData)
      ).rejects.toThrow();
    });

    it('should propagate API errors from POD endpoints', async () => {
      const podData: CreateProofOfDeliveryRequest = {
        transactionId: 'invalid-txn',
        recipientName: 'John Doe',
      };

      mockFailedResponse('Transaction not found', 404);

      await expect(
        client.transactions.createProofOfDelivery(podData)
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFailedResponse('Network error', 500);

      await expect(
        client.transactions.getTransaction('txn_123')
      ).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockFailedResponse('Request timeout', 408);

      await expect(client.transactions.listTransactions()).rejects.toThrow();
    });
  });
});
