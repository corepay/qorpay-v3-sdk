/**
 * @file src/types/customers.ts
 * @description Type definitions for customer-related operations
 */

import type {
  BaseQorPayResponse,
  QueryParams,
  CustomerId,
  Maybe,
} from './common';

/**
 * Customer object structure
 */
export interface Customer {
  id: CustomerId;
  first_name?: Maybe<string>;
  last_name?: Maybe<string>;
  email?: Maybe<string>;
  phone?: Maybe<string>;
  company?: Maybe<string>;
  address1?: Maybe<string>;
  address2?: Maybe<string>;
  city?: Maybe<string>;
  state?: Maybe<string>;
  postal_code?: Maybe<string>;
  country?: Maybe<string>;
  created_at?: Maybe<string>;
  updated_at?: Maybe<string>;
  metadata?: Maybe<Record<string, unknown>>;
}

/**
 * Query parameters for listing customers
 */
export interface CustomerListQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  created_start?: string;
  created_end?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing customers
 */
export interface CustomerListResponse extends BaseQorPayResponse {
  data: {
    customers: Customer[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Response payload for getting a customer
 */
export interface CustomerResponse extends BaseQorPayResponse {
  data: Customer;
}

/**
 * Request payload for creating or updating a customer
 */
export interface CustomerRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  metadata?: Record<string, unknown>;
}
