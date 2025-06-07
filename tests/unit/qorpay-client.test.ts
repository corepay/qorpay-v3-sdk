import { QorPayClient } from '../../src/client/qorpay-client';
import { BaseClient } from '../../src/client/base-client';
import { Environment } from '../../src/types/common';

// Mock the BaseClient
jest.mock('../../src/client/base-client');
const MockedBaseClient = BaseClient as jest.MockedClass<typeof BaseClient>;

// Mock all resource classes
jest.mock('../../src/resources/payments');
jest.mock('../../src/resources/ach-payments');
jest.mock('../../src/resources/cash-payments');
jest.mock('../../src/resources/gift-cards');
jest.mock('../../src/resources/payment-tokens');
jest.mock('../../src/resources/transactions');
jest.mock('../../src/resources/proof-of-delivery');
jest.mock('../../src/resources/customers');
jest.mock('../../src/resources/plans');
jest.mock('../../src/resources/disputes');
jest.mock('../../src/resources/deposits');
jest.mock('../../src/resources/webhooks');
jest.mock('../../src/resources/payment-forms');
jest.mock('../../src/resources/channels');
jest.mock('../../src/resources/utilities');

describe('QorPayClient', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    MockedBaseClient.mockClear();
  });

  describe('constructor', () => {
    it('should initialize with required configuration', () => {
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });

      expect(client).toBeInstanceOf(QorPayClient);
      expect(MockedBaseClient).toHaveBeenCalledWith({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });
    });

    it('should initialize with sandbox environment by default', () => {
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });

      // Verify environment is sandbox by default
      expect(client.getEnvironment()).toBe('sandbox');
    });

    it('should initialize with production environment when specified', () => {
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production'
      });

      expect(client.getEnvironment()).toBe('production');
    });

    it('should use custom baseURL when provided', () => {
      const customUrl = 'https://custom-api.example.com';
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL: customUrl
      });

      expect(client.getBaseURL()).toBe(customUrl);
    });

    it('should pass timeout to BaseClient when provided', () => {
      const timeout = 60000;
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        timeout
      });

      expect(MockedBaseClient).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout
        })
      );
    });

    it('should pass custom headers to BaseClient when provided', () => {
      const headers = { 'Custom-Header': 'value' };
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        headers
      });

      expect(MockedBaseClient).toHaveBeenCalledWith(
        expect.objectContaining({
          headers
        })
      );
    });
  });

  describe('resource modules', () => {
    let client: QorPayClient;

    beforeEach(() => {
      client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key'
      });
    });

    it('should provide access to payments resource', () => {
      expect(client.payments).toBeDefined();
    });

    it('should provide access to achPayments resource', () => {
      expect(client.achPayments).toBeDefined();
    });

    it('should provide access to cashPayments resource', () => {
      expect(client.cashPayments).toBeDefined();
    });

    it('should provide access to giftCards resource', () => {
      expect(client.giftCards).toBeDefined();
    });

    it('should provide access to paymentTokens resource', () => {
      expect(client.paymentTokens).toBeDefined();
    });

    it('should provide access to transactions resource', () => {
      expect(client.transactions).toBeDefined();
    });

    it('should provide access to proofOfDelivery resource', () => {
      expect(client.proofOfDelivery).toBeDefined();
    });

    it('should provide access to customers resource', () => {
      expect(client.customers).toBeDefined();
    });

    it('should provide access to plans resource', () => {
      expect(client.plans).toBeDefined();
    });

    it('should provide access to disputes resource', () => {
      expect(client.disputes).toBeDefined();
    });

    it('should provide access to deposits resource', () => {
      expect(client.deposits).toBeDefined();
    });

    it('should provide access to webhooks resource', () => {
      expect(client.webhooks).toBeDefined();
    });

    it('should provide access to paymentForms resource', () => {
      expect(client.paymentForms).toBeDefined();
    });

    it('should provide access to channels resource', () => {
      expect(client.channels).toBeDefined();
    });

    it('should provide access to utilities resource', () => {
      expect(client.utilities).toBeDefined();
    });
  });

  describe('configuration methods', () => {
    it('should return the correct base URL for sandbox environment', () => {
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'sandbox'
      });

      expect(client.getBaseURL()).toContain('sandbox-api.qorcommerce.io');
    });

    it('should return the correct base URL for production environment', () => {
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production'
      });

      expect(client.getBaseURL()).toContain('api.qorcommerce.io');
    });

    it('should return the correct custom base URL', () => {
      const customUrl = 'https://custom-api.example.com';
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL: customUrl
      });

      expect(client.getBaseURL()).toBe(customUrl);
    });

    it('should return the correct environment', () => {
      const environment: Environment = 'production';
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment
      });

      expect(client.getEnvironment()).toBe(environment);
    });
  });

  describe('environment setup', () => {
    it('should use sandbox URL when environment is sandbox', () => {
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'sandbox'
      });

      expect(client.getBaseURL()).toBe('https://sandbox-api.qorcommerce.io/api/v3');
    });

    it('should use production URL when environment is production', () => {
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production'
      });

      expect(client.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
    });

    it('should prioritize custom baseURL over environment setting', () => {
      const customUrl = 'https://custom-api.example.com';
      const client = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production',
        baseURL: customUrl
      });

      expect(client.getBaseURL()).toBe(customUrl);
    });
  });
});
