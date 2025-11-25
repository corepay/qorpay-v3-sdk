/**
 * @file tests/unit/base-client-direct.test.ts
 * @description Direct BaseClient tests to cover interceptor setup lines 90-99
 */

import axios from 'axios';
import { BaseClient } from '../../src/client/base-client';

// Mock axios minimally - just enough to prevent actual network calls
jest.mock('axios');
jest.mock('axios-retry', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
  isNetworkOrIdempotentRequestError: jest.fn(() => false),
  exponentialDelay: jest.fn(() => 100),
}));

// Mock performance tracker to avoid actual performance tracking
jest.mock('../../src/utils/performance', () => ({
  performanceTracker: {
    startRequest: jest.fn(() => ({
      requestId: 'test-123',
      headers: { 'X-Request-Id': 'test-123' },
    })),
    endRequest: jest.fn(() => ({ duration: 50 })),
    getPerformanceSummary: jest.fn(() => ({})),
  },
}));

describe('BaseClient - Direct Integration Tests', () => {
  let mockAxiosCreate: jest.MockedFunction<typeof axios.create>;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock axios instance with interceptors
    mockAxiosInstance = {
      request: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };

    // Mock axios.create to return our mock instance
    mockAxiosCreate = axios.create as jest.MockedFunction<typeof axios.create>;
    mockAxiosCreate.mockReturnValue(mockAxiosInstance);
  });

  it('should configure request interceptors during constructor (lines 90-99)', () => {
    const config = {
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
      environment: 'sandbox' as const,
    };

    // This will execute the constructor and interceptor setup lines
    const client = new BaseClient(config);

    // Verify axios.create was called
    expect(mockAxiosCreate).toHaveBeenCalledWith({
      baseURL: 'https://sandbox-api.qorcommerce.io/api/v3',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Qor-App-Key': 'test-app-key',
        'Qor-Client-Key': 'test-client-key',
      },
    });

    // Verify request interceptor was set up (line 90)
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);

    // Verify response interceptors were set up (lines 93-99)
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(
      1
    );

    // Verify the response.use call has both success and error handlers
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(
      expect.any(Function), // success handler
      expect.any(Function) // error handler
    );
  });

  it('should configure interceptors with custom headers', () => {
    const config = {
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
      headers: {
        'User-Agent': 'Test-Agent/1.0',
        'X-Custom': 'custom-value',
      },
    };

    // This executes constructor with custom headers
    new BaseClient(config);

    // Verify custom headers are merged in the create call
    expect(mockAxiosCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Qor-App-Key': 'test-app-key',
          'Qor-Client-Key': 'test-client-key',
          'User-Agent': 'Test-Agent/1.0',
          'X-Custom': 'custom-value',
        },
      })
    );

    // Interceptors should still be set up
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(
      1
    );
  });

  it('should configure axios retry with exponential delay', () => {
    const { default: axiosRetry } = require('axios-retry');

    const config = {
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    };

    new BaseClient(config);

    // Verify axiosRetry was called with correct configuration
    expect(axiosRetry).toHaveBeenCalledWith(
      mockAxiosInstance,
      expect.objectContaining({
        retries: 3,
        retryCondition: expect.any(Function),
      })
    );
  });

  it('should handle interceptor methods being callable', () => {
    const config = {
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    };

    const client = new BaseClient(config);

    // Get the handlers that were registered
    const requestHandler =
      mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    const responseHandlers =
      mockAxiosInstance.interceptors.response.use.mock.calls[0];

    // Verify handlers are functions and can be called
    expect(typeof requestHandler).toBe('function');
    expect(typeof responseHandlers[0]).toBe('function'); // success handler
    expect(typeof responseHandlers[1]).toBe('function'); // error handler

    // Test request handler
    const requestConfig = {
      method: 'GET',
      url: '/test',
      headers: { Existing: 'value' },
    };

    const modifiedConfig = requestHandler(requestConfig);
    expect(modifiedConfig).toBeDefined();
    expect(modifiedConfig.headers).toHaveProperty('X-Request-Id');
  });

  it('should verify interceptor handlers are registered', () => {
    const config = {
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    };

    new BaseClient(config);

    // Get the handlers that were registered
    const requestHandler =
      mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    const responseHandlers =
      mockAxiosInstance.interceptors.response.use.mock.calls[0];

    // Verify handlers are functions
    expect(typeof requestHandler).toBe('function');
    expect(typeof responseHandlers[0]).toBe('function'); // success handler
    expect(typeof responseHandlers[1]).toBe('function'); // error handler

    // Verify the handlers were registered
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(
      1
    );
  });
});
