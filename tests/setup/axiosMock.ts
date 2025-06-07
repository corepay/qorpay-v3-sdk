/**
 * @file tests/setup/axiosMock.ts
 * @description Mock implementation of axios for unit tests
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create mock response function type
type MockResponseFn = (config: AxiosRequestConfig) => Promise<AxiosResponse>;

// Create a type for our mock axios instance
interface MockAxiosInstance extends AxiosInstance {
  // Add mock implementation properties
  mockReset: () => void;
  mockResolvedValueOnce: (value: any) => MockAxiosInstance;
  mockRejectedValueOnce: (error: any) => MockAxiosInstance;
  mockResolvedValue: (value: any) => MockAxiosInstance;
  mockRejectedValue: (error: any) => MockAxiosInstance;
  mockImplementation: (fn: MockResponseFn) => MockAxiosInstance;
  mockImplementationOnce: (fn: MockResponseFn) => MockAxiosInstance;
}

// Create the mock response interceptor
const mockResponseInterceptorUse = jest.fn();
const mockRequestInterceptorUse = jest.fn();

// Create the mock axios instance
const mockAxiosInstance = {
  // HTTP methods
  request: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),

  // Interceptors
  interceptors: {
    request: {
      use: mockRequestInterceptorUse,
      eject: jest.fn(),
    },
    response: {
      use: mockResponseInterceptorUse,
      eject: jest.fn(),
    },
  },

  // Default headers and config
  defaults: {
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {},
    },
    timeout: 0,
    baseURL: '',
  },

  // Helper to reset all mocks
  mockReset() {
    jest.clearAllMocks();
    return this;
  },
} as unknown as MockAxiosInstance;

// Create the mock axios module
const mockAxios = {
  create: jest.fn().mockReturnValue(mockAxiosInstance),
  request: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
  isAxiosError: jest.fn().mockReturnValue(true),
  CancelToken: {
    source: jest.fn().mockReturnValue({
      token: 'mock-token',
      cancel: jest.fn(),
    }),
  },
};

// Mock axios module
jest.mock('axios', () => mockAxios);

/**
 * Reset all axios mocks between tests
 */
export function resetAxiosMocks(): void {
  mockAxios.create.mockClear();
  mockAxiosInstance.request.mockClear();
  mockAxiosInstance.get.mockClear();
  mockAxiosInstance.post.mockClear();
  mockAxiosInstance.put.mockClear();
  mockAxiosInstance.delete.mockClear();
  mockAxiosInstance.patch.mockClear();
  mockResponseInterceptorUse.mockClear();
  mockRequestInterceptorUse.mockClear();
}

/**
 * Mock a successful response for any axios request
 * @param responseData The data to include in the response
 * @param status HTTP status code (default: 200)
 */
export function mockSuccessResponse(responseData: any, status = 200): void {
  const response = {
    data: responseData,
    status,
    statusText: status === 200 ? 'OK' : 'Created',
    headers: {},
    config: {},
  };

  mockAxiosInstance.request.mockResolvedValue(response);
  mockAxiosInstance.get.mockResolvedValue(response);
  mockAxiosInstance.post.mockResolvedValue(response);
  mockAxiosInstance.put.mockResolvedValue(response);
  mockAxiosInstance.delete.mockResolvedValue(response);
  mockAxiosInstance.patch.mockResolvedValue(response);
}

/**
 * Mock an error response for any axios request
 * @param errorData The error data to include in the response
 * @param status HTTP status code (default: 400)
 */
export function mockErrorResponse(errorData: any, status = 400): void {
  const error = {
    response: {
      data: errorData,
      status,
      statusText: 'Error',
      headers: {},
      config: {},
    },
  };

  mockAxiosInstance.request.mockRejectedValue(error);
  mockAxiosInstance.get.mockRejectedValue(error);
  mockAxiosInstance.post.mockRejectedValue(error);
  mockAxiosInstance.put.mockRejectedValue(error);
  mockAxiosInstance.delete.mockRejectedValue(error);
  mockAxiosInstance.patch.mockRejectedValue(error);
}

/**
 * Mock a network error for any axios request
 * @param message Error message
 */
export function mockNetworkError(message = 'Network Error'): void {
  const error = new Error(message);
  error.name = 'NetworkError';

  mockAxiosInstance.request.mockRejectedValue(error);
  mockAxiosInstance.get.mockRejectedValue(error);
  mockAxiosInstance.post.mockRejectedValue(error);
  mockAxiosInstance.put.mockRejectedValue(error);
  mockAxiosInstance.delete.mockRejectedValue(error);
  mockAxiosInstance.patch.mockRejectedValue(error);
}

// Export the mock instance for direct manipulation in tests
export {
  mockAxiosInstance,
  mockResponseInterceptorUse,
  mockRequestInterceptorUse,
};
export default mockAxios;
