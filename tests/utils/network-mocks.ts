/**
 * @file tests/utils/network-mocks.ts
 * @description Utilities for mocking network layer (axios) in tests without mocking our own code
 */

import axios from 'axios';
import { createMockAxiosResponse, createMockAxiosError } from './test-helpers';

// Mock axios and axios-retry at module level
jest.mock('axios');
jest.mock('axios-retry');

// Mock axios at the network level only
export const mockAxiosInstance = {
  request: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

// Setup axios mocking before each test
export function setupNetworkMocks() {
  const mockAxios = axios as jest.Mocked<typeof axios>;

  // Ensure the mock functions exist
  if (!mockAxios.create) {
    mockAxios.create = jest.fn();
  }

  mockAxios.create.mockReturnValue(mockAxiosInstance as any);
  mockAxiosInstance.request.mockResolvedValue(createMockAxiosResponse({}));

  return {
    mockAxios,
    mockAxiosInstance,
  };
}

// Reset all network mocks after each test
export function resetNetworkMocks() {
  jest.clearAllMocks();
  mockAxiosInstance.request.mockReset();
  mockAxiosInstance.get.mockReset();
  mockAxiosInstance.post.mockReset();
  mockAxiosInstance.put.mockReset();
  mockAxiosInstance.patch.mockReset();
  mockAxiosInstance.delete.mockReset();
}

// Helper to mock successful API responses
export function mockSuccessfulResponse(data: any, status = 200) {
  mockAxiosInstance.request.mockResolvedValue(
    createMockAxiosResponse(data, status)
  );
  return mockAxiosInstance.request;
}

// Helper to mock failed API responses
export function mockFailedResponse(
  message: string,
  status = 400,
  responseData?: any
) {
  mockAxiosInstance.request.mockRejectedValue(
    createMockAxiosError(message, status, responseData)
  );
  return mockAxiosInstance.request;
}

// Helper to mock network errors
export function mockNetworkError(message = 'Network Error') {
  const error = new Error(message);
  (error as any).code = 'ENOTFOUND';
  mockAxiosInstance.request.mockRejectedValue(error);
  return mockAxiosInstance.request;
}

// Helper to verify API calls
export function expectApiCall(
  method: string,
  url: string,
  data?: any,
  params?: any
) {
  expect(mockAxiosInstance.request).toHaveBeenCalledWith(
    expect.objectContaining({
      method,
      url,
      ...(data && { data }),
      ...(params && { params }),
    })
  );
}

// Helper to get the actual request data from the last call
export function getLastRequest() {
  return mockAxiosInstance.request.mock.calls[
    mockAxiosInstance.request.mock.calls.length - 1
  ][0];
}
