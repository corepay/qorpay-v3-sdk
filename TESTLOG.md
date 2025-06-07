# Test Log – QorPay V3 TypeScript SDK  
_Last run: 2025-06-07 • Jest_

---

## 1. Executive Summary

| Metric                          | Value |
|---------------------------------|-------|
| Test suites executed            | **3** (`errors`, `base-client`, `qorpay-client`) |
| Suites passed                   | 1 |
| Suites failed                   | **2** |
| Total tests                     | 55 |
| Passed                          | 43 |
| Failed                          | **12** |
| Global coverage (Statements)    | **25.78 %** (threshold 80 %) |

---

## 2. Specific Failing-Test Fixes Needed

| Failing Assertion | Root Cause | Proposed Fix (code) |
|-------------------|-----------|---------------------|
| `QorPayApiError` message prefixes (`API Error:`) | Implementation omits prefix | Update constructor in `src/errors/index.ts` lines 55–70 to prepend `API Error:` when building `super(message)` |
| `responseData` undefined | property never assigned | Pass `responseData` into class field in ctor |
| `QorPayNetworkError` + `QorPayUnknownError` prefixes | Same as above | Prepend `Network Error:` / `Unknown Error:` |
| Stack-trace expectations | After prefix change stack text will include expected substrings | No extra change once prefixes fixed |
| `BaseClient` tests crash (`interceptors`) | Axios mock lacks `interceptors.response.use` stub | Provide helper in `tests/setup/axiosMock.ts` that returns `{ use: jest.fn() }` and `jest.mock('axios', () => ({ create: () => ({ request: jest.fn(), interceptors: { response: { use: jest.fn() } } }) }))` |

---

## 3. Endpoint Test Matrix (per Resource & Method)

| Resource              | Methods                                                                                                           | Unit Test | Status |
|-----------------------|-------------------------------------------------------------------------------------------------------------------|-----------|--------|
| payments              | `saleManual`, `saleToken`, `saleSwipe`, `saleLvl2Lvl3`, `sale3DS`, `salePin`, `salePos`, `authorize`, `authorizeToken`, `capture`, `void`, `refund`, `recurringSetup`, `recurringExisting`, `recurringMy` | ✖ | Not covered |
| achPayments           | `debit`, `credit`, `refund`, `void`, `verify`, `getTransaction`                                                   | ✖ | Not covered |
| cashPayments          | `recordSale`                                                                                                      | ✖ | Not covered |
| giftCards             | `activate`, `load`, `sale`, `refund`, `balance`, `deactivate`                                                     | ✖ | Not covered |
| paymentTokens         | `createCardToken`, `createAchToken`, `rotateCardToken`, `updateCardToken`, `deleteCardToken`, `fetch...`          | ✖ | Not covered |
| transactions          | `getTransaction`, `listTransactions`, `listAchTransactions`                                                       | ✖ | Not covered |
| proofOfDelivery       | `create`, `update`, `list`, `get`                                                                                 | ✖ | Not covered |
| customers             | `createCustomer`, `updateCustomer`, `getCustomer`, `listCustomers`, `deleteCustomer`                              | ✖ | Not covered |
| plans                 | `createPlan`, `updatePlan`, `activatePlan`, `deactivatePlan`, `subscribeToPlan`, `cancelSubscription`             | ✖ | Not covered |
| disputes              | `listDisputes`, `getDispute`                                                                                      | ✖ | Not covered |
| deposits              | `listDeposits`, `getDeposit`                                                                                      | ✖ | Not covered |
| webhooks              | `createWebhook`, `listWebhooks`, `deleteWebhook`                                                                  | ✖ | Not covered |
| paymentForms          | `createForm`, `getForm`, `listForms`                                                                              | ✖ | Not covered |
| channels              | `createMerchant`, `listMyMerchants`, `listChannelDeposits`                                                        | ✖ | Not covered |
| utilities             | `validateCard`, `validateCvv`, `validateExpiration`, `validateRoutingNumber`, `binLookup`, `checkAvsResult`, `generateTestCard`, `validateAddress`, `getServerTime`, `validateTaxId` | ✖ | Not covered |
| Core clients          | `BaseClient`, `QorPayClient`                                                                                      | ✔ partial | BaseClient failing |

---

## 4. Detailed Action Items

| Priority | Task | File(s) / Line(s) | Owner |
|----------|------|-------------------|-------|
| 🔴 | Prefix & property fixes in error classes | `src/errors/index.ts` 55-90, 105-135, 148-180 | SDK |
| 🔴 | Add `interceptors` stub to axios mock | new `tests/setup/axiosMock.ts`; update Jest `setupFiles` | QA |
| 🔴 | Patch failing expectations in `errors.test.ts` after impl change | `tests/unit/errors.test.ts` lines 45-75, 120-145 | QA |
| 🟠 | Create generic request/response mock helper | `tests/helpers/http.ts` | QA |
| 🟠 | Write happy-path unit tests for `payments.saleManual` & `utilities.validateCard` | new `tests/unit/payments.test.ts`, `utilities.test.ts` | QA |
| 🟠 | Lift global coverage threshold to **60 %** once resources covered | `jest.config.js` | Dev Ops |
| 🟡 | Introduce MSW integration harness (sandbox) | `tests/integration/**` | QA |
| 🟢 | Add Artillery perf script for `POST /payment/sale/manual` (95th ≤ 500 ms) | `tests/perf/saleManual.yml` | Perf |

---

## 5. Jest Test Template Examples

### 5.1 Payments (POST wrapper)

```ts
// tests/unit/payments.test.ts
import { Payments } from '../../src/resources/payments';
import { BaseClient } from '../../src/client/base-client';

jest.mock('../../src/client/base-client');
const mockClient = new BaseClient({appKey:'k',clientKey:'k'}) as jest.Mocked<BaseClient>;

describe('payments.saleManual', () => {
  it('wraps data under transaction_data and hits correct path', async () => {
    const payments = new Payments(mockClient);
    mockClient.post.mockResolvedValue({ status:'approved', code:'GW00', message:'ok', data:{} });

    await payments.saleManual({ amount:'1.00', card_number:'4111...', card_exp:'1228', card_cvv:'123' });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/payment/sale/manual/',
      { transaction_data: expect.objectContaining({ amount:'1.00' }) }
    );
  });
});
```

### 5.2 Utilities (GET helper)

```ts
describe('utilities.binLookup', () => {
  it('requests /utils/bin-lookup/:bin', async () => {
    mockClient.get.mockResolvedValue(/* success payload */);
    await utils.binLookup('411111');
    expect(mockClient.get).toHaveBeenCalledWith('/utils/bin-lookup/411111');
  });
});
```

---

## 6. Performance Testing Considerations

| Endpoint | Tool | Metric | Target |
|----------|------|--------|--------|
| `POST /payment/sale/manual` | Artillery | P95 latency | < 500 ms |
| `GET /transactions`        | Artillery | Throughput  | ≥ 100 rps |
| UMD Bundle size            | rollup-analyzer | Gzipped KB | < 35 KB |

Scripts live under `tests/perf/*` and run in CI nightly.

---

## 7. Integration Test Strategy (Sandbox API)

1. **Mock Service Worker (MSW)** in `tests/integration` to stub sandbox until API key rate limits resolved.  
2. Env vars: `QOR_APP_KEY`, `QOR_CLIENT_KEY`, `QOR_ENV=sandbox`.  
3. For live smoke, use GitHub environment secrets and only on `main` nightly workflow.  
4. Validate real auth header forwarding and 200 JSON schema with [jest-json-schema].

---

## 8. Mock Setup Instructions

```ts
// tests/setup/axiosMock.ts
import jestAxios from 'axios';
const mockAxiosInstance = {
  request : jest.fn(),
  get     : jest.fn(),
  post    : jest.fn(),
  put     : jest.fn(),
  delete  : jest.fn(),
  patch   : jest.fn(),
  interceptors: { response: { use: jest.fn() } }
};
export default jest.mock('axios', () => ({
  create: () => mockAxiosInstance,
  request: mockAxiosInstance.request
}));
```

Add to `jest.config.js`:
```js
setupFiles: ['<rootDir>/tests/setup/axiosMock.ts']
```

---

## 9. Coverage Improvement Roadmap

| Folder            | Current | Target v1.2 | Milestone PR |
|-------------------|---------|-------------|--------------|
| `client`          | 61 %    | 90 %        | #52 |
| `errors`          | 40 %    | 100 %       | #53 |
| `resources/payments` | 3 %  | 80 %        | #54 |
| Other resources   | < 15 % | 70 %        | #55 |
| **Global**        | 26 %    | 80 %        | — |

Approach: snapshot success fixtures + parameterised error tests.

---

## 10. Test Data Generation & Fixtures

* **Static JSON fixtures** in `tests/fixtures/<resource>/<example>.json` derived from OpenAPI examples.  
* Use helper `loadFixture('payments/saleManual-success')` to keep test code DRY.  
* Sensitive fields (PAN, CVV) are masked (`4242…4242`).  
* For integration tests generate dynamic amounts (`Math.random().toFixed(2)`) to avoid duplicate transaction rejection.

---

### End of TESTLOG
