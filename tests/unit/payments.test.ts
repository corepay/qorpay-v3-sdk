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
  amount: '49.95',
  currency: 'USD',
  card_number: '4111111111111111',
  card_exp: '1225',
  card_cvv: '123',
  reference_id: 'order_123456'
};

const sampleTokenData = {
  amount: '49.95',
  currency: 'USD',
  token: '541341$KR0eAiX2',
  reference_id: 'order_123456'
};

const sampleCaptureData = {
  transaction_id: 'txn_12345',
  amount: '49.95'
};

const sampleRefundData = {
  transaction_id: 'txn_12345',
  amount: '49.95',
  reason: 'Customer request'
};

const sampleVoidData = {
  transaction_id: 'txn_12345',
  reason: 'Order cancelled'
};

const sampleSuccessResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Transaction approved',
  data: {
    transaction_id: 'txn_12345',
    amount: '49.95',
    currency: 'USD',
    status: 'approved',
    created_at: '2023-01-01T12:00:00Z',
    card: {
      last4: '1111',
      brand: 'visa',
      exp_month: '12',
      exp_year: '25'
    }
  }
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
      clientKey: 'test-client-key'
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
        '/payment/sale/manual/',
        { transaction_data: sampleCardData }
      );
    });
    
    it('should return the response from the BaseClient', async () => {
      const response = await payments.saleManual(sampleCardData);
      
      expect(response).toEqual(sampleSuccessResponse);
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Invalid card number', 400, 'GW01', { 
        status: 'error',
        code: 'GW01',
        message: 'Invalid card number'
      });
      
      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(payments.saleManual(sampleCardData)).rejects.toThrow(QorPayApiError);
      await expect(payments.saleManual(sampleCardData)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid card number'),
        statusCode: 400,
        errorCode: 'GW01'
      });
    });
  });

  describe('saleToken', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.saleToken(sampleTokenData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/sale/token',
        { transaction_data: sampleTokenData }
      );
    });
    
    it('should return the response from the BaseClient', async () => {
      const response = await payments.saleToken(sampleTokenData);
      
      expect(response).toEqual(sampleSuccessResponse);
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Invalid token', 400, 'GW02', { 
        status: 'error',
        code: 'GW02',
        message: 'Invalid token'
      });
      
      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(payments.saleToken(sampleTokenData)).rejects.toThrow(QorPayApiError);
      await expect(payments.saleToken(sampleTokenData)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid token'),
        statusCode: 400,
        errorCode: 'GW02'
      });
    });
  });

  describe('authorize', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.authorize(sampleCardData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/authorize',
        { transaction_data: sampleCardData }
      );
    });
    
    it('should return the response from the BaseClient', async () => {
      const authResponse = {
        ...sampleSuccessResponse,
        data: {
          ...sampleSuccessResponse.data,
          status: 'authorized',
          auth_code: 'AUTH123'
        }
      };
      
      mockBaseClient.post = jest.fn().mockResolvedValue(authResponse);
      
      const response = await payments.authorize(sampleCardData);
      
      expect(response).toEqual(authResponse);
      expect(response.data.status).toBe('authorized');
    });
  });

  describe('authorizeToken', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.authorizeToken(sampleTokenData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/authorize/token',
        { transaction_data: sampleTokenData }
      );
    });
  });

  describe('capture', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.capture(sampleCaptureData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/capture',
        { transaction_data: sampleCaptureData }
      );
    });
    
    it('should return the response from the BaseClient', async () => {
      const captureResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Capture successful',
        data: {
          transaction_id: 'txn_12345',
          amount: '49.95',
          status: 'captured',
          created_at: '2023-01-01T12:30:00Z'
        }
      };
      
      mockBaseClient.post = jest.fn().mockResolvedValue(captureResponse);
      
      const response = await payments.capture(sampleCaptureData);
      
      expect(response).toEqual(captureResponse);
      expect(response.data.status).toBe('captured');
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Transaction not found', 404, 'GW04', { 
        status: 'error',
        code: 'GW04',
        message: 'Transaction not found'
      });
      
      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(payments.capture(sampleCaptureData)).rejects.toThrow(QorPayApiError);
      await expect(payments.capture(sampleCaptureData)).rejects.toMatchObject({
        message: expect.stringContaining('Transaction not found'),
        statusCode: 404,
        errorCode: 'GW04'
      });
    });
  });

  describe('refund', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.refund(sampleRefundData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/refund',
        { transaction_data: sampleRefundData }
      );
    });
    
    it('should return the response from the BaseClient', async () => {
      const refundResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Refund successful',
        data: {
          transaction_id: 'txn_12345_refund',
          original_transaction_id: 'txn_12345',
          amount: '49.95',
          status: 'refunded',
          created_at: '2023-01-01T13:00:00Z'
        }
      };
      
      mockBaseClient.post = jest.fn().mockResolvedValue(refundResponse);
      
      const response = await payments.refund(sampleRefundData);
      
      expect(response).toEqual(refundResponse);
      expect(response.data.status).toBe('refunded');
    });
  });

  describe('void', () => {
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.void(sampleVoidData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/void',
        { transaction_data: sampleVoidData }
      );
    });
    
    it('should return the response from the BaseClient', async () => {
      const voidResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Void successful',
        data: {
          transaction_id: 'txn_12345',
          status: 'voided',
          created_at: '2023-01-01T13:30:00Z'
        }
      };
      
      mockBaseClient.post = jest.fn().mockResolvedValue(voidResponse);
      
      const response = await payments.void(sampleVoidData);
      
      expect(response).toEqual(voidResponse);
      expect(response.data.status).toBe('voided');
    });
  });

  describe('saleCashDiscount', () => {
    const cashDiscountData = {
      ...sampleCardData,
      cash_discount: true,
      surcharge_amount: '2.50'
    };
    
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.saleCashDiscount(cashDiscountData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/sale/cashdiscount',
        { transaction_data: cashDiscountData }
      );
    });
  });

  describe('saleLvl2Lvl3', () => {
    const lvl3Data = {
      ...sampleCardData,
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
            total: '43.95'
          }
        ]
      }
    };
    
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.saleLvl2Lvl3(lvl3Data);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/sale/lvl2_3',
        { transaction_data: lvl3Data }
      );
    });
  });

  describe('sale3DS', () => {
    const threeDSData = {
      ...sampleCardData,
      threeds_data: {
        cavv: 'CAVV_VALUE',
        xid: 'XID_VALUE',
        eci: '05',
        ds_transaction_id: 'DS_TRANS_ID'
      }
    };
    
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.sale3DS(threeDSData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/sale/3ds',
        { transaction_data: threeDSData }
      );
    });
  });

  describe('recurringSetup', () => {
    const recurringData = {
      ...sampleCardData,
      recurring: {
        frequency: 'monthly',
        start_date: '2023-02-01',
        total_occurrences: 12
      }
    };
    
    it('should wrap data in transaction_data and call the correct endpoint', async () => {
      await payments.recurringSetup(recurringData);
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/recurring/setup',
        { transaction_data: recurringData }
      );
    });
  });
});
