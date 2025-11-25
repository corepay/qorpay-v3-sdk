/**
 * @file tests/unit/transactions.test.ts
 * @description Unit tests for the Transactions resource module
 */

import { Transactions } from '../../src/resources/transactions';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

// Sample test data for QorPay API responses (raw format)
const sampleQorPayTransactionResponse = {
  transaction_id: 'txn_123456789',
  amount: '100.50', // QorPay returns string
  currency: 'USD',
  status: 'approved',
  type: 'sale',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  card_brand: 'visa',
  card_last4: '1111',
  card_exp_month: '12',
  card_exp_year: '25',
  customer_id: 'cust_123',
  cfirstname: 'John',
  clastname: 'Doe',
  cemail: 'john.doe@example.com',
  reference_id: 'order_123456',
  order_id: 'order_123456',
  batch_id: 'batch_789',
};

const sampleQorPayTransactionListResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Success',
  data: {
    transactions: [
      sampleQorPayTransactionResponse,
      {
        ...sampleQorPayTransactionResponse,
        transaction_id: 'txn_987654321',
        amount: '75.25',
        card_last4: '2222',
        card_brand: 'mastercard',
      },
    ],
    total: 2,
    has_more: false,
  },
};

const sampleQorPayAchTransactionResponse = {
  transaction_id: 'ach_txn_123456789',
  amount: '200.00',
  currency: 'USD',
  status: 'approved',
  type: 'sale',
  created_at: '2024-01-15T11:00:00Z',
  ach_account_last4: '6789',
  ach_routing: '021000021',
  ach_account_type: 'checking',
  ach_bank_name: 'Test Bank',
  customer_id: 'cust_456',
  cfirstname: 'Jane',
  clastname: 'Smith',
  cemail: 'jane.smith@example.com',
};

const sampleQorPayPodResponse = {
  id: 'pod_123456789',
  transaction_id: 'txn_123456789',
  delivery_date: '2024-01-16T14:00:00Z',
  recipient_name: 'John Doe',
  recipient_signature: 'signature_data_url',
  notes: 'Delivered to front desk',
  images: ['image_url_1', 'image_url_2'],
  created_at: '2024-01-16T14:00:00Z',
  updated_at: '2024-01-16T14:30:00Z',
};

const sampleQorPayPodListResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Success',
  data: {
    records: [sampleQorPayPodResponse],
    total: 1,
    has_more: false,
  },
};

describe('Transactions', () => {
  let transactions: Transactions;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new mocked BaseClient instance
    mockBaseClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Mock the HTTP methods to return success responses by default
    mockBaseClient.get = jest
      .fn()
      .mockResolvedValue(sampleQorPayTransactionResponse);
    mockBaseClient.post = jest
      .fn()
      .mockResolvedValue({ data: sampleQorPayPodResponse });
    mockBaseClient.patch = jest
      .fn()
      .mockResolvedValue({ data: sampleQorPayPodResponse });
    mockBaseClient.delete = jest.fn().mockResolvedValue({
      status: 'approved',
      code: 'GW00',
      message: 'Deleted',
    });

    // Create a new Transactions instance with the mocked BaseClient
    transactions = new Transactions(mockBaseClient);
  });

  describe('Payment Transaction Methods', () => {
    describe('get', () => {
      it('should fetch and transform a single transaction', async () => {
        const result = await transactions.get('txn_123456789');

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/payments/transaction/txn_123456789'
        );
        expect(result.id).toBe('txn_123456789');
        expect(result.amount).toBe(100.5); // Transformed from string to number
        expect(result.currency).toBe('USD');
        expect(result.status).toBe('approved');
        expect(result.type).toBe('sale');
        expect(result.createdAt).toBeInstanceOf(Date); // Transformed from string to Date
        expect(result.paymentMethod.type).toBe('card');
        expect(result.paymentMethod.card?.brand).toBe('visa');
        expect(result.paymentMethod.card?.last4).toBe('1111');
        expect(result.customer?.name).toBe('John Doe');
        expect(result.customer?.email).toBe('john.doe@example.com');
        expect(result.referenceId).toBe('order_123456');
        expect(result.batchId).toBe('batch_789');
      });

      it('should handle API errors correctly', async () => {
        const errorResponse = new QorPayApiError(
          'Transaction not found',
          404,
          'GW04',
          { status: 'error', code: 'GW04', message: 'Transaction not found' }
        );

        mockBaseClient.get = jest.fn().mockRejectedValue(errorResponse);

        await expect(transactions.get('invalid_txn')).rejects.toThrow(
          QorPayApiError
        );
        await expect(transactions.get('invalid_txn')).rejects.toMatchObject({
          message: expect.stringContaining('Transaction not found'),
          statusCode: 404,
          errorCode: 'GW04',
        });
      });
    });

    describe('list', () => {
      it('should list and transform transactions with default parameters', async () => {
        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue(sampleQorPayTransactionListResponse);

        const result = await transactions.list();

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/payments/transactions',
          undefined
        );
        expect(result.data).toHaveLength(2);
        expect(result.data[0].amount).toBe(100.5); // Number transformation
        expect(result.data[1].amount).toBe(75.25);
        expect(result.pagination.total).toBe(2);
        expect(result.pagination.hasMore).toBe(false);
        expect(result.pagination.limit).toBe(50); // Default limit
      });

      it('should list transactions with custom parameters', async () => {
        const params = {
          status: 'approved' as const,
          limit: 25,
          offset: 10,
          minAmount: 50,
          maxAmount: 200,
          startDate: new Date('2024-01-01'),
        };

        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue(sampleQorPayTransactionListResponse);

        const result = await transactions.list(params);

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/payments/transactions',
          params
        );
        expect(result.pagination.limit).toBe(25);
        expect(result.pagination.offset).toBe(10);
      });

      it('should validate query parameters', async () => {
        const invalidParams = {
          limit: 150, // Above max of 100
          status: 'invalid_status' as any,
        };

        await expect(transactions.list(invalidParams)).rejects.toThrow();
      });
    });

    describe('listByCustomer', () => {
      it('should list transactions for a specific customer', async () => {
        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue(sampleQorPayTransactionListResponse);

        const result = await transactions.listByCustomer('cust_123', {
          limit: 10,
        });

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/payments/transactions/profile/cust_123',
          { limit: 10 }
        );
        expect(result.data).toHaveLength(2);
        expect(result.pagination.limit).toBe(10);
      });
    });

    describe('listByBatch', () => {
      it('should list transactions for a specific batch', async () => {
        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue(sampleQorPayTransactionListResponse);

        const result = await transactions.listByBatch('batch_789', {
          limit: 20,
        });

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/payments/transactions/batch/batch_789',
          { limit: 20 }
        );
        expect(result.data).toHaveLength(2);
        expect(result.pagination.limit).toBe(20);
      });
    });

    describe('listMarketPlaceByBatch', () => {
      it('should list marketplace transactions by batch', async () => {
        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue(sampleQorPayTransactionListResponse);

        const result =
          await transactions.listMarketPlaceByBatch('mp_batch_789');

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/payments/transactions/mp/batch/mp_batch_789',
          undefined
        );
        expect(result.data).toHaveLength(2);
      });
    });
  });

  describe('ACH Transaction Methods', () => {
    describe('getAchTransaction', () => {
      it('should fetch and transform an ACH transaction', async () => {
        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue(sampleQorPayAchTransactionResponse);

        const result =
          await transactions.getAchTransaction('ach_txn_123456789');

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/ach/transaction/ach_txn_123456789'
        );
        expect(result.id).toBe('ach_txn_123456789');
        expect(result.amount).toBe(200.0);
        expect(result.paymentMethod.type).toBe('ach');
        expect(result.paymentMethod.ach?.accountType).toBe('checking');
        expect(result.paymentMethod.ach?.last4).toBe('6789');
        expect(result.paymentMethod.ach?.routingNumber).toBe('021000021');
        expect(result.paymentMethod.ach?.bankName).toBe('Test Bank');
      });
    });

    describe('listAchTransactions', () => {
      it('should list ACH transactions', async () => {
        const achListResponse = {
          ...sampleQorPayTransactionListResponse,
          data: {
            transactions: [sampleQorPayAchTransactionResponse],
            total: 1,
            has_more: false,
          },
        };
        mockBaseClient.get = jest.fn().mockResolvedValue(achListResponse);

        const result = await transactions.listAchTransactions({ limit: 15 });

        expect(mockBaseClient.get).toHaveBeenCalledWith('/ach/transactions', {
          limit: 15,
        });
        expect(result.data).toHaveLength(1);
        expect(result.data[0].paymentMethod.type).toBe('ach');
        expect(result.pagination.limit).toBe(15);
      });
    });
  });

  describe('Proof of Delivery Methods', () => {
    describe('createProofOfDelivery', () => {
      it('should create a POD record with transformation', async () => {
        const podData = {
          transactionId: 'txn_123456789',
          deliveryDate: new Date('2024-01-16'),
          recipientName: 'John Doe',
          notes: 'Delivered to front desk',
        };

        const result = await transactions.createProofOfDelivery(podData);

        expect(mockBaseClient.post).toHaveBeenCalledWith(
          '/payments/transaction/proof_of_delivery/',
          expect.objectContaining({
            transaction_id: podData.transactionId,
            delivery_date: podData.deliveryDate.toISOString(),
            recipient_name: podData.recipientName,
            notes: podData.notes,
          })
        );
        expect(result.data.id).toBe('pod_123456789');
        expect(result.data.transactionId).toBe(podData.transactionId);
        expect(result.data.deliveryDate).toBeInstanceOf(Date);
      });

      it('should validate POD creation data', async () => {
        const invalidPodData = {
          transactionId: '', // Empty string should fail validation
          deliveryDate: 'invalid-date' as any,
        };

        await expect(
          transactions.createProofOfDelivery(invalidPodData)
        ).rejects.toThrow();
      });
    });

    describe('updateProofOfDelivery', () => {
      it('should update a POD record', async () => {
        const updateData = {
          id: 'pod_123456789',
          recipientName: 'Jane Doe',
          notes: 'Updated notes',
        };

        // Mock the response to reflect the updated data
        const updatedPodResponse = {
          ...sampleQorPayPodResponse,
          recipient_name: updateData.recipientName,
          notes: updateData.notes,
        };
        mockBaseClient.patch = jest
          .fn()
          .mockResolvedValue({ data: updatedPodResponse });

        const result = await transactions.updateProofOfDelivery(updateData);

        expect(mockBaseClient.patch).toHaveBeenCalledWith(
          '/payments/transaction/proof_of_delivery/',
          expect.objectContaining({
            id: updateData.id,
            recipient_name: updateData.recipientName,
            notes: updateData.notes,
          })
        );
        expect(result.data.recipientName).toBe('Jane Doe');
        expect(result.data.notes).toBe('Updated notes');
      });
    });

    describe('listProofOfDelivery', () => {
      it('should list POD records', async () => {
        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue(sampleQorPayPodListResponse);

        const result = await transactions.listProofOfDelivery({ limit: 5 });

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/payments/transaction/proof_of_delivery/',
          { limit: 5 }
        );
        expect(result.data).toHaveLength(1);
        expect(result.data[0].transactionId).toBe('txn_123456789');
        expect(result.pagination.limit).toBe(5);
      });
    });

    describe('getProofOfDelivery', () => {
      it('should fetch a single POD record', async () => {
        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue({ data: sampleQorPayPodResponse });

        const result = await transactions.getProofOfDelivery('pod_123456789');

        expect(mockBaseClient.get).toHaveBeenCalledWith(
          '/payments/transaction/proof_of_delivery/pod_123456789'
        );
        expect(result.data.id).toBe('pod_123456789');
        expect(result.data.deliveryDate).toBeInstanceOf(Date);
      });
    });

    describe('deleteProofOfDelivery', () => {
      it('should delete a POD record', async () => {
        await transactions.deleteProofOfDelivery('pod_123456789');

        expect(mockBaseClient.delete).toHaveBeenCalledWith(
          '/payments/transaction/proof_of_delivery/pod_123456789'
        );
      });
    });
  });

  describe('Transformation Logic', () => {
    describe('payment method extraction', () => {
      it('should extract card payment method correctly', async () => {
        const cardTransaction = {
          ...sampleQorPayTransactionResponse,
          ach_account_last4: undefined,
          ach_routing: undefined,
        };

        mockBaseClient.get = jest.fn().mockResolvedValue(cardTransaction);
        const result = await transactions.get('txn_123');

        expect(result.paymentMethod.type).toBe('card');
        expect(result.paymentMethod.card?.brand).toBe('visa');
        expect(result.paymentMethod.card?.last4).toBe('1111');
      });

      it('should extract ACH payment method correctly', async () => {
        mockBaseClient.get = jest
          .fn()
          .mockResolvedValue(sampleQorPayAchTransactionResponse);
        const result = await transactions.getAchTransaction('ach_txn_123');

        expect(result.paymentMethod.type).toBe('ach');
        expect(result.paymentMethod.ach?.accountType).toBe('checking');
        expect(result.paymentMethod.ach?.last4).toBe('6789');
      });

      it('should default to card payment method when no method data present', async () => {
        const noMethodTransaction = {
          ...sampleQorPayTransactionResponse,
          card_last4: undefined,
          card_brand: undefined,
          ach_account_last4: undefined,
          ach_routing: undefined,
        };

        mockBaseClient.get = jest.fn().mockResolvedValue(noMethodTransaction);
        const result = await transactions.get('txn_123');

        expect(result.paymentMethod.type).toBe('card');
      });
    });

    describe('status normalization', () => {
      it('should normalize various status values', async () => {
        const testCases = [
          { input: 'APPROVED', expected: 'approved' },
          { input: 'Approved', expected: 'approved' },
          { input: 'DECLINED', expected: 'declined' },
          { input: 'PENDING', expected: 'pending' },
          { input: 'VOIDED', expected: 'voided' },
          { input: 'REFUNDED', expected: 'refunded' },
          { input: 'UNKNOWN', expected: 'pending' }, // Default fallback
        ];

        for (const testCase of testCases) {
          const testTransaction = {
            ...sampleQorPayTransactionResponse,
            status: testCase.input,
          };

          mockBaseClient.get = jest.fn().mockResolvedValue(testTransaction);
          const result = await transactions.get('txn_123');

          expect(result.status).toBe(testCase.expected);
        }
      });
    });

    describe('type normalization', () => {
      it('should normalize various type values', async () => {
        const testCases = [
          { input: 'SALE', expected: 'sale' },
          { input: 'Sale', expected: 'sale' },
          { input: 'AUTH', expected: 'authorization' },
          { input: 'AUTHORIZATION', expected: 'authorization' },
          { input: 'CAPTURE', expected: 'capture' },
          { input: 'VOID', expected: 'void' },
          { input: 'REFUND', expected: 'refund' },
          { input: 'UNKNOWN', expected: 'sale' }, // Default fallback
        ];

        for (const testCase of testCases) {
          const testTransaction = {
            ...sampleQorPayTransactionResponse,
            type: testCase.input,
          };

          mockBaseClient.get = jest.fn().mockResolvedValue(testTransaction);
          const result = await transactions.get('txn_123');

          expect(result.type).toBe(testCase.expected);
        }
      });
    });

    describe('date transformation', () => {
      it('should transform various date formats to Date objects', async () => {
        const testCases = [
          '2024-01-15T10:30:00Z',
          '2024-01-15T10:30:00.000Z',
          '2024-01-15 10:30:00',
        ];

        for (const testCase of testCases) {
          const testTransaction = {
            ...sampleQorPayTransactionResponse,
            created_at: testCase,
          };

          mockBaseClient.get = jest.fn().mockResolvedValue(testTransaction);
          const result = await transactions.get('txn_123');

          expect(result.createdAt).toBeInstanceOf(Date);
        }
      });

      it('should handle missing date fields gracefully', async () => {
        const noDateTransaction = {
          ...sampleQorPayTransactionResponse,
          created_at: undefined,
          transaction_date: undefined,
        };

        mockBaseClient.get = jest.fn().mockResolvedValue(noDateTransaction);
        const result = await transactions.get('txn_123');

        expect(result.createdAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockBaseClient.get = jest.fn().mockRejectedValue(networkError);

      await expect(transactions.get('txn_123')).rejects.toThrow(
        'Network timeout'
      );
    });

    it('should handle malformed API responses with default values', async () => {
      const malformedResponse = {
        // Missing required fields - should get default values
        transaction_id: 'txn_123',
        status: 'approved',
        code: 'GW00',
        message: 'Success',
      };

      mockBaseClient.get = jest.fn().mockResolvedValue(malformedResponse);
      const result = await transactions.get('txn_123');

      // Should handle missing fields gracefully with defaults
      expect(result.id).toBe('txn_123');
      expect(result.amount).toBeNaN(); // NaN when amount is undefined
      expect(result.currency).toBe('USD'); // Default currency
      expect(result.status).toBe('approved');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});
