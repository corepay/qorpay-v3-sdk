/**
 * @file src/types/transactions.ts
 * @description Type definitions for transaction-related operations
 */

import {
  BaseQorPayResponse,
  QueryParams,
  TransactionId,
  CustomerId,
  Mid,
  BatchId,
  ProofOfDeliveryId,
  Maybe,
} from './common';

/**
 * Query parameters for fetching transactions
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

/**
 * Alias for TransactionQueryParams for list operations
 */
export interface ListTransactionsQueryParams extends QueryParams {
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

/**
 * Query parameters for fetching ACH transactions
 */
export interface AchTransactionQueryParams extends QueryParams {
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

/**
 * Alias for AchTransactionQueryParams for list operations
 */
export interface ListAchTransactionsQueryParams extends QueryParams {
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

/**
 * Transaction result object structure
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
  metadata?: Record<string, any>;
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
 * Response for fetching a transaction
 */
export interface TransactionResponse extends BaseQorPayResponse {
  data: TransactionResultObject;
}

/**
 * Response for listing transactions
 */
export interface TransactionListResponse extends BaseQorPayResponse {
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
 * Alias for TransactionListResponse for API consistency
 */
export interface AchTransactionListResponse extends BaseQorPayResponse {
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
 * Proof of delivery create request
 */
export interface ProofOfDeliveryCreateRequest {
  transaction_id: TransactionId;
  delivery_date: string; // ISO date string
  carrier?: string;
  tracking_number?: string;
  signed_by?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Proof of delivery update request
 */
export interface ProofOfDeliveryUpdateRequest {
  delivery_date?: string; // ISO date string
  carrier?: string;
  tracking_number?: string;
  signed_by?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Proof of delivery object structure
 */
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
  metadata?: Maybe<Record<string, any>>;
}

/**
 * Response for proof of delivery operations
 */
export interface ProofOfDeliveryResponse extends BaseQorPayResponse {
  data: ProofOfDeliveryObject;
}

/**
 * Query parameters for listing proof of delivery records
 */
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

/**
 * Response for listing proof of delivery records
 */
export interface ProofOfDeliveryListResponse extends BaseQorPayResponse {
  data: {
    proof_of_delivery: ProofOfDeliveryObject[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}
