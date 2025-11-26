/**
 * @file tests/unit/ach-payments.test.ts
 * @description Tests for achPayments resource class using real instances
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('AchPayments', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockAchDebitResponse = {
    transaction_id: 'ach_txn_123',
    status: 'pending',
    amount: '100.00',
    currency: 'USD',
    ach_account_last4: '6789',
    ach_routing: '123456789',
    ach_account_type: 'checking',
  };

  const mockAchCreditResponse = {
    transaction_id: 'ach_credit_456',
    status: 'completed',
    amount: '50.00',
    currency: 'USD',
    ach_account_last4: '4321',
    ach_routing: '987654321',
    ach_account_type: 'savings',
  };

  const mockAchVoidResponse = {
    transaction_id: 'ach_void_789',
    status: 'voided',
    amount: '25.00',
    currency: 'USD',
  };

  const mockAchRefundResponse = {
    transaction_id: 'ach_refund_101',
    status: 'refunded',
    amount: '75.00',
    currency: 'USD',
    original_transaction_id: 'ach_txn_123',
  };

  const mockVerifyResponse = {
    status: 'success',
    account_verified: true,
    ach_account_last4: '6789',
    ach_routing: '123456789',
    ach_account_type: 'checking',
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize ach payments resource', () => {
      expect(client.achPayments).toBeDefined();
      expect(typeof client.achPayments.debit).toBe('function');
      expect(typeof client.achPayments.credit).toBe('function');
      expect(typeof client.achPayments.void).toBe('function');
      expect(typeof client.achPayments.refund).toBe('function');
      expect(typeof client.achPayments.verify).toBe('function');
      expect(typeof client.achPayments.getTransaction).toBe('function');
    });
  });

  describe('debit', () => {
    it('should process an ACH debit transaction', async () => {
      const debitData = {
        account_number: '123456789',
        routing_number: '123456789',
        account_type: 'checking',
        amount: '100.00',
        customer_id: 'cust_123',
      };

      mockSuccessfulResponse(mockAchDebitResponse);

      const result = await client.achPayments.debit(debitData);

      expect(result).toEqual(mockAchDebitResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/debit',
          data: expect.objectContaining({
            account_number: '123456789',
            routing_number: '123456789',
            account_type: 'checking',
            amount: '100.00',
            customer_id: 'cust_123',
          }),
        })
      );
    });

    it('should handle ACH debit with different account types', async () => {
      const debitData = {
        account_number: '987654321',
        routing_number: '987654321',
        account_type: 'savings',
        amount: '50.00',
      };

      mockSuccessfulResponse({
        ...mockAchDebitResponse,
        ach_account_type: 'savings',
        ach_account_last4: '4321',
      });

      const result = await client.achPayments.debit(debitData);

      expect(result.ach_account_type).toBe('savings');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/debit',
          data: expect.objectContaining({
            account_type: 'savings',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const debitData = {
        account_number: 'invalid',
        routing_number: '123456789',
        account_type: 'checking',
        amount: '100.00',
      };

      mockFailedResponse('Invalid account number', 400);

      await expect(client.achPayments.debit(debitData)).rejects.toThrow();
    });
  });

  describe('credit', () => {
    it('should process an ACH credit transaction', async () => {
      const creditData = {
        account_number: '123456789',
        routing_number: '123456789',
        account_type: 'checking',
        amount: '50.00',
        customer_id: 'cust_123',
      };

      mockSuccessfulResponse(mockAchCreditResponse);

      const result = await client.achPayments.credit(creditData);

      expect(result).toEqual(mockAchCreditResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/credit',
          data: expect.objectContaining({
            account_number: '123456789',
            routing_number: '123456789',
            account_type: 'checking',
            amount: '50.00',
          }),
        })
      );
    });

    it('should handle ACH credit for savings account', async () => {
      const creditData = {
        account_number: '987654321',
        routing_number: '987654321',
        account_type: 'savings',
        amount: '75.00',
      };

      mockSuccessfulResponse({
        ...mockAchCreditResponse,
        ach_account_type: 'savings',
      });

      const result = await client.achPayments.credit(creditData);

      expect(result.ach_account_type).toBe('savings');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/credit',
          data: expect.objectContaining({
            account_type: 'savings',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const creditData = {
        account_number: 'invalid',
        routing_number: '123456789',
        account_type: 'checking',
        amount: '50.00',
      };

      mockFailedResponse('Insufficient funds', 402);

      await expect(client.achPayments.credit(creditData)).rejects.toThrow();
    });
  });

  describe('void', () => {
    it('should void an ACH transaction', async () => {
      const voidData = {
        transaction_id: 'ach_txn_123',
        reason: 'customer_request',
      };

      mockSuccessfulResponse(mockAchVoidResponse);

      const result = await client.achPayments.void(voidData);

      expect(result).toEqual(mockAchVoidResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/void',
          data: expect.objectContaining({
            transaction_id: 'ach_txn_123',
            reason: 'customer_request',
          }),
        })
      );
    });

    it('should handle void with reason', async () => {
      const voidData = {
        transaction_id: 'ach_txn_456',
        reason: 'duplicate_transaction',
      };

      mockSuccessfulResponse({
        ...mockAchVoidResponse,
        transaction_id: 'ach_txn_456',
      });

      const result = await client.achPayments.void(voidData);

      expect(result.transaction_id).toBe('ach_txn_456');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/void',
          data: expect.objectContaining({
            reason: 'duplicate_transaction',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const voidData = {
        transaction_id: 'invalid_txn',
        reason: 'customer_request',
      };

      mockFailedResponse('Transaction not found', 404);

      await expect(client.achPayments.void(voidData)).rejects.toThrow();
    });
  });

  describe('refund', () => {
    it('should refund an ACH transaction', async () => {
      const refundData = {
        original_transaction_id: 'ach_txn_123',
        amount: '50.00',
        reason: 'customer_return',
      };

      mockSuccessfulResponse(mockAchRefundResponse);

      const result = await client.achPayments.refund(refundData);

      expect(result).toEqual(mockAchRefundResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/refund',
          data: expect.objectContaining({
            original_transaction_id: 'ach_txn_123',
            amount: '50.00',
            reason: 'customer_return',
          }),
        })
      );
    });

    it('should handle partial refund', async () => {
      const refundData = {
        original_transaction_id: 'ach_txn_456',
        amount: '25.00',
        reason: 'partial_refund',
      };

      mockSuccessfulResponse({
        ...mockAchRefundResponse,
        amount: '25.00',
      });

      const result = await client.achPayments.refund(refundData);

      expect(result.amount).toBe('25.00');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/refund',
          data: expect.objectContaining({
            amount: '25.00',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const refundData = {
        original_transaction_id: 'invalid_txn',
        amount: '50.00',
        reason: 'customer_return',
      };

      mockFailedResponse('Original transaction not found', 404);

      await expect(client.achPayments.refund(refundData)).rejects.toThrow();
    });
  });

  describe('verify', () => {
    it('should verify an ACH account', async () => {
      const verifyData = {
        account_number: '123456789',
        routing_number: '123456789',
        account_type: 'checking',
      };

      mockSuccessfulResponse(mockVerifyResponse);

      const result = await client.achPayments.verify(verifyData);

      expect(result).toEqual(mockVerifyResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/verify',
          data: expect.objectContaining({
            account_number: '123456789',
            routing_number: '123456789',
            account_type: 'checking',
          }),
        })
      );
    });

    it('should handle verification failure', async () => {
      const verifyData = {
        account_number: '123456789',
        routing_number: 'invalid_routing',
        account_type: 'checking',
      };

      mockSuccessfulResponse({
        ...mockVerifyResponse,
        account_verified: false,
      });

      const result = await client.achPayments.verify(verifyData);

      expect(result.account_verified).toBe(false);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/ach/verify',
        })
      );
    });

    it('should propagate API errors', async () => {
      const verifyData = {
        account_number: 'invalid',
        routing_number: 'invalid_routing',
        account_type: 'checking',
      };

      mockFailedResponse('Invalid account details', 400);

      await expect(client.achPayments.verify(verifyData)).rejects.toThrow();
    });
  });

  describe('getTransaction', () => {
    it('should fetch ACH transaction details', async () => {
      const transactionId = 'ach_txn_123';

      mockSuccessfulResponse(mockAchDebitResponse);

      const result = await client.achPayments.getTransaction(transactionId);

      expect(result).toEqual(mockAchDebitResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/ach/transaction/${transactionId}`,
        })
      );
    });

    it('should fetch credit transaction details', async () => {
      const transactionId = 'ach_credit_456';

      mockSuccessfulResponse(mockAchCreditResponse);

      const result = await client.achPayments.getTransaction(transactionId);

      expect(result.status).toBe('completed');
      expect(result.ach_account_type).toBe('savings');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/ach/transaction/${transactionId}`,
        })
      );
    });

    it('should handle transaction with special characters', async () => {
      const transactionId = 'ach_txn_123/with/special-chars';

      mockSuccessfulResponse(mockAchDebitResponse);

      await client.achPayments.getTransaction(transactionId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/ach/transaction/${transactionId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Transaction not found', 404);

      await expect(
        client.achPayments.getTransaction('invalid_txn')
      ).rejects.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors from debit', async () => {
      mockFailedResponse('ACH processing error', 500);

      const debitData = {
        account_number: '123456789',
        routing_number: '123456789',
        account_type: 'checking',
        amount: '100.00',
      };

      await expect(client.achPayments.debit(debitData)).rejects.toThrow();
    });

    it('should propagate API errors from credit', async () => {
      mockFailedResponse('ACH credit failed', 500);

      const creditData = {
        account_number: '123456789',
        routing_number: '123456789',
        account_type: 'checking',
        amount: '50.00',
      };

      await expect(client.achPayments.credit(creditData)).rejects.toThrow();
    });

    it('should propagate API errors from getTransaction', async () => {
      mockFailedResponse('Network error', 500);

      await expect(
        client.achPayments.getTransaction('ach_txn_123')
      ).rejects.toThrow();
    });
  });

  describe('URL construction', () => {
    it('should properly encode special characters in transaction IDs', async () => {
      const transactionId = 'ach_txn_123/with/slashes';

      mockSuccessfulResponse(mockAchDebitResponse);

      await client.achPayments.getTransaction(transactionId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/payments/ach/transaction/${transactionId}`,
        })
      );
    });
  });
});
