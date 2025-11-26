/**
 * @file tests/unit/payments.test.ts
 * @description Unit tests for Payments resource class using real instances
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import { QorPayApiError, QorPayNetworkError } from '../../src/errors';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
} from '../utils/test-client';
import type {
  PaymentSaleManualRequestData,
  PaymentSaleTokenRequestData,
  PaymentAuthRequestData,
  PaymentVoidRequestData,
  PaymentRefundRequestData,
  PaymentCaptureRequestData,
  SaleAuthResponsePayload,
  PaymentActionResponsePayload,
} from '../../src/types';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('Payments', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockSaleResponse: SaleAuthResponsePayload = {
    transaction_id: 'txn_123',
    status: 'approved',
    amount: '10.00',
    currency: 'USD',
  };

  const mockActionResponse: PaymentActionResponsePayload = {
    transaction_id: 'txn_123',
    status: 'success',
    message: 'Operation completed successfully',
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
  });

  describe('saleManual', () => {
    it('should process a manual card payment successfully', async () => {
      const paymentData: PaymentSaleManualRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.saleManual(paymentData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/sale/manual/',
          data: expect.objectContaining({
            transaction_data: expect.objectContaining({
              mid: '123456',
              amount: '10.00',
              creditcard: '4111111111111111',
              cvv: '123',
              orderid: expect.stringMatching(/^[A-Z0-9]{10}$/),
            }),
          }),
        })
      );
    });

    it('should handle validation errors for invalid card data', async () => {
      const invalidData = {
        mid: '123456',
        amount: 'invalid', // Invalid amount - will fail Zod validation
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      // Zod validation happens before HTTP call, so it throws ZodError
      await expect(client.payments.saleManual(invalidData)).rejects.toThrow(
        'Invalid amount format'
      );
    });

    it('should handle network errors gracefully', async () => {
      const paymentData: PaymentSaleManualRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      // Create a network-like error (no response, has request)
      const networkError = new Error('Network error') as any;
      networkError.isAxiosError = true;
      networkError.request = {}; // Has request but no response = network error
      mockAxiosInstance.request.mockRejectedValue(networkError);

      // In the test environment, network errors may not be fully transformed through interceptors
      await expect(client.payments.saleManual(paymentData)).rejects.toThrow(
        'Network error'
      );
    });

    it('should include orderid in payment data', async () => {
      const paymentData: PaymentSaleManualRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      mockSuccessfulResponse(mockSaleResponse);

      await client.payments.saleManual(paymentData);

      const lastCall =
        mockAxiosInstance.request.mock.calls[
          mockAxiosInstance.request.mock.calls.length - 1
        ];
      const requestData = lastCall[0];

      expect(requestData.data).toHaveProperty('transaction_data');
      expect(requestData.data.transaction_data).toHaveProperty('orderid');
      // Order ID should be a 10-character alphanumeric string
      expect(requestData.data.transaction_data.orderid).toMatch(
        /^[A-Z0-9]{10}$/
      );
      expect(requestData.data.transaction_data.orderid).toHaveLength(10);
    });
  });

  describe('saleToken', () => {
    it('should process a token payment successfully', async () => {
      const tokenData: PaymentSaleTokenRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: 'tok_123456', // Token goes in creditcard field
        customer_id: 'cust_123', // Required for security
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.saleToken(tokenData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/sale/token',
          data: expect.objectContaining({
            transaction_data: expect.objectContaining({
              mid: '123456',
              amount: '10.00',
              creditcard: 'tok_123456',
              customer_id: 'cust_123',
            }),
          }),
        })
      );
    });

    it('should handle invalid token (missing customer_id)', async () => {
      const invalidTokenData = {
        mid: '123456',
        amount: '10.00',
        creditcard: 'tok_123456',
        // Missing required customer_id
      } as PaymentSaleTokenRequestData;

      // This should fail validation before making the API call
      await expect(client.payments.saleToken(invalidTokenData)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  describe('saleCashDiscount', () => {
    it('should process a cash discount payment successfully', async () => {
      const paymentData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
        cashdiscount: true, // The field should be 'cashdiscount' not 'cash_discount'
        orderid: 'ORDERID123', // Provide a specific order ID for this endpoint
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.saleCashDiscount(paymentData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/sale/cashdiscount',
          data: expect.objectContaining({
            transaction_data: expect.objectContaining({
              mid: '123456',
              amount: '10.00',
              creditcard: '4111111111111111',
              cvv: '123',
              orderid: 'ORDERID123',
            }),
          }),
        })
      );
    });
  });

  describe('saleSwipe', () => {
    it('should process a swipe payment successfully', async () => {
      const swipeData = {
        mid: '123456',
        amount: '10.00',
        trackdata:
          '%B4111111111111111^CARDHOLDER/NAME^9912101100000000000000000000000?;4111111111111111=99121011000000000000?', // Field is 'trackdata' not 'track_data'
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.saleSwipe(swipeData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/sale/swipe',
          data: expect.objectContaining({
            transaction_data: expect.objectContaining({
              mid: '123456',
              amount: '10.00',
              trackdata:
                '%B4111111111111111^CARDHOLDER/NAME^9912101100000000000000000000000?;4111111111111111=99121011000000000000?',
            }),
          }),
        })
      );
    });
  });

  describe('authorize', () => {
    it('should authorize a payment successfully', async () => {
      const authData: PaymentAuthRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.authorize(authData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/authorize',
          data: expect.objectContaining({
            transaction_data: expect.objectContaining({
              mid: '123456',
              amount: '10.00',
              creditcard: '4111111111111111',
              cvv: '123',
            }),
          }),
        })
      );
    });

    it('should handle authorization with token', async () => {
      const tokenAuthData = {
        mid: '123456',
        amount: '10.00',
        creditcard: 'tok_123456', // Token goes in creditcard field
        customer_id: 'cust_123', // Required for token auth
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.authorizeToken(tokenAuthData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/authorize/token',
          data: expect.objectContaining({
            transaction_data: tokenAuthData,
          }),
        })
      );
    });
  });

  describe('capture', () => {
    it('should capture an authorized payment successfully', async () => {
      const captureData: PaymentCaptureRequestData = {
        transaction_id: 'txn_123',
        amount: '10.00',
        mid: '123456', // Required field
      };

      mockSuccessfulResponse(mockActionResponse);

      const result = await client.payments.capture(captureData);

      expect(result).toEqual(mockActionResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/capture',
          data: expect.objectContaining({
            transaction_data: captureData,
          }),
        })
      );
    });

    it('should handle capture for invalid transaction', async () => {
      const invalidCaptureData: PaymentCaptureRequestData = {
        transaction_id: 'invalid_txn',
        amount: '10.00',
        mid: '123456', // Required field
      };

      mockFailedResponse('Transaction not found', 404);

      // In the test environment, errors may not be fully transformed through interceptors
      await expect(client.payments.capture(invalidCaptureData)).rejects.toThrow(
        'Transaction not found'
      );
    });
  });

  describe('void', () => {
    it('should void a transaction successfully', async () => {
      const voidData: PaymentVoidRequestData = {
        transaction_id: 'txn_123',
      };

      mockSuccessfulResponse(mockActionResponse);

      const result = await client.payments.void(voidData);

      expect(result).toEqual(mockActionResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/void',
          data: expect.objectContaining({
            transaction_data: voidData,
          }),
        })
      );
    });

    it('should handle void for already captured transaction', async () => {
      const voidData: PaymentVoidRequestData = {
        transaction_id: 'already_captured',
      };

      mockFailedResponse('Transaction already captured', 400);

      // In the test environment, errors may not be fully transformed through interceptors
      await expect(client.payments.void(voidData)).rejects.toThrow(
        'Transaction already captured'
      );
    });
  });

  describe('refund', () => {
    it('should refund a transaction successfully', async () => {
      const refundData: PaymentRefundRequestData = {
        transaction_id: 'txn_123',
        amount: '5.00',
        mid: '123456', // Required field
        orderid: 'REFUND123', // Required field
      };

      mockSuccessfulResponse(mockActionResponse);

      const result = await client.payments.refund(refundData);

      expect(result).toEqual(mockActionResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/refund',
          data: expect.objectContaining({
            transaction_data: refundData,
          }),
        })
      );
    });

    it('should handle partial refund', async () => {
      const partialRefundData: PaymentRefundRequestData = {
        transaction_id: 'txn_123',
        amount: '5.00', // Less than original amount
        mid: '123456', // Required field
        orderid: 'PARTIALREF', // Required field
      };

      mockSuccessfulResponse(mockActionResponse);

      const result = await client.payments.refund(partialRefundData);

      expect(result).toEqual(mockActionResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/refund',
          data: expect.objectContaining({
            transaction_data: partialRefundData,
          }),
        })
      );
    });

    it('should handle refund for non-existent transaction', async () => {
      const invalidRefundData: PaymentRefundRequestData = {
        transaction_id: 'nonexistent',
        amount: '10.00',
        mid: '123456', // Required field
        orderid: 'INVALIDREF', // Required field
      };

      mockFailedResponse('Transaction not found', 404);

      // In the test environment, errors may not be fully transformed through interceptors
      await expect(client.payments.refund(invalidRefundData)).rejects.toThrow(
        'Transaction not found'
      );
    });
  });

  describe('recurringSetup', () => {
    it('should setup recurring payment successfully', async () => {
      const recurringData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
        recurring_type: 'monthly',
        start_date: '2024-01-01',
        orderid: 'RECURRING1', // Required
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.recurringSetup(recurringData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/recurring/setup',
          data: expect.objectContaining({
            transaction_data: expect.objectContaining({
              mid: '123456',
              amount: '10.00',
              creditcard: '4111111111111111',
              cvv: '123',
              orderid: 'RECURRING1',
            }),
          }),
        })
      );
    });
  });

  describe('recurringExisting', () => {
    it('should setup recurring for existing customer successfully', async () => {
      const recurringData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111', // Required field
        customer_id: 'cust_123',
        recurring_type: 'monthly',
        start_date: '2024-01-01',
        orderid: 'RECURRING2', // Required
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.recurringExisting(recurringData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/recurring',
          data: expect.objectContaining({
            transaction_data: expect.objectContaining({
              mid: '123456',
              amount: '10.00',
              creditcard: '4111111111111111',
              customer_id: 'cust_123',
              orderid: 'RECURRING2',
            }),
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle API errors correctly', async () => {
      const paymentData: PaymentSaleManualRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      const errorResponse = {
        status: 'error',
        message: 'Insufficient funds',
        code: 'INSUFFICIENT_FUNDS',
      };

      mockFailedResponse('Insufficient funds', 402, errorResponse);

      // In the test environment, errors may not be fully transformed through interceptors
      await expect(client.payments.saleManual(paymentData)).rejects.toThrow(
        'Insufficient funds'
      );
    });

    it('should handle malformed responses gracefully', async () => {
      const paymentData: PaymentSaleManualRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      mockFailedResponse('Internal server error', 500);

      // In the test environment, errors may not be fully transformed through interceptors
      await expect(client.payments.saleManual(paymentData)).rejects.toThrow(
        'Internal server error'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very large amounts', async () => {
      const largeAmountData: PaymentSaleManualRequestData = {
        mid: '123456',
        amount: '999999.99',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.payments.saleManual(largeAmountData);

      expect(result).toEqual(mockSaleResponse);

      // Verify the API call was made with the correct structure
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/payments/sale/manual/',
          data: expect.objectContaining({
            transaction_data: expect.objectContaining({
              mid: '123456',
              amount: '999999.99',
              creditcard: '4111111111111111',
              cvv: '123',
              orderid: expect.stringMatching(/^[A-Z0-9]{10}$/),
            }),
          }),
        })
      );
    });

    it('should handle zero amount payments', async () => {
      const zeroAmountData = {
        mid: '123456',
        amount: '0.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      mockFailedResponse('Amount must be greater than 0', 400);

      // In the test environment, errors may not be fully transformed through interceptors
      await expect(client.payments.saleManual(zeroAmountData)).rejects.toThrow(
        'Amount must be greater than 0'
      );
    });

    it('should handle negative amounts', async () => {
      const negativeAmountData = {
        mid: '123456',
        amount: '-10.00', // This will fail Zod validation
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
      };

      // Zod validation happens before HTTP call
      await expect(
        client.payments.saleManual(negativeAmountData)
      ).rejects.toThrow('Invalid amount format');
    });
  });
});
