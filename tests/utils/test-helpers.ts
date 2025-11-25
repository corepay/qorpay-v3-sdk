import { QorPayError, QorPayApiError, QorPayNetworkError } from '../../src/errors';

/**
 * Creates a mock QorPay error for testing
 */
export function createMockQorPayError(
  message: string,
  code?: string | number
): QorPayError {
  return new QorPayError(message, code);
}

/**
 * Creates a mock API error for testing
 */
export function createMockApiError(
  message: string,
  status: number,
  code?: string | number
): QorPayApiError {
  return new QorPayApiError(message, status, code);
}

/**
 * Creates a mock network error for testing
 */
export function createMockNetworkError(message: string): QorPayNetworkError {
  const error = new Error(message) as any;
  error.code = 'NETWORK_ERROR';
  return QorPayNetworkError.fromError(error);
}

/**
 * Helper to assert the structure of API responses
 */
export function expectValidQorPayResponse(response: any) {
  expect(response).toHaveProperty('status');
  expect(['success', 'error']).toContain(response.status);
}

/**
 * Helper to create mock Axios responses
 */
export function createMockAxiosResponse(data: any, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

/**
 * Helper to create mock Axios errors
 */
export function createMockAxiosError(
  message: string,
  status?: number,
  response?: any
): any {
  const error = new Error(message) as any;
  error.isAxiosError = true;
  if (status) {
    error.response = {
      status,
      data: response || { message, status: 'error' },
    };
  }
  return error;
}