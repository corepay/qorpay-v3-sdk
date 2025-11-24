/**
 * @file src/resources/disputes.ts
 * @description Resource module for dispute-related operations
 */

import type { BaseClient } from '../client/base-client';
import type {
  DisputeId,
  TransactionId,
  ListDisputesQueryParams,
  ListDisputesResponsePayload,
  GetDisputeResponsePayload,
} from '../types';
import {
  ListDisputesQueryParamsSchema,
  DisputeIdParamSchema,
} from '../schemas';

// Re-export types from central types module for backward compatibility
export type {
  Dispute,
  DisputeDocument,
  DisputeEvidence,
  DisputeTransactionData,
  ListDisputesQueryParams,
  ListDisputesResponsePayload,
  GetDisputeResponsePayload,
  DisputeStatus,
  DisputeReasonCode,
} from '../types';

/**
 * Disputes resource class for dispute-related operations
 */
export class Disputes {
  private client: BaseClient;

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
  /**
   * Note: Individual dispute retrieval is not available in the current API.
   * Use listDisputes() with appropriate filters to find specific disputes.
   * @deprecated This method is not supported by the current API
   */
  async getDispute(disputeId: DisputeId): Promise<GetDisputeResponsePayload> {
    // Check for empty ID first to avoid validation error before deprecation message
    if (!disputeId || disputeId.trim().length === 0) {
      return Promise.reject(new Error('Dispute ID is required'));
    }

    // Validate dispute ID parameter
    DisputeIdParamSchema.parse(disputeId);

    // This endpoint doesn't exist in the API - throw a helpful error
    return Promise.reject(
      new Error(
        'Individual dispute retrieval is not supported by the QorPay API. ' +
          'Use listDisputes() with transaction_id filter to find specific disputes.'
      )
    );
  }

  /**
   * List disputes with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of disputes
   */
  /**
   * List payment disputes with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of payment disputes
   */
  async listDisputes(
    params?: ListDisputesQueryParams
  ): Promise<ListDisputesResponsePayload> {
    // Validate query parameters
    const validatedParams = ListDisputesQueryParamsSchema.parse(params || {});

    return this.client.get<ListDisputesResponsePayload>(
      '/payment/disputes',
      validatedParams
    );
  }

  /**
   * List ACH disputes with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of ACH disputes
   */
  async listAchDisputes(
    params?: ListDisputesQueryParams
  ): Promise<ListDisputesResponsePayload> {
    // Validate query parameters
    const validatedParams = ListDisputesQueryParamsSchema.parse(params || {});

    return this.client.get<ListDisputesResponsePayload>(
      '/payment/ach/disputes',
      validatedParams
    );
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
