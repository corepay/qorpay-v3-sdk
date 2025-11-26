# QorPay V3 SDK

A TypeScript SDK for QorPay payment processing API with type-safe interfaces and REST-compliant methods.

---

## ⚠️ IMPORTANT DISCLAIMER

**This SDK is NOT provided by, endorsed by, or affiliated with QorPay Inc. (https://qorpay.com)**

This SDK is an independent, community-driven implementation created as a best-practice RESTful wrapper around the QorCommerce V3 APIs (https://docs.qorcommerce.io).

### 🚨 USE AT YOUR OWN RISK

**NO WARRANTY**: This software is provided "AS IS" without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement.

**NO LIABILITY**: In no event shall the authors, contributors, or maintainers of this SDK be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

**FINANCIAL RISK**: Payment processing involves financial transactions and sensitive data. Users are solely responsible for:
- Testing thoroughly before production use
- Ensuring compliance with PCI DSS and other financial regulations
- Validating all transactions and business logic
- Implementing appropriate security measures
- Monitoring for fraudulent activity

**NO OFFICIAL SUPPORT**: This SDK does not come with official support from QorPay Inc. For official QorPay support, contact QorPay directly through their official channels.

### ✅ WHAT THIS SDK PROVIDES

- **Community Best Practices**: RESTful design patterns and modern TypeScript implementation
- **Developer Experience**: Type-safe interfaces and comprehensive documentation
- **Educational Value**: Reference implementation for API integration patterns
- **Open Source Collaboration**: Community-driven improvements and contributions

### 📋 RECOMMENDATIONS

1. **TEST THOROUGHLY**: Always test in sandbox environment before production
2. **REVIEW CODE**: Understand the implementation before using in production
3. **MONITOR TRANSACTIONS**: Implement proper logging and monitoring
4. **SECURITY AUDIT**: Conduct security reviews before production deployment
5. **OFFICIAL DOCUMENTATION**: Always reference the official QorCommerce API documentation

### 🔗 OFFICIAL RESOURCES

- **QorPay Inc.**: https://qorpay.com
- **Official API Documentation**: https://docs.qorcommerce.io
- **Official Support**: Contact QorPay Inc. directly for official support

---

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

The package is published to **GitHub Packages Registry**. To install:

**Option 1: Install with registry flag**

```bash
npm install @corepay/qorpay-v3-sdk --registry=https://npm.pkg.github.com
```

**Option 2: Configure .npmrc in your project**
Create or add to your project's `.npmrc` file:

```
@corepay:registry=https://npm.pkg.github.com/
```

Then install normally:

```bash
npm install @corepay/qorpay-v3-sdk
```

**Option 3: Configure global .npmrc**
Add to your global `~/.npmrc`:

```
@corepay:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
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
  amount: 100.5,
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
  amount: 50.0,
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

## 📚 Examples & Code Patterns

### 🟢 Quick Start Examples

```bash
# Explore comprehensive examples
ls examples/
examples/
├── README.md                    # Complete examples guide
├── basic/sdk-setup.ts           # SDK initialization & basic payments
├── basic/ach-payments.ts        # Bank transfer payments
├── security/secure-token-payments.ts # Secure token payments
├── advanced/error-handling.ts   # Production-ready error handling
├── advanced/webhook-integration.ts # Real-time webhook processing
├── advanced/recurring-payments.ts # Subscription billing
└── testing/testing-with-sdk.ts  # Testing patterns & utilities
```

### 🔒 Security & Best Practices

### Token Payment Security

**🚨 IMPORTANT: Customer ID Required for Token Payments**

For security and compliance, all token payments **must** include a `customer_id`. This prevents token hijacking and ensures proper audit trails.

```typescript
// ✅ SECURE: Token payment with customer verification
const customer = await qorpay.customers.create({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
});

// Create a token linked to the customer
const token = await qorpay.paymentTokens.createCardToken({
  card_number: '4111111111111111',
  card_exp: '1225',
  customer_id: customer.id, // Link token to customer
  card_holder: 'John Doe',
});

// Process payment with token (customer_id required)
const payment = await qorpay.payments.saleToken({
  mid: 'your-mid',
  amount: '29.99',
  creditcard: token.token,
  customer_id: customer.id, // REQUIRED: Must match token owner
  customer_validation: {
    name_match: true,
    email_match: true,
  },
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
  year: '25',
  // No customer_id needed for one-time payments
});

// ⚠️ Token payments ALWAYS require customer_id
await qorpay.payments.saleToken({
  creditcard: 'tok_abc123', // Stored token
  amount: '29.99',
  customer_id: 'cust_xyz789', // REQUIRED for security
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
    name_match: true, // Customer name matches token holder
    email_match: true, // Customer email matches token holder
    ip_match: true, // Customer IP matches previous usage
  },
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

| Resource           | What It Does                                      | Example Usage                           |
| ------------------ | ------------------------------------------------- | --------------------------------------- |
| **Payments**       | Process card/ACH/cash payments, refunds, captures | `qorpay.payments.create({...})`         |
| **Transactions**   | View payment history and transaction details      | `qorpay.transactions.list({...})`       |
| **Customers**      | Manage customer data and payment methods          | `qorpay.customers.create({...})`        |
| **Payment Tokens** | Store payment methods securely                    | `qorpay.paymentTokens.create({...})`    |
| **ACH Payments**   | Process bank transfers                            | `qorpay.achPayments.createDebit({...})` |
| **Subscriptions**  | Manage recurring billing                          | `qorpay.subscriptions.create({...})`    |
| **Gift Cards**     | Issue and redeem gift cards                       | `qorpay.giftCards.create({...})`        |
| **Disputes**       | Handle chargebacks                                | `qorpay.disputes.create({...})`         |
| **Webhooks**       | Configure event notifications                     | `qorpay.webhooks.create({...})`         |
| **Utilities**      | Validate cards, BIN lookup, etc.                  | `qorpay.utilities.validateCard({...})`  |

### Documentation & Resources

- **API Documentation**: [QorPay API Docs](https://docs.qorcommerce.io/)
- **Type Definitions**: Inline JSDoc in your IDE
- **Code Examples**: `examples/` directory - Comprehensive usage patterns
- **Test Examples**: `tests/` directory - Testing patterns and utilities

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
qorpay.payments.create(data); // Process payment
qorpay.payments.capture(id); // Capture authorized payment
qorpay.payments.void(id); // Void payment
qorpay.payments.refund(id, data); // Refund payment
qorpay.payments.get(id); // Get payment details
qorpay.payments.list(filters); // List payments
```

### Customers

```typescript
qorpay.customers.create(data); // Create customer
qorpay.customers.get(id); // Get customer
qorpay.customers.update(id, data); // Update customer
qorpay.customers.delete(id); // Delete customer
qorpay.customers.list(filters); // List customers
```

### All Other Resources

Each resource follows the same pattern: `create()`, `get()`, `list()`, `update()`, `delete()` where applicable.

### Core Resources

| Resource           | Methods                                                           | Examples                                         |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------ |
| **Payments**       | `create()`, `authorize()`, `capture()`, `void()`, `refund()`      | `qorpay.payments.create({...})`                  |
| **Transactions**   | `get()`, `list()`, `listByCustomer()`, `listByBatch()`            | `qorpay.transactions.list({status: 'approved'})` |
| **Payment Tokens** | `createCardToken()`, `getCardToken()`, `listExpiringCardTokens()` | `qorpay.paymentTokens.createCardToken({...})`    |
| **Customers**      | `create()`, `get()`, `list()`, `update()`, `delete()`             | `qorpay.customers.create({email: '...'})`        |
| **ACH Payments**   | `createDebit()`, `createCredit()`, `void()`, `refund()`           | `qorpay.achPayments.createDebit({...})`          |
| **Utilities**      | `validateCard()`, `lookupBin()`, `validateRouting()`              | `qorpay.utilities.validateCard('411111...')`     |

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

- **API Coverage**: 137 endpoints across 8 resource classes
- **Test Coverage**: 95.42% statements, 95.52% branches, 90.53% functions
- **Test Suite**: 900 passing tests (100% success rate)
- **Type Safety**: 100% (zero `any` types, 0 TS errors/warnings)
- **Code Quality**: 0 ESLint errors/warnings
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
├── examples/            # Comprehensive usage examples
│   ├── basic/           # Basic SDK usage patterns
│   ├── advanced/        # Advanced implementations
│   ├── security/        # Security best practices
│   └── testing/         # Testing patterns and utilities
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

- **API Coverage**: 137 endpoints across 8 resource classes (100% complete)
- **Test Coverage**: 95.42% statements, 95.52% branches, 90.53% functions
- **Test Suite**: 900 passing tests (100% success rate)
- **Type Safety**: 100% (zero `any` types, 0 TS errors/warnings)
- **Code Quality**: 0 ESLint errors/warnings
- **Input Validation**: Zod schemas for all API inputs
- **Bundle Size**: 2.82 MB total (ESM, CJS, UMD)

## Implementation Status

### Available Resources

All 8 resources are fully implemented with REST-compliant APIs:

- **Payments** (22 endpoints) - Card, ACH, cash, and gift card payments with full lifecycle
- **Transactions** (16 endpoints) - Transaction management and reporting with POD
- **Payment Tokens** (11 endpoints) - Card and ACH tokenization with security
- **Customers** (6 endpoints) - Customer CRUD operations
- **ACH Payments** (6 endpoints) - ACH-specific payment operations
- **Utilities** (16 endpoints) - Validation and utility functions
- **Webhooks** (9 endpoints) - Webhook configuration and management
- **Payment Methods** (6 endpoints) - Payment method management
- **Gift Cards** (6 endpoints) - Gift card operations
- **Deposits** (4 endpoints) - Deposit and payout management
- **Disputes** (4 endpoints) - Dispute handling and management
- **Payment Forms** (8 endpoints) - Payment form management
- **Proof of Delivery** (6 endpoints) - Delivery verification
- **Cash Payments** (4 endpoints) - Cash payment processing
- **Channels** (12 endpoints) - Channel and marketplace operations
- **Plans** (7 endpoints) - Subscription plan management

## 🤝 Contributing

1. Check the `examples/` directory for usage patterns and best practices
2. Follow existing code patterns and architecture
3. Ensure all tests pass (`npm test`)
4. Maintain 100% type safety (no `any` types)
5. Add tests for new features
6. Update documentation and examples as needed

## 📝 License

MIT

---

**⚠️ FINAL DISCLAIMER**: This is a community-driven SDK, NOT an official QorPay Inc. product. All financial and security responsibilities remain with the user. See the disclaimer section above for complete details.

## 🔗 Links

- [QorPay API Documentation](https://docs.qorcommerce.io/)
- [GitHub Repository](https://github.com/corepay/qorpay-v3-sdk)
- [npm Package](https://www.npmjs.com/package/@corepay/qorpay-v3-sdk)

---
