/**
 * Recurring Payments Example
 *
 * This example demonstrates how to set up and manage recurring payments
 * using the QorPay SDK for subscription-based business models.
 */

import { QorPayClient } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: process.env.QORPAY_APP_KEY || 'your-sandbox-app-key',
  clientKey: process.env.QORPAY_CLIENT_KEY || 'your-sandbox-client-key',
  environment: 'sandbox',
});

interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  description?: string;
  trialDays?: number;
}

async function createSubscriptionPlan(planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
  try {
    const plan = await qorpay.plans.createPlan({
      name: planData.name || 'Premium Plan',
      amount: planData.amount || 29.99,
      currency: planData.currency || 'USD',
      frequency: planData.frequency || 'monthly',
      description: planData.description || 'Monthly premium subscription',
      trial_period_days: planData.trialDays || 0,
    });

    console.log('✅ Subscription plan created:', {
      id: plan.id,
      name: plan.name,
      amount: plan.amount,
      frequency: plan.frequency,
    });

    return {
      id: plan.id,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency || 'USD',
      frequency: plan.frequency as any,
      description: plan.description,
      trialDays: plan.trial_period_days,
    };
  } catch (error) {
    console.error('❌ Failed to create subscription plan:', error.message);
    throw error;
  }
}

async function setupRecurringPaymentWithToken(
  customerId: string,
  tokenId: string,
  plan: SubscriptionPlan
) {
  try {
    // Setup recurring payment using a stored token
    const recurring = await qorpay.payments.recurringSetup({
      mid: 'your-mid',
      amount: plan.amount.toString(),
      creditcard: tokenId,
      customer_id: customerId,
      recurring: {
        frequency: plan.frequency,
        start_date: new Date().toISOString().split('T')[0], // Start today
        // Optional end date for limited duration subscriptions
        end_date: plan.trialDays
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
          : undefined,
      },
      customer_validation: {
        name_match: true,
        email_match: true,
      },
      description: `Subscription to ${plan.name}`,
      // Add trial period if specified
      trial_period_days: plan.trialDays,
    });

    console.log('✅ Recurring payment setup:', {
      id: recurring.id,
      amount: plan.amount,
      frequency: plan.frequency,
      trialDays: plan.trialDays,
      nextBillingDate: recurring.next_billing_date,
    });

    return recurring;
  } catch (error) {
    console.error('❌ Failed to setup recurring payment:', error.message);
    throw error;
  }
}

async function setupRecurringPaymentWithCard(
  customerId: string,
  plan: SubscriptionPlan,
  cardData: any
) {
  try {
    // Setup recurring payment using raw card data
    const recurring = await qorpay.payments.recurringSetup({
      mid: 'your-mid',
      amount: plan.amount.toString(),
      creditcard: cardData.number,
      cvv: cardData.cvv,
      month: cardData.expiryMonth,
      year: cardData.expiryYear,
      customer_id: customerId,
      recurring: {
        frequency: plan.frequency,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      customer_validation: {
        name_match: true,
        email_match: true,
      },
      description: `Subscription to ${plan.name}`,
      trial_period_days: plan.trialDays,
    });

    console.log('✅ Recurring payment setup with card:', recurring.id);
    return recurring;
  } catch (error) {
    console.error('❌ Failed to setup recurring payment with card:', error.message);
    throw error;
  }
}

async function modifyExistingRecurringPayment(recurringId: string, updates: any) {
  try {
    const modified = await qorpay.payments.recurringMy({
      recurring_id: recurringId,
      ...updates,
    });

    console.log('✅ Recurring payment modified:', modified.id);
    return modified;
  } catch (error) {
    console.error('❌ Failed to modify recurring payment:', error.message);
    throw error;
  }
}

async function pauseRecurringPayment(recurringId: string) {
  try {
    // Some payment processors support pausing subscriptions
    // This might involve updating the recurring payment with a pause status
    const paused = await modifyExistingRecurringPayment(recurringId, {
      status: 'paused',
      pause_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Pause for 30 days
    });

    console.log('✅ Recurring payment paused:', paused.id);
    return paused;
  } catch (error) {
    console.error('❌ Failed to pause recurring payment:', error.message);
    throw error;
  }
}

async function resumeRecurringPayment(recurringId: string) {
  try {
    const resumed = await modifyExistingRecurringPayment(recurringId, {
      status: 'active',
      pause_until: null,
    });

    console.log('✅ Recurring payment resumed:', resumed.id);
    return resumed;
  } catch (error) {
    console.error('❌ Failed to resume recurring payment:', error.message);
    throw error;
  }
}

async function cancelRecurringPayment(recurringId: string, reason?: string) {
  try {
    // Cancel a recurring payment
    const cancelled = await modifyExistingRecurringPayment(recurringId, {
      status: 'cancelled',
      cancellation_reason: reason || 'Customer requested cancellation',
      cancelled_at: new Date().toISOString(),
    });

    console.log('✅ Recurring payment cancelled:', cancelled.id);
    return cancelled;
  } catch (error) {
    console.error('❌ Failed to cancel recurring payment:', error.message);
    throw error;
  }
}

async function listRecurringPayments(customerId?: string) {
  try {
    // List recurring payments (all or for specific customer)
    const recurringList = await qorpay.payments.recurringMy({
      customer_id: customerId,
      status: 'active', // Can filter by status: active, paused, cancelled, expired
    });

    console.log(`📋 Found ${recurringList.data.length} recurring payments:`);
    recurringList.data.forEach(recurring => {
      console.log(`  - ${recurring.id}: ${recurring.amount} ${recurring.currency} (${recurring.frequency})`);
      console.log(`    Status: ${recurring.status}, Next billing: ${recurring.next_billing_date}`);
    });

    return recurringList;
  } catch (error) {
    console.error('❌ Failed to list recurring payments:', error.message);
    throw error;
  }
}

async function upgradeSubscription(customerId: string, currentRecurringId: string, newPlan: SubscriptionPlan) {
  try {
    console.log('🔄 Upgrading subscription...');

    // Step 1: Cancel current recurring payment (effective immediately)
    await cancelRecurringPayment(currentRecurringId, 'Upgrading to new plan');

    // Step 2: Setup new recurring payment with upgraded plan
    // Note: In a real implementation, you'd want to handle this more gracefully
    // to ensure continuous service during the upgrade
    const newRecurring = await setupRecurringPaymentWithToken(
      customerId,
      'new_token_for_upgraded_plan', // In practice, you'd use the existing token
      newPlan
    );

    console.log('✅ Subscription upgraded:', newRecurring.id);
    return newRecurring;
  } catch (error) {
    console.error('❌ Failed to upgrade subscription:', error.message);
    throw error;
  }
}

async function handleFailedRecurringPayment(recurringId: string, maxRetries: number = 3) {
  try {
    console.log('🔄 Handling failed recurring payment...');

    // Get details of the failed recurring payment
    const recurringDetails = await qorpay.payments.recurringMy({
      recurring_id: recurringId,
    });

    const failureCount = recurringDetails.failure_count || 0;

    if (failureCount >= maxRetries) {
      console.log('❌ Max retries exceeded, cancelling subscription');
      await cancelRecurringPayment(recurringId, 'Payment method failed after multiple retries');
      return { action: 'cancelled', reason: 'max_retries_exceeded' };
    }

    // Try to update the recurring payment to retry
    const updated = await modifyExistingRecurringPayment(recurringId, {
      retry_after: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Retry tomorrow
      failure_count: failureCount + 1,
    });

    console.log('🔄 Scheduled retry for failed payment:', updated.id);
    return { action: 'retry_scheduled', retryDate: updated.retry_after };
  } catch (error) {
    console.error('❌ Failed to handle recurring payment failure:', error.message);
    throw error;
  }
}

// Example usage
async function main() {
  console.log('🔄 QorPay Recurring Payments Example');
  console.log('=====================================');

  try {
    // Step 1: Create subscription plans
    const basicPlan = await createSubscriptionPlan({
      name: 'Basic Plan',
      amount: 9.99,
      frequency: 'monthly',
      description: 'Basic monthly subscription',
    });

    const premiumPlan = await createSubscriptionPlan({
      name: 'Premium Plan',
      amount: 29.99,
      frequency: 'monthly',
      description: 'Premium monthly subscription with trial',
      trialDays: 14,
    });

    // Step 2: Create a customer for the subscription
    const customer = await qorpay.customers.create({
      email: 'subscriber@example.com',
      name: 'Jane Smith',
    });

    // Step 3: Create a payment token for the customer
    const token = await qorpay.paymentTokens.createCardToken({
      card_number: '4111111111111111',
      card_exp: '1225',
      cvv: '123',
      card_holder: 'Jane Smith',
      customer_id: customer.id,
    });

    // Step 4: Setup recurring payment with trial
    const recurring = await setupRecurringPaymentWithToken(
      customer.id,
      token.token,
      premiumPlan
    );

    // Step 5: List active recurring payments
    await listRecurringPayments();

    // Step 6: Demonstrate subscription modification (pause/resume)
    // await pauseRecurringPayment(recurring.id);
    // await resumeRecurringPayment(recurring.id);

    // Step 7: Demonstrate subscription upgrade
    // await upgradeSubscription(customer.id, recurring.id, basicPlan);

    // Step 8: Demonstrate cancellation
    // await cancelRecurringPayment(recurring.id, 'Customer requested cancellation');

    console.log('✅ All recurring payment examples completed successfully!');
  } catch (error) {
    console.error('❌ Recurring payments example failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  createSubscriptionPlan,
  setupRecurringPaymentWithToken,
  setupRecurringPaymentWithCard,
  modifyExistingRecurringPayment,
  pauseRecurringPayment,
  resumeRecurringPayment,
  cancelRecurringPayment,
  listRecurringPayments,
  upgradeSubscription,
  handleFailedRecurringPayment,
};