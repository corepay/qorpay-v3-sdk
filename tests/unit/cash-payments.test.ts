/**
 * @file tests/unit/cash-payments.test.ts
 * @description Unit tests for CashPayments resource class
 */

import { CashPayments } from '../../src/resources/cash-payments';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import type {
  CashPaymentRequest,
  CashPaymentResponse,
} from '../../src/resources/cash-payments';
import type {
  TransactionDataWrapper,
  CashSaleTransactionData,
  CashSaleResponsePayload,
} from '../../src/types';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('CashPayments', () => {
  let cashPayments: CashPayments;
  let mockClient: jest.Mocked<BaseClient>;

  const mockCashPaymentResponse: CashPaymentResponse = {
    status: 'success',
    code: '200',
    message: 'Cash payment processed successfully',
    reference_id: 'ref_123',
    data: {
      transaction_id: 'txn_123456',
      amount: '100.00',
      currency: 'USD',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      register_id: 'reg_001',
      tender_type: 'cash',
    },
  };

  const mockCashSaleResponse: CashSaleResponsePayload = {
    status: 'success',
    code: '200',
    message: 'Cash sale recorded successfully',
    reference_id: 'ref_123',
    data: {
      transaction_id: 'txn_123456',
      amount: '50.00',
      currency: 'USD',
      status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
    },
  };

  const mockVoidResponse = {
    status: 'success',
    code: '200',
    message: 'Cash payment voided successfully',
    reference_id: 'ref_124',
  };

  const mockRefundResponse = {
    status: 'success',
    code: '200',
    message: 'Cash payment refunded successfully',
    reference_id: 'ref_125',
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    cashPayments = new CashPayments(mockClient);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with BaseClient instance', () => {
      expect(cashPayments['client']).toBe(mockClient);
      expect(cashPayments['basePath']).toBe('/payments/cash');
    });
  });

  describe('create', () => {
    it('should create a cash payment successfully', async () => {
      const paymentData: CashPaymentRequest = {
        amount: '100.00',
        currency: 'USD',
        description: 'Test cash payment',
        customer_id: 'cust_123',
        order_id: 'order_456',
        reference_id: 'ref_789',
        register_id: 'reg_001',
        tender_type: 'cash',
        metadata: { custom_field: 'value' },
      };

      mockClient.post.mockResolvedValue(mockCashPaymentResponse);

      const result = await cashPayments.create(paymentData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/cash',
        paymentData
      );
      expect(result).toEqual(mockCashPaymentResponse);
    });

    it('should create a cash payment with minimal data', async () => {
      const minimalPaymentData: CashPaymentRequest = {
        amount: 50,
      };

      mockClient.post.mockResolvedValue(mockCashPaymentResponse);

      const result = await cashPayments.create(minimalPaymentData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/cash',
        minimalPaymentData
      );
      expect(result).toEqual(mockCashPaymentResponse);
    });

    it('should propagate API errors', async () => {
      const paymentData: CashPaymentRequest = {
        amount: '100.00',
      };

      const apiError = new QorPayApiError('Cash payment failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(cashPayments.create(paymentData)).rejects.toThrow(apiError);
    });
  });

  describe('recordPayment', () => {
    it('should record a cash sale payment successfully', async () => {
      const saleData: TransactionDataWrapper<CashSaleTransactionData> = {
        transaction_data: {
          mid: 'merch_123',
          amount: '50.00',
          register_id: 'reg_001',
          clerk_id: 'clerk_456',
          tender_type: 'cash',
          description: 'In-store purchase',
        },
      };

      mockClient.post.mockResolvedValue(mockCashSaleResponse);

      const result = await cashPayments.recordPayment(saleData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/cash/sale',
        saleData
      );
      expect(result).toEqual(mockCashSaleResponse);
    });

    it('should record a cash sale with minimal transaction data', async () => {
      const minimalSaleData: TransactionDataWrapper<CashSaleTransactionData> = {
        transaction_data: {
          mid: 'merch_123',
          amount: '25.00',
        },
      };

      mockClient.post.mockResolvedValue(mockCashSaleResponse);

      const result = await cashPayments.recordPayment(minimalSaleData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/cash/sale',
        minimalSaleData
      );
      expect(result).toEqual(mockCashSaleResponse);
    });

    it('should propagate API errors', async () => {
      const saleData: TransactionDataWrapper<CashSaleTransactionData> = {
        transaction_data: {
          mid: 'merch_123',
          amount: '50.00',
        },
      };

      const apiError = new QorPayApiError('Failed to record cash sale', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(cashPayments.recordPayment(saleData)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('voidPayment', () => {
    it('should void a cash payment successfully', async () => {
      const transactionId = 'txn_123456';

      mockClient.post.mockResolvedValue(mockVoidResponse);

      const result = await cashPayments.voidPayment(transactionId);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/void', {
        transaction_id: 'txn_123456',
      });
      expect(result).toEqual(mockVoidResponse);
    });

    it('should propagate API errors', async () => {
      const transactionId = 'txn_invalid';

      const apiError = new QorPayApiError('Transaction not found', 404);
      mockClient.post.mockRejectedValue(apiError);

      await expect(cashPayments.voidPayment(transactionId)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('refundPayment', () => {
    it('should refund a cash payment with partial amount', async () => {
      const transactionId = 'txn_123456';
      const refundAmount = '25.00';

      mockClient.post.mockResolvedValue(mockRefundResponse);

      const result = await cashPayments.refundPayment(
        transactionId,
        refundAmount
      );

      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: 'txn_123456',
        amount: '25.00',
      });
      expect(result).toEqual(mockRefundResponse);
    });

    it('should refund a cash payment with full amount (no amount specified)', async () => {
      const transactionId = 'txn_123456';

      mockClient.post.mockResolvedValue(mockRefundResponse);

      const result = await cashPayments.refundPayment(transactionId);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: 'txn_123456',
      });
      expect(result).toEqual(mockRefundResponse);
    });

    it('should handle numeric amount', async () => {
      const transactionId = 'txn_123456';
      const refundAmount = 25.5; // Numeric amount

      mockClient.post.mockResolvedValue(mockRefundResponse);

      await cashPayments.refundPayment(transactionId, refundAmount);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: 'txn_123456',
        amount: 25.5,
      });
    });

    it('should propagate API errors', async () => {
      const transactionId = 'txn_invalid';
      const refundAmount = '10.00';

      const apiError = new QorPayApiError('Refund failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(
        cashPayments.refundPayment(transactionId, refundAmount)
      ).rejects.toThrow(apiError);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const paymentData: CashPaymentRequest = {
        amount: '100.00',
      };

      const networkError = new Error('Network timeout');
      mockClient.post.mockRejectedValue(networkError);

      await expect(cashPayments.create(paymentData)).rejects.toThrow(
        networkError
      );
    });

    it('should handle timeout errors', async () => {
      const transactionId = 'txn_123456';

      const timeoutError = new QorPayApiError('Request timeout', 408);
      mockClient.post.mockRejectedValue(timeoutError);

      await expect(cashPayments.voidPayment(transactionId)).rejects.toThrow(
        timeoutError
      );
    });
  });

  describe('parameter validation', () => {
    it('should handle empty transaction ID for void', async () => {
      const emptyTransactionId = '';

      mockClient.post.mockResolvedValue(mockVoidResponse);

      await cashPayments.voidPayment(emptyTransactionId);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/void', {
        transaction_id: '',
      });
    });

    it('should handle zero amount for refund', async () => {
      const transactionId = 'txn_123456';
      const zeroAmount = '0.00';

      mockClient.post.mockResolvedValue(mockRefundResponse);

      await cashPayments.refundPayment(transactionId, zeroAmount);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: 'txn_123456',
        amount: '0.00',
      });
    });
  });
});
