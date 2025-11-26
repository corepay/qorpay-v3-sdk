/**
 * @file tests/unit/payments-final-coverage.test.ts
 * @description Final coverage tests for Payments to reach 100%
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
} from '../utils/test-client';
import type { PaymentSaleTokenRequestData } from '../../src/types';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('Payments - Final Coverage Tests', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
  });

  describe('saleToken method', () => {
    it('should handle successful token payment', async () => {
      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_123456',
        amount: '10.00',
      };

      mockSuccessfulResponse(mockResponse);

      const request: PaymentSaleTokenRequestData = {
        mid: 'test-mid',
        amount: '10.00',
        creditcard: 'tok_test123',
        customer_id: 'cust_123',
      };

      const result = await client.payments.saleToken(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('saleLvl2Lvl3 method - no schema validation', () => {
    it('should handle Lvl2/Lvl3 payment without schema validation', async () => {
      const request = {
        mid: 'test-mid',
        amount: '100.00',
        level2_data: {
          tax_amount: '8.00',
          customer_reference: 'REF123',
        },
        level3_data: {
          line_items: [
            {
              description: 'Test Item',
              quantity: 1,
              unit_price: '92.00',
            },
          ],
        },
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_lvl3_123',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.saleLvl2Lvl3(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('saleLevel2_3 method', () => {
    it('should handle Level 2/3 payment alias method', async () => {
      const request = {
        mid: 'test-mid',
        amount: '100.00',
        level2_data: {
          tax_amount: '8.00',
        },
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_lvl3_456',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.saleLevel2_3(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('sale3DS method - no schema validation', () => {
    it('should handle 3DS payment without schema validation', async () => {
      const request = {
        mid: 'test-mid',
        amount: '50.00',
        three_d_secure: {
          verification_id: '3ds_123',
          authentication_response: 'success',
        },
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_3ds_123',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.sale3DS(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('salePin method - no schema validation', () => {
    it('should handle PIN debit payment without schema validation', async () => {
      const request = {
        mid: 'test-mid',
        amount: '25.00',
        pin_block: 'encrypted_pin_data',
        ksn: 'key_serial_number',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_pin_123',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.salePin(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('salePos method', () => {
    it('should handle POS payment', async () => {
      const request = {
        mid: 'test-mid',
        amount: '75.00',
        creditcard: '4111111111111111',
        exp: '1225',
        cvv: '123',
        orderid: 'order_123',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_pos_123',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.salePos(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('recurring methods', () => {
    it('should handle recurring setup', async () => {
      const request = {
        mid: 'test-mid',
        amount: '20.00',
        creditcard: '4111111111111111',
        exp: '1225',
        cvv: '123',
        schedule: 'monthly',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_rec_setup_123',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.recurringSetup(request);

      expect(result).toBe(mockResponse);
    });

    it('should handle recurring existing', async () => {
      const request = {
        mid: 'test-mid',
        amount: '20.00',
        creditcard: '4111111111111111',
        exp: '1225',
        cvv: '123',
        recurring_transaction_id: 'rec_123',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_rec_existing_123',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.recurringExisting(request);

      expect(result).toBe(mockResponse);
    });

    it('should handle recurring my', async () => {
      const request = {
        mid: 'test-mid',
        amount: '20.00',
        transaction_id: 'txn_123',
        cvv: '123',
        my_recurring_id: 'my_rec_123',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_my_rec_123',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.recurringMy(request);

      expect(result).toBe(mockResponse);
    });

    it('should handle myRecurring alias', async () => {
      const request = {
        mid: 'test-mid',
        amount: '20.00',
        transaction_id: 'txn_456',
        cvv: '123',
        my_recurring_id: 'my_rec_456',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_my_rec_456',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.myRecurring(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('authorization methods', () => {
    it('should handle authorize', async () => {
      const request = {
        mid: 'test-mid',
        amount: '30.00',
        creditcard: '4111111111111111',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_auth_123',
        auth_code: '123456',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.authorize(request);

      expect(result).toBe(mockResponse);
    });

    it('should handle authorizeToken', async () => {
      const request = {
        mid: 'test-mid',
        amount: '30.00',
        creditcard: 'tok_auth_123',
        customer_id: 'cust_123',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_auth_tok_123',
        auth_code: '654321',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.authorizeToken(request);

      expect(result).toBe(mockResponse);
    });
  });

  describe('action methods', () => {
    it('should handle void', async () => {
      const request = {
        transaction_id: 'txn_123',
        mid: 'test-mid',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_123_voided',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.void(request);

      expect(result).toBe(mockResponse);
    });

    it('should handle refund', async () => {
      const request = {
        transaction_id: 'txn_123',
        mid: 'test-mid',
        amount: '10.00',
        orderid: 'order_123',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_123_refunded',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.refund(request);

      expect(result).toBe(mockResponse);
    });

    it('should handle capture', async () => {
      const request = {
        transaction_id: 'txn_123',
        mid: 'test-mid',
        amount: '15.00',
      };

      const mockResponse = {
        status: 'success',
        transaction_id: 'txn_123_captured',
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.payments.capture(request);

      expect(result).toBe(mockResponse);
    });
  });
});
