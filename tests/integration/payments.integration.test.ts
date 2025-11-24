/**
 * @file tests/integration/payments.integration.test.ts
 * @description Integration tests for the Payments module using MSW
 */

import { QorPayClient, QorPayApiError } from '../../src';
import mswServer from './setup/msw-server';

// Test credentials (from README)
const TEST_APP_KEY = 'T6554252567241061980';
const TEST_CLIENT_KEY = '01dffeb784c64d098c8c691ea589eb82';

// Test data
const cardSaleData = {
  mid: TEST_APP_KEY,
  amount: '49.95',
  currency: 'USD',
  creditcard: '4111111111111111',
  month: '12',
  year: '25',
  cvv: '123',
  reference_id: 'test_order_' + Date.now(),
};

const invalidCardData = {
  ...cardSaleData,
  creditcard: '4111111111111112', // Invalid checksum
};

const tokenSaleData = {
  mid: TEST_APP_KEY,
  amount: '49.95',
  currency: 'USD',
  creditcard: '541341$KR0eAiX2',
  reference_id: 'test_token_order_' + Date.now(),
};

const captureData = {
  mid: TEST_APP_KEY,
  transaction_id: 'txn_test12345',
  amount: '49.95',
};

describe('Payments Integration Tests', () => {
  let qorpay: QorPayClient;

  // Set up the MSW server before all tests
  beforeAll(() => {
    mswServer.start();
  });

  // Reset handlers between tests
  beforeEach(() => {
    mswServer.reset();

    // Create a new client for each test
    qorpay = new QorPayClient({
      appKey: TEST_APP_KEY,
      clientKey: TEST_CLIENT_KEY,
      environment: 'sandbox',
      // Set a short timeout for faster test failures
      timeout: 3000,
    });
  });

  // Stop the server after all tests
  afterAll(() => {
    mswServer.stop();
  });

  describe('Card Payments', () => {
    it('should process a card sale successfully', async () => {
      // Mock the endpoint with a specific transaction ID for verification
      const mockTransactionId = 'txn_test_' + Date.now();
      mswServer.mockEndpoint('post', '/payment/sale/manual/', {
        data: {
          transaction_id: mockTransactionId,
          amount: cardSaleData.amount,
          currency: cardSaleData.currency,
          status: 'approved',
          card: {
            last4: '1111',
            brand: 'visa',
          },
        },
      });

      const response = await qorpay.payments.saleManual(cardSaleData);

      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.transaction_id).toBe(mockTransactionId);
      expect(response.data.amount).toBe(cardSaleData.amount);
      expect(response.data.status).toBe('approved');
      expect(response.data.card.last4).toBe('1111');
    });

    it('should handle card decline errors', async () => {
      // Mock a declined transaction
      mswServer.mockEndpoint('post', '/payment/sale/manual/', {
        status: 400,
        errorCode: 'GW05',
        errorMessage: 'Card declined: insufficient funds',
      });

      // Expect the API error to be thrown and caught
      await expect(qorpay.payments.saleManual(cardSaleData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(
        qorpay.payments.saleManual(cardSaleData)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Card declined'),
        statusCode: 400,
        errorCode: 'GW05',
      });
    });

    it('should handle invalid card validation errors', async () => {
      // Mock a validation error
      mswServer.mockEndpoint('post', '/payment/sale/manual/', {
        status: 400,
        errorCode: 'GW01',
        errorMessage: 'Invalid card number',
      });

      await expect(qorpay.payments.saleManual(invalidCardData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(
        qorpay.payments.saleManual(invalidCardData)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid card number'),
        statusCode: 400,
        errorCode: 'GW01',
      });
    });

    it('should process a token sale successfully', async () => {
      // Mock the endpoint with a specific transaction ID for verification
      const mockTransactionId = 'txn_token_' + Date.now();
      mswServer.mockEndpoint('post', '/payment/sale/token', {
        data: {
          transaction_id: mockTransactionId,
          amount: tokenSaleData.amount,
          currency: tokenSaleData.currency,
          status: 'approved',
          card: {
            last4: '1111',
            brand: 'visa',
          },
        },
      });

      const response = await qorpay.payments.saleToken(tokenSaleData);

      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.transaction_id).toBe(mockTransactionId);
      expect(response.data.amount).toBe(tokenSaleData.amount);
      expect(response.data.status).toBe('approved');
    });

    it('should handle invalid token errors', async () => {
      // Mock an invalid token error
      mswServer.mockEndpoint('post', '/payment/sale/token', {
        status: 400,
        errorCode: 'GW02',
        errorMessage: 'Invalid or expired token',
      });

      await expect(qorpay.payments.saleToken(tokenSaleData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(
        qorpay.payments.saleToken(tokenSaleData)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid or expired token'),
        statusCode: 400,
        errorCode: 'GW02',
      });
    });

    it('should capture an authorized payment', async () => {
      // Mock the capture endpoint
      mswServer.mockEndpoint('post', '/payment/capture', {
        data: {
          transaction_id: captureData.transaction_id,
          amount: captureData.amount,
          status: 'captured',
          captured_at: new Date().toISOString(),
        },
      });

      const response = await qorpay.payments.capture(captureData);

      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.transaction_id).toBe(captureData.transaction_id);
      expect(response.data.status).toBe('captured');
    });

    it('should void a transaction', async () => {
      const voidData = {
        transaction_id: 'txn_test12345',
        reason: 'Integration test',
      };

      // Mock the void endpoint
      mswServer.mockEndpoint('post', '/payment/void', {
        data: {
          transaction_id: voidData.transaction_id,
          status: 'voided',
          voided_at: new Date().toISOString(),
        },
      });

      const response = await qorpay.payments.void(voidData);

      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.transaction_id).toBe(voidData.transaction_id);
      expect(response.data.status).toBe('voided');
    });
  });

  describe('Authentication and Error Handling', () => {
    it('should fail with authentication error when credentials are invalid', async () => {
      // Mock authentication failure
      mswServer.mockAuthFailure();

      await expect(qorpay.payments.saleManual(cardSaleData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(
        qorpay.payments.saleManual(cardSaleData)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid API credentials'),
        statusCode: 401,
        errorCode: 'AUTH01',
      });
    });

    it('should handle rate limiting errors', async () => {
      // Mock rate limiting
      mswServer.mockRateLimit();

      await expect(qorpay.payments.saleManual(cardSaleData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(
        qorpay.payments.saleManual(cardSaleData)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Rate limit exceeded'),
        statusCode: 429,
        errorCode: 'RATE01',
      });
    });

    it('should handle server errors', async () => {
      // Mock server error
      mswServer.mockServerError();

      await expect(qorpay.payments.saleManual(cardSaleData)).rejects.toThrow(
        QorPayApiError
      );
      await expect(
        qorpay.payments.saleManual(cardSaleData)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Internal server error'),
        statusCode: 500,
        errorCode: 'SERVER01',
      });
    });

    it('should handle network timeouts', async () => {
      // Set a very short timeout for this test
      const timeoutClient = new QorPayClient({
        appKey: TEST_APP_KEY,
        clientKey: TEST_CLIENT_KEY,
        environment: 'sandbox',
        timeout: 100, // 100ms timeout
      });

      // Mock a response that takes longer than the timeout
      mswServer.mockTimeout(500); // 500ms delay

      await expect(
        timeoutClient.payments.saleManual(cardSaleData)
      ).rejects.toThrow();
    });
  });

  describe('Advanced Payment Flows', () => {
    it('should process a recurring payment setup', async () => {
      const recurringData = {
        ...cardSaleData,
        recurring: {
          frequency: 'monthly',
          start_date: '2023-02-01',
          total_occurrences: 12,
        },
      };

      // Mock the recurring setup endpoint
      mswServer.mockEndpoint('post', '/payment/recurring/setup', {
        data: {
          transaction_id: 'txn_recurring_' + Date.now(),
          amount: recurringData.amount,
          status: 'approved',
          recurring_id: 'rec_12345',
          next_payment_date: '2023-02-01',
        },
      });

      const response = await qorpay.payments.recurringSetup(recurringData);

      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.recurring_id).toBeDefined();
      expect(response.data.next_payment_date).toBeDefined();
    });

    it('should process a Level 3 data payment', async () => {
      const lvl3Data = {
        ...cardSaleData,
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

      // Mock the Level 3 endpoint
      mswServer.mockEndpoint('post', '/payment/sale/lvl2_3', {
        data: {
          transaction_id: 'txn_lvl3_' + Date.now(),
          amount: lvl3Data.amount,
          status: 'approved',
          level3_qualified: true,
        },
      });

      const response = await qorpay.payments.saleLvl2Lvl3(lvl3Data);

      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.level3_qualified).toBe(true);
    });

    it('should process a 3DS authenticated payment', async () => {
      const threeDSData = {
        ...cardSaleData,
        threeds_data: {
          cavv: 'CAVV_VALUE',
          xid: 'XID_VALUE',
          eci: '05',
          ds_transaction_id: 'DS_TRANS_ID',
        },
      };

      // Mock the 3DS endpoint
      mswServer.mockEndpoint('post', '/payment/sale/3ds', {
        data: {
          transaction_id: 'txn_3ds_' + Date.now(),
          amount: threeDSData.amount,
          status: 'approved',
          authentication: {
            status: 'Y',
            protocol: '2.2.0',
            liability_shift: true,
          },
        },
      });

      const response = await qorpay.payments.sale3DS(threeDSData);

      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.authentication).toBeDefined();
      expect(response.data.authentication.liability_shift).toBe(true);
    });
  });
});
