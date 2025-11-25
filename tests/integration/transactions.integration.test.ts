/**
 * @file tests/integration/transactions.integration.test.ts
 * @description Integration tests for the Transactions module using MSW
 */

import { QorPayClient, QorPayApiError } from '../../src';
import mswServer from './setup/msw-server';

// Test credentials (from README)
const TEST_APP_KEY = 'T6554252567241061980';
const TEST_CLIENT_KEY = '01dffeb784c64d098c8c691ea589eb82';

describe('Transactions Integration Tests', () => {
  let qorpay: QorPayClient;

  // Set up the MSW server before all tests
  beforeAll(() => {
    mswServer.start();
  });

  // Reset handlers between tests
  beforeEach(() => {
    mswServer.reset();

    // Create a new client for each test
    qorpay = new QorPayClient({
      appKey: TEST_APP_KEY,
      clientKey: TEST_CLIENT_KEY,
      environment: 'sandbox',
      // Set a short timeout for faster test failures
      timeout: 3000,
    });
  });

  // Stop the server after all tests
  afterAll(() => {
    mswServer.stop();
  });

  describe('Payment Transaction Operations', () => {
    describe('get', () => {
      it('should fetch a transaction with full transformation', async () => {
        const mockTransactionId = 'txn_test_123456789';
        const mockResponse = {
          transaction_id: mockTransactionId,
          amount: '100.50',
          currency: 'USD',
          status: 'approved',
          type: 'sale',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:35:00Z',
          card_brand: 'visa',
          card_last4: '4242',
          card_exp_month: '12',
          card_exp_year: '25',
          customer_id: 'cust_123',
          customer_email: 'john.doe@example.com',
          customer_name: 'John Doe',
          reference_id: 'order_123456',
          order_id: 'order_123456',
          batch_id: 'batch_789',
          metadata: { source: 'online' },
        };

        // Mock specific endpoint - return raw QorPay response format
        mswServer.mockEndpoint(
          'get',
          `/payments/transaction/${mockTransactionId}`,
          {
            data: mockResponse,
          }
        );

        const result = await qorpay.transactions.get(mockTransactionId);

        // Test transformation from QorPay format to clean SDK format
        expect(result.id).toBe(mockTransactionId);
        expect(result.amount).toBe(100.5); // Transformed from string to number
        expect(result.currency).toBe('USD');
        expect(result.status).toBe('approved');
        expect(result.type).toBe('sale');
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);

        // Test payment method extraction
        expect(result.paymentMethod.type).toBe('card');
        expect(result.paymentMethod.card?.brand).toBe('visa');
        expect(result.paymentMethod.card?.last4).toBe('4242');
        expect(result.paymentMethod.card?.expiryMonth).toBe('12');
        expect(result.paymentMethod.card?.expiryYear).toBe('25');

        // Test customer information extraction
        expect(result.customer?.id).toBe('cust_123');
        expect(result.customer?.email).toBe('john.doe@example.com');
        expect(result.customer?.name).toBe('John Doe');

        // Test references
        expect(result.referenceId).toBe('order_123456');
        expect(result.orderId).toBe('order_123456');
        expect(result.batchId).toBe('batch_789');
        expect(result.metadata).toEqual({ source: 'online' });
      });

      it('should handle transaction not found error', async () => {
        const invalidTransactionId = 'txn_invalid_123';

        mswServer.mockEndpoint(
          'get',
          `/payments/transaction/${invalidTransactionId}`,
          {
            status: 404,
            errorCode: 'TRANSACTION_NOT_FOUND',
            errorMessage: 'Transaction not found',
          }
        );

        await expect(
          qorpay.transactions.get(invalidTransactionId)
        ).rejects.toThrow(QorPayApiError);
      });
    });

    describe('list', () => {
      it('should list transactions with default pagination', async () => {
        const mockResponse = {
          transactions: [
            {
              transaction_id: 'txn_1',
              amount: '100.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2024-01-15T10:00:00Z',
              card_brand: 'visa',
              card_last4: '1111',
            },
            {
              transaction_id: 'txn_2',
              amount: '75.50',
              currency: 'USD',
              status: 'pending',
              type: 'sale',
              created_at: '2024-01-15T11:00:00Z',
              card_brand: 'mastercard',
              card_last4: '2222',
            },
          ],
          total: 2,
          has_more: false,
        };

        mswServer.mockEndpoint('get', '/payments/transactions', {
          data: mockResponse,
        });

        const result = await qorpay.transactions.list();

        expect(result.data).toHaveLength(2);
        expect(result.data[0].amount).toBe(100.0); // Number transformation
        expect(result.data[1].amount).toBe(75.5);
        expect(result.pagination.total).toBe(2);
        expect(result.pagination.hasMore).toBe(false);
        expect(result.pagination.limit).toBe(50); // Default limit
        expect(result.pagination.offset).toBe(0); // Default offset
      });

      it('should list transactions with custom parameters', async () => {
        const params = {
          status: 'approved' as const,
          limit: 25,
          offset: 10,
          minAmount: 50,
          maxAmount: 200,
          startDate: new Date('2024-01-01'),
          customerId: 'cust_123',
        };

        const mockResponse = {
          transactions: [
            {
              transaction_id: 'txn_filtered',
              amount: '150.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2024-01-15T12:00:00Z',
              card_brand: 'visa',
              card_last4: '3333',
            },
          ],
          total: 1,
          has_more: false,
        };

        mswServer.mockEndpoint('get', '/payments/transactions', {
          data: mockResponse,
        });

        const result = await qorpay.transactions.list(params);

        expect(result.data).toHaveLength(1);
        expect(result.pagination.limit).toBe(25);
        expect(result.pagination.offset).toBe(10);
        expect(result.data[0].amount).toBe(150.0);
      });
    });

    describe('listByCustomer', () => {
      it('should list transactions for a specific customer', async () => {
        const customerId = 'cust_123456';
        const mockResponse = {
          transactions: [
            {
              transaction_id: 'txn_cust_1',
              amount: '200.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2024-01-15T13:00:00Z',
              card_brand: 'visa',
              card_last4: '4444',
              customer_id: customerId,
            },
          ],
          total: 1,
          has_more: false,
        };

        mswServer.mockEndpoint(
          'get',
          `/payments/transactions/profile/${customerId}`,
          {
            data: mockResponse,
          }
        );

        const result = await qorpay.transactions.listByCustomer(customerId, {
          limit: 20,
        });

        expect(result.data).toHaveLength(1);
        expect(result.pagination.limit).toBe(20);
        expect(result.data[0].customer?.id).toBe(customerId);
      });
    });

    describe('listByBatch', () => {
      it('should list transactions for a specific batch', async () => {
        const batchId = 'batch_789012';
        const mockResponse = {
          transactions: [
            {
              transaction_id: 'txn_batch_1',
              amount: '300.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2024-01-15T14:00:00Z',
              card_brand: 'mastercard',
              card_last4: '5555',
              batch_id: batchId,
            },
          ],
          total: 1,
          has_more: false,
        };

        mswServer.mockEndpoint(
          'get',
          `/payments/transactions/batch/${batchId}`,
          {
            data: mockResponse,
          }
        );

        const result = await qorpay.transactions.listByBatch(batchId);

        expect(result.data).toHaveLength(1);
        expect(result.data[0].batchId).toBe(batchId);
      });
    });

    describe('listMarketPlaceByBatch', () => {
      it('should list marketplace transactions by batch', async () => {
        const mpBatchId = 'mp_batch_345678';
        const mockResponse = {
          transactions: [
            {
              transaction_id: 'txn_mp_1',
              amount: '400.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2024-01-15T15:00:00Z',
              card_brand: 'visa',
              card_last4: '6666',
            },
          ],
          total: 1,
          has_more: false,
        };

        mswServer.mockEndpoint(
          'get',
          `/payments/transactions/mp/batch/${mpBatchId}`,
          {
            data: mockResponse,
          }
        );

        const result =
          await qorpay.transactions.listMarketPlaceByBatch(mpBatchId);

        expect(result.data).toHaveLength(1);
        expect(result.data[0].amount).toBe(400.0);
      });
    });
  });

  describe('ACH Transaction Operations', () => {
    describe('getAchTransaction', () => {
      it('should fetch an ACH transaction with proper transformation', async () => {
        const achTransactionId = 'ach_txn_123456789';
        const mockResponse = {
          transaction_id: achTransactionId,
          amount: '500.00',
          currency: 'USD',
          status: 'pending',
          type: 'sale',
          created_at: '2024-01-15T16:00:00Z',
          ach_account_last4: '6789',
          ach_routing: '021000021',
          ach_account_type: 'checking',
          ach_bank_name: 'Test Bank',
          customer_id: 'cust_456',
          customer_email: 'jane.smith@example.com',
          reference_id: 'ach_order_789',
        };

        mswServer.mockEndpoint('get', `/ach/transaction/${achTransactionId}`, {
          data: mockResponse,
        });

        const result =
          await qorpay.transactions.getAchTransaction(achTransactionId);

        expect(result.id).toBe(achTransactionId);
        expect(result.amount).toBe(500.0); // Number transformation
        expect(result.status).toBe('pending');
        expect(result.paymentMethod.type).toBe('ach');
        expect(result.paymentMethod.ach?.accountType).toBe('checking');
        expect(result.paymentMethod.ach?.last4).toBe('6789');
        expect(result.paymentMethod.ach?.routingNumber).toBe('021000021');
        expect(result.paymentMethod.ach?.bankName).toBe('Test Bank');
        expect(result.customer?.id).toBe('cust_456');
        expect(result.customer?.email).toBe('jane.smith@example.com');
        expect(result.referenceId).toBe('ach_order_789');
      });

      it('should handle ACH transaction not found error', async () => {
        const invalidAchId = 'ach_invalid_123';

        mswServer.mockEndpoint('get', `/ach/transaction/${invalidAchId}`, {
          status: 404,
          errorCode: 'ACH_NOT_FOUND',
          errorMessage: 'ACH transaction not found',
        });

        await expect(
          qorpay.transactions.getAchTransaction(invalidAchId)
        ).rejects.toThrow(QorPayApiError);
      });
    });

    describe('listAchTransactions', () => {
      it('should list ACH transactions', async () => {
        const mockResponse = {
          transactions: [
            {
              transaction_id: 'ach_txn_1',
              amount: '250.00',
              currency: 'USD',
              status: 'approved',
              type: 'sale',
              created_at: '2024-01-15T17:00:00Z',
              ach_account_last4: '4321',
              ach_routing: '123456789',
              ach_account_type: 'savings',
              ach_bank_name: 'First Bank',
            },
            {
              transaction_id: 'ach_txn_2',
              amount: '350.00',
              currency: 'USD',
              status: 'pending',
              type: 'sale',
              created_at: '2024-01-15T18:00:00Z',
              ach_account_last4: '8765',
              ach_routing: '987654321',
              ach_account_type: 'checking',
              ach_bank_name: 'Second Bank',
            },
          ],
          total: 2,
          has_more: false,
        };

        mswServer.mockEndpoint('get', '/ach/transactions', {
          data: mockResponse,
        });

        const result = await qorpay.transactions.listAchTransactions({
          limit: 15,
        });

        expect(result.data).toHaveLength(2);
        expect(result.pagination.limit).toBe(15);
        expect(result.data[0].paymentMethod.type).toBe('ach');
        expect(result.data[0].paymentMethod.ach?.accountType).toBe('savings');
        expect(result.data[1].paymentMethod.ach?.accountType).toBe('checking');
        expect(result.data[0].amount).toBe(250.0);
        expect(result.data[1].amount).toBe(350.0);
      });

      it('should handle empty ACH transaction list', async () => {
        const mockResponse = {
          transactions: [],
          total: 0,
          has_more: false,
        };

        mswServer.mockEndpoint('get', '/ach/transactions', {
          data: mockResponse,
        });

        const result = await qorpay.transactions.listAchTransactions();

        expect(result.data).toHaveLength(0);
        expect(result.pagination.total).toBe(0);
      });
    });
  });

  describe('Proof of Delivery Operations', () => {
    describe('createProofOfDelivery', () => {
      it('should create a POD record with transformation', async () => {
        const podData = {
          transactionId: 'txn_123456789',
          deliveryDate: new Date('2024-01-16'),
          recipientName: 'John Doe',
          recipientSignature: 'base64_signature_data',
          notes: 'Delivered to front desk',
          images: ['image1.jpg', 'image2.jpg'],
        };

        const mockResponse = {
          id: 'pod_123456789',
          transaction_id: podData.transactionId,
          delivery_date: '2024-01-16T00:00:00Z',
          recipient_name: podData.recipientName,
          recipient_signature: podData.recipientSignature,
          notes: podData.notes,
          images: podData.images,
          created_at: '2024-01-16T08:00:00Z',
        };

        mswServer.mockEndpoint(
          'post',
          '/payments/transaction/proof_of_delivery/',
          {
            data: mockResponse,
          }
        );

        const result = await qorpay.transactions.createProofOfDelivery(podData);

        expect(result.id).toBe('pod_123456789');
        expect(result.transactionId).toBe(podData.transactionId);
        expect(result.recipientName).toBe(podData.recipientName);
        expect(result.recipientSignature).toBe(podData.recipientSignature);
        expect(result.notes).toBe(podData.notes);
        expect(result.images).toEqual(podData.images);
        expect(result.deliveryDate).toBeInstanceOf(Date);
        expect(result.createdAt).toBeInstanceOf(Date);
      });

      it('should validate POD creation data', async () => {
        const invalidPodData = {
          transactionId: '', // Empty string should fail validation
          deliveryDate: 'invalid-date' as any,
        };

        await expect(
          qorpay.transactions.createProofOfDelivery(invalidPodData)
        ).rejects.toThrow();
      });
    });

    describe('updateProofOfDelivery', () => {
      it('should update a POD record', async () => {
        const updateData = {
          id: 'pod_123456789',
          recipientName: 'Jane Doe Updated',
          notes: 'Updated delivery notes',
        };

        const mockResponse = {
          id: updateData.id,
          transaction_id: 'txn_123456789',
          delivery_date: '2024-01-16T00:00:00Z',
          recipient_name: updateData.recipientName,
          notes: updateData.notes,
          created_at: '2024-01-16T08:00:00Z',
          updated_at: '2024-01-16T09:00:00Z',
        };

        mswServer.mockEndpoint(
          'patch',
          '/payments/transaction/proof_of_delivery/',
          {
            data: mockResponse,
          }
        );

        const result =
          await qorpay.transactions.updateProofOfDelivery(updateData);

        expect(result.id).toBe(updateData.id);
        expect(result.recipientName).toBe(updateData.recipientName);
        expect(result.notes).toBe(updateData.notes);
        expect(result.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('listProofOfDelivery', () => {
      it('should list POD records', async () => {
        const mockResponse = {
          records: [
            {
              id: 'pod_111',
              transaction_id: 'txn_111',
              delivery_date: '2024-01-16T10:00:00Z',
              recipient_name: 'John Doe',
              notes: 'Delivered to front door',
              created_at: '2024-01-16T10:00:00Z',
            },
            {
              id: 'pod_222',
              transaction_id: 'txn_222',
              delivery_date: '2024-01-16T11:00:00Z',
              recipient_name: 'Jane Smith',
              notes: 'Delivered to back door',
              created_at: '2024-01-16T11:00:00Z',
            },
          ],
          total: 2,
          has_more: false,
        };

        mswServer.mockEndpoint(
          'get',
          '/payments/transaction/proof_of_delivery/',
          {
            data: mockResponse,
          }
        );

        const result = await qorpay.transactions.listProofOfDelivery({
          limit: 10,
        });

        expect(result.data).toHaveLength(2);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.total).toBe(2);
        expect(result.data[0].transactionId).toBe('txn_111');
        expect(result.data[0].recipientName).toBe('John Doe');
        expect(result.data[1].deliveryDate).toBeInstanceOf(Date);
      });
    });

    describe('getProofOfDelivery', () => {
      it('should fetch a single POD record', async () => {
        const podId = 'pod_123456789';
        const mockResponse = {
          id: podId,
          transaction_id: 'txn_123456789',
          delivery_date: '2024-01-16T12:00:00Z',
          recipient_name: 'John Doe',
          recipient_signature: 'signature_url',
          notes: 'Delivered successfully',
          images: ['proof1.jpg'],
          created_at: '2024-01-16T12:00:00Z',
          updated_at: '2024-01-16T12:30:00Z',
        };

        mswServer.mockEndpoint(
          'get',
          `/payments/transaction/proof_of_delivery/${podId}`,
          {
            data: mockResponse,
          }
        );

        const result = await qorpay.transactions.getProofOfDelivery(podId);

        expect(result.id).toBe(podId);
        expect(result.transactionId).toBe('txn_123456789');
        expect(result.recipientName).toBe('John Doe');
        expect(result.recipientSignature).toBe('signature_url');
        expect(result.notes).toBe('Delivered successfully');
        expect(result.images).toEqual(['proof1.jpg']);
        expect(result.deliveryDate).toBeInstanceOf(Date);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      });

      it('should handle POD not found error', async () => {
        const invalidPodId = 'pod_invalid_123';

        mswServer.mockEndpoint(
          'get',
          `/payments/transaction/proof_of_delivery/${invalidPodId}`,
          {
            status: 404,
            errorCode: 'POD_NOT_FOUND',
            errorMessage: 'Proof of Delivery not found',
          }
        );

        await expect(
          qorpay.transactions.getProofOfDelivery(invalidPodId)
        ).rejects.toThrow(QorPayApiError);
      });
    });

    describe('deleteProofOfDelivery', () => {
      it('should delete a POD record', async () => {
        const podId = 'pod_123456789';

        mswServer.mockEndpoint(
          'delete',
          `/payments/transaction/proof_of_delivery/${podId}`,
          {
            data: {
              status: 'success',
              code: 'GW00',
              message: 'Proof of Delivery deleted successfully',
            },
          }
        );

        await expect(
          qorpay.transactions.deleteProofOfDelivery(podId)
        ).resolves.toBeUndefined();
      });

      it('should handle POD deletion error', async () => {
        const invalidPodId = 'pod_invalid_123';

        mswServer.mockEndpoint(
          'delete',
          `/payments/transaction/proof_of_delivery/${invalidPodId}`,
          {
            status: 404,
            errorCode: 'POD_DELETE_ERROR',
            errorMessage: 'Proof of Delivery not found for deletion',
          }
        );

        await expect(
          qorpay.transactions.deleteProofOfDelivery(invalidPodId)
        ).rejects.toThrow(QorPayApiError);
      });
    });
  });

  describe('Error Handling and Authentication', () => {
    it('should handle authentication errors', async () => {
      // Mock authentication failure for all endpoints
      mswServer.mockAuthFailure();

      await expect(qorpay.transactions.get('txn_123')).rejects.toThrow(
        QorPayApiError
      );
      await expect(qorpay.transactions.list()).rejects.toThrow(QorPayApiError);
      await expect(
        qorpay.transactions.getAchTransaction('ach_123')
      ).rejects.toThrow(QorPayApiError);
    });

    it('should handle rate limiting errors', async () => {
      // Mock rate limit error
      mswServer.mockRateLimit();

      await expect(qorpay.transactions.get('txn_123')).rejects.toThrow(
        QorPayApiError
      );
    });

    it('should handle server errors', async () => {
      // Mock server error
      mswServer.mockServerError();

      await expect(qorpay.transactions.get('txn_123')).rejects.toThrow(
        QorPayApiError
      );
    });

    it('should handle network timeouts', async () => {
      // Mock timeout
      mswServer.mockTimeout(5000);

      // Create client with shorter timeout to fail faster
      const timeoutClient = new QorPayClient({
        appKey: TEST_APP_KEY,
        clientKey: TEST_CLIENT_KEY,
        environment: 'sandbox',
        timeout: 1000, // 1 second timeout
      });

      await expect(timeoutClient.transactions.get('txn_123')).rejects.toThrow();
    });
  });

  describe('Complex Real-world Scenarios', () => {
    it('should handle mixed transaction types in a single list', async () => {
      const mockResponse = {
        transactions: [
          {
            // Card transaction
            transaction_id: 'txn_card',
            amount: '100.00',
            currency: 'USD',
            status: 'approved',
            type: 'sale',
            created_at: '2024-01-15T10:00:00Z',
            card_brand: 'visa',
            card_last4: '1111',
            customer_id: 'cust_card_123',
            customer_email: 'card@example.com',
          },
          {
            // ACH transaction
            transaction_id: 'txn_ach',
            amount: '250.00',
            currency: 'USD',
            status: 'pending',
            type: 'sale',
            created_at: '2024-01-15T11:00:00Z',
            ach_account_last4: '4321',
            ach_routing: '123456789',
            ach_account_type: 'checking',
            customer_id: 'cust_ach_456',
            customer_email: 'ach@example.com',
          },
        ],
        total: 2,
        has_more: false,
      };

      mswServer.mockEndpoint('get', '/payments/transactions', {
        data: mockResponse,
      });

      const result = await qorpay.transactions.list();

      expect(result.data).toHaveLength(2);

      // Test card transaction transformation
      const cardTxn = result.data[0];
      expect(cardTxn.paymentMethod.type).toBe('card');
      expect(cardTxn.paymentMethod.card?.last4).toBe('1111');
      expect(cardTxn.customer?.email).toBe('card@example.com');

      // Test ACH transaction transformation
      const achTxn = result.data[1];
      expect(achTxn.paymentMethod.type).toBe('ach');
      expect(achTxn.paymentMethod.ach?.last4).toBe('4321');
      expect(achTxn.customer?.email).toBe('ach@example.com');
    });

    it('should handle full POD lifecycle', async () => {
      // 1. Create POD
      const createData = {
        transactionId: 'txn_lifecycle_123',
        deliveryDate: new Date('2024-01-16'),
        recipientName: 'John Doe',
        notes: 'Initial delivery',
      };

      const createResponse = {
        id: 'pod_lifecycle_123',
        transaction_id: createData.transactionId,
        delivery_date: createData.deliveryDate.toISOString(),
        recipient_name: createData.recipientName,
        notes: createData.notes,
        created_at: '2024-01-16T08:00:00Z',
      };

      mswServer.mockEndpoint(
        'post',
        '/payments/transaction/proof_of_delivery/',
        {
          data: createResponse,
        }
      );

      const createdPod =
        await qorpay.transactions.createProofOfDelivery(createData);
      expect(createdPod.id).toBe('pod_lifecycle_123');
      expect(createdPod.recipientName).toBe('John Doe');

      // 2. Get POD
      mswServer.mockEndpoint(
        'get',
        `/payments/transaction/proof_of_delivery/${createdPod.id as string}`,
        {
          data: createResponse,
        }
      );

      const retrievedPod = await qorpay.transactions.getProofOfDelivery(
        createdPod.id as string
      );
      expect(retrievedPod.id).toBe(createdPod.id);
      expect(retrievedPod.recipientName).toBe('John Doe');

      // 3. Update POD
      const updateData = {
        id: createdPod.id,
        recipientName: 'John Doe Updated',
        notes: 'Updated delivery notes',
      };

      const updateResponse = {
        ...createResponse,
        recipient_name: updateData.recipientName,
        notes: updateData.notes,
        updated_at: '2024-01-16T09:00:00Z',
      };

      mswServer.mockEndpoint(
        'patch',
        '/payments/transaction/proof_of_delivery/',
        {
          data: updateResponse,
        }
      );

      const updatedPod =
        await qorpay.transactions.updateProofOfDelivery(updateData);
      expect(updatedPod.recipientName).toBe('John Doe Updated');
      expect(updatedPod.notes).toBe('Updated delivery notes');

      // 4. Delete POD
      mswServer.mockEndpoint(
        'delete',
        `/payments/transaction/proof_of_delivery/${createdPod.id as string}`,
        {
          data: {
            status: 'success',
            code: 'GW00',
            message: 'Proof of Delivery deleted successfully',
          },
        }
      );

      await expect(
        qorpay.transactions.deleteProofOfDelivery(createdPod.id as string)
      ).resolves.toBeUndefined();
    });
  });
});
