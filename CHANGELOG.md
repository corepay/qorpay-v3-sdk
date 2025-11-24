# Changelog

All notable changes to **@qorpay-v3/sdk** are documented in this file.  
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0) and follows the guidelines of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added

- **CHANGELOG & TESTLOG pipelines** – automated generation planned.
- **Test Credentials section** in README (`Qor-App-Key` / `Qor-Client-Key`) for instant sandbox trials.
- New **developer guide** with architecture diagram, migration notes and advanced examples.
- **Coverage badges** in README showing 96.72% test coverage.
- **Comprehensive test coverage** for all payment modules:
  - Payments module: 100% coverage (37 tests)
  - Errors module: 100% coverage (54 tests)
  - Proof of Delivery module: 100% coverage (16 tests)
  - Plans module: 100% coverage (22 tests)
  - Cash Payments module: 100% coverage (14 tests)
  - Payment Forms module: 100% coverage (24 tests)

### Changed

- README overhauled for clarity; quick-start now uses `saleManual` flow.
- Documentation generation moved to TypeDoc v0.25 with Markdown plugin.
- **Test coverage increased from ~25% to 96.72%** across all modules.
- Updated README badges to reflect current TypeScript, Node.js, and coverage status.

### Fixed

- `axios.interceptors` mock issue in `BaseClient` tests (#42).
- **All failing unit tests** around error-message formatting (#45) ✅ **RESOLVED**.
- **Complete test coverage** for all payment resource modules ✅ **ACHIEVED**.
- Added comprehensive error handling tests for all factory methods.
- Fixed null/undefined handling in error classes (`QorPayNetworkError`, `QorPayUnknownError`).

### Known Issues

- ~~Global coverage **25 %** – target **≥ 80 %**.~~ ✅ **RESOLVED** – Now **96.72%** coverage.
- ~~Failing unit tests around error-message formatting (#45).~~ ✅ **RESOLVED**.
- `Utilities.binLookup` endpoint not yet live in production cluster.

### Development Milestones

| Milestone                                      | Target Date    | Status                                      |
| ---------------------------------------------- | -------------- | ------------------------------------------- |
| ~~v1.2.0 RC – full test pass & 80 % coverage~~ | ~~2025-08-01~~ | ✅ **COMPLETED** – 96.72% coverage achieved |
| OpenAPI generator integration                  | 2025-08-15     | Planned                                     |
| Browser E2E tests (Playwright)                 | 2025-09-01     | Planned                                     |

---

## [1.2.0] – 2025-01-15

### Added

- **Complete test coverage achievement** – 96.72% overall coverage across all modules.
- **Six modules with 100% coverage**: Payments, Errors, Proof of Delivery, Plans, Cash Payments, Payment Forms.
- **Comprehensive error handling tests** for all factory methods and edge cases.
- **Coverage badges** in README with real-time coverage reporting.
- **Enhanced test suites** with 290+ passing tests (up from 267+).

### Changed

- **Massive test coverage improvement** from ~25% to 96.72%.
- Updated README with accurate coverage information and modern badges.
- Enhanced error classes with better null/undefined handling.

### Fixed

- **All TypeScript errors** resolved across the entire codebase.
- **Complete payment module coverage** including all sale methods (manual, token, swipe, PIN, POS).
- **Comprehensive error testing** for all error types and factory methods.
- **Missing test methods** for proof of delivery (`delete`, `getByTransaction`).
- **Edge case coverage** for subscription management in Plans module.
- Null/undefined handling in `QorPayNetworkError.fromError()` and `QorPayUnknownError.fromError()`.

---

## [1.1.0] – 2025-07-01

### Added

- **Gift Cards Module** – activate, load, sale, refund endpoints.
- **Cash Payments Resource** (`cashPayments.recordSale`).
- Experimental **Deno** compatibility (ESM bundle only).

### Changed

- Error hierarchy now exported from root (`import { QorPayApiError } … from '@qorpay-v3/sdk'`).
- Default timeout reduced to **30 s** (was 60 s).

### Fixed

- Incorrect `Content-Type` header on multipart requests.
- Pagination meta fields now typed as `Maybe<number>`.

---

## [1.0.1] – 2025-06-15

### Added

- **README improvements**: sandbox keys, environment examples, troubleshooting guide.
- **Rollup** upgrade to v4.12 for smaller UMD bundle (-9 kB).

### Fixed

- `QorPayClient.getBaseURL()` now respects custom `baseURL` when provided.
- Missing exports for `ProofOfDelivery` types.

---

## [1.0.0] – 2025-06-07

### Added

- **Initial public release** of the official QorPay V3 TypeScript SDK.
- Universal, tree-shakable bundles:
  - **ESM** (`dist/esm`)
  - **CommonJS** (`dist/cjs`)
  - **UMD** (`dist/umd`)
  - Bundled typings (`dist/types`)
- **Environment support** with automatic base URL selection for `sandbox` and `production`, plus custom override.
- **Authentication handling** – automatic inclusion of `Qor-App-Key` and `Qor-Client-Key` headers.
- **Resource-oriented API surface** generated from OpenAPI v3:
  - `payments`, `achPayments`, `cashPayments`, `giftCards`
  - `paymentTokens`, `transactions`, `proofOfDelivery`
  - `customers`, `plans`, `disputes`, `deposits`
  - `webhooks`, `paymentForms`, `channels`, `utilities`
- **Strongly-typed models** for every request and response.
- **Error classes** (`QorPayError`, `QorPayApiError`, `QorPayNetworkError`, `QorPayUnknownError`).
- **Unit test suite** (Jest + ts-jest) with axios mocks.
- **ESLint + Prettier** configuration and GitHub Actions CI/CD.

### Changed

- _N/A_ (first release)

### Fixed

- _N/A_ (first release)

---

[Unreleased]: https://github.com/QorLabs/qorpay-v3-sdk/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/QorLabs/qorpay-v3-sdk/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/QorLabs/qorpay-v3-sdk/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/QorLabs/qorpay-v3-sdk/compare/v1.0.0...v1.0.1
