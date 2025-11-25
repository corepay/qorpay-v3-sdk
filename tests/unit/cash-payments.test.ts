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
      clientKey: 'test-client-key',
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
        cphone: '+15551234567',
      },
    };

    const mockCashPaymentResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      transaction_id: 'cash_txn_123456',
      amount_recorded: '100.00',
      transaction_date: '2023-01-01T12:00:00Z',
    };

    it('should record a cash payment successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockCashPaymentResponse);

      // Call the method
      const result = await cashPayments.recordPayment(mockCashPaymentRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/cash/sale',
        mockCashPaymentRequest
      );

      // Verify the result
      expect(result).toEqual(mockCashPaymentResponse);
      expect(result.transaction_id).toBe('cash_txn_123456');
      expect(result.amount_recorded).toBe('100.00');
      expect(result.status).toBe('approved');
    });

    it('should record a cash payment with minimal required fields', async () => {
      const minimalRequest = {
        transaction_data: {
          orderid: 'order_minimal',
          amount: '25.50',
        },
      };

      const minimalResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        transaction_id: 'cash_txn_minimal',
      };

      mockClient.post.mockResolvedValue(minimalResponse);

      const result = await cashPayments.recordPayment(minimalRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/cash/sale',
        minimalRequest
      );
      expect(result).toEqual(minimalResponse);
    });

    it('should record a cash payment with all optional fields', async () => {
      const fullRequest = {
        transaction_data: {
          orderid: 'order_full',
          amount: '150.75',
          currency: 'EUR',
          reference_id: 'ref_12345',
          invoiceid: 'inv_67890',
          topt: 'test_opt',
          service_charge: '5.00',
          cfirstname: 'Jane',
          clastname: 'Smith',
          cidentity_type: 'passport',
          cidentity: 'P123456789',
          cemail: 'jane.smith@example.com',
          cphone: '+1-555-987-6543',
          ipaddress: '192.168.1.100',
        },
      };

      const fullResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        transaction_id: 'cash_txn_full',
        amount_recorded: '150.75',
        transaction_date: '2023-01-01T15:30:00Z',
      };

      mockClient.post.mockResolvedValue(fullResponse);

      const result = await cashPayments.recordPayment(fullRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/cash/sale',
        fullRequest
      );
      expect(result).toEqual(fullResponse);
      expect(result.transaction_id).toBe('cash_txn_full');
      expect(result.amount_recorded).toBe('150.75');
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
      await expect(
        cashPayments.recordPayment(mockCashPaymentRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/cash/sale',
        mockCashPaymentRequest
      );
    });

    it('should handle different error response statuses', async () => {
      const errorResponse = {
        status: 'error',
        code: 'GW02',
        message: 'Insufficient funds',
      };

      mockClient.post.mockResolvedValue(errorResponse);

      const result = await cashPayments.recordPayment(mockCashPaymentRequest);

      expect(result).toEqual(errorResponse);
      expect(result.status).toBe('error');
      expect(result.code).toBe('GW02');
    });
  });

  describe('voidPayment', () => {
    const mockTransactionId = 'cash_txn_123456';
    const mockVoidResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Transaction voided successfully',
    };

    it('should void a cash payment successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockVoidResponse);

      // Call the method
      const result = await cashPayments.voidPayment(mockTransactionId);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/void', {
        transaction_id: mockTransactionId,
      });

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
      await expect(cashPayments.voidPayment(mockTransactionId)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/void', {
        transaction_id: mockTransactionId,
      });
    });
  });

  describe('refundPayment', () => {
    const mockTransactionId = 'cash_txn_123456';
    const mockAmount = '50.00';
    const mockRefundResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Refund processed successfully',
    };

    it('should refund a cash payment with specific amount successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockRefundResponse);

      // Call the method with amount
      const result = await cashPayments.refundPayment(
        mockTransactionId,
        mockAmount
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: mockTransactionId,
        amount: mockAmount,
      });

      // Verify the result
      expect(result).toEqual(mockRefundResponse);
      expect(result.status).toBe('approved');
      expect(result.message).toBe('Refund processed successfully');
    });

    it('should refund a full cash payment successfully', async () => {
      // Mock the post method to return a successful response
      const fullRefundResponse = {
        ...mockRefundResponse,
        message: 'Full refund processed successfully',
      };
      mockClient.post.mockResolvedValue(fullRefundResponse);

      // Call the method without amount (full refund)
      const result = await cashPayments.refundPayment(mockTransactionId);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: mockTransactionId,
      });

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
      await expect(
        cashPayments.refundPayment(mockTransactionId, mockAmount)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: mockTransactionId,
        amount: mockAmount,
      });
    });

    it('should handle refund with undefined amount (edge case)', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockRefundResponse);

      // Call the method with explicitly undefined amount
      const result = await cashPayments.refundPayment(
        mockTransactionId,
        undefined
      );

      // Verify the client was called with the correct parameters (no amount field)
      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: mockTransactionId,
      });

      // Verify the result
      expect(result).toEqual(mockRefundResponse);
    });

    it('should handle refund with empty string amount (edge case)', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockRefundResponse);

      // Call the method with empty string amount
      const result = await cashPayments.refundPayment(mockTransactionId, '');

      // Verify the client was called with the correct parameters (no amount field since empty string is falsy)
      expect(mockClient.post).toHaveBeenCalledWith('/payments/cash/refund', {
        transaction_id: mockTransactionId,
      });

      // Verify the result
      expect(result).toEqual(mockRefundResponse);
    });
  });

  describe('constructor and class properties', () => {
    it('should initialize with the correct base path', () => {
      // Access the private basePath through the public methods to verify it's set correctly
      const spy = jest.spyOn(mockClient, 'post');

      // Call a method to verify the base path is used correctly
      cashPayments.voidPayment('test_txn');

      // Verify the base path is used in the endpoint
      expect(spy).toHaveBeenCalledWith(
        '/payments/cash/void',
        expect.any(Object)
      );
    });

    it('should store the client instance correctly', () => {
      // Verify that the client is stored and used correctly
      expect(cashPayments).toBeInstanceOf(CashPayments);

      // Call a method to ensure the client is being used
      const spy = jest.spyOn(mockClient, 'post');
      cashPayments.voidPayment('test_txn');

      expect(spy).toHaveBeenCalled();
    });
  });
});
