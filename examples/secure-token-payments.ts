/**
 * @file examples/secure-token-payments.ts
 * @description Examples demonstrating secure token payment usage with customer_id requirements
 *
 * These examples show how to properly use payment tokens with customer associations
 * for security, compliance, and fraud prevention.
 */

import { QorPayClient } from '../src';

const qorpay = new QorPayClient({
  appKey: 'your-app-key',
  clientKey: 'your-client-key',
  environment: 'sandbox',
});

/**
 * Example 1: Complete Secure Customer Flow
 * Shows the recommended pattern for creating customers and using tokens
 */
async function completeSecureCustomerFlow() {
  console.log('🔐 Complete Secure Customer Flow');

  try {
    // Step 1: Create a customer
    const customer = await qorpay.customers.create({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
    });

    console.log(`✅ Customer created: ${customer.id}`);

    // Step 2: Create a payment token linked to the customer
    const cardToken = await qorpay.paymentTokens.createCardToken({
      card_number: '4111111111111111',
      card_exp: '1225',
      card_cvv: '123',
      card_holder: 'John Doe',
      customer_id: customer.id, // 🔒 CRITICAL: Link token to customer
      billing_address: {
        address1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postal_code: '12345',
        country: 'US',
      },
    });

    console.log(`✅ Token created: ${cardToken.token}`);

    // Step 3: Process payment with token and customer verification
    const payment = await qorpay.payments.saleToken({
      mid: 'your-mid',
      amount: '29.99',
      creditcard: cardToken.token,
      customer_id: customer.id, // 🔒 REQUIRED: Must match token owner

      // Optional enhanced security validation
      customer_validation: {
        name_match: true,
        email_match: true,
        ip_match: true,
      },
    });

    console.log(`✅ Payment processed: ${payment.transaction_id}`);

    return { customer, cardToken, payment };

  } catch (error) {
    console.error('❌ Error in secure flow:', error);
    throw error;
  }
}

/**
 * Example 2: Token Payment Without Customer (BLOCKED)
 * Shows what happens when you try to use a token without customer_id
 */
async function tokenPaymentWithoutCustomer() {
  console.log('🚫 Token Payment Without Customer ID (Should Fail)');

  try {
    // This will fail with validation error
    await qorpay.payments.saleToken({
      mid: 'your-mid',
      amount: '29.99',
      creditcard: 'tok_some_existing_token',
      // ❌ MISSING: customer_id is required!
    });

    console.log('❌ This should never reach - validation should fail');

  } catch (error) {
    console.log('✅ Expected validation error:', error.message);
    // Expected: "Customer ID required for token payments"
  }
}

/**
 * Example 3: One-Time Payment (No Customer Required)
 * Shows that one-time payments don't need customer_id
 */
async function oneTimePaymentExample() {
  console.log('💳 One-Time Payment (No Customer ID Required)');

  try {
    const payment = await qorpay.payments.saleManual({
      mid: 'your-mid',
      amount: '49.99',
      creditcard: '4111111111111111', // Raw card data, not token
      cvv: '123',
      month: '12',
      year: '25',
      cfirstname: 'Jane',
      clastname: 'Smith',
      cemail: 'jane.smith@example.com',

      // No customer_id needed for one-time payments
    });

    console.log(`✅ One-time payment processed: ${payment.transaction_id}`);
    return payment;

  } catch (error) {
    console.error('❌ Error in one-time payment:', error);
    throw error;
  }
}

/**
 * Example 4: Recurring Payments with Customer Association
 * Shows how to set up recurring billing with customer tracking
 */
async function recurringPaymentWithCustomer() {
  console.log('🔄 Recurring Payment with Customer Association');

  try {
    // Create customer for recurring billing
    const customer = await qorpay.customers.create({
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mike.johnson@example.com',
    });

    // Set up recurring payment with customer association
    const recurringPayment = await qorpay.payments.recurringSetup({
      mid: 'your-mid',
      amount: '19.99',
      creditcard: '4111111111111111',
      cvv: '123',
      month: '12',
      year: '25',
      customer_id: customer.id, // 🔒 Recommended for recurring payments

      recurring: {
        frequency: 'monthly',
        start_date: '2024-12-01',
        total_occurrences: 12,
      },
    });

    console.log(`✅ Recurring payment set up: ${recurringPayment.transaction_id}`);
    console.log(`📋 Customer: ${customer.id} - ${customer.email}`);

    return { customer, recurringPayment };

  } catch (error) {
    console.error('❌ Error in recurring payment setup:', error);
    throw error;
  }
}

/**
 * Example 5: Customer Validation Best Practices
 * Shows how to use customer validation for enhanced security
 */
async function customerValidationExample() {
  console.log('🛡️ Customer Validation Best Practices');

  try {
    const customer = await qorpay.customers.create({
      first_name: 'Sarah',
      last_name: 'Williams',
      email: 'sarah.williams@example.com',
    });

    // Get customer's IP address from request (example)
    const customerIP = '192.168.1.100'; // From HTTP request headers

    const payment = await qorpay.payments.saleToken({
      mid: 'your-mid',
      amount: '99.99',
      creditcard: 'tok_secure_token',
      customer_id: customer.id,

      // Enhanced security validation
      customer_validation: {
        name_match: true,     // Customer name matches token holder
        email_match: true,    // Customer email matches token holder
        ip_match: true,       // Customer IP matches previous usage
      },

      // Additional customer data for validation
      cfirstname: 'Sarah',
      clastname: 'Williams',
      cemail: 'sarah.williams@example.com',
      ipaddress: customerIP,
    });

    console.log(`✅ Secure payment with validation: ${payment.transaction_id}`);
    return payment;

  } catch (error) {
    console.error('❌ Error in validated payment:', error);
    throw error;
  }
}

/**
 * Example 6: Error Handling for Token Validation
 * Shows proper error handling for missing or invalid customer_id
 */
async function tokenValidationErrorHandling() {
  console.log('⚠️ Token Validation Error Handling');

  const testCases = [
    {
      name: 'Missing customer_id',
      data: {
        mid: 'your-mid',
        amount: '29.99',
        creditcard: 'tok_valid_token',
        // customer_id: missing
      },
    },
    {
      name: 'Empty customer_id',
      data: {
        mid: 'your-mid',
        amount: '29.99',
        creditcard: 'tok_valid_token',
        customer_id: '', // Empty string
      },
    },
    {
      name: 'Valid customer_id',
      data: {
        mid: 'your-mid',
        amount: '29.99',
        creditcard: 'tok_valid_token',
        customer_id: 'cust_valid_123',
      },
    },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      await qorpay.payments.saleToken(testCase.data);
      console.log(`✅ Passed: ${testCase.name}`);

    } catch (error) {
      if (testCase.name.includes('Missing') || testCase.name.includes('Empty')) {
        console.log(`✅ Expected validation error: ${error.message}`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  console.log('🚀 Running Secure Token Payment Examples\n');

  try {
    await completeSecureCustomerFlow();
    console.log('\n' + '='.repeat(50) + '\n');

    await tokenPaymentWithoutCustomer();
    console.log('\n' + '='.repeat(50) + '\n');

    await oneTimePaymentExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await recurringPaymentWithCustomer();
    console.log('\n' + '='.repeat(50) + '\n');

    await customerValidationExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await tokenValidationErrorHandling();
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('🎉 All examples completed successfully!');

  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Export examples for individual testing
export {
  completeSecureCustomerFlow,
  tokenPaymentWithoutCustomer,
  oneTimePaymentExample,
  recurringPaymentWithCustomer,
  customerValidationExample,
  tokenValidationErrorHandling,
  runExamples,
};

// Run if executed directly
if (require.main === module) {
  runExamples();
}