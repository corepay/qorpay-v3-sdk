/**
 * @file tests/unit/error-codes.test.ts
 * @description Tests for error codes utilities
 */

import {
  QorPayErrorCode,
  QorPayErrorMessages,
  getErrorMessage,
  isClientErrorCode,
  isServerErrorCode,
  isRetryableError,
  getRetryDelay,
} from '../../src/utils/error-codes';

describe('QorPayErrorCode', () => {
  it('should have correct values for common error codes', () => {
    expect(QorPayErrorCode.SUCCESS).toBe('0000');
    expect(QorPayErrorCode.CARD_DECLINED).toBe('4006');
    expect(QorPayErrorCode.INSUFFICIENT_FUNDS).toBe('4005');
    expect(QorPayErrorCode.INVALID_API_KEYS).toBe('4101');
    expect(QorPayErrorCode.RATE_LIMIT_EXCEEDED).toBe('4297');
    expect(QorPayErrorCode.INTERNAL_SERVER_ERROR).toBe('5001');
  });
});

describe('QorPayErrorMessages', () => {
  it('should have messages for all error codes', () => {
    expect(QorPayErrorMessages[QorPayErrorCode.SUCCESS]).toBe(
      'Transaction successful'
    );
    expect(QorPayErrorMessages[QorPayErrorCode.CARD_DECLINED]).toBe(
      'Card declined'
    );
    expect(QorPayErrorMessages[QorPayErrorCode.INSUFFICIENT_FUNDS]).toBe(
      'Insufficient funds'
    );
    expect(QorPayErrorMessages[QorPayErrorCode.INVALID_API_KEYS]).toBe(
      'Invalid API keys'
    );
  });

  it('should handle all defined error codes', () => {
    const allCodes = Object.values(QorPayErrorCode);
    allCodes.forEach((code) => {
      expect(QorPayErrorMessages[code]).toBeDefined();
      expect(typeof QorPayErrorMessages[code]).toBe('string');
    });
  });
});

describe('getErrorMessage', () => {
  it('should return the correct message for known error codes', () => {
    expect(getErrorMessage(QorPayErrorCode.CARD_DECLINED)).toBe(
      'Card declined'
    );
    expect(getErrorMessage('4006')).toBe('Card declined');
  });

  it('should return default message for unknown error codes', () => {
    expect(getErrorMessage('9999')).toBe('Unknown error');
    expect(getErrorMessage('UNKNOWN')).toBe('Unknown error');
  });
});

describe('isClientErrorCode', () => {
  it('should identify client error codes (4xx)', () => {
    expect(isClientErrorCode(QorPayErrorCode.CARD_DECLINED)).toBe(true);
    expect(isClientErrorCode(QorPayErrorCode.INVALID_API_KEYS)).toBe(true);
    expect(isClientErrorCode('4001')).toBe(true);
    expect(isClientErrorCode('4999')).toBe(true);
  });

  it('should identify network error codes', () => {
    expect(isClientErrorCode(QorPayErrorCode.NETWORK_TIMEOUT)).toBe(true);
    expect(isClientErrorCode(QorPayErrorCode.CONNECTION_REFUSED)).toBe(true);
    expect(isClientErrorCode('E001')).toBe(true);
  });

  it('should not identify server error codes as client errors', () => {
    expect(isClientErrorCode(QorPayErrorCode.INTERNAL_SERVER_ERROR)).toBe(
      false
    );
    expect(isClientErrorCode('5001')).toBe(false);
  });

  it('should treat success as client error', () => {
    expect(isClientErrorCode(QorPayErrorCode.SUCCESS)).toBe(true);
  });
});

describe('isServerErrorCode', () => {
  it('should identify server error codes (5xx)', () => {
    expect(isServerErrorCode(QorPayErrorCode.INTERNAL_SERVER_ERROR)).toBe(true);
    expect(isServerErrorCode(QorPayErrorCode.DATABASE_ERROR)).toBe(true);
    expect(isServerErrorCode('5001')).toBe(true);
    expect(isServerErrorCode('5999')).toBe(true);
  });

  it('should not identify client error codes as server errors', () => {
    expect(isServerErrorCode(QorPayErrorCode.CARD_DECLINED)).toBe(false);
    expect(isServerErrorCode('4001')).toBe(false);
    expect(isServerErrorCode(QorPayErrorCode.NETWORK_TIMEOUT)).toBe(false);
  });
});

describe('isRetryableError', () => {
  it('should identify retryable errors', () => {
    expect(isRetryableError(QorPayErrorCode.RATE_LIMIT_EXCEEDED)).toBe(true);
    expect(isRetryableError(QorPayErrorCode.TIMEOUT)).toBe(true);
    expect(isRetryableError(QorPayErrorCode.NETWORK_TIMEOUT)).toBe(true);
    expect(isRetryableError(QorPayErrorCode.CONNECTION_REFUSED)).toBe(true);
    expect(isRetryableError(QorPayErrorCode.INTERNAL_SERVER_ERROR)).toBe(true);
    expect(isRetryableError(QorPayErrorCode.PAYMENT_PROCESSOR_DOWN)).toBe(true);
  });

  it('should not identify non-retryable errors', () => {
    expect(isRetryableError(QorPayErrorCode.CARD_DECLINED)).toBe(false);
    expect(isRetryableError(QorPayErrorCode.INSUFFICIENT_FUNDS)).toBe(false);
    expect(isRetryableError(QorPayErrorCode.INVALID_API_KEYS)).toBe(false);
    expect(isRetryableError(QorPayErrorCode.INVALID_CARD_NUMBER)).toBe(false);
  });
});

describe('getRetryDelay', () => {
  it('should return appropriate delay for different error codes', () => {
    // Rate limit should have longer delay
    expect(
      getRetryDelay(QorPayErrorCode.RATE_LIMIT_EXCEEDED)
    ).toBeGreaterThanOrEqual(5000);

    // Network errors should have moderate delay
    expect(
      getRetryDelay(QorPayErrorCode.NETWORK_TIMEOUT)
    ).toBeGreaterThanOrEqual(2000);

    // Default should be 1 second
    expect(getRetryDelay('9999')).toBeGreaterThanOrEqual(1000);
  });

  it('should implement exponential backoff', () => {
    const baseDelay = getRetryDelay(QorPayErrorCode.TIMEOUT, 1);
    const secondDelay = getRetryDelay(QorPayErrorCode.TIMEOUT, 2);
    const thirdDelay = getRetryDelay(QorPayErrorCode.TIMEOUT, 3);

    expect(secondDelay).toBeGreaterThan(baseDelay);
    expect(thirdDelay).toBeGreaterThan(secondDelay);
  });

  it('should not exceed maximum delay', () => {
    const maxDelay = 30000; // 30 seconds
    const delay = getRetryDelay(QorPayErrorCode.RATE_LIMIT_EXCEEDED, 10);
    expect(delay).toBeLessThanOrEqual(maxDelay);
  });

  it('should include jitter to prevent thundering herd', () => {
    // Multiple calls should return slightly different delays due to jitter
    const delay1 = getRetryDelay(QorPayErrorCode.TIMEOUT, 1);
    const delay2 = getRetryDelay(QorPayErrorCode.TIMEOUT, 1);
    const delay3 = getRetryDelay(QorPayErrorCode.TIMEOUT, 1);

    // With jitter, not all delays should be exactly the same
    const uniqueDelays = new Set([delay1, delay2, delay3]);
    expect(uniqueDelays.size).toBeGreaterThan(1);
  });
});

describe('Error Code Categories', () => {
  it('should properly categorize card processing errors', () => {
    const cardErrors = [
      QorPayErrorCode.INVALID_CARD_NUMBER,
      QorPayErrorCode.CARD_DECLINED,
      QorPayErrorCode.INSUFFICIENT_FUNDS,
    ];

    cardErrors.forEach((code) => {
      expect(isClientErrorCode(code)).toBe(true);
      expect(isRetryableError(code)).toBe(false); // Card errors are not retryable
    });
  });

  it('should properly categorize authentication errors', () => {
    const authErrors = [
      QorPayErrorCode.INVALID_API_KEYS,
      QorPayErrorCode.UNAUTHORIZED,
      QorPayErrorCode.TOKEN_EXPIRED,
    ];

    authErrors.forEach((code) => {
      expect(isClientErrorCode(code)).toBe(true);
      expect(isRetryableError(code)).toBe(false); // Auth errors are not retryable
    });
  });

  it('should properly categorize server errors', () => {
    const serverErrors = [
      QorPayErrorCode.INTERNAL_SERVER_ERROR,
      QorPayErrorCode.DATABASE_ERROR,
      QorPayErrorCode.SERVICE_UNAVAILABLE,
    ];

    serverErrors.forEach((code) => {
      expect(isServerErrorCode(code)).toBe(true);
      expect(isRetryableError(code)).toBe(true); // Server errors are retryable
    });
  });

  it('should properly categorize network errors', () => {
    const networkErrors = [
      QorPayErrorCode.NETWORK_TIMEOUT,
      QorPayErrorCode.CONNECTION_REFUSED,
      QorPayErrorCode.SSL_ERROR,
    ];

    networkErrors.forEach((code) => {
      expect(isClientErrorCode(code)).toBe(true);
      expect(isRetryableError(code)).toBe(true); // Network errors are retryable
    });
  });
});
