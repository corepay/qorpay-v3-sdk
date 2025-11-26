/**
 * Advanced Error Handling Example
 *
 * This example demonstrates comprehensive error handling patterns for the QorPay SDK,
 * including retry logic, error classification, and user-friendly error messages.
 */

import { QorPayClient, QorPayApiError, QorPayNetworkError, QorPayErrorCode } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: process.env.QORPAY_APP_KEY || 'your-sandbox-app-key',
  clientKey: process.env.QORPAY_CLIENT_KEY || 'your-sandbox-client-key',
  environment: 'sandbox',
  // Configure retry behavior
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000, // Base delay in milliseconds
    retryCondition: (error) => {
      // Only retry network errors and specific server errors
      return error.code === 'network_error' ||
             error.code === 'timeout' ||
             error.code === 'rate_limited' ||
             error.status >= 500;
    },
  },
});

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: {
    code: string;
    message: string;
    userMessage: string;
    retryable: boolean;
  };
}

async function processPaymentWithRetry(paymentData: any): Promise<PaymentResult> {
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Payment attempt ${attempt}/${maxRetries}`);

      const payment = await qorpay.payments.create(paymentData);

      console.log('✅ Payment successful:', payment.id);
      return {
        success: true,
        paymentId: payment.id,
      };
    } catch (error) {
      lastError = error as Error;

      if (error instanceof QorPayApiError) {
        const shouldRetry = isRetryableApiError(error);

        if (!shouldRetry) {
          console.log('❌ Non-retryable API error:', error.code);
          return {
            success: false,
            error: {
              code: error.code || 'unknown_error',
              message: error.message,
              userMessage: getApiUserMessage(error),
              retryable: false,
            },
          };
        }

        if (attempt < maxRetries) {
          const delay = calculateRetryDelay(attempt, error.code);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else if (error instanceof QorPayNetworkError) {
        if (attempt < maxRetries) {
          const delay = calculateRetryDelay(attempt, 'network_error');
          console.log(`🌐 Network error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else {
        // Unknown error type
        console.log('❓ Unknown error:', error.message);
        if (attempt < maxRetries) {
          console.log('⏳ Retrying in 2000ms...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: {
      code: 'max_retries_exceeded',
      message: lastError.message,
      userMessage: 'Payment processing failed after multiple attempts. Please try again later.',
      retryable: true,
    },
  };
}

function isRetryableApiError(error: QorPayApiError): boolean {
  const retryableCodes = [
    QorPayErrorCode.RATE_LIMITED,
    QorPayErrorCode.NETWORK_ERROR,
    QorPayErrorCode.TIMEOUT,
    QorPayErrorCode.SERVER_ERROR,
  ];

  return retryableCodes.includes(error.code as QorPayErrorCode) ||
         (error.status && error.status >= 500);
}

function calculateRetryDelay(attempt: number, errorCode: string): number {
  const baseDelay = 1000; // 1 second
  const exponentialBackoff = Math.pow(2, attempt - 1) * baseDelay;

  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * exponentialBackoff;

  // Adjust delay based on error type
  switch (errorCode) {
    case QorPayErrorCode.RATE_LIMITED:
      return exponentialBackoff + jitter + 2000; // Extra delay for rate limiting
    case QorPayErrorCode.TIMEOUT:
      return exponentialBackoff + jitter + 1000; // Extra delay for timeouts
    default:
      return exponentialBackoff + jitter;
  }
}

function getApiUserMessage(error: QorPayApiError): string {
  switch (error.code) {
    case QorPayErrorCode.CARD_DECLINED:
      return 'Your card was declined. Please try a different payment method or contact your bank.';

    case QorPayErrorCode.INSUFFICIENT_FUNDS:
      return 'Insufficient funds. Please use a different payment method or add funds to your account.';

    case QorPayErrorCode.INVALID_CARD:
      return 'Invalid card information. Please check your card details and try again.';

    case QorPayErrorCode.EXPIRED_CARD:
      return 'Your card has expired. Please use a different payment method.';

    case QorPayErrorCode.INVALID_CVV:
      return 'Invalid CVV. Please check your security code and try again.';

    case QorPayErrorCode.INVALID_EXPIRATION:
      return 'Invalid expiration date. Please check your card expiration and try again.';

    case QorPayErrorCode.FRAUD_DETECTED:
      return 'Transaction blocked for security reasons. Please contact support if this is a mistake.';

    case QorPayErrorCode.RATE_LIMITED:
      return 'Too many requests. Please wait a moment and try again.';

    case QorPayErrorCode.NETWORK_ERROR:
      return 'Network connection failed. Please check your internet connection and try again.';

    case QorPayErrorCode.TIMEOUT:
      return 'Request timed out. Please try again.';

    case QorPayErrorCode.INVALID_AMOUNT:
      return 'Invalid payment amount. Please check the amount and try again.';

    case QorPayErrorCode.CURRENCY_NOT_SUPPORTED:
      return 'Currency not supported. Please use a supported currency.';

    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

async function handleSpecificErrorScenarios() {
  console.log('🎯 Testing specific error scenarios...');

  // Test 1: Invalid card number
  try {
    await qorpay.payments.create({
      amount: 100,
      card: {
        number: '1234567890123456', // Invalid card
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
      },
    });
  } catch (error) {
    if (error instanceof QorPayApiError) {
      console.log('❌ Invalid card error handled:', getApiUserMessage(error));
    }
  }

  // Test 2: Invalid amount
  try {
    await qorpay.payments.create({
      amount: -100, // Invalid negative amount
      card: {
        number: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
      },
    });
  } catch (error) {
    if (error instanceof QorPayApiError) {
      console.log('❌ Invalid amount error handled:', getApiUserMessage(error));
    }
  }

  // Test 3: Missing required fields
  try {
    await qorpay.payments.create({
      amount: 100,
      // Missing card object
    });
  } catch (error) {
    if (error instanceof QorPayApiError) {
      console.log('❌ Missing fields error handled:', getApiUserMessage(error));
    }
  }
}

async function demonstrateErrorClassification() {
  console.log('🏷️ Demonstrating error classification...');

  try {
    // This will fail with various error types
    await qorpay.payments.get('non_existent_payment_123');
  } catch (error) {
    if (error instanceof QorPayApiError) {
      console.log('📋 API Error Details:');
      console.log(`  Code: ${error.code}`);
      console.log(`  Message: ${error.message}`);
      console.log(`  Status: ${error.status}`);
      console.log(`  Is Client Error: ${error.isClientError()}`);
      console.log(`  Is Server Error: ${error.isServerError()}`);
      console.log(`  Is Rate Limited: ${error.isRateLimitError()}`);
      console.log(`  Is Authentication Error: ${error.isAuthenticationError()}`);
      console.log(`  User Message: ${getApiUserMessage(error)}`);
    }
  }
}

async function monitorPaymentHealth() {
  console.log('🏥 Payment health monitoring...');

  const healthMetrics = {
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    errorCounts: {} as Record<string, number>,
  };

  // Simulate multiple payments
  const payments = [
    { amount: 100, card: { number: '4111111111111111', expiryMonth: '12', expiryYear: '25', cvv: '123' } },
    { amount: 200, card: { number: '1234567890123456', expiryMonth: '12', expiryYear: '25', cvv: '123' } },
    { amount: 300, card: { number: '5555555555554444', expiryMonth: '12', expiryYear: '25', cvv: '123' } },
  ];

  for (const paymentData of payments) {
    healthMetrics.totalPayments++;

    try {
      await qorpay.payments.create(paymentData);
      healthMetrics.successfulPayments++;
    } catch (error) {
      healthMetrics.failedPayments++;

      if (error instanceof QorPayApiError) {
        const errorCode = error.code || 'unknown';
        healthMetrics.errorCounts[errorCode] = (healthMetrics.errorCounts[errorCode] || 0) + 1;
      }
    }
  }

  // Display health metrics
  console.log('📊 Payment Health Metrics:');
  console.log(`  Total Payments: ${healthMetrics.totalPayments}`);
  console.log(`  Successful: ${healthMetrics.successfulPayments}`);
  console.log(`  Failed: ${healthMetrics.failedPayments}`);
  console.log(`  Success Rate: ${((healthMetrics.successfulPayments / healthMetrics.totalPayments) * 100).toFixed(2)}%`);
  console.log('  Error Breakdown:', healthMetrics.errorCounts);
}

// Example usage
async function main() {
  console.log('🛡️ QorPay Advanced Error Handling Example');
  console.log('========================================');

  try {
    // Example 1: Payment with retry logic
    const paymentData = {
      amount: 100,
      card: {
        number: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
      },
      customer: {
        email: 'customer@example.com',
        name: 'John Doe',
      },
    };

    const result = await processPaymentWithRetry(paymentData);

    if (result.success) {
      console.log('✅ Payment succeeded:', result.paymentId);
    } else {
      console.log('❌ Payment failed:', result.error?.userMessage);
      console.log(`Retryable: ${result.error?.retryable}`);
    }

    // Example 2: Handle specific error scenarios
    await handleSpecificErrorScenarios();

    // Example 3: Demonstrate error classification
    await demonstrateErrorClassification();

    // Example 4: Monitor payment health
    await monitorPaymentHealth();

    console.log('✅ All error handling examples completed!');
  } catch (error) {
    console.error('❌ Error handling example failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  processPaymentWithRetry,
  getApiUserMessage,
  isRetryableApiError,
  calculateRetryDelay,
};