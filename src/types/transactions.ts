/**
 * @file src/types/transactions.ts
 * @description Type definitions for transaction-related operations
 */

import type {
  BaseQorPayResponse,
  QueryParams,
  TransactionId,
  CustomerId,
  Mid,
  BatchId,
  ProofOfDeliveryId,
  Maybe,
} from './common';

// Re-export common types for convenience
export type { BaseQorPayResponse, QueryParams };

// ========================================================
// RAW QORPAY RESPONSE INTERFACES (For internal transformation)
// ========================================================

/**
 * Raw QorPay transaction response format
 */
export interface RawQorPayTransactionResponse {
  transaction_id: string;
  amount: string; // QorPay returns string
  currency: string;
  status: string;
  type: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string

  // Card payment method fields
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: string;
  card_exp_year?: string;

  // ACH payment method fields
  ach_account_last4?: string;
  ach_routing?: string;
  ach_account_type?: string;
  ach_bank_name?: string;

  // Customer fields
  customer_id?: string;
  cfirstname?: string;
  clastname?: string;
  cemail?: string;

  // References
  reference_id?: string;
  order_id?: string;
  batch_id?: string;

  // Response metadata
  code?: string;
  message?: string;
}

/**
 * Raw QorPay transaction list response
 */
export interface RawQorPayTransactionListResponse {
  status: string;
  code: string;
  message: string;
  data: {
    transactions: RawQorPayTransactionResponse[];
    total: number;
    has_more: boolean;
    limit?: number;
    offset?: number;
  };
}

/**
 * Raw QorPay POD (Proof of Delivery) response
 */
export interface RawQorPayPodResponse {
  id: string;
  transaction_id: string;
  delivery_date: string; // ISO string
  recipient_name: string;
  recipient_signature?: string;
  notes?: string;
  images?: string[];
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

/**
 * QorPay POD API response wrapper
 */
export interface QorPayProofOfDeliveryResponse extends BaseQorPayResponse {
  data?: RawQorPayPodResponse;
}

/**
 * Raw QorPay POD list response
 */
export interface RawQorPayPodListResponse {
  status: string;
  code: string;
  message: string;
  data: {
    records: RawQorPayPodResponse[];
    total: number;
    has_more: boolean;
    limit?: number;
    offset?: number;
  };
}

/**
 * POD creation data interface
 */
export interface CreatePodData {
  transactionId: string;
  deliveryDate?: Date;
  recipientName?: string;
  recipientSignature?: string;
  notes?: string;
  images?: string[];
}

/**
 * POD update data interface
 */
export interface UpdatePodData {
  deliveryDate?: Date;
  recipientName?: string;
  recipientSignature?: string;
  notes?: string;
  images?: string[];
}

// ========================================================
// CLEAN SDK INTERFACES (What developers see)
// ========================================================

/**
 * Clean transaction interface with proper data types
 * This is what developers should see - transformed from QorPay's format
 */
export interface Transaction {
  id: string;
  amount: number; // ✅ Number, not string
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  createdAt: Date; // ✅ Date object, not string
  updatedAt?: Date;

  // Payment method info
  paymentMethod: PaymentMethod;

  // Customer info (if available)
  customer?: {
    id?: string;
    email?: string;
    name?: string;
  };

  // References
  referenceId?: string;
  orderId?: string;
  batchId?: string;

  // Additional data
  metadata?: Record<string, unknown>;
}

export type TransactionStatus =
  | 'approved'
  | 'declined'
  | 'pending'
  | 'voided'
  | 'refunded';
export type TransactionType =
  | 'sale'
  | 'authorization'
  | 'capture'
  | 'void'
  | 'refund';

export interface PaymentMethod {
  type: 'card' | 'ach' | 'cash' | 'gift';
  card?: {
    brand: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
  };
  ach?: {
    accountType: 'checking' | 'savings';
    last4: string;
    routingNumber: string;
    bankName?: string;
  };
}

// Response types with clean interfaces
export interface TransactionResponse extends BaseQorPayResponse {
  data: Transaction;
}

export interface TransactionListResponse extends BaseQorPayResponse {
  data: Transaction[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// Query parameters (clean interface)
export interface TransactionListParams extends QueryParams {
  limit?: number;
  offset?: number;
  status?: TransactionStatus | TransactionStatus[];
  type?: TransactionType | TransactionType[];
  customerId?: string;
  batchId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: 'card' | 'ach' | 'cash' | 'gift';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Proof of Delivery types (clean interface)
export interface ProofOfDelivery {
  id: string;
  transactionId: string;
  deliveryDate?: Date;
  recipientName?: string;
  recipientSignature?: string;
  notes?: string;
  images?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateProofOfDeliveryRequest {
  transactionId: string;
  deliveryDate?: Date | string;
  recipientName?: string;
  recipientSignature?: string;
  notes?: string;
  images?: string[];
}

export interface UpdateProofOfDeliveryRequest
  extends Partial<CreateProofOfDeliveryRequest> {
  id: string;
}

export interface ProofOfDeliveryResponse extends BaseQorPayResponse {
  data: ProofOfDelivery;
}

export interface ProofOfDeliveryListResponse extends BaseQorPayResponse {
  data: ProofOfDelivery[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// ========================================================
// QORPAY RAW INTERFACES (Internal use only)
// ========================================================

/**
 * Raw QorPay transaction response format
 * This is what QorPay API returns - should not be exposed to developers
 */
export interface QorPayTransactionResponse {
  transaction_id: string;
  amount: string; // QorPay returns string
  currency?: string;
  status: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
  transaction_date?: string;

  // Card fields
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: string;
  card_exp_year?: string;
  exp_month?: string;
  exp_year?: string;

  // ACH fields
  ach_account_last4?: string;
  ach_routing?: string;
  ach_account_type?: string;
  ach_bank_name?: string;

  // Customer fields
  customer_id?: string;
  profile_id?: string;
  customer_email?: string;
  cemail?: string;
  customer_name?: string;
  cfirstname?: string;
  clastname?: string;

  // References
  reference_id?: string;
  order_id?: string;
  orderid?: string;
  batch_id?: string;

  // Additional data
  metadata?: Record<string, unknown>;
}

/**
 * Raw QorPay POD response format
 */
export interface QorPayProofOfDeliveryResponse {
  id: string;
  transaction_id: string;
  delivery_date?: string;
  recipient_name?: string;
  recipient_signature?: string;
  notes?: string;
  images?: string[];
  created_at: string;
  updated_at?: string;
}

// ========================================================
// API RESPONSE WRAPPERS (For BaseClient compatibility)
// ========================================================

/**
 * Internal transaction response wrapper for QorPay API responses
 * Used internally by BaseClient for API transformations
 * @internal
 */
export interface QorPayTransactionResponseWrapper extends BaseQorPayResponse {
  data?: QorPayTransactionResponse;
}

/**
 * Internal transaction list response wrapper for QorPay API responses
 * Used internally by BaseClient for API transformations
 * @internal
 */
export interface QorPayTransactionListResponseWrapper
  extends BaseQorPayResponse {
  data?: {
    transactions?: QorPayTransactionResponse[];
    total?: number;
    has_more?: boolean;
    limit?: number;
    offset?: number;
  };
}

/**
 * Internal POD response wrapper for QorPay API responses
 * Used internally by BaseClient for API transformations
 * @internal
 */
export interface QorPayProofOfDeliveryResponseWrapper
  extends BaseQorPayResponse {
  data?: QorPayProofOfDeliveryResponse;
}

/**
 * Internal POD list response wrapper for QorPay API responses
 * Used internally by BaseClient for API transformations
 * @internal
 */
export interface QorPayProofOfDeliveryListResponseWrapper
  extends BaseQorPayResponse {
  data?: {
    pods?: QorPayProofOfDeliveryResponse[];
    total?: number;
    has_more?: boolean;
    limit?: number;
    offset?: number;
  };
}

// ========================================================
// LEGACY INTERFACES (Backward compatibility)
// ========================================================

/**
 * Legacy query parameters for backward compatibility
 */
export interface TransactionQueryParams extends QueryParams {
  transaction_id?: TransactionId;
  reference_id?: string;
  order_id?: string;
  customer_id?: CustomerId;
  mid?: Mid;
  status?: string;
  type?: string;
  created_start?: string;
  created_end?: string;
  amount_min?: string | number;
  amount_max?: string | number;
  currency?: string;
  batch_id?: BatchId;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ListTransactionsQueryParams extends TransactionQueryParams {}
export interface AchTransactionQueryParams extends TransactionQueryParams {}
export interface ListAchTransactionsQueryParams
  extends TransactionQueryParams {}

/**
 * Legacy transaction result object for backward compatibility
 */
export interface TransactionResultObject {
  transaction_id: TransactionId;
  reference_id?: string;
  order_id?: string;
  customer_id?: CustomerId;
  mid: Mid;
  amount: string;
  currency: string;
  status: string;
  type: string;
  payment_method: string;
  payment_type: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
  batch_id?: BatchId;
  proof_of_delivery_id?: ProofOfDeliveryId;
  card?: {
    type?: string;
    last_four?: string;
    exp_date?: string;
    token?: string;
  };
  ach?: {
    account_type?: string;
    last_four?: string;
    token?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  billing_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  shipping_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: string;
    total: string;
  }>;
}

/**
 * Legacy response types for backward compatibility
 */
export interface LegacyTransactionResponse extends BaseQorPayResponse {
  data: TransactionResultObject;
}

export interface LegacyTransactionListResponse extends BaseQorPayResponse {
  data: {
    transactions: TransactionResultObject[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

export interface LegacyAchTransactionListResponse extends BaseQorPayResponse {
  data: {
    transactions: TransactionResultObject[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Legacy POD types for backward compatibility
 */
export interface ProofOfDeliveryCreateRequest {
  transaction_id: TransactionId;
  delivery_date: string; // ISO date string
  carrier?: string;
  tracking_number?: string;
  signed_by?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ProofOfDeliveryUpdateRequest {
  delivery_date?: string; // ISO date string
  carrier?: string;
  tracking_number?: string;
  signed_by?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ProofOfDeliveryObject {
  id: ProofOfDeliveryId;
  transaction_id: TransactionId;
  delivery_date: string;
  carrier?: Maybe<string>;
  tracking_number?: Maybe<string>;
  signed_by?: Maybe<string>;
  notes?: Maybe<string>;
  created_at: string;
  updated_at: string;
  metadata?: Maybe<Record<string, unknown>>;
}

export interface LegacyProofOfDeliveryResponse extends BaseQorPayResponse {
  data: ProofOfDeliveryObject;
}

export interface ProofOfDeliveryQueryParams extends QueryParams {
  transaction_id?: TransactionId;
  delivery_date_start?: string;
  delivery_date_end?: string;
  carrier?: string;
  tracking_number?: string;
  created_start?: string;
  created_end?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface LegacyProofOfDeliveryListResponse extends BaseQorPayResponse {
  data: {
    proof_of_delivery: ProofOfDeliveryObject[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}
