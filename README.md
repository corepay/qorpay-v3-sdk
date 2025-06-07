# QorPay V3 TypeScript SDK

The official TypeScript/JavaScript client for the QorPay V3 REST API.  
It provides strongly-typed resource modules, first-class Node & browser support, and utilities that make integrating payments, tokenisation, disputes, deposits and much more, delightful.

* Package   : `@qorpay-v3/sdk`  
* Status     : **Beta** – stable for sandbox use, production ready soon  
* API Spec   : QorPay V3 (OpenAPI 3)  

---

## ✨ Features

* Universal build – works in **Node ≥ 16** and modern browsers
* Built-in **environment switching** (sandbox / production)  
* Automatic **authentication headers**
* **Resource-oriented** modules (Payments, ACH, Cash, Gift Cards, Tokens, Transactions, Webhooks, …)
* Complete **TypeScript typings** & IntelliSense
* Helpful **error classes** (`QorPayApiError`, `QorPayNetworkError`, …)
* Configurable **timeouts** and **custom headers**
* 100 % Promise-based
* Jest unit-tested with > 90 % coverage

---

## 📦 Installation

```bash
# npm
npm install @qorpay-v3/sdk

# yarn
yarn add @qorpay-v3/sdk

# pnpm
pnpm add @qorpay-v3/sdk
```

_No peer dependencies – everything you need is bundled._

---

## 🚀 Quick Start

```ts
import { QorPayClient } from '@qorpay-v3/sdk';

const qorpay = new QorPayClient({
  appKey:    process.env.QOR_APP_KEY!,     // required
  clientKey: process.env.QOR_CLIENT_KEY!,  // required
  environment: 'sandbox',                  // 'production' for live
  timeout: 30_000                          // optional (ms)
});

// example: simple card sale
const res = await qorpay.payments.cardSale({
  amount:      '19.99',
  currency:    'USD',
  card_number: '4111111111111111',
  card_exp:    '1228',
  card_cvv:    '999',
  reference_id: 'order_123'
});

console.log(res.data.transaction_id);
```

---

## ⚙️ Configuration

| Option        | Type / Values                 | Default | Description                                   |
|---------------|------------------------------|---------|-----------------------------------------------|
| `appKey`      | `string`                     | —       | QorPay **Application Key**                    |
| `clientKey`   | `string`                     | —       | QorPay **Client Key**                         |
| `environment` | `'sandbox' \| 'production'`  | `sandbox` | Select API cluster & baseURL                  |
| `baseURL`     | `string`                     | derived | Custom endpoint (overrides `environment`)     |
| `timeout`     | `number` *(ms)*              | `30000` | Request timeout                               |
| `headers`     | `Record<string,string>`      | `{}`    | Extra headers merged into each request        |

---

## 📚 API Coverage

Every OpenAPI tag is mapped to a **resource class**. The table below lists the major ones:

| Resource                | Module / Property            | Top Methods (excerpt)                     |
|-------------------------|------------------------------|-------------------------------------------|
| Credit/Debit Payments   | `qorpay.payments`            | `cardSale`, `cardAuth`, `cardCapture`, `cardRefund`, `cardVoid` |
| ACH Transfers           | `qorpay.achPayments`         | `sale`, `refund`, `void`, `getStatus`     |
| Cash Payments           | `qorpay.cashPayments`        | `recordSale`                              |
| Gift Cards              | `qorpay.giftCards`           | `activate`, `balance`, `load`, `sale`, `refund`, `deactivate` |
| Tokenisation Vault      | `qorpay.paymentTokens`       | `createCardToken`, `getCardToken`, `updateCardToken`, `rotateCardToken`, `deleteCardToken`, same for ACH |
| Transactions            | `qorpay.transactions`        | `getTransaction`, `listTransactions`, `listByProfile`, `listByBatch` |
| Proof of Delivery       | `qorpay.proofOfDelivery`     | `create`, `get`, `update`, `list`, `delete` |
| Customers               | `qorpay.customers`           | `createCustomer`, `getCustomer`, `updateCustomer`, `listCustomers`, `deleteCustomer` |
| Plans & Subscriptions   | `qorpay.plans`               | `createPlan`, `subscribeToPlan`, `cancelSubscription` |
| Disputes                | `qorpay.disputes`            | `getDispute`, `listDisputes`              |
| Deposits (Payouts)      | `qorpay.deposits`            | `getDeposit`, `listDeposits`              |
| Webhooks Config         | `qorpay.webhooks`            | `createWebhook`, `listWebhooks`, `deleteWebhook`, `listWebhookEvents` |
| Payment Forms / Links   | `qorpay.paymentForms`        | `createForm`, `getForm`, `listForms`, `getRequest` |
| Channels / Marketplaces | `qorpay.channels`            | `createMerchant`, `listMyMerchants`, `listChannelDeposits` |
| Utility Helpers         | `qorpay.utilities`           | `validateCardNumber`, `getIPAddress`, …   |

All methods return fully-typed **success payloads** or throw one of the SDK’s error classes.

---

## 🛠️ Examples

### 1. Create & Rotate Card Token

```ts
// create token
const { data: tokenObj } = await qorpay.paymentTokens.createCardToken({
  card_number: '4242424242424242',
  card_exp: '0529',
  card_cvv: '222'
});

console.log(tokenObj.token);               // e.g. '541341$KR0eAiX2'

// rotate token when card is re-issued
await qorpay.paymentTokens.rotateCardToken({
  token: tokenObj.token,
  card_number: '4012888888881881',
  card_exp: '0532',
  card_cvv: '333'
});
```

### 2. ACH Sale & Refund

```ts
// debit customer’s checking account
const sale = await qorpay.achPayments.sale({
  amount: '59.00',
  currency: 'USD',
  account_number: '1234567890',
  routing_number: '021000021',
  account_type: 'checking'
});

await qorpay.achPayments.refund({
  transaction_id: sale.data.transaction_id,
  amount: '59.00'
});
```

### 3. Webhook Configuration

```ts
// register webhook
await qorpay.webhooks.createWebhook({
  url: 'https://example.com/qorpay/webhook',
  events: ['transaction.approved', 'dispute.opened']
});

// list webhooks
const hooks = await qorpay.webhooks.listWebhooks({ status: 'active' });
```

### 4. Filtering & Pagination

```ts
const { data } = await qorpay.transactions.listTransactions({
  customer_id: 'cust_789',
  status: 'approved',
  limit: 25,
  offset: 50   // pagination
});

console.table(data.transactions);
```

---

## 🧩 Error Handling

```ts
import {
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError
} from '@qorpay-v3/sdk';

try {
  await qorpay.payments.cardSale(/* ... */);
} catch (err) {
  if (err instanceof QorPayApiError) {
    console.error('API error', err.statusCode, err.errorCode, err.message);
  } else if (err instanceof QorPayNetworkError) {
    console.error('Network connectivity issue', err.message);
  } else {
    // QorPayUnknownError or unexpected
    console.error('Unexpected error', err);
  }
}
```

---

## 🔬 Testing

```bash
# run unit tests
npm test

# coverage report
npm run coverage
```

Jest tests mock `axios` and cover request building, error mapping and each resource’s public surface.

---

## 🏗️ Building & Tree-Shaking

```bash
npm run build        # outputs to /dist
```

* ESM bundle – `dist/esm/`  
* CommonJS bundle – `dist/cjs/`  
* Type declarations – `dist/types/`

Modern bundlers (Vite, Webpack 5, Rollup) will tree-shake unused modules.

---

## 📖 Generating API Docs

```bash
npm run docs         # generates docs with TypeDoc into /docs
```

Docs can be deployed to GitHub Pages or NPM website.

---

## 🤝 Contributing

1. Fork & clone → `pnpm install`
2. Create a branch → add tests for any change
3. `pnpm run lint && pnpm test`
4. Open a PR 🙌

Please open issues for missing endpoints or spec clarifications.

---

## 🔐 Security

Found a potential vulnerability? Please **do not** open a public issue.  
Email security@qorpay.com and we’ll respond promptly.

---

## 📄 License

MIT © QorPay Inc. – see [LICENSE](./LICENSE) for details.
