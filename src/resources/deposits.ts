/**
 * @file src/resources/deposits.ts
 * @description Resource module for deposit-related operations
 */

import { BaseClient } from '../client/base-client';
import {
  BaseQorPayResponse,
  QueryParams,
  DepositId,
  Mid,
  BatchId,
  TransactionId,
} from '../types/common';

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
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
}

/**
 * Query parameters for listing deposits
 */
export interface ListDepositsQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  mid?: Mid;
  status?: string;
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
 * Deposits resource class for deposit-related operations
 */
export class Deposits {
  private client: BaseClient;
  private basePath = '/deposits';

  /**
   * Creates a new Deposits resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Get a specific deposit by ID
   * @param depositId Deposit ID
   * @returns Promise resolving to the deposit details
   */
  async getDeposit(depositId: DepositId): Promise<GetDepositResponsePayload> {
    return this.client.get<GetDepositResponsePayload>(
      `${this.basePath}/${depositId}`
    );
  }

  /**
   * List deposits with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of deposits
   */
  async listDeposits(
    params?: ListDepositsQueryParams
  ): Promise<ListDepositsResponsePayload> {
    return this.client.get<ListDepositsResponsePayload>(this.basePath, params);
  }
}
