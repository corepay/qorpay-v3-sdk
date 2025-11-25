/**
 * @file tests/unit/transactions.test.ts
 * @description Unit tests for Transactions resource class
 */

import { Transactions } from '../../src/resources/transactions';
import { BaseClient } from '../../src/client/base-client';
import type {
  Transaction,
  TransactionListResponse,
  ProofOfDelivery,
  ProofOfDeliveryListResponse,
  CreateProofOfDeliveryRequest,
  UpdateProofOfDeliveryRequest,
} from '../../src/types/transactions';
import type { TransactionId, BatchId, ProfileId } from '../../src/types/common';

// Mock dependencies
jest.mock('../../src/client/base-client');
jest.mock('../../src/schemas/transactions', () => ({
  TransactionListParamsSchema: {
    parse: jest.fn((data) => data),
  },
  CreateProofOfDeliverySchema: {
    parse: jest.fn((data) => data),
  },
  UpdateProofOfDeliverySchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('Transactions', () => {
  let transactions: Transactions;
  let mockClient: jest.Mocked<BaseClient>;

  const mockTransaction: Transaction = {
    id: 'txn_123',
    amount: 10.00,
    currency: 'USD',
    status: 'approved',
    type: 'sale',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    paymentMethod: {
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        expiryMonth: '12',
        expiryYear: '2025',
      },
    },
    customer: {
      id: 'cust_123',
      name: 'John Doe',
      email: 'john@example.com',
    },
    referenceId: 'ref_123',
    orderId: 'order_123',
    batchId: 'batch_123',
    metadata: {
      code: 'SUCCESS',
      message: 'Transaction approved',
    },
  };

  const mockTransactionListResponse: TransactionListResponse = {
    data: [mockTransaction],
    pagination: {
      total: 1,
      hasMore: false,
      limit: 50,
      offset: 0,
    },
    status: 'success',
    code: 'SUCCESS',
    message: 'Transactions retrieved successfully',
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
    mockClient = new BaseClient({ appKey: 'test', clientKey: 'test' }) as jest.Mocked<BaseClient>;
    transactions = new Transactions(mockClient);
    jest.clearAllMocks();
  });

  describe('getTransaction', () => {
    it('should fetch a specific transaction by ID', async () => {
      const transactionId: TransactionId = 'txn_123';
      mockClient.get.mockResolvedValue({
        transaction_id: transactionId,
        amount: '10.00',
        currency: 'USD',
        status: 'approved',
        type: 'sale',
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
      });

      const result = await transactions.getTransaction(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith('/transactions/txn_123');
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('listTransactions', () => {
    it('should list transactions without parameters', async () => {
      mockClient.get.mockResolvedValue({
        data: {
          transactions: [{
            transaction_id: 'txn_123',
            amount: '10.00',
            currency: 'USD',
            status: 'approved',
            type: 'sale',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }],
          total: 1,
          has_more: false,
          limit: 50,
          offset: 0,
        },
        status: 'success',
        code: 'SUCCESS',
        message: 'Transactions retrieved',
      });

      const result = await transactions.listTransactions();

      expect(mockClient.get).toHaveBeenCalledWith('/transactions', undefined);
      expect(result.data).toHaveLength(1);
    });

    it('should list transactions with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        status: 'approved' as const,
      };

      mockClient.get.mockResolvedValue({
        data: {
          transactions: [],
          total: 0,
          has_more: false,
          limit: 10,
          offset: 0,
        },
        status: 'success',
        code: 'SUCCESS',
        message: 'No transactions found',
      });

      await transactions.listTransactions(params);

      expect(mockClient.get).toHaveBeenCalledWith('/transactions', params);
    });
  });

  describe('listTransactionsByProfile', () => {
    it('should list transactions for a specific profile', async () => {
      const profileId: ProfileId = 'profile_123';
      const params = { limit: 20 };

      mockClient.get.mockResolvedValue({
        data: {
          transactions: [{
            transaction_id: 'txn_456',
            amount: '25.00',
            status: 'approved',
            type: 'sale',
          }],
          total: 1,
          has_more: false,
        },
        status: 'success',
      });

      await transactions.listTransactionsByProfile(profileId, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/profiles/${profileId}/transactions`,
        params
      );
    });
  });

  describe('listTransactionsByBatch', () => {
    it('should list transactions for a specific batch', async () => {
      const batchId: BatchId = 'batch_123';

      mockClient.get.mockResolvedValue({
        data: {
          transactions: [{
            transaction_id: 'txn_789',
            amount: '50.00',
            status: 'approved',
            type: 'sale',
          }],
          total: 1,
          has_more: false,
        },
        status: 'success',
      });

      await transactions.listTransactionsByBatch(batchId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/batches/${batchId}/transactions`,
        undefined
      );
    });
  });

  describe('ACH transactions', () => {
    it('should get an ACH transaction', async () => {
      const transactionId: TransactionId = 'ach_123';
      mockClient.get.mockResolvedValue({
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

      const result = await transactions.getAchTransaction(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith(`/ach/transaction/${transactionId}`);
      expect(result.paymentMethod.type).toBe('ach');
      expect(result.paymentMethod.ach?.last4).toBe('6789');
    });

    it('should list ACH transactions', async () => {
      const params = { limit: 25 };
      mockClient.get.mockResolvedValue({
        data: {
          transactions: [{
            transaction_id: 'ach_456',
            amount: '200.00',
            ach_account_last4: '4321',
            ach_routing: '987654321',
          }],
          total: 1,
          has_more: false,
        },
        status: 'success',
      });

      const result = await transactions.listAchTransactions(params);

      expect(mockClient.get).toHaveBeenCalledWith('/ach/transactions', params);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].paymentMethod.type).toBe('ach');
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

      mockClient.post.mockResolvedValue({
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

      const result = await transactions.createProofOfDelivery(podData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/transaction/proof_of_delivery/',
        expect.objectContaining({
          transaction_id: 'txn_123',
          recipient_name: 'John Doe',
        })
      );
      expect(result.data).toEqual(expect.objectContaining({
        transactionId: 'txn_123',
        recipientName: 'John Doe',
      }));
    });

    it('should use current date when deliveryDate is not provided', async () => {
      const podData: CreateProofOfDeliveryRequest = {
        transactionId: 'txn_123',
        recipientName: 'Jane Doe',
      };

      mockClient.post.mockResolvedValue({
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

      await transactions.createProofOfDelivery(podData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/transaction/proof_of_delivery/',
        expect.objectContaining({
          transaction_id: 'txn_123',
          recipient_name: 'Jane Doe',
          delivery_date: expect.any(String),
        })
      );
    });

    it('should update a POD record', async () => {
      const updateData: UpdateProofOfDeliveryRequest & { id: string } = {
        id: 'pod_123',
        notes: 'Updated notes',
        recipientSignature: 'newsignature',
      };

      mockClient.patch.mockResolvedValue({
        status: 'success',
        code: 'SUCCESS',
        message: 'POD updated',
        data: {
          id: 'pod_123',
          notes: 'Updated notes',
          recipient_signature: 'newsignature',
          updated_at: '2024-01-02T00:00:00Z',
        },
      });

      const result = await transactions.updateProofOfDelivery(updateData);

      expect(mockClient.patch).toHaveBeenCalledWith(
        '/payments/transaction/proof_of_delivery/',
        expect.objectContaining({
          id: 'pod_123',
          notes: 'Updated notes',
        })
      );
      expect(result.data.notes).toBe('Updated notes');
    });

    it('should list POD records', async () => {
      const params = { limit: 10, offset: 0 };
      mockClient.get.mockResolvedValue({
        status: 'success',
        code: 'SUCCESS',
        message: 'POD list retrieved',
        data: {
          records: [{
            id: 'pod_125',
            transaction_id: 'txn_456',
            delivery_date: '2024-01-01T00:00:00Z',
            recipient_name: 'Bob Smith',
            created_at: '2024-01-01T00:00:00Z',
          }],
          total: 1,
          has_more: false,
        },
      });

      const result = await transactions.listProofOfDelivery(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/transaction/proof_of_delivery/',
        params
      );
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should get a single POD record', async () => {
      const podId = 'pod_123';
      mockClient.get.mockResolvedValue({
        status: 'success',
        code: 'SUCCESS',
        message: 'POD retrieved',
        data: {
          id: podId,
          transaction_id: 'txn_123',
          delivery_date: '2024-01-01T00:00:00Z',
          recipient_name: 'John Doe',
          created_at: '2024-01-01T00:00:00Z',
        },
      });

      const result = await transactions.getProofOfDelivery(podId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/payments/transaction/proof_of_delivery/${podId}`
      );
      expect(result.data.id).toBe(podId);
    });

    it('should delete a POD record', async () => {
      const podId = 'pod_123';
      mockClient.delete.mockResolvedValue(undefined);

      await transactions.deleteProofOfDelivery(podId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/payments/transaction/proof_of_delivery/${podId}`
      );
    });
  });

  describe('Alias methods', () => {
    it('should get transaction using alias method', async () => {
      const transactionId: TransactionId = 'txn_123';
      mockClient.get.mockResolvedValue({
        transaction_id: transactionId,
        amount: '10.00',
        status: 'approved',
        type: 'sale',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });

      const result = await transactions.get(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/payments/transaction/${transactionId}`
      );
      expect(result.id).toBe(transactionId);
    });

    it('should list transactions using alias method', async () => {
      const params = { limit: 5 };
      mockClient.get.mockResolvedValue({
        data: {
          transactions: [],
          total: 0,
          has_more: false,
        },
        status: 'success',
      });

      await transactions.list(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/transactions',
        params
      );
    });

    it('should list transactions by customer using alias method', async () => {
      const customerId: ProfileId = 'cust_123';
      mockClient.get.mockResolvedValue({
        data: {
          transactions: [],
          total: 0,
          has_more: false,
        },
        status: 'success',
      });

      await transactions.listByCustomer(customerId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/payments/transactions/profile/${customerId}`,
        undefined
      );
    });

    it('should list marketplace transactions by batch', async () => {
      const batchId: BatchId = 'batch_456';
      mockClient.get.mockResolvedValue({
        data: {
          transactions: [{
            transaction_id: 'mp_txn_789',
            amount: '75.00',
            status: 'approved',
            type: 'sale',
          }],
          total: 1,
          has_more: false,
        },
        status: 'success',
      });

      const result = await transactions.listMarketPlaceByBatch(batchId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/payments/transactions/mp/batch/${batchId}`,
        undefined
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('Data transformation', () => {
    it('should normalize various status values', async () => {
      const statusTests = [
        { input: 'settled', expected: 'approved' },
        { input: 'completed', expected: 'approved' },
        { input: 'APPROVED', expected: 'approved' },
        { input: 'declined', expected: 'declined' },
        { input: 'pending', expected: 'pending' },
        { input: 'unknown', expected: 'pending' }, // fallback
      ];

      for (const test of statusTests) {
        mockClient.get.mockResolvedValueOnce({
          transaction_id: `txn_${test.input}`,
          amount: '10.00',
          status: test.input,
          type: 'sale',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        });

        const result = await transactions.get(`txn_${test.input}`);
        expect(result.status).toBe(test.expected);
      }
    });

    it('should normalize various type values', async () => {
      const typeTests = [
        { input: 'AUTH', expected: 'authorization' },
        { input: 'authorization', expected: 'authorization' },
        { input: 'sale', expected: 'sale' },
        { input: 'refund', expected: 'refund' },
        { input: 'unknown', expected: 'sale' }, // fallback
      ];

      for (const test of typeTests) {
        mockClient.get.mockResolvedValueOnce({
          transaction_id: `txn_${test.input}`,
          amount: '10.00',
          status: 'approved',
          type: test.input,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        });

        const result = await transactions.get(`txn_${test.input}`);
        expect(result.type).toBe(test.expected);
      }
    });

    it('should extract payment method correctly', async () => {
      // Test card payment method
      mockClient.get.mockResolvedValueOnce({
        transaction_id: 'txn_card',
        amount: '10.00',
        status: 'approved',
        type: 'sale',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        card_brand: 'mastercard',
        card_last4: '5555',
        card_exp_month: '06',
        card_exp_year: '2026',
      });

      const cardResult = await transactions.get('txn_card');
      expect(cardResult.paymentMethod.type).toBe('card');
      expect(cardResult.paymentMethod.card?.brand).toBe('mastercard');

      // Test ACH payment method
      mockClient.get.mockResolvedValueOnce({
        transaction_id: 'txn_ach',
        amount: '10.00',
        status: 'approved',
        type: 'sale',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ach_account_last4: '9876',
        ach_routing: '111222333',
        ach_account_type: 'savings',
        ach_bank_name: 'Test Savings Bank',
      });

      const achResult = await transactions.get('txn_ach');
      expect(achResult.paymentMethod.type).toBe('ach');
      expect(achResult.paymentMethod.ach?.accountType).toBe('savings');
    });
  });
});