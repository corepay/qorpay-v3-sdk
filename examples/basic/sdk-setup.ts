/**
 * Basic QorPay SDK Setup Example
 *
 * This example demonstrates the simplest way to initialize and use the QorPay V3 SDK
 * for processing payments in a TypeScript/JavaScript application.
 */

import { QorPayClient } from '@corepay/qorpay-v3-sdk';

// Initialize the SDK with your credentials
const qorpay = new QorPayClient({
  appKey: process.env.QORPAY_APP_KEY || 'your-sandbox-app-key',
  clientKey: process.env.QORPAY_CLIENT_KEY || 'your-sandbox-client-key',
  environment: 'sandbox', // Use 'production' for live transactions
});

async function processCardPayment() {
  try {
    // Process a basic card payment
    const payment = await qorpay.payments.create({
      amount: 100.50,
      currency: 'USD',
      card: {
        number: '4111111111111111', // Test card number
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
      },
      customer: {
        email: 'customer@example.com',
        name: 'John Doe',
      },
    });

    console.log('Payment successful:', {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
    });

    return payment;
  } catch (error) {
    console.error('Payment failed:', error.message);
    throw error;
  }
}

async function createCustomer() {
  try {
    // Create a new customer
    const customer = await qorpay.customers.create({
      email: 'customer@example.com',
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

    console.log('Customer created:', customer.id);
    return customer;
  } catch (error) {
    console.error('Customer creation failed:', error.message);
    throw error;
  }
}

async function listTransactions() {
  try {
    // List recent transactions
    const transactions = await qorpay.transactions.list({
      limit: 10,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    });

    console.log(`Found ${transactions.data.length} transactions`);
    return transactions;
  } catch (error) {
    console.error('Failed to list transactions:', error.message);
    throw error;
  }
}

// Example usage
async function main() {
  console.log('🚀 QorPay SDK Basic Example');
  console.log('==========================');

  try {
    // Create a customer
    const customer = await createCustomer();

    // Process a payment
    const payment = await processCardPayment();

    // List recent transactions
    const transactions = await listTransactions();

    console.log('✅ All operations completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  qorpay,
  processCardPayment,
  createCustomer,
  listTransactions,
};