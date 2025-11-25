/**
 * @file tests/unit/payments.test.ts
 * @description Unit tests for Payments resource class
 */

import { Payments } from '../../src/resources/payments';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import { ensureOrderId } from '../../src/utils/order-id';
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

// Mock dependencies
jest.mock('../../src/client/base-client');
jest.mock('../../src/utils/order-id');
jest.mock('../../src/schemas', () => ({
  PaymentSaleManualRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentSaleCashDiscountRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentSaleSwipeRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentSaleTokenRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentRecurringSetupRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentRecurringExistingRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentRecurringMyRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentAuthRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentAuthTokenRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentVoidRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentRefundRequestSchema: {
    parse: jest.fn((data) => data),
  },
  PaymentCaptureRequestSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('Payments', () => {
  let payments: Payments;
  let mockClient: jest.Mocked<BaseClient>;

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
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    payments = new Payments(mockClient);
    jest.clearAllMocks();

    // Mock ensureOrderId to return a predictable value
    (ensureOrderId as jest.Mock).mockReturnValue('order_123456');
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

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.saleManual(paymentData);

      expect(ensureOrderId).toHaveBeenCalledWith(undefined);
      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/manual/', {
        transaction_data: {
          ...paymentData,
          orderid: 'order_123456',
        },
      });
      expect(result).toEqual(mockSaleResponse);
    });

    it('should use provided order_id when given', async () => {
      const paymentData: PaymentSaleManualRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cvv: '123',
        orderid: 'custom_order_123',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      await payments.saleManual(paymentData);

      expect(ensureOrderId).toHaveBeenCalledWith('custom_order_123');
      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/manual/', {
        transaction_data: paymentData,
      });
    });
  });

  describe('saleCashDiscount', () => {
    it('should process a cash discount sale', async () => {
      const paymentData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        cash_discount: true,
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.saleCashDiscount(paymentData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/sale/cashdiscount',
        {
          transaction_data: paymentData,
        }
      );
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('saleSwipe', () => {
    it('should process a swiped card payment', async () => {
      const swipeData = {
        mid: '123456',
        amount: '10.00',
        track_data: '%B4111111111111111^TEST/CARD^25122011000012300000?',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.saleSwipe(swipeData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/swipe', {
        transaction_data: swipeData,
      });
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('saleToken', () => {
    it('should process a token payment with customer_id', async () => {
      const tokenData: PaymentSaleTokenRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: 'tok_abc123',
        customer_id: 'cust_xyz789',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.saleToken(tokenData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/token', {
        transaction_data: tokenData,
      });
      expect(result).toEqual(mockSaleResponse);
    });

    it('should throw QorPayApiError when validation fails', async () => {
      const tokenData: PaymentSaleTokenRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: 'tok_abc123',
        // Missing required customer_id
      };

      const { PaymentSaleTokenRequestSchema } = require('../../src/schemas');
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      PaymentSaleTokenRequestSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      await expect(payments.saleToken(tokenData)).rejects.toThrow(
        QorPayApiError
      );

      try {
        await payments.saleToken(tokenData);
      } catch (error) {
        if (error instanceof QorPayApiError) {
          expect(error.message).toBe('Validation failed: Validation failed');
          expect(error.statusCode).toBe(400);
          expect(error.errorCode).toBe('VALIDATION_ERROR');
        }
      }
    });
  });

  describe('saleLvl2Lvl3', () => {
    it('should process a Level 2/3 payment', async () => {
      const lvl3Data = {
        mid: '123456',
        amount: '100.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        level2_data: {
          tax_amount: '8.00',
          customer_code: 'CUST123',
        },
        level3_data: {
          line_items: [
            {
              description: 'Product 1',
              quantity: '1',
              unit_cost: '50.00',
            },
          ],
        },
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.saleLvl2Lvl3(lvl3Data);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/lvl2_3', {
        transaction_data: lvl3Data,
      });
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('saleLevel2_3', () => {
    it('should be an alias for saleLvl2Lvl3', async () => {
      const lvl3Data = {
        mid: '123456',
        amount: '100.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      await payments.saleLevel2_3(lvl3Data);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/lvl2_3', {
        transaction_data: lvl3Data,
      });
    });
  });

  describe('sale3DS', () => {
    it('should process a 3-D Secure payment', async () => {
      const threeDSData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        three_ds_data: {
          cavv: 'AAABBBCCC',
          xid: 'XYZ123',
          eci: '05',
        },
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.sale3DS(threeDSData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/3ds', {
        transaction_data: threeDSData,
      });
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('salePin', () => {
    it('should process a PIN debit transaction', async () => {
      const pinData = {
        mid: '123456',
        amount: '10.00',
        pin_block: 'encrypted_pin_block',
        ksn: 'key_serial_number',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.salePin(pinData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/pin', {
        transaction_data: pinData,
      });
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('salePos', () => {
    it('should process a POS transaction', async () => {
      const posData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        pos_data: {
          terminal_id: 'TERM001',
          entry_mode: 'chip',
        },
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.salePos(posData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/sale/pos', {
        transaction_data: posData,
      });
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('recurringSetup', () => {
    it('should setup a recurring payment', async () => {
      const recurringData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
        recurring_details: {
          frequency: 'monthly',
          start_date: '2024-01-01',
        },
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.recurringSetup(recurringData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/recurring/setup',
        {
          transaction_data: recurringData,
        }
      );
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('recurringExisting', () => {
    it('should process an existing recurring payment', async () => {
      const recurringData = {
        mid: '123456',
        transaction_id: 'txn_123',
        amount: '10.00',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.recurringExisting(recurringData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/recurring', {
        transaction_data: recurringData,
      });
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('recurringMy', () => {
    it('should process a merchant-initiated recurring payment', async () => {
      const recurringData = {
        mid: '123456',
        transaction_id: 'txn_123',
        amount: '10.00',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.recurringMy(recurringData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/my_recurring', {
        transaction_data: recurringData,
      });
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('myRecurring', () => {
    it('should be an alias for recurringMy', async () => {
      const recurringData = {
        mid: '123456',
        transaction_id: 'txn_123',
        amount: '10.00',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      await payments.myRecurring(recurringData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/my_recurring', {
        transaction_data: recurringData,
      });
    });
  });

  describe('authorize', () => {
    it('should authorize a payment', async () => {
      const authData: PaymentAuthRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.authorize(authData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/authorize', {
        transaction_data: authData,
      });
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('authorizeToken', () => {
    it('should authorize a payment with a token', async () => {
      const authTokenData = {
        mid: '123456',
        amount: '10.00',
        creditcard: 'tok_abc123',
        customer_id: 'cust_xyz789',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await payments.authorizeToken(authTokenData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/payments/authorize/token',
        {
          transaction_data: authTokenData,
        }
      );
      expect(result).toEqual(mockSaleResponse);
    });
  });

  describe('void', () => {
    it('should void a transaction', async () => {
      const voidData: PaymentVoidRequestData = {
        mid: '123456',
        transaction_id: 'txn_123',
      };

      mockClient.post.mockResolvedValue(mockActionResponse);

      const result = await payments.void(voidData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/void', {
        transaction_data: voidData,
      });
      expect(result).toEqual(mockActionResponse);
    });
  });

  describe('refund', () => {
    it('should refund a transaction', async () => {
      const refundData: PaymentRefundRequestData = {
        mid: '123456',
        transaction_id: 'txn_123',
        amount: '5.00',
      };

      mockClient.post.mockResolvedValue(mockActionResponse);

      const result = await payments.refund(refundData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/refund', {
        transaction_data: refundData,
      });
      expect(result).toEqual(mockActionResponse);
    });
  });

  describe('capture', () => {
    it('should capture an authorized transaction', async () => {
      const captureData: PaymentCaptureRequestData = {
        mid: '123456',
        transaction_id: 'txn_123',
        amount: '10.00',
      };

      mockClient.post.mockResolvedValue(mockActionResponse);

      const result = await payments.capture(captureData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/capture', {
        transaction_data: captureData,
      });
      expect(result).toEqual(mockActionResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from the client', async () => {
      const paymentData: PaymentSaleManualRequestData = {
        mid: '123456',
        amount: '10.00',
        creditcard: '4111111111111111',
        ccexp: '1225',
      };

      const apiError = new QorPayApiError('API Error', 500);
      mockClient.post.mockRejectedValue(apiError);

      await expect(payments.saleManual(paymentData)).rejects.toThrow(apiError);
    });
  });
});
