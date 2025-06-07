/**
 * @file src/types/paymentTokens.ts
 * @description Type definitions for payment token operations
 */

import {
  BaseQorPayResponse,
  QueryParams,
  Maybe,
  CustomerId,
  PaymentToken,
  AchToken,
  TransactionId
} from './common';

/**
 * Request parameters for creating a card token
 */
export interface CreateCardTokenRequest {
  card_number: string;
  card_exp: string; // Format: MMYY
  card_cvv?: string;
  customer_id?: CustomerId;
  card_holder?: string;
  billing_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Response for card token creation
 */
export interface CreateCardTokenResponse extends BaseQorPayResponse {
  data: CardTokenObject;
}

/**
 * Card token object structure
 */
export interface CardTokenObject {
  token: PaymentToken;
  card_type: string;
  last_four: string;
  exp_date: string;
  card_holder?: string;
  customer_id?: CustomerId;
  created_at: string;
  updated_at: string;
  billing_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Request parameters for creating an ACH token
 */
export interface CreateAchTokenRequest {
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
  account_holder: string;
  customer_id?: CustomerId;
  billing_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Response for ACH token creation
 */
export interface CreateAchTokenResponse extends BaseQorPayResponse {
  data: AchTokenObject;
}

/**
 * ACH token object structure
 */
export interface AchTokenObject {
  token: AchToken;
  account_type: 'checking' | 'savings';
  last_four: string;
  account_holder: string;
  customer_id?: CustomerId;
  created_at: string;
  updated_at: string;
  billing_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Query parameters for fetching card tokens
 */
export interface FetchCardTokensQueryParams extends QueryParams {
  customer_id?: CustomerId;
  token?: PaymentToken;
  card_type?: string;
  last_four?: string;
  created_start?: string;
  created_end?: string;
  updated_start?: string;
  updated_end?: string;
  limit?: number;
  offset?: number;
}

/**
 * Response for fetching a card token by ID
 */
export interface FetchCardTokenByIdResponse extends BaseQorPayResponse {
  data: CardTokenObject;
}

/**
 * Response for fetching card tokens by customer
 */
export interface FetchCardTokenByCustomerResponse extends BaseQorPayResponse {
  data: {
    tokens: CardTokenObject[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Query parameters for fetching ACH tokens
 */
export interface FetchAchTokensQueryParams extends QueryParams {
  customer_id?: CustomerId;
  token?: AchToken;
  account_type?: 'checking' | 'savings';
  last_four?: string;
  created_start?: string;
  created_end?: string;
  updated_start?: string;
  updated_end?: string;
  limit?: number;
  offset?: number;
}

/**
 * Response for fetching an ACH token by ID
 */
export interface FetchAchTokenByIdResponse extends BaseQorPayResponse {
  data: AchTokenObject;
}

/**
 * Response for fetching ACH tokens by customer
 */
export interface FetchAchTokenByCustomerResponse extends BaseQorPayResponse {
  data: {
    tokens: AchTokenObject[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Parameters for deleting a card token
 */
export interface DeleteCardTokenParams extends QueryParams {
  token: PaymentToken;
  customer_id?: CustomerId;
}

/**
 * Request for deleting a card token
 */
export interface DeleteCardTokenRequest {
  token: PaymentToken;
  customer_id?: CustomerId;
}

/**
 * Response for deleting a card token
 */
export interface DeleteCardTokenResponse extends BaseQorPayResponse {
  data: {
    token: PaymentToken;
    deleted: boolean;
  };
}

/**
 * Request for updating a card token
 */
export interface UpdateCardTokenRequest {
  token: PaymentToken;
  customer_id?: CustomerId;
  card_exp?: string; // Format: MMYY
  card_holder?: string;
  billing_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Response for updating a card token
 */
export interface UpdateCardTokenResponse extends BaseQorPayResponse {
  data: CardTokenObject;
}

/**
 * Request for rotating a card token
 */
export interface RotateCardTokenRequest {
  token: PaymentToken;
  customer_id?: CustomerId;
  card_number: string;
  card_exp: string; // Format: MMYY
  card_cvv?: string;
}

/**
 * Response for rotating a card token
 */
export interface RotateCardTokenResponse extends BaseQorPayResponse {
  data: CardTokenObject;
}

/**
 * Request for rolling back a card token
 */
export interface RollbackCardTokenRequest {
  token: PaymentToken;
  customer_id?: CustomerId;
  transaction_id: TransactionId;
}

/**
 * Response for rolling back a card token
 */
export interface RollbackCardTokenResponse extends BaseQorPayResponse {
  data: {
    token: PaymentToken;
    rolled_back: boolean;
    transaction_id: TransactionId;
  };
}
