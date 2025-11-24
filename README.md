# QorPay V3 SDK

A TypeScript SDK for the QorPay payment processing API, providing a clean,
type-safe, REST-compliant interface.

## 🎯 Philosophy

This SDK is **not a 1:1 API wrapper**. We're building a **world-class SDK** that
abstracts QorPay's inconsistent API into a clean, intuitive interface following
REST best practices.

### What We Hide

- ❌ Inconsistent endpoint patterns
- ❌ Weird data wrappers (`transaction_data`)
- ❌ Confusing field names
- ❌ String amounts (we use numbers)
- ❌ Inconsistent date formats

### What We Provide

- ✅ Clean, predictable methods (`get`, `list`, `create`, `update`, `delete`)
- ✅ Full TypeScript type safety
- ✅ Zod validation for all inputs
- ✅ Transformation layer for requests/responses
- ✅ Comprehensive error handling

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

## 📚 Documentation

- **API Reference**: See JSDoc in source code
- **Examples**: See `examples/` directory
- **Planning Docs**: See `.sandbox/` directory (for AI agents and developers)

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

- **Coverage**: 65.7% (90/137 endpoints)
- **Tests**: 419 passing
- **Type Safety**: 100% (zero `any` types)
- **Validation**: Zod schemas for all inputs

## 🎯 Roadmap

See `.sandbox/IMPLEMENTATION_PLAN.md` for detailed roadmap.

**High Priority:**

1. Transaction Management (19 endpoints)
2. Payment Methods/Tokenization (14 endpoints)
3. Utilities & Validation (10 endpoints)

**Medium Priority:** 4. Complete CRUD Operations (9 endpoints) 5. Deposits &
Disputes (8 endpoints)

**Low Priority:** 6. Alternative Payment Methods (12 endpoints) 7. Advanced
Features (28 endpoints)

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

**Remember**: This SDK is designed to make QorPay's API a joy to use. The
developer should never have to think about QorPay's quirks! 🎯
