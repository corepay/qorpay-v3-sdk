/**
 * @file src/types/deposits.ts
 * @description Type definitions for deposit-related operations
 */

import type {
  BaseQorPayResponse,
  QueryParams,
  DepositId,
  Mid,
  BatchId,
  TransactionId,
} from './common';

/**
 * Deposit object structure
 */
export interface Deposit {
  id: DepositId;
  mid: Mid;
  amount: string;
  currency: string;
  status: string;
  deposit_date: string;
  settlement_date?: string;
  batch_id?: BatchId;
  transaction_count?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Deposit details with transaction information
 */
export interface DepositDetails extends Deposit {
  transactions?: DepositTransaction[];
}

/**
 * Transaction within a deposit
 */
export interface DepositTransaction {
  transaction_id: TransactionId;
  amount: string;
  currency: string;
  type: string;
  status: string;
  created_at: string;
  reference_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Query parameters for listing deposits
 */
export interface ListDepositsQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  mid?: Mid;
  deposit_date_start?: string;
  deposit_date_end?: string;
  settlement_date_start?: string;
  settlement_date_end?: string;
  batch_id?: BatchId;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing deposits
 */
export interface ListDepositsResponsePayload extends BaseQorPayResponse {
  data: {
    deposits: Deposit[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Response payload for getting a deposit
 */
export interface GetDepositResponsePayload extends BaseQorPayResponse {
  data: DepositDetails;
}

/**
 * Parameters for the listDeposits method (matches API requirements)
 */
export interface ListDepositsParams {
  year: number;
  status: string;
  queryParams?: Omit<ListDepositsQueryParams, 'status'>;
}
