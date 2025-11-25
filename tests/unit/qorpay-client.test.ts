/**
 * @file tests/unit/qorpay-client.test.ts
 * @description Unit tests for QorPayClient class
 */

import { QorPayClient } from '../../src/client/qorpay-client';
import { BaseClient } from '../../src/client/base-client';
import { Payments } from '../../src/resources/payments';
import { AchPayments } from '../../src/resources/ach-payments';
import { CashPayments } from '../../src/resources/cash-payments';
import { GiftCards } from '../../src/resources/gift-cards';
import { PaymentTokens } from '../../src/resources/payment-tokens';
import { PaymentMethods } from '../../src/resources/paymentMethods';
import { PaymentForms } from '../../src/resources/payment-forms';
import { Transactions } from '../../src/resources/transactions';
import { ProofOfDelivery } from '../../src/resources/proof-of-delivery';
import { Customers } from '../../src/resources/customers';
import { Plans } from '../../src/resources/plans';
import { Disputes } from '../../src/resources/disputes';
import { Deposits } from '../../src/resources/deposits';
import { Webhooks } from '../../src/resources/webhooks';
import { Channels } from '../../src/resources/channels';
import { Utilities } from '../../src/resources/utilities';

// Mock only the BaseClient
jest.mock('../../src/client/base-client');

// Mock BaseClient methods
const mockBaseClient = {
  enablePerformanceMetrics: jest.fn(),
  disablePerformanceMetrics: jest.fn(),
  getPerformanceMetrics: jest.fn(),
  getBaseURL: jest.fn(),
  getEnvironment: jest.fn(),
};

(BaseClient as jest.MockedClass<typeof BaseClient>).mockImplementation(
  () => mockBaseClient as any
);

describe('QorPayClient', () => {
  const defaultConfig = {
    appKey: 'test-app-key',
    clientKey: 'test-client-key',
    environment: 'sandbox' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with sandbox environment by default', () => {
      const client = new QorPayClient(defaultConfig);

      expect(BaseClient).toHaveBeenCalledWith(defaultConfig);
      expect(client.getEnvironment()).toBe('sandbox');
      expect(client.getBaseURL()).toBe(
        'https://sandbox-api.qorcommerce.io/api/v3'
      );
    });

    it('should initialize with production environment when specified', () => {
      const config = {
        ...defaultConfig,
        environment: 'production' as const,
      };
      const client = new QorPayClient(config);

      expect(BaseClient).toHaveBeenCalledWith(config);
      expect(client.getEnvironment()).toBe('production');
      expect(client.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
    });

    it('should use custom baseURL when provided', () => {
      const config = {
        ...defaultConfig,
        baseURL: 'https://custom.api.example.com',
      };
      const client = new QorPayClient(config);

      expect(BaseClient).toHaveBeenCalledWith(config);
      expect(client.getBaseURL()).toBe('https://custom.api.example.com');
    });

    it('should initialize all resource modules', () => {
      const client = new QorPayClient(defaultConfig);

      // Check that all resource modules are initialized
      expect(client.payments).toBeInstanceOf(Payments);
      expect(client.achPayments).toBeInstanceOf(AchPayments);
      expect(client.cashPayments).toBeInstanceOf(CashPayments);
      expect(client.giftCards).toBeInstanceOf(GiftCards);
      expect(client.paymentTokens).toBeInstanceOf(PaymentTokens);
      expect(client.paymentMethods).toBeInstanceOf(PaymentMethods);
      expect(client.paymentForms).toBeInstanceOf(PaymentForms);
      expect(client.transactions).toBeInstanceOf(Transactions);
      expect(client.proofOfDelivery).toBeInstanceOf(ProofOfDelivery);
      expect(client.customers).toBeInstanceOf(Customers);
      expect(client.plans).toBeInstanceOf(Plans);
      expect(client.disputes).toBeInstanceOf(Disputes);
      expect(client.deposits).toBeInstanceOf(Deposits);
      expect(client.webhooks).toBeInstanceOf(Webhooks);
      expect(client.channels).toBeInstanceOf(Channels);
      expect(client.utilities).toBeInstanceOf(Utilities);

      // Verify BaseClient was called with the config
      expect(BaseClient).toHaveBeenCalledWith(defaultConfig);
    });
  });

  describe('getBaseURL', () => {
    it('should return the correct base URL for sandbox', () => {
      const client = new QorPayClient(defaultConfig);
      expect(client.getBaseURL()).toBe(
        'https://sandbox-api.qorcommerce.io/api/v3'
      );
    });

    it('should return the correct base URL for production', () => {
      const config = {
        ...defaultConfig,
        environment: 'production' as const,
      };
      const client = new QorPayClient(config);
      expect(client.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
    });

    it('should return custom baseURL when provided', () => {
      const config = {
        ...defaultConfig,
        baseURL: 'https://custom.example.com/api',
      };
      const client = new QorPayClient(config);
      expect(client.getBaseURL()).toBe('https://custom.example.com/api');
    });
  });

  describe('getEnvironment', () => {
    it('should return sandbox by default', () => {
      const client = new QorPayClient(defaultConfig);
      expect(client.getEnvironment()).toBe('sandbox');
    });

    it('should return production when configured', () => {
      const config = {
        ...defaultConfig,
        environment: 'production' as const,
      };
      const client = new QorPayClient(config);
      expect(client.getEnvironment()).toBe('production');
    });
  });

  describe('performance metrics', () => {
    let client: QorPayClient;
    const mockMetrics = {
      totalRequests: 10,
      averageResponseTime: 150,
      slowestRequest: { url: '/test', method: 'GET', duration: 500 },
    };

    beforeEach(() => {
      client = new QorPayClient(defaultConfig);
      mockBaseClient.getPerformanceMetrics.mockReturnValue(mockMetrics as any);
    });

    describe('enablePerformanceMetrics', () => {
      it('should enable performance metrics on base client', () => {
        client.enablePerformanceMetrics();
        expect(mockBaseClient.enablePerformanceMetrics).toHaveBeenCalled();
      });
    });

    describe('disablePerformanceMetrics', () => {
      it('should disable performance metrics on base client', () => {
        client.disablePerformanceMetrics();
        expect(mockBaseClient.disablePerformanceMetrics).toHaveBeenCalled();
      });
    });

    describe('getPerformanceMetrics', () => {
      it('should get performance metrics from base client', () => {
        const metrics = client.getPerformanceMetrics();
        expect(mockBaseClient.getPerformanceMetrics).toHaveBeenCalled();
        expect(metrics).toEqual(mockMetrics);
      });
    });
  });

  describe('resource module access', () => {
    let client: QorPayClient;

    beforeEach(() => {
      client = new QorPayClient(defaultConfig);
    });

    it('should provide access to performance methods', () => {
      // Test that performance methods are accessible
      expect(typeof client.enablePerformanceMetrics).toBe('function');
      expect(typeof client.disablePerformanceMetrics).toBe('function');
      expect(typeof client.getPerformanceMetrics).toBe('function');

      // Test that they call the base client methods
      client.enablePerformanceMetrics();
      expect(mockBaseClient.enablePerformanceMetrics).toHaveBeenCalled();

      client.disablePerformanceMetrics();
      expect(mockBaseClient.disablePerformanceMetrics).toHaveBeenCalled();

      client.getPerformanceMetrics();
      expect(mockBaseClient.getPerformanceMetrics).toHaveBeenCalled();
    });

    it('should have all expected resource modules', () => {
      const expectedModules = [
        'payments',
        'achPayments',
        'cashPayments',
        'giftCards',
        'paymentTokens',
        'paymentMethods',
        'paymentForms',
        'transactions',
        'proofOfDelivery',
        'customers',
        'plans',
        'disputes',
        'deposits',
        'webhooks',
        'channels',
        'utilities',
      ];

      expectedModules.forEach((module) => {
        expect(client).toHaveProperty(module);
        expect((client as any)[module]).toBeDefined();
      });
    });
  });

  describe('configuration validation', () => {
    it('should work with minimal configuration', () => {
      const minimalConfig = {
        appKey: 'test-key',
        clientKey: 'client-key',
      };

      expect(() => new QorPayClient(minimalConfig)).not.toThrow();
    });

    it('should work with all configuration options', () => {
      const fullConfig = {
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production' as const,
        baseURL: 'https://custom.example.com',
        timeout: 60000,
        headers: {
          'User-Agent': 'Test-Agent/1.0',
        },
      };

      expect(() => new QorPayClient(fullConfig)).not.toThrow();
    });
  });
});
