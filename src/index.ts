/**
 * @file src/index.ts
 * @description Main entry point for the QorPay SDK
 */

// Export the main client class
export { QorPayClient } from './client/qorpay-client';

// Export resource classes for direct usage if needed
export { Payments } from './resources/payments';
export { AchPayments } from './resources/ach-payments';
export { CashPayments } from './resources/cash-payments';
export { GiftCards } from './resources/gift-cards';
export { PaymentTokens } from './resources/payment-tokens';
export { Transactions } from './resources/transactions';
export { ProofOfDelivery } from './resources/proof-of-delivery';
export { Customers } from './resources/customers';
export { Plans } from './resources/plans';
export { Disputes } from './resources/disputes';
export { Deposits } from './resources/deposits';
export { Webhooks } from './resources/webhooks';
export { PaymentForms } from './resources/payment-forms';
export { PaymentMethods } from './resources/paymentMethods';
export { Channels } from './resources/channels';
export { Utilities } from './resources/utilities';

// Export error classes
export {
  QorPayError,
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError,
} from './errors';

// Export constants
export { QORPAY_BASE_URLS } from './types/common';

// Export types with proper 'export type' syntax for isolatedModules compatibility
export type { QorPayEnvironment } from './types/common';
export type { HttpVerb } from './types/common';
export type { QorPayClientConfig } from './types/common';
export type { Environment } from './types/common';
export type { Maybe } from './types/common';
export type { Timestamp } from './types/common';
export type { BaseQorPayResponse } from './types/common';
export type { QorPaySuccessDataResponse } from './types/common';
export type { QorPaySuccessTokenResponse } from './types/common';
export type { QorPaySuccessResultResponse } from './types/common';
export type { QorPaySuccessProfileTokensResponse } from './types/common';
export type { PaginationMeta } from './types/common';
export type { QorPaySuccessDataResponseWithPagination } from './types/common';
export type { TransactionDataWrapper } from './types/common';
export type { QueryParams } from './types/common';
export type { RequestBody } from './types/common';

// Export ID types
export type { TransactionId } from './types/common';
export type { OrderId } from './types/common';
export type { CustomerId } from './types/common';
export type { PlanId } from './types/common';
export type { DisputeId } from './types/common';
export type { DepositId } from './types/common';
export type { WebhookId } from './types/common';
export type { PaymentToken } from './types/common';
export type { AchToken } from './types/common';
export type { ProofOfDeliveryId } from './types/common';
export type { Mid } from './types/common';
export type { FormId } from './types/common';
export type { ProfileId } from './types/common';
export type { BatchId } from './types/common';
export type { RequestId } from './types/common';
export type { Currency } from './types/common';

// Export common address and customer types from common.ts to avoid ambiguity
export type { BillingAddress } from './types/common';
export type { CustomerDetails } from './types/common';
export type { ShippingAddress } from './types/common';
export type { ItemDetail } from './types/common';

// Export performance utilities
export {
  performanceTracker,
  type PerformanceMetrics,
  type PerformanceHeaders,
} from './utils/performance';

// Export type guards
export {
  isQorPayResponse,
  isSuccessResponse,
  isErrorResponse,
  isQorPayError,
  isQorPayApiError,
  isQorPayNetworkError,
  isQorPayUnknownError,
  isPaymentStatus,
  isTransactionType,
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
  isValidEmail,
  isValidPhoneNumber,
  isValidAmount,
  isValidTransactionId,
  isValidCustomerId,
  isValidTokenId,
  isValidEnvironment,
  validatePaymentData,
  validateCustomerData,
} from './utils/type-guards';

// Export error codes
export {
  QorPayErrorCode,
  QorPayErrorMessages,
  getErrorMessage,
  isClientErrorCode,
  isServerErrorCode,
  isRetryableError,
  getRetryDelay,
} from './utils/error-codes';

// Re-export specific types from each module to avoid naming conflicts
// Payments types`
export type {
  PaymentCardRequest,
  PaymentCardResponse,
  PaymentCardObject,
  PaymentCardTokenObject,
  PaymentCardRefundRequest,
  PaymentCardRefundResponse,
  PaymentCardVoidRequest,
  PaymentCardVoidResponse,
} from './types/payments';

// ACH Payment types
export type {
  PaymentAchRequest,
  PaymentAchResponse,
  PaymentAchObject,
  PaymentAchRefundRequest,
  PaymentAchRefundResponse,
  PaymentAchVoidRequest,
  PaymentAchVoidResponse,
} from './types/payments';

// Cash Payment types
export type { PaymentCashRequest, PaymentCashResponse } from './types/payments';
export type {
  CashPaymentRequest,
  CashPaymentResponse,
} from './resources/cash-payments';

// Payment Token types
export type {
  CreateCardTokenRequest,
  CreateCardTokenResponse,
  CreateAchTokenRequest,
  CreateAchTokenResponse,
  CardTokenObject,
  AchTokenObject,
  FetchCardTokenByIdResponse,
  FetchAchTokenByIdResponse,
  FetchCardTokenByCustomerResponse,
  FetchAchTokenByCustomerResponse,
  FetchCardTokensQueryParams,
  FetchAchTokensQueryParams,
  DeleteCardTokenParams,
  DeleteCardTokenRequest,
  DeleteCardTokenResponse,
  UpdateCardTokenRequest,
  UpdateCardTokenResponse,
  RotateCardTokenRequest,
  RollbackCardTokenRequest,
} from './types/paymentTokens';

// Transaction types
export type {
  TransactionQueryParams,
  ListTransactionsQueryParams,
  TransactionResponse,
  TransactionListResponse,
  AchTransactionQueryParams,
  ListAchTransactionsQueryParams,
} from './types/transactions';

// Customer types
export type {
  Customer,
  CustomerRequest,
  CustomerResponse,
  CustomerListResponse,
  CustomerListQueryParams,
} from './types/customers';

// Proof of Delivery types
export type {
  ProofOfDeliveryCreateRequest,
  ProofOfDeliveryUpdateRequest,
  ProofOfDeliveryResponse,
  ProofOfDeliveryListResponse,
  ProofOfDeliveryQueryParams,
} from './types/transactions';

// Utility types
export type {
  CardValidationResult,
  LuhnValidationResult,
  BinLookupResult,
  RoutingValidationResult,
  RoutingValidationEnhancedResult,
  AccountValidationResult,
  ZipValidationResult,
  TaxIdValidationResult,
  AvsResult,
  TestCardResult,
  ServerTimeResult,
} from './types/utilities';
export type { CvvResultResponse } from './resources/utilities';
