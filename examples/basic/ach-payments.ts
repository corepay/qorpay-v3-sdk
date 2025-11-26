/**
 * ACH (Bank Transfer) Payments Example
 *
 * This example demonstrates how to process ACH payments using the QorPay SDK.
 * ACH payments are bank-to-bank transfers that take 1-3 business days.
 */

import { QorPayClient } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: process.env.QORPAY_APP_KEY || 'your-sandbox-app-key',
  clientKey: process.env.QORPAY_CLIENT_KEY || 'your-sandbox-client-key',
  environment: 'sandbox',
});

async function processACHDebit() {
  try {
    // Process an ACH debit (pulling money from customer account)
    const debit = await qorpay.achPayments.debit({
      amount: 150.00,
      currency: 'USD',
      account: {
        type: 'checking', // 'checking' or 'savings'
        routingNumber: '123456789', // Test routing number
        accountNumber: '432156789', // Test account number
        name: 'John Doe', // Account holder name
      },
      customer: {
        email: 'customer@example.com',
        name: 'John Doe',
      },
      description: 'Monthly subscription payment',
    });

    console.log('ACH Debit initiated:', {
      id: debit.id,
      status: debit.status,
      amount: debit.amount,
    });

    return debit;
  } catch (error) {
    console.error('ACH debit failed:', error.message);
    throw error;
  }
}

async function processACHCredit() {
  try {
    // Process an ACH credit (pushing money to customer account)
    const credit = await qorpay.achPayments.credit({
      amount: 75.00,
      currency: 'USD',
      account: {
        type: 'checking',
        routingNumber: '123456789',
        accountNumber: '432156789',
        name: 'Jane Smith',
      },
      customer: {
        email: 'jane@example.com',
        name: 'Jane Smith',
      },
      description: 'Refund for returned item',
    });

    console.log('ACH Credit initiated:', {
      id: credit.id,
      status: credit.status,
      amount: credit.amount,
    });

    return credit;
  } catch (error) {
    console.error('ACH credit failed:', error.message);
    throw error;
  }
}

async function verifyBankAccount() {
  try {
    // Verify bank account ownership (required for some transactions)
    const verification = await qorpay.achPayments.verify({
      account: {
        type: 'checking',
        routingNumber: '123456789',
        accountNumber: '432156789',
        name: 'John Doe',
      },
      verificationMethod: 'micro_deposits', // or 'instant_verification'
    });

    console.log('Bank account verified:', verification.status);
    return verification;
  } catch (error) {
    console.error('Account verification failed:', error.message);
    throw error;
  }
}

async function getACHTransaction() {
  try {
    // Get details of a specific ACH transaction
    const transactionId = 'ach_transaction_1234567890';
    const transaction = await qorpay.achPayments.getTransaction(transactionId);

    console.log('ACH Transaction details:', {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
    });

    return transaction;
  } catch (error) {
    console.error('Failed to get ACH transaction:', error.message);
    throw error;
  }
}

async function voidACHTransaction() {
  try {
    // Void/cancel an ACH transaction (only possible before settlement)
    const transactionId = 'ach_transaction_1234567890';
    const voidResult = await qorpay.achPayments.void(transactionId, {
      reason: 'Customer requested cancellation',
    });

    console.log('ACH Transaction voided:', voidResult);
    return voidResult;
  } catch (error) {
    console.error('Failed to void ACH transaction:', error.message);
    throw error;
  }
}

async function refundACHTransaction() {
  try {
    // Refund a settled ACH transaction
    const transactionId = 'ach_transaction_1234567890';
    const refund = await qorpay.achPayments.refund(transactionId, {
      amount: 50.00,
      reason: 'Customer dispute resolution',
    });

    console.log('ACH Refund processed:', {
      id: refund.id,
      amount: refund.amount,
      status: refund.status,
    });

    return refund;
  } catch (error) {
    console.error('Failed to refund ACH transaction:', error.message);
    throw error;
  }
}

// Example usage
async function main() {
  console.log('🏦 QorPay ACH Payments Example');
  console.log('=================================');

  try {
    // Verify bank account
    await verifyBankAccount();

    // Process ACH debit
    const debit = await processACHDebit();

    // Process ACH credit
    const credit = await processACHCredit();

    // Get transaction details
    await getACHTransaction();

    console.log('✅ All ACH operations completed successfully!');
  } catch (error) {
    console.error('❌ ACH example failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  processACHDebit,
  processACHCredit,
  verifyBankAccount,
  getACHTransaction,
  voidACHTransaction,
  refundACHTransaction,
};