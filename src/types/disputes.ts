/**
 * @file src/types/disputes.ts
 * @description Type definitions for dispute-related operations
 */

import type {
  BaseQorPayResponse,
  QueryParams,
  DisputeId,
  TransactionId,
  Mid,
} from './common';

/**
 * Dispute transaction data structure
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
  metadata?: Record<string, unknown>;
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
  reason_code?: string;
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
 * Dispute status values
 */
export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'lost'
  | 'won'
  | 'expired';

/**
 * Dispute reason codes (common examples)
 */
export type DisputeReasonCode =
  | 'fraud'
  | 'unrecognized'
  | 'duplicate'
  | 'credit_not_processed'
  | 'services_not_provided'
  | 'general'
  | 'product_not_received'
  | 'product_unacceptable'
  | 'canceled_recurring'
  | 'account_number';
