/**
 * @file tests/integration/payment-tokens.integration.test.ts
 * @description Integration tests for the PaymentTokens module using MSW
 */

import { QorPayClient, QorPayApiError } from '../../src';
import mswServer from './setup/msw-server';

// Test credentials (from README)
const TEST_APP_KEY = 'T6554252567241061980';
const TEST_CLIENT_KEY = '01dffeb784c64d098c8c691ea589eb82';

describe('PaymentTokens Integration Tests', () => {
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

  describe('Card Token Operations', () => {
    describe('createCardToken', () => {
      it('should create a card token with full transformation', async () => {
        const tokenId = 'tk_card_' + Date.now();

        mswServer.mockEndpoint('post', '/payment/token/card', {
          data: {
            status: 'success',
            code: 'GW00',
            message: 'Card token created successfully',
            reference_id: 'ref_create_token_' + Date.now(),
            data: {
              token: tokenId,
              card_brand: 'visa',
              card_type: 'credit',
              last4: '1111',
              exp_month: '12',
              exp_year: '25',
              card_holder: 'John Doe',
              customer_id: 'cust_123456',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        });

        const createRequest = {
          card_number: '4111111111111111',
          card_exp: '1225', // MMYY format
          card_cvv: '123',
          card_holder: 'John Doe',
          customer_id: 'cust_123456',
        };

        const result =
          await qorpay.paymentTokens.createCardToken(createRequest);

        expect(result.status).toBe('success');
        expect(result.code).toBe('GW00');
        expect(result.data.token).toMatch(/^tk_card_\d+$/);
        expect(result.data.cardBrand).toBe('visa');
        expect(result.data.cardType).toBe('credit');
        expect(result.data.last4).toBe('1111');
        expect(result.data.expMonth).toBe('12');
        expect(result.data.expYear).toBe('25');
        expect(result.data.cardHolder).toBe('John Doe');
        expect(result.data.customerId).toBe('cust_123456');
        expect(result.data.createdAt).toBeInstanceOf(Date);
      });

      it('should handle invalid card data gracefully', async () => {
        mswServer.mockEndpoint('post', '/payment/token/card', {
          status: 400,
          errorCode: 'INVALID_CARD',
          errorMessage: 'Invalid card number or expiration',
        });

        const invalidRequest = {
          card_number: 'invalid_card',
          card_exp: 'invalid_exp',
          card_cvv: '123',
          card_holder: 'John Doe',
          customer_id: 'cust_123456',
        };

        await expect(
          qorpay.paymentTokens.createCardToken(invalidRequest)
        ).rejects.toThrow(QorPayApiError);
      });
    });

    describe('getCardToken', () => {
      it('should retrieve a card token with proper transformation', async () => {
        const tokenId = 'tk_card_123456';

        mswServer.mockEndpoint('get', `/payment/token/card/${tokenId}`, {
          data: {
            status: 'success',
            code: 'GW00',
            message: 'Card token retrieved successfully',
            reference_id: 'ref_get_token_' + Date.now(),
            data: {
              token: tokenId,
              card_brand: 'visa',
              card_type: 'debit',
              last4: '4242',
              exp_month: '09',
              exp_year: '26',
              card_holder: 'Jane Smith',
              customer_id: 'cust_789',
              created_at: '2024-01-15T10:30:00Z',
              updated_at: '2024-01-16T11:00:00Z',
              metadata: { source: 'api_call' },
            },
          },
        });

        const result = await qorpay.paymentTokens.getCardToken(tokenId);

        expect(result.status).toBe('success');
        expect(result.data.token).toBe(tokenId);
        expect(result.data.cardBrand).toBe('visa');
        expect(result.data.cardType).toBe('debit');
        expect(result.data.last4).toBe('4242');
        expect(result.data.expMonth).toBe('09');
        expect(result.data.expYear).toBe('26');
        expect(result.data.cardHolder).toBe('Jane Smith');
        expect(result.data.customerId).toBe('cust_789');
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt).toBeInstanceOf(Date);
      });

      it('should handle token not found errors', async () => {
        const invalidTokenId = 'tk_invalid_123';

        mswServer.mockEndpoint('get', `/payment/token/card/${invalidTokenId}`, {
          status: 404,
          errorCode: 'TOKEN_NOT_FOUND',
          errorMessage: 'Card token not found',
        });

        await expect(
          qorpay.paymentTokens.getCardToken(invalidTokenId)
        ).rejects.toThrow(QorPayApiError);
      });
    });

    describe('deleteCardToken', () => {
      it('should delete a card token successfully', async () => {
        const tokenId = 'tk_card_delete_123';

        mswServer.mockEndpoint('delete', `/payment/token/card/${tokenId}`, {
          data: {
            status: 'success',
            code: 'GW00',
            message: 'Card token deleted successfully',
            reference_id: 'ref_delete_token_' + Date.now(),
            data: {
              token: tokenId,
              customer_id: 'cust_delete_123',
              deleted_at: new Date().toISOString(),
            },
          },
        });

        const result = await qorpay.paymentTokens.deleteCardToken(
          tokenId,
          'cust_delete_123'
        );

        expect(result.status).toBe('success');
        expect(result.data.token).toBe(tokenId);
        expect(result.data.customerId).toBe('cust_delete_123');
      });
    });
  });

  describe('ACH Token Operations', () => {
    describe('createAchToken', () => {
      it('should create an ACH token with full transformation', async () => {
        const tokenId = 'tk_ach_' + Date.now();

        mswServer.mockEndpoint('post', '/payment/token/ach', {
          data: {
            status: 'success',
            code: 'GW00',
            message: 'ACH token created successfully',
            reference_id: 'ref_create_ach_' + Date.now(),
            data: {
              token: tokenId,
              ach_account_type: 'checking',
              ach_account_last4: '6789',
              ach_routing_number: '021000021',
              ach_bank_name: 'TEST BANK',
              ach_holder: 'Jane Doe',
              customer_id: 'cust_ach_123',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        });

        const createRequest = {
          ach_account_number: '123456789',
          ach_routing_number: '021000021',
          ach_account_type: 'checking',
          ach_holder: 'Jane Doe',
          customer_id: 'cust_ach_123',
        };

        const result = await qorpay.paymentTokens.createAchToken(createRequest);

        expect(result.status).toBe('success');
        expect(result.data.token).toMatch(/^tk_ach_\d+$/);
        expect(result.data.achAccountType).toBe('checking');
        expect(result.data.achAccountLast4).toBe('6789');
        expect(result.data.achRoutingNumber).toBe('021000021');
        expect(result.data.achBankName).toBe('TEST BANK');
        expect(result.data.achHolder).toBe('Jane Doe');
        expect(result.data.customerId).toBe('cust_ach_123');
        expect(result.data.createdAt).toBeInstanceOf(Date);
      });
    });

    describe('getAchToken', () => {
      it('should retrieve an ACH token with proper transformation', async () => {
        const tokenId = 'tk_ach_123456';

        mswServer.mockEndpoint('get', `/payment/token/ach/${tokenId}`, {
          data: {
            status: 'success',
            code: 'GW00',
            message: 'ACH token retrieved successfully',
            reference_id: 'ref_get_ach_' + Date.now(),
            data: {
              token: tokenId,
              ach_account_type: 'savings',
              ach_account_last4: '9876',
              ach_routing_number: '021000021',
              ach_bank_name: 'JPMORGAN CHASE',
              ach_holder: 'Bob Smith',
              customer_id: 'cust_ach_get_123',
              created_at: '2024-01-15T10:30:00Z',
              updated_at: '2024-01-16T11:00:00Z',
            },
          },
        });

        const result = await qorpay.paymentTokens.getAchToken(tokenId);

        expect(result.status).toBe('success');
        expect(result.data.token).toBe(tokenId);
        expect(result.data.achAccountType).toBe('savings');
        expect(result.data.achAccountLast4).toBe('9876');
        expect(result.data.achRoutingNumber).toBe('021000021');
        expect(result.data.achBankName).toBe('JPMORGAN CHASE');
        expect(result.data.achHolder).toBe('Bob Smith');
        expect(result.data.customerId).toBe('cust_ach_get_123');
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors across all token endpoints', async () => {
      const invalidClient = new QorPayClient({
        appKey: 'invalid_key',
        clientKey: 'invalid_key',
        environment: 'sandbox',
      });

      // Mock authentication failure for get endpoint
      mswServer.mockEndpoint('get', '/payment/token/card/test', {
        status: 401,
        errorCode: 'AUTH_001',
        errorMessage: 'Invalid API credentials',
      });

      await expect(
        invalidClient.paymentTokens.getCardToken('test')
      ).rejects.toThrow(QorPayApiError);
    });

    it('should handle rate limiting for token operations', async () => {
      mswServer.mockEndpoint('post', '/payment/token/card', {
        status: 429,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        errorMessage:
          'Too many token creation requests. Please try again later.',
      });

      const createRequest = {
        card_number: '4111111111111111',
        card_exp: '1225',
        card_cvv: '123',
        card_holder: 'John Doe',
        customer_id: 'cust_123456',
      };

      await expect(
        qorpay.paymentTokens.createCardToken(createRequest)
      ).rejects.toThrow(QorPayApiError);
    });
  });
});
