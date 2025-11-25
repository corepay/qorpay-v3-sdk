import type { BaseQorPayResponse } from '../../src/types/common';

/**
 * Creates a mock success response
 */
export function createMockSuccessResponse<T = any>(
  data: T,
  overrides: Partial<BaseQorPayResponse> = {}
): BaseQorPayResponse & { data: T; status: 'success' } {
  return {
    status: 'success',
    code: '000',
    message: 'Success',
    data,
    ...overrides,
  };
}

/**
 * Creates a mock error response
 */
export function createMockErrorResponse(
  message: string,
  code = 'ERROR',
  overrides: Partial<BaseQorPayResponse> = {}
): BaseQorPayResponse & { status: 'error' } {
  return {
    status: 'error',
    code,
    message,
    data: null,
    ...overrides,
  };
}

/**
 * Mock payment success response
 */
export const MOCK_PAYMENT_SUCCESS_RESPONSE = createMockSuccessResponse({
  transaction_id: 'txn_1234567890',
  amount: '10.00',
  currency: 'USD',
  status: 'approved',
  created_at: '2025-01-25T12:00:00Z',
});

/**
 * Mock payment error response
 */
export const MOCK_PAYMENT_ERROR_RESPONSE = createMockErrorResponse(
  'Payment declined',
  'DECLINED'
);

/**
 * Mock customer success response
 */
export const MOCK_CUSTOMER_SUCCESS_RESPONSE = createMockSuccessResponse({
  customer_id: 'cust_123456',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  created_at: '2025-01-25T12:00:00Z',
  updated_at: '2025-01-25T12:00:00Z',
});

/**
 * Mock ACH return response
 */
export const MOCK_ACH_RETURN_RESPONSE = createMockSuccessResponse({
  return_id: 'ret_1234567890',
  original_transaction_id: 'txn_1234567890',
  amount: '10.00',
  return_code: 'R01',
  return_reason: 'Insufficient Funds',
  created_at: '2025-01-25T12:00:00Z',
});

/**
 * Mock validation error response
 */
export const MOCK_VALIDATION_ERROR_RESPONSE = createMockErrorResponse(
  'Validation failed',
  'VALIDATION_ERROR',
  {
    errors: [
      { field: 'amount', message: 'Invalid amount' },
      { field: 'creditcard', message: 'Invalid card number' },
    ],
  }
);

/**
 * Mock network error (no response)
 */
export const MOCK_NETWORK_ERROR = {
  code: 'NETWORK_ERROR',
  errno: 'ECONNRESET',
  message: 'Network Error',
};

/**
 * Mock timeout error
 */
export const MOCK_TIMEOUT_ERROR = {
  code: 'ECONNABORTED',
  message: 'timeout of 30000ms exceeded',
};
