/**
 * @file src/types/index.ts
 * @description Barrel file for exporting all type definitions from the QorPay V3 SDK.
 * This allows for cleaner imports in other parts of the SDK and for consumers of the SDK.
 *
 * Example Usage:
 * import { QorPayClientConfig, PaymentSaleManualRequestData } from './types';
 */

// Export types from common.ts
export * from './common';

// Export types from payments.ts (includes card, ACH, cash, gift cards)
export * from './payments';

// Export types from paymentTokens.ts (tokenization for cards and ACH)
export * from './paymentTokens';

// Export types from transactions.ts (includes fetching transactions and Proof of Delivery)
export * from './transactions';

// Export types from customers.ts
export * from './customers';

// --- Placeholder exports for future type definition files ---
// These can be uncommented as the respective type files are created.

// export * from './plans'; // For Subscriptions / Plans
// export * from './disputes'; // For Dispute management
// export * from './deposits'; // For Deposits / Payouts
// export * from './webhooks'; // For Webhook configurations and events
// export * from './paymentForms'; // For Payment Forms (linq)
// export * from './channels'; // For ISV / Referrer / Marketplace channel operations
// export * from './utilities'; // For utility endpoints (validation, BIN lookup, etc.)
// export * from './errors'; // Specific error type structures if needed beyond QorPayErrorResponse

// It's good practice to also export any enums or constants defined within these type files
// if they are intended for public use by SDK consumers.
// The `export *` syntax generally handles this for named exports.
