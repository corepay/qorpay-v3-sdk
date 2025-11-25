# QorPay V3 SDK

A TypeScript SDK for QorPay payment processing API with type-safe interfaces and REST-compliant methods.

## WHAT IT DOES

Process payments, manage customers, handle subscriptions, and more through QorPay's payment platform.

**Main Features:**
- Accept credit/debit card payments
- Process ACH bank transfers
- Manage customer payment methods
- Handle subscription billing
- Process marketplaces with split payments
- Manage disputes and chargebacks
- Validate payment data
- Process webhooks
- Generate reports

## HOW TO USE IT

### Installation
```bash
npm install @corepay/qorpay-v3-sdk
```

### Basic Setup
```typescript
import { QorPayClient } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: 'your-app-key',
  clientKey: 'your-client-key',
  environment: 'sandbox', // or 'production'
});
```

### Common Tasks

**Process a Card Payment**
```typescript
const payment = await qorpay.payments.create({
  amount: 100.50,
  currency: 'USD',
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
});
```

**Create a Customer**
```typescript
const customer = await qorpay.customers.create({
  email: 'customer@example.com',
  name: 'John Doe',
  phone: '+1-555-123-4567',
});
```

**Process a Refund**
```typescript
const refund = await qorpay.payments.refund('pay_1234567890', {
  amount: 50.00,
  reason: 'Customer requested refund',
});
```

**List Transactions**
```typescript
const transactions = await qorpay.transactions.list({
  status: 'approved',
  limit: 25,
  startDate: new Date('2024-01-01'),
});
```

**Validate a Card**
```typescript
const validation = await qorpay.utilities.validateCard({
  cardNumber: '4111111111111111',
  expiryMonth: '12',
  expiryYear: '25',
  cvv: '123',
});
```

## 🔒 Security & Best Practices

### Token Payment Security

**🚨 IMPORTANT: Customer ID Required for Token Payments**

For security and compliance, all token payments **must** include a `customer_id`. This prevents token hijacking and ensures proper audit trails.

```typescript
// ✅ SECURE: Token payment with customer verification
const customer = await qorpay.customers.create({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe'
});

// Create a token linked to the customer
const token = await qorpay.paymentTokens.createCardToken({
  card_number: '4111111111111111',
  card_exp: '1225',
  customer_id: customer.id, // Link token to customer
  card_holder: 'John Doe'
});

// Process payment with token (customer_id required)
const payment = await qorpay.payments.saleToken({
  mid: 'your-mid',
  amount: '29.99',
  creditcard: token.token,
  customer_id: customer.id, // REQUIRED: Must match token owner
  customer_validation: {
    name_match: true,
    email_match: true
  }
});

// ❌ BLOCKED: Token payment without customer_id
await qorpay.payments.saleToken({
  creditcard: 'tok_abc123',
  amount: '29.99',
  // customer_id: 'MISSING' -> ValidationError!
});
```

### One-Time vs Token Payments

```typescript
// ✅ One-time payments don't need customer_id
await qorpay.payments.saleManual({
  mid: 'your-mid',
  amount: '29.99',
  creditcard: '4111111111111111', // Raw card, not token
  cvv: '123',
  month: '12',
  year: '25'
  // No customer_id needed for one-time payments
});

// ⚠️ Token payments ALWAYS require customer_id
await qorpay.payments.saleToken({
  creditcard: 'tok_abc123', // Stored token
  amount: '29.99',
  customer_id: 'cust_xyz789' // REQUIRED for security
});
```

### Customer Validation Options

Enhance security with optional customer validation:

```typescript
await qorpay.payments.saleToken({
  creditcard: 'tok_abc123',
  amount: '29.99',
  customer_id: 'cust_xyz789',
  customer_validation: {
    name_match: true,    // Customer name matches token holder
    email_match: true,   // Customer email matches token holder
    ip_match: true       // Customer IP matches previous usage
  }
});
```

### Security Benefits

- **🛡️ Fraud Prevention**: Tokens can only be used by their owning customer
- **📋 Audit Trails**: Clear customer-token relationships for compliance
- **🔒 Regulatory Compliance**: Meets PCI-DSS requirements for stored payment methods
- **💼 Business Logic**: Prevents orphaned tokens and misuse



## 📦 Installation

```bash
npm install @corepay/qorpay-v3-sdk
```

## 🚀 Quick Start

```typescript
import { QorPayClient } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: 'your-app-key',
  clientKey: 'your-client-key',
  environment: 'sandbox',
});

// Create a payment - clean and simple!
const payment = await qorpay.payments.create({
  amount: 100.5, // Number, not string
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
});

console.log(payment.id); // txn_abc123
console.log(payment.status); // 'approved'
console.log(payment.amount); // 100.5 (number)
```

## WHERE TO FIND THINGS

### API Resources
All available through `qorpay.resourceName.method()`:

| Resource | What It Does | Example Usage |
|----------|--------------|---------------|
| **Payments** | Process card/ACH/cash payments, refunds, captures | `qorpay.payments.create({...})` |
| **Transactions** | View payment history and transaction details | `qorpay.transactions.list({...})` |
| **Customers** | Manage customer data and payment methods | `qorpay.customers.create({...})` |
| **Payment Tokens** | Store payment methods securely | `qorpay.paymentTokens.create({...})` |
| **ACH Payments** | Process bank transfers | `qorpay.achPayments.createDebit({...})` |
| **Subscriptions** | Manage recurring billing | `qorpay.subscriptions.create({...})` |
| **Gift Cards** | Issue and redeem gift cards | `qorpay.giftCards.create({...})` |
| **Disputes** | Handle chargebacks | `qorpay.disputes.create({...})` |
| **Webhooks** | Configure event notifications | `qorpay.webhooks.create({...})` |
| **Utilities** | Validate cards, BIN lookup, etc. | `qorpay.utilities.validateCard({...})` |

### Documentation & Resources
- **API Documentation**: [QorPay API Docs](https://docs.qorcommerce.io/)
- **Type Definitions**: Inline JSDoc in your IDE
- **Test Examples**: `tests/` directory - Usage patterns

### Error Handling
```typescript
try {
  const payment = await qorpay.payments.create(paymentData);
} catch (error) {
  if (error.code === 'card_declined') {
    // Handle declined card
  } else if (error.code === 'insufficient_funds') {
    // Handle insufficient funds
  }
}
```

## ALL RESOURCES & METHODS

### Payments
```typescript
qorpay.payments.create(data)        // Process payment
qorpay.payments.capture(id)         // Capture authorized payment
qorpay.payments.void(id)            // Void payment
qorpay.payments.refund(id, data)    // Refund payment
qorpay.payments.get(id)             // Get payment details
qorpay.payments.list(filters)       // List payments
```

### Customers
```typescript
qorpay.customers.create(data)       // Create customer
qorpay.customers.get(id)            // Get customer
qorpay.customers.update(id, data)   // Update customer
qorpay.customers.delete(id)         // Delete customer
qorpay.customers.list(filters)      // List customers
```

### All Other Resources
Each resource follows the same pattern: `create()`, `get()`, `list()`, `update()`, `delete()` where applicable.

### Core Resources

| Resource | Methods | Examples |
|----------|---------|----------|
| **Payments** | `create()`, `authorize()`, `capture()`, `void()`, `refund()` | `qorpay.payments.create({...})` |
| **Transactions** | `get()`, `list()`, `listByCustomer()`, `listByBatch()` | `qorpay.transactions.list({status: 'approved'})` |
| **Payment Tokens** | `createCardToken()`, `getCardToken()`, `listExpiringCardTokens()` | `qorpay.paymentTokens.createCardToken({...})` |
| **Customers** | `create()`, `get()`, `list()`, `update()`, `delete()` | `qorpay.customers.create({email: '...'})` |
| **ACH Payments** | `createDebit()`, `createCredit()`, `void()`, `refund()` | `qorpay.achPayments.createDebit({...})` |
| **Utilities** | `validateCard()`, `lookupBin()`, `validateRouting()` | `qorpay.utilities.validateCard('411111...')` |

## DEVELOPMENT

### Setup
```bash
npm install
npm test        # Run tests
npm run build   # Build the package
```

### Testing
```bash
npm run test:coverage  # See coverage report
npm run test:watch     # Watch mode
```

### Status
- **API Coverage**: 139 endpoints across 16 resource classes
- **Test Coverage**: 92.16% statements
- **Type Safety**: 100% (zero `any` types)
- **Bundle Size**: 2.82 MB total (ESM, CJS, UMD)

## 🏗️ Project Structure

```
qorpay-v3-sdk/
├── src/
│   ├── client/          # HTTP client and main SDK client
│   ├── resources/       # Resource classes (Payments, Customers, etc.)
│   ├── types/           # TypeScript type definitions
│   ├── schemas/         # Zod validation schemas
│   ├── errors/          # Custom error classes
│   └── index.ts         # Main export
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests with MSW
├── .sandbox/            # Planning docs (gitignored, AI-accessible)
│   ├── SDK_STRATEGY.md
│   ├── REST_BEST_PRACTICES_PLAN.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── GAP_ANALYSIS.md
│   ├── oas.json
│   └── oas.postman.json
└── scripts/             # Utility scripts
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Run all quality gates
npm run type-check && npm test && npm run lint && npm run build
```

## 📊 Current Status

- **API Coverage**: 139 endpoints across 16 resource classes
- **Test Coverage**: 92.16% statements, 86.46% branches, 92.53% functions
- **Test Suite**: 436 unit tests, 526 total tests
- **Type Safety**: 100% (zero `any` types)
- **Input Validation**: Zod schemas for all API inputs
- **Bundle Size**: 2.82 MB total (ESM, CJS, UMD)

## Implementation Status

### Available Resources

All 16 resources are fully implemented with REST-compliant APIs:

- **Payments** (18 endpoints) - Card, ACH, cash, and gift card payments
- **Transactions** (16 endpoints) - Transaction management and reporting
- **Payment Tokens** (11 endpoints) - Card and ACH tokenization
- **Customers** (6 endpoints) - Customer CRUD operations
- **ACH Payments** (6 endpoints) - ACH-specific payment operations
- **Utilities** (16 endpoints) - Validation and utility functions
- **Channels** (12 endpoints) - Channel and marketplace operations
- **Webhooks** (9 endpoints) - Webhook configuration and management
- **Payment Forms** (8 endpoints) - Payment form management
- **Plans** (7 endpoints) - Subscription plan management
- **Gift Cards** (6 endpoints) - Gift card operations
- **Payment Methods** (6 endpoints) - Payment method management
- **Deposits** (4 endpoints) - Deposit and payout management
- **Disputes** (4 endpoints) - Dispute handling and management
- **Proof of Delivery** (6 endpoints) - Delivery verification
- **Cash Payments** (4 endpoints) - Cash payment processing

## 🤝 Contributing

1. Read `.sandbox/SDK_STRATEGY.md` for overall approach
2. Read `.sandbox/REST_BEST_PRACTICES_PLAN.md` for patterns
3. Follow existing code patterns
4. Ensure all tests pass
5. Maintain 100% type safety (no `any`)

## 📝 License

MIT

## 🔗 Links

- [QorPay API Documentation](https://docs.qorcommerce.io/)
- [GitHub Repository](https://github.com/corepay/qorpay-v3-sdk)
- [npm Package](https://www.npmjs.com/package/@corepay/qorpay-v3-sdk)

---
