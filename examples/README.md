# QorPay SDK Examples

This directory contains comprehensive examples demonstrating how to use the QorPay V3 SDK in various scenarios. Each example is self-contained and includes detailed explanations of the concepts being demonstrated.

## 📁 Directory Structure

```
examples/
├── README.md                    # This file
├── basic/                       # Basic SDK usage examples
│   ├── sdk-setup.ts            # Simple SDK initialization and basic operations
│   └── ach-payments.ts         # ACH (bank transfer) payment processing
├── advanced/                    # Advanced usage patterns
│   └── error-handling.ts       # Comprehensive error handling and retry logic
├── security/                    # Security-focused examples
│   └── secure-token-payments.ts # Secure token payments with customer validation
└── testing/                     # Testing patterns and utilities
    └── testing-with-sdk.ts     # Unit and integration testing examples
```

## 🚀 Getting Started

### Prerequisites

1. **Install the SDK**:
   ```bash
   npm install @corepay/qorpay-v3-sdk
   ```

2. **Set up environment variables**:
   ```bash
   export QORPAY_APP_KEY="your-app-key"
   export QORPAY_CLIENT_KEY="your-client-key"
   ```

3. **Run any example**:
   ```bash
   # From the examples directory
   npx ts-node basic/sdk-setup.ts
   ```

## 📋 Example Categories

### 🟢 Basic Examples

Perfect for getting started with the SDK:

#### [SDK Setup](./basic/sdk-setup.ts)
- SDK initialization
- Basic card payments
- Customer creation
- Transaction listing

#### [ACH Payments](./basic/ach-payments.ts)
- ACH debit transactions
- ACH credit transactions
- Bank account verification
- Transaction management

### 🟡 Advanced Examples

For more complex use cases and production-ready patterns:

#### [Error Handling](./advanced/error-handling.ts)
- Comprehensive error classification
- Retry logic with exponential backoff
- User-friendly error messages
- Payment health monitoring

### 🔒 Security Examples

Essential for production applications dealing with sensitive payment data:

#### [Secure Token Payments](./security/secure-token-payments.ts)
- Customer validation requirements
- Token creation and management
- Fraud prevention patterns
- Security best practices

### 🧪 Testing Examples

For developers implementing tests for their payment integration:

#### [Testing with SDK](./testing/testing-with-sdk.ts)
- Mocking strategies
- Unit test patterns
- Integration testing
- Test data factories
- Performance testing

## 🎯 Key Concepts Demonstrated

### 1. **SDK Initialization**
```typescript
import { QorPayClient } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: process.env.QORPAY_APP_KEY,
  clientKey: process.env.QORPAY_CLIENT_KEY,
  environment: 'sandbox', // or 'production'
});
```

### 2. **Secure Token Payments**
```typescript
// Create a customer first
const customer = await qorpay.customers.create({
  email: 'customer@example.com',
  name: 'John Doe',
});

// Create a token linked to the customer
const token = await qorpay.paymentTokens.createCardToken({
  card_number: '4111111111111111',
  card_exp: '1225',
  customer_id: customer.id, // REQUIRED for security
});

// Process payment with token
const payment = await qorpay.payments.saleToken({
  creditcard: token.token,
  amount: '29.99',
  customer_id: customer.id, // REQUIRED
  customer_validation: {
    name_match: true,
    email_match: true,
  },
});
```

### 3. **Error Handling**
```typescript
try {
  const payment = await qorpay.payments.create(paymentData);
} catch (error) {
  if (error instanceof QorPayApiError) {
    if (error.isClientError()) {
      // Handle client errors (4xx)
      console.error('Validation error:', error.message);
    } else if (error.isServerError()) {
      // Handle server errors (5xx) - potentially retryable
      console.error('Server error, retrying...');
    }
  }
}
```

## 🛡️ Security Best Practices

1. **Always use customer_id for token payments** - This prevents token hijacking
2. **Validate customer information** - Use customer validation metadata when possible
3. **Handle errors gracefully** - Never expose sensitive information in error messages
4. **Use environment variables for credentials** - Never hardcode API keys
5. **Implement retry logic** - Handle network failures and rate limiting

## 🧪 Running the Examples

### Using TypeScript Directly
```bash
# Install TypeScript ts-node if not already installed
npm install -g ts-node

# Run any example
ts-node basic/sdk-setup.ts
```

### Using Node.js (after compilation)
```bash
# First compile the TypeScript
npx tsc basic/sdk-setup.ts

# Run the compiled JavaScript
node basic/sdk-setup.js
```

### In Your Own Project
```typescript
// Import the examples into your project
import { processCardPayment } from './examples/basic/sdk-setup';

// Use the functions
await processCardPayment();
```

## 📚 Additional Resources

- [Main README](../README.md) - Complete SDK documentation
- [CHANGELOG](../CHANGELOG.md) - Version history and changes
- [QorPay API Documentation](https://docs.qorcommerce.io/) - Complete API reference

## 🤝 Contributing Examples

To contribute new examples:

1. Choose the appropriate category directory
2. Follow the existing code style and documentation patterns
3. Include comprehensive error handling
4. Add detailed explanations of concepts being demonstrated
5. Ensure all examples work in sandbox environment

## ⚠️ Important Notes

- All examples use test/placeholder data
- Never use real customer data in examples
- Always use sandbox environment for development and testing
- Ensure you have proper error handling before moving to production

## 🆘 Need Help?

- Check the [main documentation](../README.md) for complete API reference
- Review error handling patterns in the [advanced examples](./advanced/error-handling.ts)
- Look at [security examples](./security/secure-token-payments.ts) for fraud prevention
- Use the [testing examples](./testing/testing-with-sdk.ts) for test patterns

Happy coding! 🚀