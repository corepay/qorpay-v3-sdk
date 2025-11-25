/**
 * @file src/utils/error-codes.ts
 * @description Centralized error codes for better error handling
 */

/**
 * QorPay API Error Codes
 * Based on common payment processing error scenarios
 */
export enum QorPayErrorCode {
  // =========================
  // SUCCESS CODES
  // =========================
  SUCCESS = '0000',

  // =========================
  // CARD PROCESSING ERRORS
  // =========================
  // Card validation errors (4xx)
  INVALID_CARD_NUMBER = '4001',
  INVALID_EXPIRY_DATE = '4002',
  INVALID_CVV = '4003',
  CARD_EXPIRED = '4004',
  INSUFFICIENT_FUNDS = '4005',
  CARD_DECLINED = '4006',
  LIMIT_EXCEEDED = '4007',
  RESTRICTED_CARD = '4008',
  INVALID_CURRENCY = '4009',
  PROCESSOR_ERROR = '4010',

  // =========================
  // AUTHENTICATION ERRORS
  // =========================
  INVALID_API_KEYS = '4101',
  API_KEY_EXPIRED = '4102',
  INVALID_SIGNATURE = '4103',
  INVALID_TOKEN = '4104',
  TOKEN_EXPIRED = '4105',
  UNAUTHORIZED = '4106',
  FORBIDDEN = '4107',

  // =========================
  // REQUEST VALIDATION ERRORS
  // =========================
  INVALID_REQUEST_DATA = '4201',
  MISSING_REQUIRED_FIELD = '4202',
  INVALID_FIELD_FORMAT = '4203',
  DUPLICATE_REQUEST = '4204',
  REQUEST_TOO_LARGE = '4205',

  // =========================
  // BUSINESS LOGIC ERRORS
  // =========================
  TRANSACTION_NOT_FOUND = '4301',
  INVALID_TRANSACTION_STATE = '4302',
  REFUND_EXCEEDED = '4303',
  INVALID_REFUND_AMOUNT = '4304',
  ALREADY_REFUNDED = '4305',
  REFUND_PERIOD_EXPIRED = '4306',
  SUBSCRIPTION_NOT_FOUND = '4307',
  SUBSCRIPTION_ALREADY_ACTIVE = '4308',
  SUBSCRIPTION_ALREADY_CANCELLED = '4309',
  CUSTOMER_NOT_FOUND = '4310',
  PAYMENT_METHOD_NOT_FOUND = '4311',
  PAYMENT_METHOD_ALREADY_USED = '4312',

  // =========================
  // RATE LIMITING ERRORS
  // =========================
  RATE_LIMIT_EXCEEDED = '4297',
  QUOTA_EXCEEDED = '4298',
  TEMPORARY_BLOCK = '4299',

  // =========================
  // SERVER ERRORS (5xx)
  // =========================
  INTERNAL_SERVER_ERROR = '5001',
  DATABASE_ERROR = '5002',
  EXTERNAL_API_ERROR = '5003',
  PAYMENT_PROCESSOR_DOWN = '5004',
  TIMEOUT = '5005',
  SERVICE_UNAVAILABLE = '5006',

  // =========================
  // NETWORK ERRORS
  // =========================
  NETWORK_TIMEOUT = 'E001',
  CONNECTION_REFUSED = 'E002',
  DNS_RESOLUTION_FAILED = 'E003',
  SSL_ERROR = 'E004',
  INVALID_RESPONSE = 'E005',

  // =========================
  // ACH PROCESSING ERRORS
  // =========================
  INVALID_ACCOUNT_NUMBER = '4401',
  INVALID_ROUTING_NUMBER = '4402',
  ACCOUNT_NOT_VERIFIED = '4403',
  INSUFFICIENT_ACH_FUNDS = '4404',
  ACH_RETURNED = '4405',
  INVALID_ACH_AMOUNT = '4406',

  // =========================
  // FRAUD ERRORS
  // =========================
  SUSPICIOUS_ACTIVITY = '4501',
  FRAUD_DETECTED = '4502',
  BLACKLISTED_CARD = '4503',
  BLACKLISTED_IP = '4504',
  VELOCITY_LIMIT_EXCEEDED = '4505',
}

/**
 * Maps error codes to human-readable messages
 */
export const QorPayErrorMessages: Record<QorPayErrorCode, string> = {
  [QorPayErrorCode.SUCCESS]: 'Transaction successful',

  // Card processing errors
  [QorPayErrorCode.INVALID_CARD_NUMBER]: 'Invalid card number',
  [QorPayErrorCode.INVALID_EXPIRY_DATE]: 'Invalid expiry date',
  [QorPayErrorCode.INVALID_CVV]: 'Invalid CVV',
  [QorPayErrorCode.CARD_EXPIRED]: 'Card has expired',
  [QorPayErrorCode.INSUFFICIENT_FUNDS]: 'Insufficient funds',
  [QorPayErrorCode.CARD_DECLINED]: 'Card declined',
  [QorPayErrorCode.LIMIT_EXCEEDED]: 'Transaction limit exceeded',
  [QorPayErrorCode.RESTRICTED_CARD]: 'Card is restricted for this transaction',
  [QorPayErrorCode.INVALID_CURRENCY]: 'Invalid currency',
  [QorPayErrorCode.PROCESSOR_ERROR]: 'Payment processor error',

  // Authentication errors
  [QorPayErrorCode.INVALID_API_KEYS]: 'Invalid API keys',
  [QorPayErrorCode.API_KEY_EXPIRED]: 'API key has expired',
  [QorPayErrorCode.INVALID_SIGNATURE]: 'Invalid request signature',
  [QorPayErrorCode.INVALID_TOKEN]: 'Invalid authentication token',
  [QorPayErrorCode.TOKEN_EXPIRED]: 'Authentication token has expired',
  [QorPayErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [QorPayErrorCode.FORBIDDEN]: 'Access forbidden',

  // Request validation errors
  [QorPayErrorCode.INVALID_REQUEST_DATA]: 'Invalid request data',
  [QorPayErrorCode.MISSING_REQUIRED_FIELD]: 'Missing required field',
  [QorPayErrorCode.INVALID_FIELD_FORMAT]: 'Invalid field format',
  [QorPayErrorCode.DUPLICATE_REQUEST]: 'Duplicate request detected',
  [QorPayErrorCode.REQUEST_TOO_LARGE]: 'Request too large',

  // Business logic errors
  [QorPayErrorCode.TRANSACTION_NOT_FOUND]: 'Transaction not found',
  [QorPayErrorCode.INVALID_TRANSACTION_STATE]:
    'Invalid transaction state for this operation',
  [QorPayErrorCode.REFUND_EXCEEDED]: 'Refund amount exceeds transaction amount',
  [QorPayErrorCode.INVALID_REFUND_AMOUNT]: 'Invalid refund amount',
  [QorPayErrorCode.ALREADY_REFUNDED]: 'Transaction already refunded',
  [QorPayErrorCode.REFUND_PERIOD_EXPIRED]: 'Refund period has expired',
  [QorPayErrorCode.SUBSCRIPTION_NOT_FOUND]: 'Subscription not found',
  [QorPayErrorCode.SUBSCRIPTION_ALREADY_ACTIVE]:
    'Subscription is already active',
  [QorPayErrorCode.SUBSCRIPTION_ALREADY_CANCELLED]:
    'Subscription is already cancelled',
  [QorPayErrorCode.CUSTOMER_NOT_FOUND]: 'Customer not found',
  [QorPayErrorCode.PAYMENT_METHOD_NOT_FOUND]: 'Payment method not found',
  [QorPayErrorCode.PAYMENT_METHOD_ALREADY_USED]:
    'Payment method is already in use',

  // Rate limiting errors
  [QorPayErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [QorPayErrorCode.QUOTA_EXCEEDED]: 'API quota exceeded',
  [QorPayErrorCode.TEMPORARY_BLOCK]: 'Temporary block due to too many requests',

  // Server errors
  [QorPayErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [QorPayErrorCode.DATABASE_ERROR]: 'Database error',
  [QorPayErrorCode.EXTERNAL_API_ERROR]: 'External API error',
  [QorPayErrorCode.PAYMENT_PROCESSOR_DOWN]:
    'Payment processor is temporarily unavailable',
  [QorPayErrorCode.TIMEOUT]: 'Request timeout',
  [QorPayErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',

  // Network errors
  [QorPayErrorCode.NETWORK_TIMEOUT]: 'Network timeout',
  [QorPayErrorCode.CONNECTION_REFUSED]: 'Connection refused',
  [QorPayErrorCode.DNS_RESOLUTION_FAILED]: 'DNS resolution failed',
  [QorPayErrorCode.SSL_ERROR]: 'SSL/TLS error',
  [QorPayErrorCode.INVALID_RESPONSE]: 'Invalid server response',

  // ACH processing errors
  [QorPayErrorCode.INVALID_ACCOUNT_NUMBER]: 'Invalid bank account number',
  [QorPayErrorCode.INVALID_ROUTING_NUMBER]: 'Invalid routing number',
  [QorPayErrorCode.ACCOUNT_NOT_VERIFIED]: 'Bank account not verified',
  [QorPayErrorCode.INSUFFICIENT_ACH_FUNDS]:
    'Insufficient funds in bank account',
  [QorPayErrorCode.ACH_RETURNED]: 'ACH transaction returned',
  [QorPayErrorCode.INVALID_ACH_AMOUNT]: 'Invalid ACH transaction amount',

  // Fraud errors
  [QorPayErrorCode.SUSPICIOUS_ACTIVITY]: 'Suspicious activity detected',
  [QorPayErrorCode.FRAUD_DETECTED]: 'Potential fraud detected',
  [QorPayErrorCode.BLACKLISTED_CARD]: 'Card is blacklisted',
  [QorPayErrorCode.BLACKLISTED_IP]: 'IP address is blacklisted',
  [QorPayErrorCode.VELOCITY_LIMIT_EXCEEDED]: 'Velocity limit exceeded',
};

/**
 * Gets the error message for a given error code
 */
export function getErrorMessage(code: QorPayErrorCode | string): string {
  return QorPayErrorMessages[code as QorPayErrorCode] || 'Unknown error';
}

/**
 * Checks if an error code is a client error (4xx)
 */
export function isClientErrorCode(code: QorPayErrorCode | string): boolean {
  const codeStr = code.toString();
  return (
    codeStr.startsWith('4') ||
    codeStr.startsWith('E') ||
    [QorPayErrorCode.SUCCESS].includes(code as QorPayErrorCode)
  );
}

/**
 * Checks if an error code is a server error (5xx)
 */
export function isServerErrorCode(code: QorPayErrorCode | string): boolean {
  return code.toString().startsWith('5');
}

/**
 * Checks if an error code indicates a temporary failure (retryable)
 */
export function isRetryableError(code: QorPayErrorCode | string): boolean {
  const retryableCodes = [
    QorPayErrorCode.RATE_LIMIT_EXCEEDED,
    QorPayErrorCode.TIMEOUT,
    QorPayErrorCode.NETWORK_TIMEOUT,
    QorPayErrorCode.CONNECTION_REFUSED,
    QorPayErrorCode.SSL_ERROR,
    QorPayErrorCode.INTERNAL_SERVER_ERROR,
    QorPayErrorCode.DATABASE_ERROR,
    QorPayErrorCode.EXTERNAL_API_ERROR,
    QorPayErrorCode.PAYMENT_PROCESSOR_DOWN,
    QorPayErrorCode.SERVICE_UNAVAILABLE,
  ];

  return retryableCodes.includes(code as QorPayErrorCode);
}

/**
 * Gets recommended retry delay in milliseconds for retryable errors
 */
export function getRetryDelay(
  code: QorPayErrorCode | string,
  attempt = 1
): number {
  // Base delays in milliseconds
  const baseDelays: Partial<Record<QorPayErrorCode, number>> = {
    [QorPayErrorCode.RATE_LIMIT_EXCEEDED]: 5000, // 5 seconds for rate limit
    [QorPayErrorCode.TIMEOUT]: 1000, // 1 second for timeout
    [QorPayErrorCode.NETWORK_TIMEOUT]: 2000, // 2 seconds for network timeout
    [QorPayErrorCode.CONNECTION_REFUSED]: 3000, // 3 seconds for connection refused
    [QorPayErrorCode.SSL_ERROR]: 2000, // 2 seconds for SSL errors
    [QorPayErrorCode.INTERNAL_SERVER_ERROR]: 1000, // 1 second for server errors
  };

  const baseDelay = baseDelays[code as QorPayErrorCode] || 1000;

  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter

  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}
