# Changelog
All notable changes to **@qorpay-v3/sdk** are documented in this file.  
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0) and follows the guidelines of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]
### Added
- **CHANGELOG & TESTLOG pipelines** – automated generation planned.
- **Test Credentials section** in README (`Qor-App-Key` / `Qor-Client-Key`) for instant sandbox trials.
- New **developer guide** with architecture diagram, migration notes and advanced examples.
- Placeholders for **integration tests** per resource (payments, ACH, utilities).

### Changed
- README overhauled for clarity; quick-start now uses `saleManual` flow.
- Documentation generation moved to TypeDoc v0.25 with Markdown plugin.

### Fixed
- `axios.interceptors` mock issue in `BaseClient` tests (#42).

### Known Issues
- Global coverage **25 %** – target **≥ 80 %**.  
- Failing unit tests around error-message formatting (#45).
- `Utilities.binLookup` endpoint not yet live in production cluster.

### Development Milestones
| Milestone | Target Date | Status |
|-----------|-------------|--------|
| v1.2.0 RC – full test pass & 80 % coverage | 2025-08-01 | ⏳ in-progress |
| OpenAPI generator integration | 2025-08-15 | Planned |
| Browser E2E tests (Playwright) | 2025-09-01 | Planned |

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

[Unreleased]: https://github.com/QorLabs/qorpay-v3-sdk/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/QorLabs/qorpay-v3-sdk/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/QorLabs/qorpay-v3-sdk/compare/v1.0.0...v1.0.1
