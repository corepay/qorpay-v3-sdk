/**
 * @file tests/unit/ach-payments.test.ts
 * @description Unit tests for ACH Payments resource class
 */

import { AchPayments } from '../../src/resources/ach-payments';
import { BaseClient } from '../../src/client/base-client';
import type {
  AchDebitRequestData,
  AchCreditRequestData,
  AchVoidRequestData,
  AchRefundRequestData,
  AchSaleResponsePayload,
  AchCreditResponsePayload,
  AchVoidResponsePayload,
  AchRefundResponsePayload,
} from '../../src/types';
import type { BaseQorPayResponse } from '../../src/types/common';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('AchPayments', () => {
  let achPayments: AchPayments;
  let mockClient: jest.Mocked<BaseClient>;

  const mockAchDebitResponse: AchSaleResponsePayload = {
    transaction_id: 'ach_txn_123',
    status: 'pending',
    amount: '100.00',
    currency: 'USD',
    ach_account_last4: '6789',
    ach_routing: '123456789',
    ach_account_type: 'checking',
  };

  const mockAchCreditResponse: AchCreditResponsePayload = {
    transaction_id: 'ach_credit_456',
    status: 'pending',
    amount: '50.00',
    currency: 'USD',
    ach_account_last4: '4321',
    ach_routing: '987654321',
  };

  const mockAchVoidResponse: AchVoidResponsePayload = {
    transaction_id: 'ach_txn_123',
    status: 'voided',
    message: 'ACH transaction voided successfully',
  };

  const mockAchRefundResponse: AchRefundResponsePayload = {
    transaction_id: 'ach_refund_789',
    status: 'pending',
    amount: '25.00',
    currency: 'USD',
    refund_transaction_id: 'ach_txn_123',
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    achPayments = new AchPayments(mockClient);
    jest.clearAllMocks();
  });

  describe('debit', () => {
    it('should process an ACH debit transaction', async () => {
      const debitData = {
        transaction_data: {
          mid: '123456789012',
          amount: '100.00',
          sec_code: 'PPD',
          account_number: '123456789',
          routing_number: '987654321',
          account_type: 'checking',
          customer_id: 'cust_123',
        } as AchDebitRequestData,
      };

      mockClient.post.mockResolvedValue(mockAchDebitResponse);

      const result = await achPayments.debit(debitData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/debit',
        debitData
      );
      expect(result).toEqual(mockAchDebitResponse);
    });

    it('should handle ACH debit with different account types', async () => {
      const debitData = {
        transaction_data: {
          mid: '123456789012',
          amount: '200.00',
          sec_code: 'CCD',
          account_number: '987654321',
          routing_number: '123456789',
          account_type: 'savings',
          customer_id: 'cust_456',
        } as AchDebitRequestData,
      };

      mockClient.post.mockResolvedValue({
        ...mockAchDebitResponse,
        ach_account_type: 'savings',
        amount: '200.00',
      });

      const result = await achPayments.debit(debitData);

      expect(result.ach_account_type).toBe('savings');
      expect(result.amount).toBe('200.00');
    });
  });

  describe('credit', () => {
    it('should process an ACH credit transaction', async () => {
      const creditData = {
        transaction_data: {
          mid: '123456789012',
          amount: '50.00',
          sec_code: 'PPD',
          account_number: '123456789',
          routing_number: '987654321',
          account_type: 'checking',
          customer_id: 'cust_123',
        } as AchCreditRequestData,
      };

      mockClient.post.mockResolvedValue(mockAchCreditResponse);

      const result = await achPayments.credit(creditData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/credit',
        creditData
      );
      expect(result).toEqual(mockAchCreditResponse);
    });

    it('should handle ACH credit for savings account', async () => {
      const creditData = {
        transaction_data: {
          mid: '123456789012',
          amount: '75.00',
          sec_code: 'CCD',
          account_number: '555555555',
          routing_number: '111222333',
          account_type: 'savings',
        } as AchCreditRequestData,
      };

      mockClient.post.mockResolvedValue({
        ...mockAchCreditResponse,
        amount: '75.00',
        ach_routing: '111222333',
      });

      const result = await achPayments.credit(creditData);

      expect(result.amount).toBe('75.00');
      expect(result.ach_routing).toBe('111222333');
    });
  });

  describe('void', () => {
    it('should void an ACH transaction', async () => {
      const voidData = {
        transaction_data: {
          mid: '123456789012',
          transaction_id: 'ach_txn_123',
        } as AchVoidRequestData,
      };

      mockClient.post.mockResolvedValue(mockAchVoidResponse);

      const result = await achPayments.void(voidData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/void',
        voidData
      );
      expect(result).toEqual(mockAchVoidResponse);
    });

    it('should handle void with reason', async () => {
      const voidData = {
        transaction_data: {
          mid: '123456789012',
          transaction_id: 'ach_txn_456',
          reason: 'Customer requested cancellation',
        } as AchVoidRequestData,
      };

      mockClient.post.mockResolvedValue({
        ...mockAchVoidResponse,
        transaction_id: 'ach_txn_456',
        message: 'Voided: Customer requested cancellation',
      });

      const result = await achPayments.void(voidData);

      expect(result.transaction_id).toBe('ach_txn_456');
    });
  });

  describe('refund', () => {
    it('should refund an ACH transaction', async () => {
      const refundData = {
        transaction_data: {
          mid: '123456789012',
          transaction_id: 'ach_txn_123',
          amount: '25.00',
          reason: 'Customer satisfaction',
        } as AchRefundRequestData,
      };

      mockClient.post.mockResolvedValue(mockAchRefundResponse);

      const result = await achPayments.refund(refundData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/refund',
        refundData
      );
      expect(result).toEqual(mockAchRefundResponse);
    });

    it('should handle partial refund', async () => {
      const refundData = {
        transaction_data: {
          mid: '123456789012',
          transaction_id: 'ach_txn_789',
          amount: '10.00',
        } as AchRefundRequestData,
      };

      mockClient.post.mockResolvedValue({
        ...mockAchRefundResponse,
        transaction_id: 'ach_refund_partial',
        amount: '10.00',
        refund_transaction_id: 'ach_txn_789',
      });

      const result = await achPayments.refund(refundData);

      expect(result.amount).toBe('10.00');
      expect(result.refund_transaction_id).toBe('ach_txn_789');
    });
  });

  describe('verify', () => {
    it('should verify an ACH account', async () => {
      const verifyData = {
        transaction_data: {
          mid: '123456789012',
          account_number: '123456789',
          routing_number: '987654321',
          account_type: 'checking',
          customer_id: 'cust_123',
        } as AchDebitRequestData,
      };

      const mockVerifyResponse: BaseQorPayResponse = {
        status: 'success',
        message: 'ACH account verified successfully',
        data: {
          verification_status: 'verified',
          bank_name: 'Test Bank',
        },
      };

      mockClient.post.mockResolvedValue(mockVerifyResponse);

      const result = await achPayments.verify(verifyData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/verify',
        verifyData
      );
      expect(result).toEqual(mockVerifyResponse);
    });

    it('should handle verification failure', async () => {
      const verifyData = {
        transaction_data: {
          mid: '123456789012',
          account_number: '000000000',
          routing_number: '000000000',
        } as AchDebitRequestData,
      };

      const mockVerifyResponse: BaseQorPayResponse = {
        status: 'error',
        message: 'Verification failed',
        data: {
          verification_status: 'failed',
          error_code: 'INVALID_ACCOUNT',
        },
      };

      mockClient.post.mockResolvedValue(mockVerifyResponse);

      const result = await achPayments.verify(verifyData);

      expect(result.status).toBe('error');
    });
  });

  describe('getTransaction', () => {
    it('should fetch ACH transaction details', async () => {
      const transactionId = 'ach_txn_123';

      mockClient.get.mockResolvedValue(mockAchDebitResponse);

      const result = await achPayments.getTransaction(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/ach/transaction/ach_txn_123'
      );
      expect(result).toEqual(mockAchDebitResponse);
    });

    it('should fetch credit transaction details', async () => {
      const transactionId = 'ach_credit_456';

      mockClient.get.mockResolvedValue(mockAchCreditResponse);

      const result = await achPayments.getTransaction(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/ach/transaction/ach_credit_456'
      );
      expect(result).toEqual(mockAchCreditResponse);
    });

    it('should handle transaction with special characters', async () => {
      const transactionId = 'ach_txn/with/special-chars';

      mockClient.get.mockResolvedValue(mockAchDebitResponse);

      await achPayments.getTransaction(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/payments/ach/transaction/${transactionId}`
      );
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors from debit', async () => {
      const debitData = {
        transaction_data: {
          mid: '123456789012',
          amount: '100.00',
          account_number: '123456789',
          routing_number: '987654321',
        } as AchDebitRequestData,
      };

      const apiError = new Error('Insufficient funds');
      mockClient.post.mockRejectedValue(apiError);

      await expect(achPayments.debit(debitData)).rejects.toThrow(apiError);
    });

    it('should propagate API errors from credit', async () => {
      const creditData = {
        transaction_data: {
          mid: '123456789012',
          amount: '50.00',
        } as AchCreditRequestData,
      };

      const apiError = new Error('Invalid account');
      mockClient.post.mockRejectedValue(apiError);

      await expect(achPayments.credit(creditData)).rejects.toThrow(apiError);
    });

    it('should propagate API errors from getTransaction', async () => {
      const transactionId = 'nonexistent';

      const apiError = new Error('Transaction not found');
      mockClient.get.mockRejectedValue(apiError);

      await expect(achPayments.getTransaction(transactionId)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('URL construction', () => {
    it('should construct correct endpoints for all operations', async () => {
      const debitData = { transaction_data: {} as AchDebitRequestData };
      const creditData = { transaction_data: {} as AchCreditRequestData };
      const voidData = { transaction_data: {} as AchVoidRequestData };
      const refundData = { transaction_data: {} as AchRefundRequestData };
      const verifyData = { transaction_data: {} as AchDebitRequestData };

      // Set up mock responses
      mockClient.post.mockResolvedValue({});
      mockClient.get.mockResolvedValue({});

      // Test all endpoints
      await achPayments.debit(debitData);
      await achPayments.credit(creditData);
      await achPayments.void(voidData);
      await achPayments.refund(refundData);
      await achPayments.verify(verifyData);
      await achPayments.getTransaction('test');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/debit',
        debitData
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/credit',
        creditData
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/void',
        voidData
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/refund',
        refundData
      );
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/ach/verify',
        verifyData
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/ach/transaction/test'
      );
    });
  });
});
