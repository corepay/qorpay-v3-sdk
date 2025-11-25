/**
 * @file tests/unit/payments.test.ts
 * @description Unit tests for the Payments resource module
 */

import { Payments } from '../../src/resources/payments';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

// Sample test data
const sampleCardData = {
  mid: 'test_mid_123456',
  amount: '49.95',
  currency: 'USD',
  creditcard: '4111111111111111',
  cvv: '123',
  month: '12',
  year: '25',
  reference_id: 'order_123456',
};

const sampleTokenData = {
  mid: 'test_mid_123456',
  amount: '49.95',
  currency: 'USD',
  creditcard: '541341$KR0eAiX2',
  reference_id: 'order_123456',
  customer_id: 'cust_123456', // Required for token payments
};

const sampleCaptureData = {
  mid: 'test_mid_123456',
  transaction_id: 'txn_12345',
  amount: '49.95',
};

const sampleRefundData = {
  mid: 'test_mid_123456',
  transaction_id: 'txn_12345',
  amount: '49.95',
  orderid: 'order_123456',
};

const sampleVoidData = {
  transaction_id: 'txn_12345',
};

const sampleSuccessResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Transaction approved',
  transaction_id: 'txn_12345',
  amount: '49.95',
  currency: 'USD',
  transaction_date: '2023-01-01T12:00:00Z',
  card_last4: '1111',
  card_brand: 'visa',
  card_exp_month: '12',
  card_exp_year: '25',
};

describe('Payments', () => {
  let payments: Payments;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new mocked BaseClient instance
    mockBaseClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Mock the post method to return a success response by default
    mockBaseClient.post = jest.fn().mockResolvedValue(sampleSuccessResponse);

    // Create a new Payments instance with the mocked BaseClient
    payments = new Payments(mockBaseClient);
  });

  describe('saleManual', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.saleManual(sampleCardData);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payments/sale/manual/',
        {
          transaction_data: {
            ...sampleCardData,
            orderid: expect.any(String), // Auto-generated order ID
          },
        }
      );
    });

    it('should return the response from the BaseClient', async () => {
      const response = await payments.saleManual(sampleCardData);

      expect(response).toEqual(sampleSuccessResponse);
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid card number',
        400,
        'GW01',
        {
          status: 'error',
          code: 'GW01',
          message: 'Invalid card number',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(payments.saleManual(sampleCardData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(payments.saleManual(sampleCardData)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid card number'),
        statusCode: 400,
        errorCode: 'GW01',
      });
    });
  });

  describe('saleToken', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.saleToken(sampleTokenData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/sale/token', {
        transaction_data: sampleTokenData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const response = await payments.saleToken(sampleTokenData);

      expect(response).toEqual(sampleSuccessResponse);
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Invalid token', 400, 'GW02', {
        status: 'error',
        code: 'GW02',
        message: 'Invalid token',
      });

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(payments.saleToken(sampleTokenData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(payments.saleToken(sampleTokenData)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid token'),
        statusCode: 400,
        errorCode: 'GW02',
      });
    });
  });

  describe('authorize', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.authorize(sampleCardData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/authorize', {
        transaction_data: sampleCardData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const authResponse = {
        ...sampleSuccessResponse,
        status: 'authorized',
        auth_code: 'AUTH123',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(authResponse);

      const response = await payments.authorize(sampleCardData);

      expect(response).toEqual(authResponse);
      expect(response.status).toBe('authorized');
    });
  });

  describe('authorizeToken', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.authorizeToken(sampleTokenData);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payments/authorize/token',
        { transaction_data: sampleTokenData }
      );
    });
  });

  describe('capture', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.capture(sampleCaptureData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/capture', {
        transaction_data: sampleCaptureData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const captureResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Capture successful',
        transaction_id: 'txn_12345',
        amount: '49.95',
        transaction_date: '2023-01-01T12:30:00Z',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(captureResponse);

      const response = await payments.capture(sampleCaptureData);

      expect(response).toEqual(captureResponse);
      expect(response.status).toBe('approved');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Transaction not found',
        404,
        'GW04',
        {
          status: 'error',
          code: 'GW04',
          message: 'Transaction not found',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(payments.capture(sampleCaptureData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(payments.capture(sampleCaptureData)).rejects.toMatchObject({
        message: expect.stringContaining('Transaction not found'),
        statusCode: 404,
        errorCode: 'GW04',
      });
    });
  });

  describe('refund', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.refund(sampleRefundData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/refund', {
        transaction_data: sampleRefundData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const refundResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Refund successful',
        transaction_id: 'txn_12345_refund',
        original_transaction_id: 'txn_12345',
        amount: '49.95',
        transaction_date: '2023-01-01T13:00:00Z',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(refundResponse);

      const response = await payments.refund(sampleRefundData);

      expect(response).toEqual(refundResponse);
      expect(response.status).toBe('approved');
    });
  });

  describe('void', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.void(sampleVoidData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/void', {
        transaction_data: sampleVoidData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const voidResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Void successful',
        transaction_id: 'txn_12345',
        transaction_date: '2023-01-01T13:30:00Z',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(voidResponse);

      const response = await payments.void(sampleVoidData);

      expect(response).toEqual(voidResponse);
      expect(response.status).toBe('approved');
    });
  });

  describe('saleCashDiscount', () => {
    const cashDiscountData = {
      mid: 'test_mid_123456',
      amount: '49.95',
      currency: 'USD',
      creditcard: '4111111111111111',
      cvv: '123',
      orderid: 'order_123456',
      cash_discount_amount: '2.50',
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.saleCashDiscount(cashDiscountData);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payments/sale/cashdiscount',
        { transaction_data: cashDiscountData }
      );
    });
  });

  describe('saleLvl2Lvl3', () => {
    const lvl3Data = {
      ...sampleCardData,
      bzip: '12345',
      level3: {
        customer_reference: 'CUST123',
        tax_amount: '4.95',
        shipping_amount: '5.00',
        line_items: [
          {
            product_code: 'SKU123',
            description: 'Test Product',
            quantity: 1,
            unit_price: '39.95',
            tax_amount: '4.00',
            discount_amount: '0.00',
            total: '43.95',
          },
        ],
      },
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.saleLvl2Lvl3(lvl3Data);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payments/sale/lvl2_3',
        {
          transaction_data: lvl3Data,
        }
      );
    });
  });

  describe('sale3DS', () => {
    const threeDSData = {
      ...sampleCardData,
      CAVV: 'CAVV_VALUE',
      XID: 'XID_VALUE',
      ECIFlag: '05',
      ds_transaction_id: 'DS_TRANS_ID',
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.sale3DS(threeDSData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/sale/3ds', {
        transaction_data: threeDSData,
      });
    });
  });

  describe('recurringSetup', () => {
    const recurringData = {
      ...sampleCardData,
      recurring: {
        frequency: 'monthly',
        start_date: '2023-02-01',
        total_occurrences: 12,
      },
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.recurringSetup(recurringData);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payments/recurring/setup',
        { transaction_data: recurringData }
      );
    });

    it('should return the response from the BaseClient', async () => {
      const recurringResponse = {
        ...sampleSuccessResponse,
        recurring_id: 'rec_123456',
        status: 'approved',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(recurringResponse);

      const response = await payments.recurringSetup(recurringData);

      expect(response).toEqual(recurringResponse);
      // @ts-expect-error Accessing recurring_id property that might not be typed
      expect(response.recurring_id).toBe('rec_123456');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid recurring setup',
        400,
        'GW05',
        {
          status: 'error',
          code: 'GW05',
          message: 'Invalid recurring setup',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(payments.recurringSetup(recurringData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(
        payments.recurringSetup(recurringData)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid recurring setup'),
        statusCode: 400,
        errorCode: 'GW05',
      });
    });
  });

  describe('saleSwipe', () => {
    const swipeData = {
      mid: 'test_mid_123456',
      amount: '49.95',
      currency: 'USD',
      trackdata: '%B4111111111111111^DOE/JOHN^2512101?',
      reference_id: 'swipe_order_123456',
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.saleSwipe(swipeData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/sale/swipe', {
        transaction_data: swipeData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const swipeResponse = {
        ...sampleSuccessResponse,
        entry_method: 'swipe',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(swipeResponse);

      const response = await payments.saleSwipe(swipeData);

      expect(response).toEqual(swipeResponse);
      // @ts-expect-error Accessing entry_method property that might not be typed
      expect(response.entry_method).toBe('swipe');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid track data',
        400,
        'GW06',
        {
          status: 'error',
          code: 'GW06',
          message: 'Invalid track data',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(payments.saleSwipe(swipeData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(payments.saleSwipe(swipeData)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid track data'),
        statusCode: 400,
        errorCode: 'GW06',
      });
    });
  });

  describe('salePin', () => {
    const pinData = {
      mid: 'test_mid_123456',
      amount: '49.95',
      currency: 'USD',
      trackdata: '%B4111111111111111^DOE/JOHN^2512101?',
      PIN: 'ENCRYPTED_PIN_BLOCK',
      knsPIN: 'KEY_SERIAL_NUMBER',
      reference_id: 'pin_order_123456',
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.salePin(pinData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/sale/pin', {
        transaction_data: pinData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const pinResponse = {
        ...sampleSuccessResponse,
        entry_method: 'pin',
        debit_network: 'STAR',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(pinResponse);

      const response = await payments.salePin(pinData);

      expect(response).toEqual(pinResponse);
      // @ts-expect-error Accessing entry_method property that might not be typed
      expect(response.entry_method).toBe('pin');
      // @ts-expect-error Accessing debit_network property that might not be typed
      expect(response.debit_network).toBe('STAR');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid PIN block',
        400,
        'GW07',
        {
          status: 'error',
          code: 'GW07',
          message: 'Invalid PIN block',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(payments.salePin(pinData)).rejects.toThrow(QorPayApiError);
      await expect(payments.salePin(pinData)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid PIN block'),
        statusCode: 400,
        errorCode: 'GW07',
      });
    });
  });

  describe('salePos', () => {
    const posData = {
      mid: 'test_mid_123456',
      amount: '49.95',
      currency: 'USD',
      creditcard: '4111111111111111',
      cvv: '123',
      month: '12',
      year: '25',
      reference_id: 'pos_order_123456',
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.salePos(posData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/sale/pos', {
        transaction_data: posData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const posResponse = {
        ...sampleSuccessResponse,
        entry_method: 'pos',
        pos_entry_mode: '051',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(posResponse);

      const response = await payments.salePos(posData);

      expect(response).toEqual(posResponse);
      // @ts-expect-error Accessing entry_method property that might not be typed
      expect(response.entry_method).toBe('pos');
      // @ts-expect-error Accessing pos_entry_mode property that might not be typed
      expect(response.pos_entry_mode).toBe('051');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid POS data',
        400,
        'GW08',
        {
          status: 'error',
          code: 'GW08',
          message: 'Invalid POS data',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(payments.salePos(posData)).rejects.toThrow(QorPayApiError);
      await expect(payments.salePos(posData)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid POS data'),
        statusCode: 400,
        errorCode: 'GW08',
      });
    });
  });

  describe('recurringExisting', () => {
    const recurringExistingData = {
      mid: 'test_mid_123456',
      amount: '49.95',
      currency: 'USD',
      creditcard: '4111111111111111',
      first_trxn: 'txn_first_123456',
      reference_id: 'recurring_order_123456',
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.recurringExisting(recurringExistingData);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/payments/recurring', {
        transaction_data: recurringExistingData,
      });
    });

    it('should return the response from the BaseClient', async () => {
      const recurringExistingResponse = {
        ...sampleSuccessResponse,
        recurring_id: 'rec_existing_123456',
        status: 'approved',
      };

      mockBaseClient.post = jest
        .fn()
        .mockResolvedValue(recurringExistingResponse);

      const response = await payments.recurringExisting(recurringExistingData);

      expect(response).toEqual(recurringExistingResponse);
      expect(response.status).toBe('approved');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid recurring transaction',
        400,
        'GW09',
        {
          status: 'error',
          code: 'GW09',
          message: 'Invalid recurring transaction',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(
        payments.recurringExisting(recurringExistingData)
      ).rejects.toThrow(QorPayApiError);
      await expect(
        payments.recurringExisting(recurringExistingData)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid recurring transaction'),
        statusCode: 400,
        errorCode: 'GW09',
      });
    });
  });

  describe('recurringMy', () => {
    const recurringMyData = {
      mid: 'test_mid_123456',
      amount: '49.95',
      cvv: '123',
      transaction_id: 'txn_original_123456',
      reference_id: 'my_recurring_order_123456',
    };

    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.recurringMy(recurringMyData);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payments/my_recurring',
        { transaction_data: recurringMyData }
      );
    });

    it('should return the response from the BaseClient', async () => {
      const recurringMyResponse = {
        ...sampleSuccessResponse,
        recurring_id: 'rec_my_123456',
        status: 'approved',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(recurringMyResponse);

      const response = await payments.recurringMy(recurringMyData);

      expect(response).toEqual(recurringMyResponse);
      expect(response.status).toBe('approved');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid merchant recurring transaction',
        400,
        'GW10',
        {
          status: 'error',
          code: 'GW10',
          message: 'Invalid merchant recurring transaction',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(payments.recurringMy(recurringMyData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(payments.recurringMy(recurringMyData)).rejects.toMatchObject(
        {
          message: expect.stringContaining(
            'Invalid merchant recurring transaction'
          ),
          statusCode: 400,
          errorCode: 'GW10',
        }
      );
    });
  });
});
