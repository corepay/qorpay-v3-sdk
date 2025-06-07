/**
 * @file src/resources/disputes.ts
 * @description Resource module for dispute-related operations
 */

import { BaseClient } from '../client/base-client';
import {
  BaseQorPayResponse,
  QueryParams,
  DisputeId,
  TransactionId,
  Mid,
} from '../types/common';

/**
 * Dispute object structure
 */
export interface DisputeTransactionData {
  transaction_id: TransactionId;
  mid: Mid;
  amount: string;
  currency: string;
  reason_code: string;
  reason_description: string;
  status: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  case_number?: string;
  metadata?: Record<string, any>;
}

/**
 * Full dispute object
 */
export interface Dispute {
  id: DisputeId;
  transaction_data: DisputeTransactionData;
  documents?: DisputeDocument[];
  evidence?: DisputeEvidence;
}

/**
 * Dispute document
 */
export interface DisputeDocument {
  id: string;
  type: string;
  filename: string;
  content_type: string;
  size: number;
  url?: string;
  uploaded_at: string;
}

/**
 * Dispute evidence
 */
export interface DisputeEvidence {
  submitted_at?: string;
  status: string;
  notes?: string;
  evidence_items?: Record<string, string>;
}

/**
 * Query parameters for listing disputes
 */
export interface ListDisputesQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  mid?: Mid;
  status?: string;
  created_start?: string;
  created_end?: string;
  due_date_start?: string;
  due_date_end?: string;
  transaction_id?: TransactionId;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing disputes
 */
export interface ListDisputesResponsePayload extends BaseQorPayResponse {
  data: {
    disputes: Dispute[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Response payload for getting a dispute
 */
export interface GetDisputeResponsePayload extends BaseQorPayResponse {
  data: Dispute;
}

/**
 * Disputes resource class for dispute-related operations
 */
export class Disputes {
  private client: BaseClient;
  private basePath = '/disputes';

  /**
   * Creates a new Disputes resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Get a specific dispute by ID
   * @param disputeId Dispute ID
   * @returns Promise resolving to the dispute details
   */
  async getDispute(disputeId: DisputeId): Promise<GetDisputeResponsePayload> {
    return this.client.get<GetDisputeResponsePayload>(
      `${this.basePath}/${disputeId}`
    );
  }

  /**
   * List disputes with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of disputes
   */
  async listDisputes(
    params?: ListDisputesQueryParams
  ): Promise<ListDisputesResponsePayload> {
    return this.client.get<ListDisputesResponsePayload>(this.basePath, params);
  }

  /**
   * List disputes for a specific transaction
   * @param transactionId Transaction ID
   * @param params Additional query parameters
   * @returns Promise resolving to the list of disputes for the transaction
   */
  async listDisputesByTransaction(
    transactionId: TransactionId,
    params?: ListDisputesQueryParams
  ): Promise<ListDisputesResponsePayload> {
    return this.client.get<ListDisputesResponsePayload>(
      `/transactions/${transactionId}/disputes`,
      params
    );
  }
}
