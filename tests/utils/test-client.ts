/**
 * @file tests/utils/test-client.ts
 * @description Factory for creating test clients with proper network mocking
 */

import { QorPayClient } from '../../src/client/qorpay-client';
import {
  setupNetworkMocks,
  resetNetworkMocks,
  mockSuccessfulResponse,
  mockFailedResponse,
  expectApiCall,
} from './network-mocks';

export interface TestClientConfig {
  appKey?: string;
  clientKey?: string;
  environment?: 'sandbox' | 'production';
  baseURL?: string;
}

// Initialize network mocks at module level
const { mockAxios, mockAxiosInstance } = setupNetworkMocks();

/**
 * Creates a real QorPayClient instance for testing with mocked network layer
 */
export function createTestClient(config: TestClientConfig = {}) {
  const {
    appKey = 'test-app-key',
    clientKey = 'test-client-key',
    environment = 'sandbox',
    baseURL = 'https://api.sandbox.qorpay.com',
  } = config;

  // Reset mocks before creating client
  resetNetworkMocks();
  mockAxios.create.mockReturnValue(mockAxiosInstance as any);

  // Create real client instance (NO mocking of our own code)
  const client = new QorPayClient({
    appKey,
    clientKey,
    environment,
    baseURL,
  });

  return {
    client,
    mockAxios,
    mockAxiosInstance,
  };
}

/**
 * Reset all test mocks between tests
 */
export function resetTestMocks() {
  resetNetworkMocks();
}

/**
 * Helper to run tests with clean setup/teardown
 */
export function withTestClient(
  testFn: (client: QorPayClient, mocks: any) => void | Promise<void>
) {
  return async () => {
    const { client, mockAxiosInstance } = createTestClient();
    try {
      await testFn(client, { mockAxiosInstance });
    } finally {
      resetTestMocks();
    }
  };
}

// Re-export network mocking functions for convenience
export {
  mockSuccessfulResponse,
  mockFailedResponse,
  expectApiCall,
} from './network-mocks';
