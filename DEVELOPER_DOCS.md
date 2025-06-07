# QorPay V3 TypeScript SDK – **Developer Guide**

Welcome to the official developer documentation for **@qorpay-v3/sdk** – the strongly-typed, universal client for the QorPay V3 REST API.

---

## 1  Overview & Architecture

### 1.1 High-level design  
* **Facade pattern** – `QorPayClient` orchestrates and exposes all resource modules (Payments, ACH, Webhooks …) [src/client/qorpay-client.ts].  
* **Base HTTP layer** – `BaseClient` wraps Axios, injects auth headers, base URL, timeout and maps Axios errors to SDK-specific classes [src/client/base-client.ts].  
* **Resource-oriented modules** – each OpenAPI tag is implemented as a class under `src/resources/` (e.g. `payments.ts`, `customers.ts`).  
* **Typed data-models** – request/response types live in `src/types/`, generated/adapted from the OpenAPI spec.  
* **Hierarchical error system** – `QorPayError` → `QorPayApiError`, `QorPayNetworkError`, `QorPayUnknownError` [src/errors/index.ts].  
* **Environment constants** – derived from `QORPAY_BASE_URLS` in `src/types/common.ts`.

<div align="center"><img alt="architecture" src="https://dummyimage.com/700x220/ededed/636363&text=App+→+QorPayClient+→ BaseClient → Axios → QorPay+API"></div>

---

## 2  Installation & Setup

```bash
# npm
npm install @qorpay-v3/sdk

# yarn
yarn add @qorpay-v3/sdk
```

No peer dependencies – the bundle includes Axios.

---

## 3  Authentication

Obtain your **Application Key** and **Client Key** from the QorCommerce portal.

```ts
import { QorPayClient } from '@qorpay-v3/sdk';

const qorpay = new QorPayClient({
  appKey:    process.env.QOR_APP_KEY!,    // sets `Qor-App-Key`
  clientKey: process.env.QOR_CLIENT_KEY!, // sets `Qor-Client-Key`
});
```

The keys are sent on every request via custom headers automatically injected by `BaseClient` [src/client/base-client.ts].

---

## 4  Environment Management

| Setting             | Effect                                           |
|---------------------|--------------------------------------------------|
| `environment:'sandbox'` (default) | Uses `https://sandbox-api.qorcommerce.io/api/v3` |
| `environment:'production'`        | Uses `https://api.qorcommerce.io/api/v3`         |
| `baseURL`           | Overrides environment entirely (useful for mocks) |

```ts
const prod = new QorPayClient({ appKey, clientKey, environment: 'production' });
```

Internally resolved in the `QorPayClient` constructor [src/client/qorpay-client.ts].

---

## 5  API Coverage

| Resource Class          | Accessor                | Representative Methods* |
|-------------------------|-------------------------|--------------------------|
| Payments (cards)        | `qorpay.payments`       | `saleManual`, `authorize`, `capture`, `refund`, `void` |
| ACH Payments            | `qorpay.achPayments`    | `debit`, `credit`, `refund`, `void`, `verify` |
| Cash Payments           | `qorpay.cashPayments`   | `recordSale` |
| Gift Cards              | `qorpay.giftCards`      | `activate`, `load`, `sale`, `refund` |
| Payment Tokens          | `qorpay.paymentTokens`  | `createCardToken`, `rotateCardToken`, `deleteCardToken` |
| Transactions            | `qorpay.transactions`   | `getTransaction`, `listTransactions` |
| Proof of Delivery       | `qorpay.proofOfDelivery`| `create`, `update`, `list` |
| Customers               | `qorpay.customers`      | `createCustomer`, `updateCustomer` |
| Plans & Subscriptions   | `qorpay.plans`          | `createPlan`, `subscribeToPlan` |
| Disputes                | `qorpay.disputes`       | `listDisputes`, `getDispute` |
| Deposits                | `qorpay.deposits`       | `listDeposits`, `getDeposit` |
| Webhooks                | `qorpay.webhooks`       | `createWebhook`, `listWebhooks`, `deleteWebhook` |
| Payment Forms (Links)   | `qorpay.paymentForms`   | `createForm`, `getForm` |
| Channels / Marketplaces | `qorpay.channels`       | `createMerchant`, `listMyMerchants` |
| Utilities               | `qorpay.utilities`      | `validateCard`, `binLookup`, `generateTestCard` |

\* Full signature list is available in the generated API reference (section 14).

---

## 6  Code Examples

### 6.1 Card Sale + Refund

```ts
// 1. Card sale (manual entry)
const sale = await qorpay.payments.saleManual({
  amount:      '49.95',
  currency:    'USD',
  card_number: '4111111111111111',
  card_exp:    '0128',
  card_cvv:    '123',
});

// 2. Refund the full amount
await qorpay.payments.refund({
  transaction_id: sale.data.transaction_id,
  amount: '49.95',
});
```

### 6.2 ACH Debit

```ts
await qorpay.achPayments.debit({
  transaction_data: {
    amount: '120.00',
    account_number: '1234567890',
    routing_number: '021000021',
    account_type: 'checking',
  },
});
```

### 6.3 Card Tokenisation Flow

```ts
// tokenise
const { data: tokenObj } = await qorpay.paymentTokens.createCardToken({
  card_number: '4242424242424242',
  card_exp: '0728',
  card_cvv: '111',
});

// pay with token
await qorpay.payments.saleToken({
  amount: '19.99',
  currency: 'USD',
  token: tokenObj.token,
});
```

### 6.4 Webhook Management

```ts
await qorpay.webhooks.createWebhook({
  url: 'https://merchant.app/webhooks/qorpay',
  events: ['transaction.approved', 'dispute.opened'],
});
```

Each snippet maps 1-to-1 to the resource functions defined under `src/resources/*`.

---

## 7  Error Handling

```ts
import {
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError,
} from '@qorpay-v3/sdk';

try {
  await qorpay.payments.capture({ /* … */ });
} catch (err) {
  if (err instanceof QorPayApiError) {
    // HTTP 4xx/5xx or `status:"error"` in body
    console.error(err.statusCode, err.errorCode, err.message);
  } else if (err instanceof QorPayNetworkError) {
    // DNS, timeout, offline…
  } else if (err instanceof QorPayUnknownError) {
    // Anything unexpected – rethrow or alert dev-ops
  }
}
```

`BaseClient` converts every Axios failure into one of the above classes [src/client/base-client.ts].

**Best practice:** always narrow-check with `instanceof`, never parse `.message` strings.

---

## 8  Type Safety & Generics

* All request/response objects are exported as **named TypeScript types** – e.g. `PaymentSaleManualRequestData` [src/types/payments.ts].  
* Generics such as `QorPaySuccessDataResponse<T>` standardise wrapped payloads [src/types/common.ts].  
* You may import individual models:

```ts
import type { PaymentSaleManualRequestData, SaleAuthResponsePayload }
  from '@qorpay-v3/sdk';
```

This keeps tree-shake size minimal and IDE IntelliSense rich.

---

## 9  Testing

### 9.1 Unit tests

The repo ships with Jest + ts-jest. Axios is mocked so tests run offline:

```
npm test          # executes tests/unit/*.test.ts
npm run coverage  # opens HTML coverage report
```

Example: `tests/unit/qorpay-client.test.ts` verifies correct environment resolution and resource instantiation.

### 9.2 Integration suggestions

For consumer apps, use [MSW](https://mswjs.io/) or `nock` to stub the HTTPS endpoints for deterministic CI.

---

## 10  Advanced Configuration

```ts
const qorpay = new QorPayClient({
  appKey,
  clientKey,
  timeout: 60_000,                  // ms – default 30_000
  headers: { 'X-My-Trace': traceId } // merged into every request
});

// Per-request override
await qorpay.payments.saleManual(data, { timeout: 10_000 });
```

> Per-request options are available on every resource method through an optional second param `[src/client/base-client.ts]`.

---

## 11  Migration Guide

### From API v2 / legacy SDK

| Concern                | Legacy                            | v3 SDK                           |
|------------------------|-----------------------------------|----------------------------------|
| Auth headers           | `Auth-Key`, `Client-Id`           | `Qor-App-Key`, `Qor-Client-Key`  |
| Querystring dates      | `MMDDYYYY`                        | ISO-8601 (RFC 3339)              |
| Response wrappers      | Raw JSON                          | Standardised `status` + `data`   |
| Error callback style   | Node-style `(err, res)`           | Promise rejection w/ typed error |

Use the compatibility shim:

```ts
import { migrateV2Payload } from '@qorpay-v3/sdk/migration';
```

(Shim exports live under `src/migration/` – add if you migrate an older codebase.)

---

## 12  Troubleshooting

| Symptom                               | Cause / Fix                                         |
|---------------------------------------|-----------------------------------------------------|
| `Network Error: Request timed out`    | Increase `timeout`, check firewall / WAF rules.     |
| `API Error (Code: GW03)`              | Invalid credentials – verify `appKey`/`clientKey`. |
| `isRateLimitError() === true`         | Too many requests – exponential back-off 30 s.      |
| CORS blocked in browser               | Use production origin or contact support to add your domain. |
| Types missing after build             | Ensure `skipLibCheck:false` in `tsconfig`.          |

---

## 13  Contributing

1. `git clone && pnpm install`  
2. `npm run lint && npm test` must be green.  
3. Follow Conventional Commits (`feat: …`, `fix: …`).  
4. All public APIs require corresponding unit tests.  
5. Create a PR to **main** – GitHub Actions will run CI.

Security reports: **security@qorpay.com** – *please do **not** open GitHub issues for vulnerabilities.*

---

## 14  API Reference

The full, generated reference lives under `/docs/` once you run:

```
npm run docs      # TypeDoc → Markdown/HTML
```

The structure mirrors the SDK exports:

```
QorPayClient
 ├─ payments
 │   ├─ saleManual(req): Promise<SaleAuthResponsePayload>
 │   ├─ capture(req)
 │   └─ …
 ├─ achPayments
 │   └─ debit(req)
 └─ …
```

Each method entry lists:

* HTTP verb & path  
* Request body type  
* Success response type  
* Possible `QorPayApiError` codes  

---

## Appendix A – File Map

| Path                               | Role |
|------------------------------------|------|
| `src/client/qorpay-client.ts`      | Facade |
| `src/client/base-client.ts`        | HTTP wrapper |
| `src/resources/`                   | Resource modules |
| `src/types/`                       | Data models |
| `src/errors/index.ts`              | Error hierarchy |
| `tests/unit/`                      | Jest suites |
| `rollup.config.mjs`                | Build pipeline |

Enjoy building with QorPay – happy coding! 🎉
