/**
 * @file tests/integration/setup/msw-server.ts
 * @description MSW server setup for QorPay V3 SDK integration tests
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { QORPAY_BASE_URLS } from '../../../src/types/common';

// Base URL patterns for QorPay API
const API_URL_PATTERNS = {
  sandbox: QORPAY_BASE_URLS.sandbox,
  production: QORPAY_BASE_URLS.production,
};

// Types for mock responses
interface MockResponseOptions {
  status?: number;
  delay?: number;
  data?: any;
  errorCode?: string;
  errorMessage?: string;
}

// Store custom handlers for runtime modification
let customHandlers: any[] = [];

// Authentication validation
const validateAuth = (req: any) => {
  const appKey = req.headers.get('Qor-App-Key');
  const clientKey = req.headers.get('Qor-Client-Key');

  if (!appKey) {
    return { valid: false, error: 'Missing Qor-App-Key header' };
  }

  if (!clientKey) {
    return { valid: false, error: 'Missing Qor-Client-Key header' };
  }

  // For testing purposes, we'll accept specific test keys
  const validTestAppKey = 'T6554252567241061980';
  const validTestClientKey = '01dffeb784c64d098c8c691ea589eb82';

  if (appKey !== validTestAppKey || clientKey !== validTestClientKey) {
    return { valid: false, error: 'Invalid API credentials' };
  }

  return { valid: true };
};

// Helper functions for response generation
const createSuccessResponse = (data: any = {}) => {
  return {
    status: 'approved',
    code: 'GW00',
    message: 'Success',
    data,
  };
};

const createErrorResponse = (message: string, code: string) => {
  return {
    status: 'error',
    code,
    message,
  };
};

// Generate realistic transaction IDs
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `txn_${timestamp}${random}`;
};

// Generate realistic token values
const generateToken = () => {
  const prefix = Math.floor(100000 + Math.random() * 900000);
  const suffix = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}$${suffix}`;
};

// Default mock data
const mockCardData = {
  transaction_id: generateTransactionId(),
  amount: '49.95',
  currency: 'USD',
  status: 'approved',
  created_at: new Date().toISOString(),
  card: {
    last4: '1111',
    brand: 'visa',
    exp_month: '12',
    exp_year: '25',
  },
  auth_code: 'A12345',
  avs_result: 'Y',
  cvv_result: 'M',
};

const mockAchData = {
  transaction_id: generateTransactionId(),
  amount: '250.00',
  status: 'pending',
  created_at: new Date().toISOString(),
  account: {
    last4: '3210',
    routing: '021000021',
    type: 'checking',
    holder_name: 'John Doe',
  },
  estimated_settlement_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
};

const mockTokenData = {
  token: generateToken(),
  card_brand: 'visa',
  card_type: 'credit',
  last4: '1111',
  exp_month: '12',
  exp_year: '25',
  created_at: new Date().toISOString(),
};

const mockCardValidationData = {
  valid: true,
  brand: 'visa',
  type: 'credit',
  country: 'US',
  bank: 'JPMORGAN CHASE BANK, N.A.',
};

const mockBinLookupData = {
  bin: '411111',
  brand: 'visa',
  type: 'credit',
  category: 'consumer',
  country: 'US',
  bank_name: 'JPMORGAN CHASE BANK, N.A.',
  bank_url: 'https://www.chase.com',
  bank_phone: '1-800-432-3117',
  bank_city: 'New York',
};

// Create response with appropriate status and delay
const createResponse = async (
  options: MockResponseOptions = {}
) => {
  const { status = 200, delay: delayMs = 0, data, errorCode, errorMessage } = options;

  const responseBody = errorCode
    ? createErrorResponse(errorMessage || 'An error occurred', errorCode)
    : createSuccessResponse(data);

  // Apply delay if specified
  if (delayMs > 0) {
    await delay(delayMs);
  }

  // Return response with appropriate status code
  return HttpResponse.json(responseBody, { status });
};

// Create a handler for a specific endpoint
const createHandler = (
  method: 'get' | 'post' | 'put' | 'delete',
  path: string,
  defaultData: any,
  requiresAuth: boolean = true
) => {
  // Create handlers for both sandbox and production URLs
  return Object.values(API_URL_PATTERNS).map((baseUrl) =>
    http[method](`${baseUrl}${path}`, async ({ request }) => {
      // Check authentication if required
      if (requiresAuth) {
        const authCheck = validateAuth(request);
        if (!authCheck.valid) {
          return createResponse({
            status: 401,
            errorCode: 'AUTH01',
            errorMessage: authCheck.error,
          });
        }
      }

      // Look for custom handler first
      const customHandler = customHandlers.find(
        (h) => h.method === method && h.path === path
      );

      if (customHandler) {
        return customHandler.handler(request);
      }

      // Default success response
      return createResponse({ data: defaultData });
    })
  );
};

// Define handlers for key endpoints
const handlers = [
  // Card payment endpoints
  ...createHandler('post', '/payment/sale/manual/', mockCardData),
  ...createHandler('post', '/payment/sale/token', mockCardData),
  ...createHandler('post', '/payment/authorize', {
    ...mockCardData,
    status: 'authorized',
  }),
  ...createHandler('post', '/payment/authorize/token', {
    ...mockCardData,
    status: 'authorized',
  }),
  ...createHandler('post', '/payment/capture', {
    ...mockCardData,
    status: 'captured',
  }),
  ...createHandler('post', '/payment/refund', {
    ...mockCardData,
    status: 'refunded',
    refund_id: generateTransactionId(),
  }),
  ...createHandler('post', '/payment/void', {
    ...mockCardData,
    status: 'voided',
  }),

  // ACH payment endpoints
  ...createHandler('post', '/payment/ach/debit', mockAchData),
  ...createHandler('post', '/payment/ach/credit', {
    ...mockAchData,
    transaction_id: generateTransactionId(),
  }),
  ...createHandler('post', '/payment/ach/refund', {
    ...mockAchData,
    status: 'refunded',
    refund_id: generateTransactionId(),
  }),
  ...createHandler('post', '/payment/ach/void', {
    ...mockAchData,
    status: 'voided',
  }),
  ...createHandler('post', '/payment/ach/verify', {
    verification_id: generateTransactionId(),
    status: 'pending',
    created_at: new Date().toISOString(),
  }),
  ...createHandler('get', '/payment/ach/transaction/:id', mockAchData),

  // Payment token endpoints
  ...createHandler('post', '/payment/token/card', mockTokenData),
  ...createHandler('post', '/payment/token/ach', {
    token: generateToken(),
    account_type: 'checking',
    last4: '3210',
    routing: '021000021',
    created_at: new Date().toISOString(),
  }),
  ...createHandler('get', '/payment/token/card/:token', mockTokenData),
  ...createHandler('delete', '/payment/token/card/:token', {
    deleted: true,
    token: ':token',
  }),

  // Utility endpoints
  ...createHandler('post', '/utils/validate-card', mockCardValidationData),
  ...createHandler('post', '/utils/validate-cvv', { valid: true }),
  ...createHandler('post', '/utils/validate-expiration', { valid: true }),
  ...createHandler('post', '/utils/validate-routing', {
    valid: true,
    bank_name: 'JP MORGAN CHASE',
    location: 'NEW YORK, NY',
  }),
  ...createHandler('post', '/utils/validate-address', {
    valid: true,
    normalized_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'US'
    }
  }),
  ...createHandler('post', '/utils/validate-tax-id', {
    valid: true,
    type: 'EIN'
  }),
  ...createHandler('get', '/utils/bin-lookup/:bin', mockBinLookupData),
  ...createHandler('get', '/utils/check-avs', {
    avs_code: 'Y',
    avs_message: 'Street address and 5-digit postal code match',
    cvv_code: 'M',
    cvv_message: 'CVV match',
  }),
  ...createHandler('get', '/utils/test-card', {
    card_number: '4111111111111111',
    brand: 'visa',
    exp_month: '12',
    exp_year: '25',
    cvv: '123',
  }),
  ...createHandler('get', '/utils/time', {
    timestamp: Math.floor(Date.now() / 1000),
    iso_date: new Date().toISOString(),
  }),

  // Customer endpoints
  ...createHandler('post', '/customer', {
    customer_id: `cust_${generateTransactionId().substring(4)}`,
    email: 'customer@example.com',
    created_at: new Date().toISOString(),
  }),
  ...createHandler('get', '/customer/:id', {
    customer_id: ':id',
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe',
    created_at: new Date().toISOString(),
  }),

  // Transaction endpoints
  ...createHandler('get', '/transaction/:id', mockCardData),
  ...createHandler('get', '/transactions', {
    transactions: [mockCardData, { ...mockCardData, transaction_id: generateTransactionId() }],
    count: 2,
    limit: 10,
    offset: 0,
  }),
];

// Create the MSW server
const server = setupServer(...handlers);

// Helper functions for tests
export const mswServer = {
  // Start the server
  start: () => {
    server.listen({ onUnhandledRequest: 'warn' });
    console.log('🔶 MSW Server started');
  },

  // Stop the server
  stop: () => {
    customHandlers = [];
    server.close();
    console.log('🔶 MSW Server stopped');
  },

  // Reset all handlers to default
  reset: () => {
    customHandlers = [];
    server.resetHandlers();
    console.log('🔶 MSW Handlers reset');
  },

  // Add a custom handler for a specific endpoint
  mockEndpoint: (
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    options: MockResponseOptions = {}
  ) => {
    const handler = {
      method,
      path,
      handler: async () => {
        return createResponse(options);
      },
    };

    customHandlers.push(handler);
    return handler;
  },

  // Mock an authentication failure
  mockAuthFailure: () => {
    Object.values(API_URL_PATTERNS).forEach((baseUrl) => {
      server.use(
        http.all(`${baseUrl}/*`, async () => {
          return createResponse({
            status: 401,
            errorCode: 'AUTH01',
            errorMessage: 'Invalid API credentials',
          });
        })
      );
    });
  },

  // Mock a rate limit error
  mockRateLimit: () => {
    Object.values(API_URL_PATTERNS).forEach((baseUrl) => {
      server.use(
        http.all(`${baseUrl}/*`, async () => {
          return createResponse({
            status: 429,
            errorCode: 'RATE01',
            errorMessage: 'Rate limit exceeded. Try again in 60 seconds.',
          });
        })
      );
    });
  },

  // Mock a server error
  mockServerError: () => {
    Object.values(API_URL_PATTERNS).forEach((baseUrl) => {
      server.use(
        http.all(`${baseUrl}/*`, async () => {
          return createResponse({
            status: 500,
            errorCode: 'SERVER01',
            errorMessage: 'Internal server error',
          });
        })
      );
    });
  },

  // Mock a network timeout
  mockTimeout: (delayMs: number = 30000) => {
    Object.values(API_URL_PATTERNS).forEach((baseUrl) => {
      server.use(
        http.all(`${baseUrl}/*`, async () => {
          return createResponse({ delay: delayMs });
        })
      );
    });
  },

  // Get the current handlers
  getHandlers: () => handlers,

  // Get custom handlers
  getCustomHandlers: () => customHandlers,

  // Raw server access for advanced usage
  server,
};

export default mswServer;
