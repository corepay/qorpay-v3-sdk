/**
 * @file tests/unit/qorpay-client.test.ts
 * @description Unit tests for QorPayClient class using real instances
 */

import { QorPayClient } from '../../src/client/qorpay-client';
import { createTestClient } from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('QorPayClient', () => {
  let client: QorPayClient;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
  });

  describe('constructor', () => {
    it('should initialize with sandbox environment by default', () => {
      expect(client).toBeInstanceOf(QorPayClient);
      expect(client.getEnvironment()).toBe('sandbox');
      expect(client.getBaseURL()).toBe('https://api.sandbox.qorpay.com');
    });

    it('should initialize with production environment when specified', () => {
      const prodClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production',
      });

      expect(prodClient.getEnvironment()).toBe('production');
      expect(prodClient.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
    });

    it('should use custom baseURL when provided', () => {
      const customClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'sandbox',
        baseURL: 'https://custom.api.example.com',
      });

      expect(customClient.getBaseURL()).toBe('https://custom.api.example.com');
    });

    it('should initialize all resource modules', () => {
      // Check that all resource modules are initialized
      expect(client.payments).toBeDefined();
      expect(client.achPayments).toBeDefined();
      expect(client.cashPayments).toBeDefined();
      expect(client.giftCards).toBeDefined();
      expect(client.paymentTokens).toBeDefined();
      expect(client.paymentMethods).toBeDefined();
      expect(client.paymentForms).toBeDefined();
      expect(client.transactions).toBeDefined();
      expect(client.proofOfDelivery).toBeDefined();
      expect(client.customers).toBeDefined();
      expect(client.plans).toBeDefined();
      expect(client.disputes).toBeDefined();
      expect(client.deposits).toBeDefined();
      expect(client.webhooks).toBeDefined();
      expect(client.channels).toBeDefined();
      expect(client.utilities).toBeDefined();
    });
  });

  describe('getBaseURL', () => {
    it('should return the correct base URL for sandbox', () => {
      expect(client.getBaseURL()).toBe('https://api.sandbox.qorpay.com');
    });

    it('should return the correct base URL for production', () => {
      const prodClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production',
      });
      expect(prodClient.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
    });

    it('should return custom baseURL when provided', () => {
      const customClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'sandbox',
        baseURL: 'https://custom.example.com/api',
      });
      expect(customClient.getBaseURL()).toBe('https://custom.example.com/api');
    });
  });

  describe('getEnvironment', () => {
    it('should return sandbox by default', () => {
      expect(client.getEnvironment()).toBe('sandbox');
    });

    it('should return production when configured', () => {
      const prodClient = new QorPayClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        environment: 'production',
      });
      expect(prodClient.getEnvironment()).toBe('production');
    });
  });

  describe('performance metrics', () => {
    describe('enablePerformanceMetrics', () => {
      it('should enable performance metrics', () => {
        expect(() => client.enablePerformanceMetrics()).not.toThrow();
      });
    });

    describe('disablePerformanceMetrics', () => {
      it('should disable performance metrics', () => {
        expect(() => client.disablePerformanceMetrics()).not.toThrow();
      });
    });

    describe('getPerformanceMetrics', () => {
      it('should get performance metrics', () => {
        const metrics = client.getPerformanceMetrics();
        expect(typeof metrics).toBe('object');
      });
    });
  });

  describe('resource module access', () => {
    it('should provide access to performance methods', () => {
      expect(typeof client.enablePerformanceMetrics).toBe('function');
      expect(typeof client.disablePerformanceMetrics).toBe('function');
      expect(typeof client.getPerformanceMetrics).toBe('function');
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

  describe('resource module types', () => {
    it('should create resource modules with correct types', () => {
      // Test that resource modules have expected methods
      expect(typeof client.payments.saleManual).toBe('function');
      expect(typeof client.customers.createCustomer).toBe('function');
      expect(typeof client.transactions.listTransactions).toBe('function');
      expect(typeof client.utilities.validateCard).toBe('function');
      expect(typeof client.giftCards.activate).toBe('function');
    });
  });
});
