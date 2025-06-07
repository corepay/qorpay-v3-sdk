# Changelog  
All notable changes to **@qorpay-v3/sdk** will be documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] – 2025-06-07  
### Added  
- **Initial public release** of the official QorPay V3 TypeScript SDK.  
- Universal, tree-shakeable bundles:  
  - **ESM** (`dist/esm`)  
  - **CommonJS** (`dist/cjs`)  
  - **UMD** (`dist/umd`) for browsers/CDN  
  - Bundled type declarations (`dist/types`)  
- **Environment support** with automatic base URL selection for `sandbox` and `production`, plus custom `baseURL` override.  
- **Authentication handling** – automatic inclusion of `Qor-App-Key` and `Qor-Client-Key` headers in every request.  
- **Resource-oriented API surface** generated from the OpenAPI v3 spec:  
  - `payments` (card, token, 3-DS, capture/void/refund)  
  - `achPayments`, `cashPayments`, `giftCards`  
  - `paymentTokens` (card & ACH vault operations)  
  - `transactions`, `proofOfDelivery`, `customers`, `plans`  
  - `disputes`, `deposits`, `webhooks`, `paymentForms`  
  - `channels` (marketplace), `utilities` & helpers  
- **Strongly-typed models** for every request, response and enum, enabling full IntelliSense in IDEs.  
- **Error hierarchy** (`QorPayError`, `QorPayApiError`, `QorPayNetworkError`, `QorPayUnknownError`) with richer metadata (HTTP status, QorPay code, full body).  
- **Configurable timeout** and custom headers per client instance.  
- **Unit test suite** (>90 % coverage) written in Jest with axios mocks.  
- **ESLint + Prettier** configuration matching QorPay coding standards.  
- **Documentation generation** via TypeDoc and Markdown-plugin, publishable to GitHub Pages.  
- **CI/CD pipeline** (GitHub Actions): lint → test (Node 16/18/20) → build → docs → publish to NPM on version tag.  
- Examples (`examples/basic-usage.ts`) showcasing common flows (sale, tokenisation, webhooks, etc.).  
- MIT licence and complete developer-facing README.

### Changed  
- _N/A_ (first release)

### Fixed  
- _N/A_ (first release)

[1.0.0]: https://github.com/QorLabs/qorpay-v3-sdk/releases/tag/v1.0.0
