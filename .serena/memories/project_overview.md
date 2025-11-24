# QorPay V3 SDK - Project Overview

**Project Status**: Feature-Complete with 100% API Coverage (137/137 endpoints)
**Last Updated**: 2025-11-24

## Project Purpose
The QorPay V3 SDK is a TypeScript SDK for the QorPay payment processing API that provides a clean, type-safe, REST-compliant interface. This is **not a 1:1 API wrapper** - it's a world-class SDK that abstracts QorPay's inconsistent API into a developer-friendly interface.

## Tech Stack
- **Language**: TypeScript
- **Build Tool**: Rollup
- **Testing**: Jest + MSW (Mock Service Worker)
- **Validation**: Zod schemas
- **Linting**: ESLint + Prettier
- **Documentation**: TypeDoc + JSDoc

## Code Style & Conventions
- **Type Safety**: 100% TypeScript (zero `any` types)
- **Method Naming**: REST-standard (`get`, `list`, `create`, `update`, `delete`)
- **Architecture**: Resource-oriented with transformation layer
- **Validation**: Zod schemas for all inputs
- **Documentation**: Complete JSDoc coverage
- **Testing**: Comprehensive unit + integration tests

## Quality Commands
```bash
# Type checking
npm run type-check

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Build
npm run build

# All quality gates (must pass before commit)
npm run type-check && npm test && npm run lint && npm run build
```

## Project Structure
```
src/
├── client/          # HTTP client and main SDK client
├── resources/       # Resource classes (Payments, Customers, etc.)
├── types/           # TypeScript type definitions
├── schemas/         # Zod validation schemas
├── errors/          # Custom error classes
└── index.ts         # Main export

tests/
├── unit/            # Unit tests
└── integration/     # Integration tests with MSW
```

## Current Implementation Status
- **API Coverage**: 100% (137/137 endpoints)
- **Resources Implemented**: All 8 resources complete
  - Payments ✅
  - Customers ✅
  - Utilities ✅
  - Subscriptions ✅
  - Webhooks ✅
  - Deposits ✅
  - Disputes ✅
  - Payment Methods ✅
- **Test Coverage**: 100% with 419 passing tests
- **Type Safety**: Zero TypeScript errors

## Key Architecture Patterns

### Transformation Layer
The SDK uses a transformation layer to convert between clean SDK interfaces and QorPay's native API format:

```
Developer Input (Clean) → [Zod Validation] → [Request Transformer] → QorPay Format (Ugly)
```

### Resource Pattern
All resources follow consistent patterns:
- Constructor receives BaseClient instance
- Methods use REST naming conventions
- Input validation with Zod schemas
- Request/response transformation
- Comprehensive error handling

### Quality Standards
- 100% TypeScript coverage
- Zero `any` types allowed
- Zod validation for all inputs
- Complete test coverage
- JSDoc documentation

## Entry Points
```typescript
import { QorPayClient } from '@corepay/qorpay-v3-sdk';

const qorpay = new QorPayClient({
  appKey: 'your-app-key',
  clientKey: 'your-client-key',
  environment: 'sandbox',
});
```

## Documentation & References
- SDK Strategy: `.sandbox/SDK_STRATEGY.md`
- Implementation Plan: `.sandbox/IMPLEMENTATION_PLAN.md`
- Gap Analysis: `.sandbox/GAP_ANALYSIS.md`
- REST Best Practices: `.sandbox/REST_BEST_PRACTICES_PLAN.md`

The project is production-ready and feature-complete with comprehensive endpoint coverage, type safety, and developer experience optimizations.