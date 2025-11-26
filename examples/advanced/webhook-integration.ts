/**
 * Webhook Integration Example
 *
 * This example demonstrates how to set up and handle webhooks from QorPay
 * to receive real-time notifications about payment events.
 */

import { QorPayClient } from '@corepay/qorpay-v3-sdk';
import * as crypto from 'crypto';
import * as express from 'express';

const qorpay = new QorPayClient({
  appKey: process.env.QORPAY_APP_KEY || 'your-sandbox-app-key',
  clientKey: process.env.QORPAY_CLIENT_KEY || 'your-sandbox-client-key',
  environment: 'sandbox',
});

interface WebhookEvent {
  id: string;
  type: string;
  created_at: string;
  data: any;
  livemode: boolean;
}

interface WebhookHandler {
  (event: WebhookEvent): Promise<void>;
}

class WebhookManager {
  private handlers: Map<string, WebhookHandler[]> = new Map();
  private webhookSecret: string;

  constructor(webhookSecret: string) {
    this.webhookSecret = webhookSecret;
  }

  /**
   * Register a handler for specific webhook events
   */
  on(eventType: string, handler: WebhookHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Process incoming webhook event
   */
  async processWebhook(payload: string, signature: string): Promise<void> {
    // Verify webhook signature first
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    // Parse the event
    let event: WebhookEvent;
    try {
      event = JSON.parse(payload);
    } catch (error) {
      throw new Error('Invalid webhook payload');
    }

    console.log(`🔔 Received webhook event: ${event.type}`);

    // Get handlers for this event type
    const handlers = this.handlers.get(event.type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];

    // Execute specific handlers
    for (const handler of [...handlers, ...wildcardHandlers]) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error in webhook handler for ${event.type}:`, error);
        // Don't throw here to avoid webhook delivery failures
      }
    }
  }

  /**
   * Create Express middleware for handling webhooks
   */
  createExpressMiddleware(): express.RequestHandler {
    return async (req, res, next) => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const signature = req.headers['x-qorpay-signature'] as string;
      const payload = req.body;

      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      try {
        await this.processWebhook(JSON.stringify(payload), signature);
        res.status(200).json({ received: true });
      } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(400).json({ error: error.message });
      }
    };
  }
}

async function createWebhook(endpointUrl: string, events: string[]): Promise<any> {
  try {
    const webhook = await qorpay.webhooks.createWebhook({
      url: endpointUrl,
      events: events,
      description: 'Production webhook endpoint',
      active: true,
    });

    console.log('✅ Webhook created:', {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
    });

    return webhook;
  } catch (error) {
    console.error('❌ Failed to create webhook:', error.message);
    throw error;
  }
}

async function listWebhooks(): Promise<any[]> {
  try {
    const webhooks = await qorpay.webhooks.listWebhooks();

    console.log(`📋 Found ${webhooks.data.length} webhooks:`);
    webhooks.data.forEach(webhook => {
      console.log(`  - ${webhook.id}: ${webhook.url} (${webhook.active ? 'active' : 'inactive'})`);
      console.log(`    Events: ${webhook.events.join(', ')}`);
    });

    return webhooks.data;
  } catch (error) {
    console.error('❌ Failed to list webhooks:', error.message);
    throw error;
  }
}

async function getAvailableWebhookEvents(): Promise<string[]> {
  try {
    const events = await qorpay.webhooks.listWebhookEvents();

    console.log('🎯 Available webhook events:');
    events.data.forEach(event => {
      console.log(`  - ${event.name}: ${event.description}`);
    });

    return events.data.map((event: any) => event.name);
  } catch (error) {
    console.error('❌ Failed to get webhook events:', error.message);
    throw error;
  }
}

// Example webhook handlers
async function handlePaymentSuccess(event: WebhookEvent): Promise<void> {
  console.log('💳 Payment successful:', {
    paymentId: event.data.payment_id,
    amount: event.data.amount,
    currency: event.data.currency,
    customerId: event.data.customer_id,
  });

  // Update your database, send confirmation email, etc.
  await updatePaymentStatus(event.data.payment_id, 'completed');
  await sendPaymentConfirmationEmail(event.data.customer_id, event.data);
}

async function handlePaymentFailure(event: WebhookEvent): Promise<void> {
  console.log('❌ Payment failed:', {
    paymentId: event.data.payment_id,
    errorCode: event.data.error_code,
    errorMessage: event.data.error_message,
    customerId: event.data.customer_id,
  });

  // Update database, notify customer, retry logic, etc.
  await updatePaymentStatus(event.data.payment_id, 'failed');
  await sendPaymentFailureNotification(event.data.customer_id, event.data);
}

async function handleSubscriptionCreated(event: WebhookEvent): Promise<void> {
  console.log('🔄 Subscription created:', {
    subscriptionId: event.data.subscription_id,
    customerId: event.data.customer_id,
    planId: event.data.plan_id,
  });

  // Activate subscription, grant access, send welcome email, etc.
  await activateSubscription(event.data.subscription_id);
  await sendSubscriptionWelcomeEmail(event.data.customer_id, event.data);
}

async function handleSubscriptionCancelled(event: WebhookEvent): Promise<void> {
  console.log('🛑 Subscription cancelled:', {
    subscriptionId: event.data.subscription_id,
    customerId: event.data.customer_id,
    reason: event.data.cancellation_reason,
  });

  // Revoke access, send cancellation confirmation, process refund if needed, etc.
  await revokeSubscriptionAccess(event.data.subscription_id);
  await sendSubscriptionCancellationEmail(event.data.customer_id, event.data);
}

async function handleDisputeCreated(event: WebhookEvent): Promise<void> {
  console.log('⚠️ Dispute created:', {
    disputeId: event.data.dispute_id,
    paymentId: event.data.payment_id,
    amount: event.data.amount,
    reason: event.data.reason,
  });

  // Notify fraud team, gather evidence, update order status, etc.
  await notifyFraudTeam(event.data.dispute_id, event.data);
  await updateOrderStatus(event.data.payment_id, 'disputed');
}

// Placeholder functions for business logic
async function updatePaymentStatus(paymentId: string, status: string): Promise<void> {
  console.log(`Updating payment ${paymentId} status to ${status}`);
  // Implementation would update your database
}

async function sendPaymentConfirmationEmail(customerId: string, paymentData: any): Promise<void> {
  console.log(`Sending payment confirmation to customer ${customerId}`);
  // Implementation would send email via your email service
}

async function sendPaymentFailureNotification(customerId: string, paymentData: any): Promise<void> {
  console.log(`Sending payment failure notification to customer ${customerId}`);
  // Implementation would send notification
}

async function activateSubscription(subscriptionId: string): Promise<void> {
  console.log(`Activating subscription ${subscriptionId}`);
  // Implementation would update database and grant access
}

async function sendSubscriptionWelcomeEmail(customerId: string, subscriptionData: any): Promise<void> {
  console.log(`Sending subscription welcome email to customer ${customerId}`);
  // Implementation would send welcome email
}

async function revokeSubscriptionAccess(subscriptionId: string): Promise<void> {
  console.log(`Revoking access for subscription ${subscriptionId}`);
  // Implementation would update database and revoke access
}

async function sendSubscriptionCancellationEmail(customerId: string, subscriptionData: any): Promise<void> {
  console.log(`Sending cancellation email to customer ${customerId}`);
  // Implementation would send cancellation email
}

async function notifyFraudTeam(disputeId: string, disputeData: any): Promise<void> {
  console.log(`Notifying fraud team about dispute ${disputeId}`);
  // Implementation would send alert to fraud team
}

async function updateOrderStatus(paymentId: string, status: string): Promise<void> {
  console.log(`Updating order ${paymentId} status to ${status}`);
  // Implementation would update order management system
}

// Example Express server setup
function setupWebhookServer(webhookManager: WebhookManager): express.Application {
  const app = express();

  // Middleware to parse JSON bodies
  app.use(express.json({ type: 'application/json' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Webhook endpoint
  app.post('/webhooks/qorpay', webhookManager.createExpressMiddleware());

  return app;
}

// Example usage
async function main() {
  console.log('🔔 QorPay Webhook Integration Example');
  console.log('===================================');

  try {
    // Initialize webhook manager
    const webhookManager = new WebhookManager(process.env.QORPAY_WEBHOOK_SECRET || 'your-webhook-secret');

    // Register webhook handlers
    webhookManager.on('payment.completed', handlePaymentSuccess);
    webhookManager.on('payment.failed', handlePaymentFailure);
    webhookManager.on('subscription.created', handleSubscriptionCreated);
    webhookManager.on('subscription.cancelled', handleSubscriptionCancelled);
    webhookManager.on('dispute.created', handleDisputeCreated);

    // Register wildcard handler for all events
    webhookManager.on('*', async (event: WebhookEvent) => {
      console.log(`📝 Logging all events: ${event.type} at ${event.created_at}`);
      // Store all events for auditing/debugging
    });

    // Get available webhook events
    const availableEvents = await getAvailableWebhookEvents();

    // Create a webhook (in production, you'd use your actual endpoint URL)
    const webhookUrl = 'https://your-domain.com/webhooks/qorpay';
    const selectedEvents = [
      'payment.completed',
      'payment.failed',
      'subscription.created',
      'subscription.cancelled',
      'dispute.created',
    ];

    const webhook = await createWebhook(webhookUrl, selectedEvents);

    // List all webhooks
    await listWebhooks();

    // Setup Express server (for demonstration)
    const app = setupWebhookServer(webhookManager);

    const PORT = process.env.WEBHOOK_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Webhook server listening on port ${PORT}`);
      console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhooks/qorpay`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });

    // Example of processing a webhook manually (for testing)
    const testEvent = {
      id: 'evt_test_123',
      type: 'payment.completed',
      created_at: new Date().toISOString(),
      data: {
        payment_id: 'pay_test_456',
        amount: 100.00,
        currency: 'USD',
        customer_id: 'cust_test_789',
      },
      livemode: false,
    };

    // This would normally be triggered by an actual webhook from QorPay
    const testPayload = JSON.stringify(testEvent);
    const testSignature = 'test_signature'; // In production, this comes from QorPay

    // await webhookManager.processWebhook(testPayload, testSignature);

    console.log('✅ Webhook integration setup completed successfully!');
  } catch (error) {
    console.error('❌ Webhook integration example failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  WebhookManager,
  createWebhook,
  listWebhooks,
  getAvailableWebhookEvents,
  handlePaymentSuccess,
  handlePaymentFailure,
  handleSubscriptionCreated,
  handleSubscriptionCancelled,
  handleDisputeCreated,
  setupWebhookServer,
};