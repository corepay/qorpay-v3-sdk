/**
 * @file tests/unit/cash-payments.test.ts
 * @description Unit tests for the CashPayments resource module
 */

import { CashPayments } from '../../src/resources/cash-payments';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('CashPayments', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let cashPayments: CashPayments;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    }) as jest.Mocked<BaseClient>;

    // Create the CashPayments instance with the mock client
    cashPayments = new CashPayments(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordPayment', () => {
    const mockCashPaymentRequest = {
      transaction_data: {
        orderid: 'order_123456',
        amount: '100.00',
        currency: 'USD',
        reference_id: 'order_123456',
        cfirstname: 'John',
        clastname: 'Doe',
        cemail: 'john.doe@example.com',
        cphone: '+15551234567'
      }
    };

    const mockCashPaymentResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      transaction_id: 'cash_txn_123456',
      amount_recorded: '100.00',
      transaction_date: '2023-01-01T12:00:00Z'
    };

    it('should record a cash payment successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockCashPaymentResponse);

      // Call the method
      const result = await cashPayments.recordPayment(mockCashPaymentRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/cash/sale',
        mockCashPaymentRequest
      );

      // Verify the result
      expect(result).toEqual(mockCashPaymentResponse);
      expect(result.transaction_id).toBe('cash_txn_123456');
      expect(result.amount_recorded).toBe('100.00');
      expect(result.status).toBe('approved');
    });

    it('should handle API errors when recording a cash payment', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid transaction data',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(cashPayments.recordPayment(mockCashPaymentRequest)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/cash/sale',
        mockCashPaymentRequest
      );
    });
  });

  describe('voidPayment', () => {
    const mockTransactionId = 'cash_txn_123456';
    const mockVoidResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Transaction voided successfully'
    };

    it('should void a cash payment successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockVoidResponse);

      // Call the method
      const result = await cashPayments.voidPayment(mockTransactionId);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/cash/void',
        { transaction_id: mockTransactionId }
      );

      // Verify the result
      expect(result).toEqual(mockVoidResponse);
      expect(result.status).toBe('approved');
      expect(result.message).toBe('Transaction voided successfully');
    });

    it('should handle API errors when voiding a cash payment', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Transaction not found',
        404,
        'GW04'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(cashPayments.voidPayment(mockTransactionId)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/cash/void',
        { transaction_id: mockTransactionId }
      );
    });
  });

  describe('refundPayment', () => {
    const mockTransactionId = 'cash_txn_123456';
    const mockAmount = '50.00';
    const mockRefundResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Refund processed successfully'
    };

    it('should refund a cash payment with specific amount successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockRefundResponse);

      // Call the method with amount
      const result = await cashPayments.refundPayment(mockTransactionId, mockAmount);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/cash/refund',
        { 
          transaction_id: mockTransactionId,
          amount: mockAmount
        }
      );

      // Verify the result
      expect(result).toEqual(mockRefundResponse);
      expect(result.status).toBe('approved');
      expect(result.message).toBe('Refund processed successfully');
    });

    it('should refund a full cash payment successfully', async () => {
      // Mock the post method to return a successful response
      const fullRefundResponse = {
        ...mockRefundResponse,
        message: 'Full refund processed successfully'
      };
      mockClient.post.mockResolvedValue(fullRefundResponse);

      // Call the method without amount (full refund)
      const result = await cashPayments.refundPayment(mockTransactionId);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/cash/refund',
        { transaction_id: mockTransactionId }
      );

      // Verify the result
      expect(result).toEqual(fullRefundResponse);
      expect(result.status).toBe('approved');
      expect(result.message).toBe('Full refund processed successfully');
    });

    it('should handle API errors when refunding a cash payment', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Refund amount exceeds transaction amount',
        400,
        'GW07'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(cashPayments.refundPayment(mockTransactionId, mockAmount)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/cash/refund',
        { 
          transaction_id: mockTransactionId,
          amount: mockAmount
        }
      );
    });
  });
});
