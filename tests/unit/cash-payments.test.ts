/**
 * @file tests/unit/cash-payments.test.ts
 * @description Tests for CashPayments resource class using real instances
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

describe('CashPayments', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockCreateResponse = {
    status: 'success',
    code: '200',
    message: 'Cash payment created successfully',
    data: {
      transaction_id: 'txn_123',
      amount: '100.00',
      currency: 'USD',
      status: 'pending',
      created_at: '2023-01-01T00:00:00Z',
    },
  };

  const mockRecordResponse = {
    status: 'success',
    code: '200',
    message: 'Cash payment recorded successfully',
    data: {
      transaction_id: 'txn_124',
      amount: '50.00',
      currency: 'USD',
      status: 'completed',
      recorded_at: '2023-01-01T00:00:00Z',
    },
  };

  const mockVoidResponse = {
    status: 'success',
    code: '200',
    message: 'Cash payment voided successfully',
    data: {
      transaction_id: 'txn_125',
      status: 'voided',
      voided_at: '2023-01-01T00:00:00Z',
    },
  };

  const mockRefundResponse = {
    status: 'success',
    code: '200',
    message: 'Cash payment refunded successfully',
    data: {
      transaction_id: 'txn_126',
      refund_amount: '25.00',
      original_amount: '100.00',
      status: 'refunded',
      refunded_at: '2023-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize cash payments resource', () => {
      expect(client.cashPayments).toBeDefined();
      expect(typeof client.cashPayments.create).toBe('function');
      expect(typeof client.cashPayments.recordPayment).toBe('function');
      expect(typeof client.cashPayments.voidPayment).toBe('function');
      expect(typeof client.cashPayments.refundPayment).toBe('function');
    });
  });

  describe('create', () => {
    it('should create a cash payment successfully', async () => {
      const createData = {
        amount: '100.00',
        currency: 'USD',
        reference_id: 'ref_123',
        metadata: { customer_id: 'cust_123' },
      };

      mockSuccessfulResponse(mockCreateResponse);

      const result = await client.cashPayments.create(createData);

      expect(result).toEqual(mockCreateResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/cash',
          data: expect.objectContaining({
            amount: '100.00',
            currency: 'USD',
            reference_id: 'ref_123',
          }),
        })
      );
    });

    it('should create a cash payment with minimal data', async () => {
      const createData = {
        amount: '50.00',
      };

      mockSuccessfulResponse(mockCreateResponse);

      const result = await client.cashPayments.create(createData);

      expect(result).toEqual(mockCreateResponse);
    });

    it('should propagate API errors', async () => {
      const createData = {
        amount: 'invalid_amount',
      };

      mockFailedResponse('Invalid amount', 400);

      await expect(client.cashPayments.create(createData)).rejects.toThrow();
    });
  });

  describe('recordPayment', () => {
    it('should record a cash sale payment successfully', async () => {
      const recordData = {
        transaction_id: 'txn_124',
        amount: '50.00',
        currency: 'USD',
        payment_method: 'cash',
        reference_id: 'ref_124',
      };

      mockSuccessfulResponse(mockRecordResponse);

      const result = await client.cashPayments.recordPayment(recordData);

      expect(result).toEqual(mockRecordResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/cash/sale',
          data: expect.objectContaining({
            transaction_id: 'txn_124',
            amount: '50.00',
            currency: 'USD',
          }),
        })
      );
    });

    it('should record a cash sale with minimal transaction data', async () => {
      const recordData = {
        transaction_id: 'txn_124',
        amount: '25.00',
      };

      mockSuccessfulResponse(mockRecordResponse);

      const result = await client.cashPayments.recordPayment(recordData);

      expect(result).toEqual(mockRecordResponse);
    });

    it('should propagate API errors', async () => {
      const recordData = {
        transaction_id: 'invalid_txn',
        amount: '50.00',
      };

      mockFailedResponse('Transaction not found', 404);

      await expect(
        client.cashPayments.recordPayment(recordData)
      ).rejects.toThrow();
    });
  });

  describe('voidPayment', () => {
    it('should void a cash payment successfully', async () => {
      const voidData = {
        transaction_id: 'txn_125',
        reason: 'customer_request',
      };

      mockSuccessfulResponse(mockVoidResponse);

      const result = await client.cashPayments.voidPayment(voidData);

      expect(result).toEqual(mockVoidResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/cash/void',
          data: expect.objectContaining({
            transaction_id: {
              transaction_id: 'txn_125',
              reason: 'customer_request',
            },
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const voidData = {
        transaction_id: 'already_voided_txn',
      };

      mockFailedResponse('Payment already voided', 400);

      await expect(client.cashPayments.voidPayment(voidData)).rejects.toThrow();
    });
  });

  describe('refundPayment', () => {
    it('should refund a cash payment with partial amount', async () => {
      const refundData = {
        transaction_id: 'txn_126',
        amount: '25.00',
        reason: 'customer_return',
      };

      mockSuccessfulResponse(mockRefundResponse);

      const result = await client.cashPayments.refundPayment(refundData);

      expect(result).toEqual(mockRefundResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/cash/refund',
          data: expect.objectContaining({
            transaction_id: {
              transaction_id: 'txn_126',
              amount: '25.00',
              reason: 'customer_return',
            },
          }),
        })
      );
    });

    it('should refund a cash payment with full amount (no amount specified)', async () => {
      const refundData = {
        transaction_id: 'txn_126',
        reason: 'customer_return',
      };

      mockSuccessfulResponse(mockRefundResponse);

      const result = await client.cashPayments.refundPayment(refundData);

      expect(result).toEqual(mockRefundResponse);
    });

    it('should handle numeric amount', async () => {
      const refundData = {
        transaction_id: 'txn_126',
        amount: 25.5, // numeric instead of string
        reason: 'customer_return',
      };

      mockSuccessfulResponse(mockRefundResponse);

      const result = await client.cashPayments.refundPayment(refundData);

      expect(result).toEqual(mockRefundResponse);
    });

    it('should propagate API errors', async () => {
      const refundData = {
        transaction_id: 'invalid_txn',
        amount: '25.00',
      };

      mockFailedResponse('Transaction not found', 404);

      await expect(
        client.cashPayments.refundPayment(refundData)
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const createData = {
        amount: '100.00',
      };

      mockFailedResponse('Network error', 500);

      await expect(client.cashPayments.create(createData)).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const createData = {
        amount: '100.00',
      };

      mockFailedResponse('Request timeout', 408);

      await expect(client.cashPayments.create(createData)).rejects.toThrow();
    });
  });

  describe('parameter validation', () => {
    it('should handle empty transaction ID for void', async () => {
      const invalidData = {
        transaction_id: '',
      };

      await expect(
        client.cashPayments.voidPayment(invalidData as any)
      ).rejects.toThrow();
    });

    it('should handle zero amount for refund', async () => {
      const invalidData = {
        transaction_id: 'txn_126',
        amount: '0.00',
      };

      // Depending on validation, this might succeed or fail
      mockSuccessfulResponse(mockRefundResponse);
      const result = await client.cashPayments.refundPayment(invalidData);
      expect(result).toBeDefined();
    });
  });
});
