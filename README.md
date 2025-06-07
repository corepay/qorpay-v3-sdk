# QorPay V3 TypeScript SDK

The **official TypeScript/JavaScript client** for the QorPay V3 REST API.  
It offers strongly-typed resource modules, first-class Node *and* browser support, and utilities that make integrating payments, tokenisation, disputes, deposits and more a breeze.

* Package   : `@qorpay-v3/sdk`  
* Current Status: **v1.0.0 – Stable**  
* API Spec   : QorPay V3 (OpenAPI 3)

---

## ✨ Features

* Universal build – works in **Node ≥ 16**, Deno and modern browsers
* Built-in **environment switching** (sandbox / production)  
* Automatic **authentication headers** (`Qor-App-Key`, `Qor-Client-Key`)
* **Resource-oriented** modules (Payments, ACH, Gift Cards, Tokens, Webhooks …)
* Comprehensive **TypeScript typings** & IntelliSense
* Helpful **error classes** (`QorPayApiError`, `QorPayNetworkError`, …)
* Configurable **timeouts** and **custom headers**
* Promise-based code with full ESM / CJS / UMD bundles
* 90 %+ unit-test coverage

---

## 📦 Installation & Setup

```bash
# npm
npm install @qorpay-v3/sdk

# yarn
yarn add @qorpay-v3/sdk

# pnpm
pnpm add @qorpay-v3/sdk
```

_No peer dependencies – Axios is bundled._

---

## 🔑 Test Credentials

Use these **public sandbox keys** to start testing immediately:

| Header           | Value                                   |
|------------------|-----------------------------------------|
| `Qor-App-Key`    | `T6554252567241061980`                  |
| `Qor-Client-Key` | `01dffeb784c64d098c8c691ea589eb82`      |

> 🛈  For live transactions **replace** them with the credentials you received during registration & merchant boarding.

---

## 🚀 Quick Start

```ts
import { QorPayClient } from '@qorpay-v3/sdk';

const qorpay = new QorPayClient({
  appKey:    'T6554252567241061980',                       // sandbox test key
  clientKey: '01dffeb784c64d098c8c691ea589eb82',           // sandbox test key
  environment: 'sandbox',                                  // 'production' for live
  timeout: 30_000                                          // optional (ms)
});

// 1. run a manual card sale
const sale = await qorpay.payments.saleManual({
  amount:      '19.99',
  currency:    'USD',
  card_number: '4111111111111111',
  card_exp:    '1228',
  card_cvv:    '999',
  reference_id: 'order_123'
});

// 2. refund the sale
await qorpay.payments.refund({
  transaction_id: sale.data.transaction_id,
  amount: '19.99'
});

console.log('Approved – refund queued');
```

---

## ⚙️ Configuration Options

| Option        | Type / Values                 | Default  | Description                                   |
|---------------|------------------------------|----------|-----------------------------------------------|
| `appKey`      | `string`                     | —        | QorPay **Application Key**                    |
| `clientKey`   | `string`                     | —        | QorPay **Client Key**                         |
| `environment` | `'sandbox' \| 'production'`  | `sandbox`| Select API cluster & baseURL                  |
| `baseURL`     | `string`                     | derived  | Custom endpoint (overrides `environment`)     |
| `timeout`     | `number` *(ms)*              | `30000`  | Request timeout                               |
| `headers`     | `Record<string,string>`      | `{}`     | Extra headers merged into each request        |

### Environment Examples

```ts
// Production
const live = new QorPayClient({ appKey, clientKey, environment: 'production' });

// Custom mock server (overrides env)
const mocked = new QorPayClient({
  appKey, clientKey, baseURL: 'http://localhost:8080/mock'
});
```

---

## 📚 API Coverage

| Resource                | Property on `QorPayClient` | Key Methods (excerpt)                                          |
|-------------------------|-----------------------------|----------------------------------------------------------------|
| Credit/Debit Payments   | `payments`                 | `saleManual`, `saleToken`, `saleSwipe`, `authorize`, `capture`, `refund`, `void` |
| ACH Transfers           | `achPayments`              | `debit`, `credit`, `refund`, `void`, `verify`                  |
| Cash Payments           | `cashPayments`             | `recordSale`                                                   |
| Gift Cards              | `giftCards`                | `activate`, `load`, `sale`, `refund`                           |
| Tokenisation Vault      | `paymentTokens`            | `createCardToken`, `createAchToken`, `rotateCardToken`, `deleteCardToken` |
| Transactions            | `transactions`             | `getTransaction`, `listTransactions`                           |
| Proof of Delivery       | `proofOfDelivery`          | `create`, `update`, `list`                                     |
| Customers               | `customers`                | `createCustomer`, `updateCustomer`, `listCustomers`            |
| Plans & Subscriptions   | `plans`                    | `createPlan`, `subscribeToPlan`, `cancelSubscription`          |
| Disputes                | `disputes`                 | `getDispute`, `listDisputes`                                   |
| Deposits (Payouts)      | `deposits`                 | `getDeposit`, `listDeposits`                                   |
| Webhooks Config         | `webhooks`                 | `createWebhook`, `listWebhooks`, `deleteWebhook`               |
| Payment Forms / Links   | `paymentForms`             | `createForm`, `getForm`, `listForms`                           |
| Channels / Marketplaces | `channels`                 | `createMerchant`, `listMyMerchants`                            |
| Utility Helpers         | `utilities`                | `validateCard`, `binLookup`, `generateTestCard`                |

Each method returns a **typed success payload** or throws one of the SDK’s error classes.

---

## 🛠️ Practical Examples

### 1. Tokenisation Flow

```ts
// create card token
const { data: tokenObj } =
  await qorpay.paymentTokens.createCardToken({
    card_number: '4242424242424242',
    card_exp: '0729',
    card_cvv: '123'
  });

// pay with token
await qorpay.payments.saleToken({
  amount: '49.90',
  currency: 'USD',
  token: tokenObj.token
});
```

### 2. ACH Debit & Verify

```ts
await qorpay.achPayments.debit({
  transaction_data: {
    amount: '120.00',
    account_number: '1234567890',
    routing_number: '021000021',
    account_type: 'checking'
  }
});

// optional micro-deposit verification
await qorpay.achPayments.verify({
  transaction_data: {
    account_number: '1234567890',
    routing_number: '021000021'
  }
});
```

### 3. Webhook Lifecycle

```ts
// register
const hook = await qorpay.webhooks.createWebhook({
  url: 'https://merchant.app/webhooks/qorpay',
  events: ['transaction.approved', 'dispute.opened']
});

// delete later
await qorpay.webhooks.deleteWebhook({ webhook_id: hook.data.webhook_id });
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
  await qorpay.payments.capture({ /* … */ });
} catch (err) {
  if (err instanceof QorPayApiError) {
    console.error('API', err.statusCode, err.errorCode, err.message);
  } else if (err instanceof QorPayNetworkError) {
    console.error('Network', err.message);
  } else {
    console.error('Unexpected', err);
  }
}
```

---

## 🔬 Testing

```bash
npm test            # run unit tests
npm run coverage    # open HTML coverage
```

Jest mocks Axios so tests run offline and deterministic.

---

## 🏗️ Building & Tree-Shaking

```bash
npm run build       # outputs /dist
```

* **ESM** → `dist/esm`  
* **CJS** → `dist/cjs`  
* **UMD** → `dist/umd`  
* **Types** → `dist/types`

Modern bundlers (Vite, Rollup) tree-shake unused modules automatically.

---

## 📖 Generating API Docs

```bash
npm run docs        # TypeDoc → /docs
```

The generated reference mirrors the SDK’s module structure.

---

## 🤝 Contributing

1. `git clone` → `pnpm install`  
2. Create a feature/bugfix branch  
3. `pnpm run lint && pnpm test` must be green  
4. Submit a PR – we review quickly!

Found an endpoint missing? Open an issue or PR with tests.

---

## 🔐 Security

Please **do not** disclose security issues publicly.  
Email **security@qorpay.com** and we’ll respond promptly.

---

## 📄 License

MIT © QorPay Inc. – see [LICENSE](./LICENSE) for details.
