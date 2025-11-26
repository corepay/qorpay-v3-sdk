/**
 * Secure Token Payments Example
 *
 * This example demonstrates how to securely use payment tokens with customer validation
 * to prevent fraud and ensure proper audit trails. All token payments MUST include customer_id.
 */

import { QorPayClient } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: process.env.QORPAY_APP_KEY || 'your-sandbox-app-key',
  clientKey: process.env.QORPAY_CLIENT_KEY || 'your-sandbox-client-key',
  environment: 'sandbox',
});

async function createCustomer() {
  try {
    // First, create a customer to associate with tokens
    const customer = await qorpay.customers.create({
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1-555-123-4567',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
    });

    console.log('✅ Customer created:', customer.id);
    return customer;
  } catch (error) {
    console.error('❌ Customer creation failed:', error.message);
    throw error;
  }
}

async function createSecureCardToken(customerId: string) {
  try {
    // Create a payment token linked to a customer
    const token = await qorpay.paymentTokens.createCardToken({
      card_number: '4111111111111111',
      card_exp: '1225', // MMYY format
      cvv: '123',
      card_holder: 'John Doe',
      customer_id: customerId, // ✅ REQUIRED: Links token to customer
      billing_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
    });

    console.log('✅ Secure card token created:', {
      tokenId: token.token,
      customerId: token.customer_id,
      last4: token.card_number_last4,
    });

    return token;
  } catch (error) {
    console.error('❌ Token creation failed:', error.message);
    throw error;
  }
}

async function processSecureTokenPayment(customerId: string, tokenId: string) {
  try {
    // Process payment with token and customer validation
    const payment = await qorpay.payments.saleToken({
      mid: 'your-mid', // Merchant ID
      amount: '29.99',
      creditcard: tokenId,
      customer_id: customerId, // ✅ REQUIRED: Must match token owner
      customer_validation: {
        name_match: true, // Customer name matches token holder
        email_match: true, // Customer email matches token holder
        ip_match: true, // Customer IP matches previous usage
      },
      order_id: 'order_' + Date.now(),
      description: 'Secure token payment',
    });

    console.log('✅ Secure token payment processed:', {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      customerId: payment.customer_id,
    });

    return payment;
  } catch (error) {
    console.error('❌ Token payment failed:', error.message);
    throw error;
  }
}

async function processTokenWithEnhancedValidation(customerId: string, tokenId: string) {
  try {
    // Process payment with enhanced security validation
    const payment = await qorpay.payments.saleToken({
      mid: 'your-mid',
      amount: '99.99',
      creditcard: tokenId,
      customer_id: customerId,
      customer_validation: {
        name_match: true,
        email_match: true,
        ip_match: true,
        // Additional validation options
        address_match: true, // Billing address matches customer address
        device_fingerprint: 'browser_fingerprint_123', // Device ID for tracking
        risk_score_threshold: 0.7, // Maximum acceptable risk score
      },
      cvv_required: true, // Require CVV for enhanced security
      three_d_secure: {
        enabled: true,
        challenge_required: true,
      },
    });

    console.log('✅ Enhanced validation payment processed:', payment.id);
    return payment;
  } catch (error) {
    console.error('❌ Enhanced validation payment failed:', error.message);
    throw error;
  }
}

async function setupRecurringTokenPayment(customerId: string, tokenId: string) {
  try {
    // Setup recurring payment with token
    const recurring = await qorpay.payments.recurringSetup({
      mid: 'your-mid',
      amount: '19.99',
      creditcard: tokenId,
      customer_id: customerId, // ✅ Recommended for recurring payments
      recurring: {
        frequency: 'monthly',
        start_date: '2025-02-01',
        end_date: '2026-01-31',
      },
      customer_validation: {
        name_match: true,
        email_match: true,
      },
    });

    console.log('✅ Recurring token payment setup:', recurring.id);
    return recurring;
  } catch (error) {
    console.error('❌ Recurring setup failed:', error.message);
    throw error;
  }
}

async function listCustomerTokens(customerId: string) {
  try {
    // List all tokens for a customer
    const tokens = await qorpay.paymentTokens.listCardTokensByCustomer(customerId);

    console.log(`📋 Customer has ${tokens.data.length} tokens:`);
    tokens.data.forEach(token => {
      console.log(`  - ${token.token} (${token.card_number_last4}) - ${token.card_type}`);
    });

    return tokens;
  } catch (error) {
    console.error('❌ Failed to list customer tokens:', error.message);
    throw error;
  }
}

async function rotateToken(customerId: string, tokenId: string) {
  try {
    // Rotate/replace an expired token
    const newToken = await qorpay.paymentTokens.rotateCardToken({
      customer_id: customerId,
      token_id: tokenId,
      card_number: '5555555555554444', // New card number
      card_exp: '0626', // New expiration
      cvv: '456',
    });

    console.log('✅ Token rotated successfully:', newToken.token);
    return newToken;
  } catch (error) {
    console.error('❌ Token rotation failed:', error.message);
    throw error;
  }
}

// ❌ SECURITY VIOLATION EXAMPLES (for demonstration only)
async function demonstrateInsecureUsage() {
  console.log('🚨 SECURITY VIOLATION EXAMPLES (Do NOT use in production):');

  try {
    // ❌ This will fail - token payment without customer_id
    await qorpay.payments.saleToken({
      mid: 'your-mid',
      amount: '29.99',
      creditcard: 'tok_without_customer', // This token has no customer_id
      // customer_id: 'MISSING' -> ValidationError!
    });
  } catch (error) {
    console.log('✅ Security check passed - prevented insecure payment:', error.message);
  }
}

// Example usage
async function main() {
  console.log('🔒 QorPay Secure Token Payments Example');
  console.log('=======================================');

  try {
    // Step 1: Create a customer
    const customer = await createCustomer();

    // Step 2: Create a secure token linked to the customer
    const token = await createSecureCardToken(customer.id);

    // Step 3: Process a secure token payment
    await processSecureTokenPayment(customer.id, token.token);

    // Step 4: Process payment with enhanced validation
    await processTokenWithEnhancedValidation(customer.id, token.token);

    // Step 5: Setup recurring payment
    await setupRecurringTokenPayment(customer.id, token.token);

    // Step 6: List customer tokens
    await listCustomerTokens(customer.id);

    // Step 7: Demonstrate security (show what's blocked)
    await demonstrateInsecureUsage();

    console.log('✅ All secure token operations completed successfully!');
  } catch (error) {
    console.error('❌ Secure token example failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  createCustomer,
  createSecureCardToken,
  processSecureTokenPayment,
  processTokenWithEnhancedValidation,
  setupRecurringTokenPayment,
  listCustomerTokens,
  rotateToken,
};