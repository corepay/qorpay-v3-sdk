import type {
  PaymentCardRequest,
  PaymentAchRequest,
  CustomerRequest,
  CreateCardTokenRequest,
  CreateAchTokenRequest,
} from '../../src/types';

/**
 * Factory for creating mock payment requests
 */
export const createMockPaymentCardRequest = (
  overrides: Partial<PaymentCardRequest> = {}
): PaymentCardRequest => ({
  amount: '10.00',
  creditcard: '4111111111111111',
  month: '12',
  year: '2025',
  cvv: '123',
  order_id: 'test-order-123',
  currency: 'USD',
  ...overrides,
});

/**
 * Factory for creating mock ACH requests
 */
export const createMockPaymentAchRequest = (
  overrides: Partial<PaymentAchRequest> = {}
): PaymentAchRequest => ({
  amount: '10.00',
  routing_number: '021000021',
  account_number: '123456789',
  account_type: 'checking',
  first_name: 'John',
  last_name: 'Doe',
  order_id: 'test-order-123',
  ...overrides,
});

/**
 * Factory for creating mock customer requests
 */
export const createMockCustomerRequest = (
  overrides: Partial<CustomerRequest> = {}
): CustomerRequest => ({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: {
    address1: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postal_code: '12345',
    country: 'US',
  },
  ...overrides,
});

/**
 * Factory for creating mock card token requests
 */
export const createMockCardTokenRequest = (
  overrides: Partial<CreateCardTokenRequest> = {}
): CreateCardTokenRequest => ({
  creditcard: '4111111111111111',
  month: '12',
  year: '2025',
  cvv: '123',
  customer_id: 'cust_123',
  ...overrides,
});

/**
 * Factory for creating mock ACH token requests
 */
export const createMockAchTokenRequest = (
  overrides: Partial<CreateAchTokenRequest> = {}
): CreateAchTokenRequest => ({
  routing_number: '021000021',
  account_number: '123456789',
  account_type: 'checking',
  first_name: 'John',
  last_name: 'Doe',
  customer_id: 'cust_123',
  ...overrides,
});

/**
 * Various invalid card numbers for testing
 */
export const INVALID_CARD_NUMBERS = [
  '411111111111111', // Too short
  '41111111111111111', // Too long
  '1234567890123456', // Invalid Luhn
  '411111111111112', // Fails Luhn
  '', // Empty
  'not-a-number', // Non-numeric
];

/**
 * Valid card numbers for testing
 */
export const VALID_CARD_NUMBERS = [
  '4111111111111111', // Visa
  '5555555555554444', // Mastercard
  '378282246310005', // American Express
  '6011111111111117', // Discover
];

/**
 * Invalid emails for testing
 */
export const INVALID_EMAILS = [
  '',
  'not-an-email',
  'missing@domain',
  '@missing-user',
  'multiple@@at.com',
  'no dot@domain',
];

/**
 * Valid emails for testing
 */
export const VALID_EMAILS = [
  'simple@example.com',
  'very.common@example.com',
  'disposable.style.email.with+symbol@example.com',
  'user.name+tag+sorting@example.com',
];
