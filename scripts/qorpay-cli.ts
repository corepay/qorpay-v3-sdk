#!/usr/bin/env node

/**
 * QorPay CLI Tool
 * A practical command-line utility for common QorPay SDK operations
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const program = new Command();

// Configuration storage
const CONFIG_FILE = join(homedir(), '.qorpay.json');

interface Config {
  appKey?: string;
  clientKey?: string;
  environment?: 'sandbox' | 'production';
  defaultCurrency?: string;
  webhookUrl?: string;
}

function loadConfig(): Config {
  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function saveConfig(config: Config): void {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Configure command
program
  .name('qorpay')
  .description('CLI tool for QorPay V3 SDK operations')
  .version('1.0.0');

// Setup command - configure API keys
program
  .command('configure')
  .description('Configure QorPay API credentials')
  .option('-a, --app-key <key>', 'QorPay App Key')
  .option('-c, --client-key <key>', 'QorPay Client Key')
  .option('-e, --environment <env>', 'Environment (sandbox|production)', 'sandbox')
  .option('-w, --webhook <url>', 'Default webhook URL')
  .action((options) => {
    const config = loadConfig();

    if (options.appKey) config.appKey = options.appKey;
    if (options.clientKey) config.clientKey = options.clientKey;
    if (options.environment) config.environment = options.environment;
    if (options.webhook) config.webhookUrl = options.webhook;

    saveConfig(config);
    console.log('✅ Configuration saved');
  });

// Create payment command
program
  .command('payment')
  .description('Create a payment')
  .requiredOption('-a, --amount <number>', 'Payment amount')
  .option('-c, --currency <code>', 'Currency code', 'USD')
  .option('-d, --description <text>', 'Payment description')
  .option('--card-number <number>', 'Card number')
  .option('--card-expiry <month>', 'Expiry MM')
  .option('--card-year <year>', 'Expiry YY')
  .option('--card-cvv <cvv>', 'Card CVV')
  .option('--customer-email <email>', 'Customer email')
  .option('--customer-name <name>', 'Customer name')
  .option('--test', 'Use test card if no card provided')
  .action(async (options) => {
    const config = loadConfig();
    if (!config.appKey || !config.clientKey) {
      console.error('❌ Please run "qorpay configure" first');
      process.exit(1);
    }

    // Dynamic import to avoid loading SDK unless needed
    const { QorPayClient } = await import('../src/index.js');
    const qorpay = new QorPayClient({
      appKey: config.appKey,
      clientKey: config.clientKey,
      environment: config.environment || 'sandbox'
    });

    try {
      const paymentData: any = {
        amount: parseFloat(options.amount),
        currency: options.currency,
        description: options.description
      };

      if (options.cardNumber) {
        paymentData.card = {
          number: options.cardNumber,
          expiryMonth: options.cardExpiry,
          expiryYear: options.cardYear,
          cvv: options.cardCvv
        };
      } else if (options.test) {
        paymentData.card = {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123'
        };
      }

      if (options.customerEmail) {
        paymentData.customer = {
          email: options.customerEmail,
          name: options.customerName
        };
      }

      const payment = await qorpay.payments.create(paymentData);

      console.log('✅ Payment created:', {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      });

    } catch (error) {
      console.error('❌ Payment failed:', error.message);
      process.exit(1);
    }
  });

// List transactions command
program
  .command('list')
  .description('List transactions')
  .option('-l, --limit <number>', 'Number of transactions', '10')
  .option('-s, --status <status>', 'Filter by status')
  .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
  .option('--end-date <date>', 'End date (YYYY-MM-DD)')
  .action(async (options) => {
    const config = loadConfig();
    if (!config.appKey || !config.clientKey) {
      console.error('❌ Please run "qorpay configure" first');
      process.exit(1);
    }

    const { QorPayClient } = await import('../src/index.js');
    const qorpay = new QorPayClient({
      appKey: config.appKey,
      clientKey: config.clientKey,
      environment: config.environment || 'sandbox'
    });

    try {
      const params: any = { limit: parseInt(options.limit) };

      if (options.status) params.status = options.status;
      if (options.startDate) params.startDate = new Date(options.startDate);
      if (options.endDate) params.endDate = new Date(options.endDate);

      const result = await qorpay.transactions.list(params);

      console.log(`📋 Found ${result.data.length} transactions:\n`);

      result.data.forEach((tx: any, i: number) => {
        console.log(`${i + 1}. ${tx.id}`);
        console.log(`   Amount: ${tx.currency} ${tx.amount}`);
        console.log(`   Status: ${tx.status}`);
        console.log(`   Date: ${tx.createdAt.toLocaleDateString()}\n`);
      });

    } catch (error) {
      console.error('❌ Failed to list transactions:', error.message);
      process.exit(1);
    }
  });

// Webhook command
program
  .command('webhook')
  .description('Web utilities')
  .argument('<action>', 'Action to perform', 'listen')
  .option('-p, --port <number>', 'Port to listen on', '3000')
  .option('-u, --url <url>', 'Webhook URL')
  .action(async (action, options) => {
    if (action === 'listen') {
      console.log(`🎣 Listening for webhooks on port ${options.port}...`);
      console.log('Press Ctrl+C to stop\n');

      // Simple webhook server example
      const http = await import('http');
      const server = http.createServer((req: any, res: any) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const event = JSON.parse(body);
            console.log('📩 Webhook received:', {
              type: event.type,
              id: event.id,
              timestamp: new Date().toISOString()
            });
            res.writeHead(200);
            res.end('OK');
          } catch (error) {
            console.error('❌ Invalid webhook:', error.message);
            res.writeHead(400);
            res.end('Invalid JSON');
          }
        });
      });

      server.listen(options.port, () => {
        console.log(`Server running at http://localhost:${options.port}`);
      });
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate payment data without charging')
  .argument('<type>', 'Type to validate', 'card|routing|ach')
  .requiredOption('-d, --data <json>', 'Data to validate (JSON)')
  .action(async (type, options) => {
    const config = loadConfig();
    if (!config.appKey || !config.clientKey) {
      console.error('❌ Please run "qorpay configure" first');
      process.exit(1);
    }

    const { QorPayClient } = await import('../src/index.js');
    const qorpay = new QorPayClient({
      appKey: config.appKey,
      clientKey: config.clientKey,
      environment: config.environment || 'sandbox'
    });

    try {
      const data = JSON.parse(options.data);
      let result;

      switch (type) {
        case 'card':
          result = await qorpay.utilities.validateCard(data);
          console.log('✅ Card validation result:', result);
          break;
        case 'routing':
          result = await qorpay.utilities.validateRouting(data);
          console.log('✅ Routing validation result:', result);
          break;
        default:
          console.error('❌ Unknown validation type');
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });

// Export command - generate code snippets
program
  .command('generate')
  .description('Generate code snippets')
  .argument('<language>', 'Target language', 'typescript|javascript')
  .argument('<action>', 'Action to generate', 'payment|refund|subscription')
  .option('-o, --output <file>', 'Output file')
  .action(async (language, action, options) => {
    const snippets: Record<string, Record<string, string>> = {
      typescript: {
        payment: `import { QorPayClient } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: 'your-app-key',
  clientKey: 'your-client-key',
  environment: 'sandbox'
});

const payment = await qorpay.payments.create({
  amount: 100.00,
  currency: 'USD',
  description: 'Payment description',
  card: {
    number: '4111111111111111',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '123'
  },
  customer: {
    email: 'customer@example.com',
    name: 'Customer Name'
  }
});`,
        refund: `const refund = await qorpay.payments.refund('payment_id', {
  amount: 50.00,
  reason: 'Customer requested refund'
});`,
        subscription: `const plan = await qorpay.plans.create({
  name: 'Premium Plan',
  amount: 29.99,
  currency: 'USD',
  interval: 'month'
});`
      },
      javascript: {
        payment: `const { QorPayClient } = require('@corepay/qorpay-v3-sdk');

const qorpay = new QorPayClient({
  appKey: 'your-app-key',
  clientKey: 'your-client-key',
  environment: 'sandbox'
});

const payment = await qorpay.payments.create({
  amount: 100.00,
  currency: 'USD',
  description: 'Payment description',
  card: {
    number: '4111111111111111',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '123'
  }
});`
      }
    };

    const snippet = snippets[language]?.[action];
    if (!snippet) {
      console.error('❌ Snippet not found');
      process.exit(1);
    }

    if (options.output) {
      writeFileSync(options.output, snippet);
      console.log(`✅ Snippet saved to ${options.output}`);
    } else {
      console.log(snippet);
    }
  });

// Show current config
program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    const config = loadConfig();
    console.log('Current configuration:');
    console.log(JSON.stringify(config, null, 2));
  });

program.parse();