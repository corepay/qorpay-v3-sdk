/**
 * BaseClient Final Coverage Test
 *
 * This test file specifically targets the remaining coverage gaps in BaseClient
 * to achieve 100% line coverage for getter methods (lines 90-99).
 */

import { BaseClient } from '../../src/client/base-client';

describe('BaseClient - Final Coverage', () => {
  describe('Getter methods coverage (lines 90-99)', () => {
    it('should exercise all getter methods with sandbox configuration', () => {
      const config = {
        appKey: 'test_app_key',
        clientKey: 'test_client_key',
        environment: 'sandbox' as const,
        timeout: 30000,
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      };

      const client = new BaseClient(config);

      // Test getBaseURL() method - line 90
      expect(client.getBaseURL()).toBe(
        'https://sandbox-api.qorcommerce.io/api/v3'
      );

      // Test getEnvironment() method - line 98
      expect(client.getEnvironment()).toBe('sandbox');
    });

    it('should exercise all getter methods with production configuration', () => {
      const config = {
        appKey: 'test_app_key',
        clientKey: 'test_client_key',
        environment: 'production' as const,
        timeout: 60000,
        headers: {
          'X-Production-Header': 'prod-value',
        },
      };

      const client = new BaseClient(config);

      // Test getBaseURL() method - line 90
      expect(client.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');

      // Test getEnvironment() method - line 98
      expect(client.getEnvironment()).toBe('production');
    });

    it('should exercise getter methods with minimal configuration', () => {
      const config = {
        appKey: 'test_app_key',
        clientKey: 'test_client_key',
        environment: 'sandbox' as const,
      };

      const client = new BaseClient(config);

      // Test all getter methods to ensure complete coverage
      expect(client.getBaseURL()).toBe(
        'https://sandbox-api.qorcommerce.io/api/v3'
      );
      expect(client.getEnvironment()).toBe('sandbox');
    });

    it('should exercise getter methods with custom timeout and headers', () => {
      const config = {
        appKey: 'test_app_key',
        clientKey: 'test_client_key',
        environment: 'production' as const,
        timeout: 45000,
        headers: {
          Authorization: 'Bearer token123',
          'X-Request-ID': 'custom-request-id',
        },
      };

      const client = new BaseClient(config);

      // Test all getter methods for complete coverage
      expect(client.getBaseURL()).toBe('https://api.qorcommerce.io/api/v3');
      expect(client.getEnvironment()).toBe('production');
    });

    it('should handle multiple getter method calls', () => {
      const client = new BaseClient({
        appKey: 'test_key',
        clientKey: 'test_secret',
        environment: 'sandbox',
      });

      // Call getter methods multiple times to ensure coverage
      for (let i = 0; i < 3; i++) {
        expect(client.getBaseURL()).toBe(
          'https://sandbox-api.qorcommerce.io/api/v3'
        );
        expect(client.getEnvironment()).toBe('sandbox');
      }
    });
  });
});
