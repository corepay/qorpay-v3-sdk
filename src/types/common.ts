/**
 * @file src/types/common.ts
 * @description Common type definitions used across the QorPay SDK.
 */

/**
 * Supported environments for the QorPay API
 */
export type Environment = 'sandbox' | 'production';

/**
 * Alias for Environment for backward compatibility
 */
export type QorPayEnvironment = Environment;

/**
 * Base URLs for different QorPay environments
 */
export const QORPAY_BASE_URLS = {
  sandbox: 'https://sandbox-api.qorcommerce.io/api/v3',
  production: 'https://api.qorcommerce.io/api/v3',
};

/**
 * HTTP verbs supported by the QorPay API
 */
export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Client configuration interface
 */
export interface QorPayClientConfig {
  appKey: string;
  clientKey: string;
  environment?: QorPayEnvironment;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface QorPayClientOptions {
  appKey: string;
  clientKey: string;
  environment?: Environment;
  baseURL?: string;
  timeout?: number; // in milliseconds
}

/**
 * Represents a value that can be of type T, null, or undefined.
 */
export type Maybe<T> = T | null | undefined;

/**
 * Represents a timestamp, typically as a string or number.
 * Example: "2023-04-01T12:00:00Z" or a Unix timestamp number.
 */
export type Timestamp = string | number;

/**
 * Base interface for all QorPay API responses.
 */
export interface BaseQorPayResponse {
  status: string; // e.g., "approved", "declined", "ok", "error"
  code: string; // e.g., "GW00"
  message: string;
  reference_id?: Maybe<string>; // Echoed back if sent in request
}

/**
 * A successful QorPay API response that includes a 'data' payload.
 */
export interface QorPaySuccessDataResponse<T> extends BaseQorPayResponse {
  data: T;
}

/**
 * A successful QorPay API response that includes a 'token' payload (often for token creation/fetch).
 */
export interface QorPaySuccessTokenResponse<T = string>
  extends BaseQorPayResponse {
  token: T; // Can be a string token or an object with token details
}

/**
 * A successful QorPay API response that includes a 'result' payload (often for actions like POD creation).
 */
export interface QorPaySuccessResultResponse<T> extends BaseQorPayResponse {
  result: T;
}

/**
 * A successful QorPay API response that includes a 'profile_id' and 'tokens' (for fetching tokens by profile).
 */
export interface QorPaySuccessProfileTokensResponse<T>
  extends BaseQorPayResponse {
  profile_id: string;
  tokens: T[];
}

/**
 * Pagination metadata often included in list responses.
 */
export interface PaginationMeta {
  count?: Maybe<number>; // Total number of items matching the query
  limit?: Maybe<number>; // Number of items per page
  offset?: Maybe<number>; // Number of items skipped
  total?: Maybe<number>; // Alias for count in some endpoints
  skip?: Maybe<number>; // Alias for offset in some endpoints
}

/**
 * A successful QorPay API response that includes a 'data' payload and pagination.
 */
export interface QorPaySuccessDataResponseWithPagination<T>
  extends BaseQorPayResponse {
  data: T & PaginationMeta; // Data object itself contains items and pagination info
}

/**
 * Wrapper for request bodies that are nested under `transaction_data`.
 */
export interface TransactionDataWrapper<T> {
  transaction_data: T;
}

/**
 * Generic type for query parameters.
 * Allows any string key with string, number, boolean, or null/undefined values.
 */
export interface QueryParams {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | undefined
    | null
    | string[]
    | number[];
}

/**
 * Generic type for request bodies.
 */
export type RequestBody =
  | Record<string, unknown>
  | TransactionDataWrapper<Record<string, unknown>>;

// --- Specific ID Types ---
export type TransactionId = string;
export type OrderId = string;
export type CustomerId = string | number;
export type PlanId = string; // e.g., "plan_0c6038ea1cc211e9b9ce0afd24307790"
export type DisputeId = string;
export type DepositId = string;
export type WebhookId = string; // e.g., "hook_af67a911391711e9924d0afd24307790"
export type PaymentToken = string; // e.g., "541341$KR0eAiX2"
export type AchToken = string;
export type ProofOfDeliveryId = string; // e.g., "pofs_..."
export type Mid = string; // Merchant ID
export type FormId = string; // e.g., "form_drakxkkljl4tfsp06w3jzf"
export type ProfileId = string; // Customer Profile ID, often used as mer_id in channel notifications
export type BatchId = string;
export type RequestId = string; // For payment linq requests, e.g. "req_..."
export type ReferenceId = string; // Reference ID for tracking transactions or requests

/**
 * Represents a currency code, typically a 3-letter ISO 4217 code.
 */
export type Currency = string; // Example: "USD", "EUR"

/**
 * Represents common billing address fields.
 */
export interface BillingAddress {
  baddress?: Maybe<string>;
  baddress2?: Maybe<string>;
  bcity?: Maybe<string>;
  bstate?: Maybe<string>; // 2-letter code
  bzip?: Maybe<string>;
  bcountry?: Maybe<string>; // 2-letter ISO code
}

/**
 * Represents common customer detail fields.
 */
export interface CustomerDetails {
  cfirstname?: Maybe<string>;
  clastname?: Maybe<string>;
  cemail?: Maybe<string>;
  cphone?: Maybe<string>;
  customerid?: Maybe<CustomerId>; // If an existing customer ID is known
}

/**
 * Represents common shipping address fields.
 */
export interface ShippingAddress {
  saddress?: Maybe<string>;
  saddress2?: Maybe<string>;
  scity?: Maybe<string>;
  sstate?: Maybe<string>; // 2-letter code
  szip?: Maybe<string>;
  scountry?: Maybe<string>; // 2-letter ISO code
  sphone?: Maybe<string>;
}

/**
 * Represents line item details for Level 2/3 transactions or invoices.
 */
export interface ItemDetail {
  name: string;
  description?: Maybe<string>;
  ucc?: Maybe<string>; // Universal Commercial Code
  upc?: Maybe<string>; // Universal Product Code
  unit_price: number | string; // Price per unit
  units_sold: number | string; // Number of units
  unit_measurement?: Maybe<string>; // e.g., "each", "kg"
  total_amount: string; // Total for this line item (unit_price * units_sold + taxes/discounts)
  tax_amount?: Maybe<string>;
  discount_amount?: Maybe<string>;
  commodity_code?: Maybe<string>;
  // Add other L2/L3 item fields as needed
}

// --- Error Classes ---

/**
 * Base error class for all SDK-specific errors.
 */
export class QorPayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Set the prototype explicitly to allow instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error class for API errors returned by the QorPay server.
 * These errors typically have a status code from the server (e.g., 4xx, 5xx)
 * or a 2xx status with an "error" status in the response body.
 */
export class QorPayApiError extends QorPayError {
  public readonly statusCode?: Maybe<number>;
  public readonly errorCode?: Maybe<string>; // QorPay specific error code (e.g., "GW03")
  public readonly responseData?: Maybe<unknown>; // Full response body if available

  constructor(
    message: string,
    statusCode?: Maybe<number>,
    errorCode?: Maybe<string>,
    responseData?: Maybe<unknown>
  ) {
    super(
      `API Error: ${message}${errorCode ? ` (Code: ${errorCode})` : ''}${statusCode ? ` (Status: ${statusCode})` : ''}`
    );
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.responseData = responseData;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error class for network-related issues (e.g., no response from server, DNS issues).
 */
export class QorPayNetworkError extends QorPayError {
  constructor(message: string) {
    super(`Network Error: ${message}`);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error class for unknown or unexpected errors occurring within the SDK or during request processing.
 */
export class QorPayUnknownError extends QorPayError {
  public readonly originalError?: Maybe<unknown>;

  constructor(message: string, originalError?: Maybe<unknown>) {
    super(`Unknown Error: ${message}`);
    this.originalError = originalError;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents a QorPay API response that might have a custom structure
 * for its successful data payload, not fitting the standard 'data', 'token', or 'result' wrappers.
 */
export interface QorPayCustomSuccessResponse<T = unknown>
  extends BaseQorPayResponse {
  // This is a generic placeholder for responses that have a custom structure
  // beyond the standard 'data', 'token', or 'result' fields but are still successful.
  // The actual structure will depend on the specific endpoint.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow any additional properties, but ensure BaseQorPayResponse fields are present
  data?: T; // Keep data optional as some custom responses might still use it, or not.
}
