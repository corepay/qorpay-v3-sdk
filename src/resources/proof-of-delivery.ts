/**
 * @file src/resources/proof-of-delivery.ts
 * @description Resource module for proof of delivery-related operations
 */

import { BaseClient } from '../client/base-client';
import { QueryParams, ProofOfDeliveryId, TransactionId } from '../types/common';
import {
  ProofOfDeliveryCreateRequest,
  ProofOfDeliveryUpdateRequest,
  ProofOfDeliveryResponse,
  ProofOfDeliveryListResponse,
} from '../types/transactions';

/**
 * Query parameters for listing proof of delivery records
 * Extends QueryParams to ensure proper typing with index signature
 */
export interface ListProofOfDeliveryQueryParams extends QueryParams {
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
 * ProofOfDelivery resource class for proof of delivery-related operations
 */
export class ProofOfDelivery {
  private client: BaseClient;
  private basePath = '/proof-of-delivery';

  /**
   * Creates a new ProofOfDelivery resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a proof of delivery record
   * @param data Proof of delivery data
   * @returns Promise resolving to the created proof of delivery record
   */
  async create(
    data: ProofOfDeliveryCreateRequest
  ): Promise<ProofOfDeliveryResponse> {
    return this.client.post<ProofOfDeliveryResponse>(this.basePath, data);
  }

  /**
   * Get a specific proof of delivery record by ID
   * @param podId Proof of delivery ID
   * @returns Promise resolving to the proof of delivery record
   */
  async get(podId: ProofOfDeliveryId): Promise<ProofOfDeliveryResponse> {
    return this.client.get<ProofOfDeliveryResponse>(
      `${this.basePath}/${podId}`
    );
  }

  /**
   * Update an existing proof of delivery record
   * @param podId Proof of delivery ID
   * @param data Proof of delivery data to update
   * @returns Promise resolving to the updated proof of delivery record
   */
  async update(
    podId: ProofOfDeliveryId,
    data: ProofOfDeliveryUpdateRequest
  ): Promise<ProofOfDeliveryResponse> {
    return this.client.put<ProofOfDeliveryResponse>(
      `${this.basePath}/${podId}`,
      data
    );
  }

  /**
   * List proof of delivery records with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of proof of delivery records
   */
  async list(
    params?: ListProofOfDeliveryQueryParams
  ): Promise<ProofOfDeliveryListResponse> {
    return this.client.get<ProofOfDeliveryListResponse>(this.basePath, params);
  }

  /**
   * Delete a proof of delivery record
   * @param podId Proof of delivery ID
   * @returns Promise resolving to the deletion confirmation
   */
  async delete(
    podId: ProofOfDeliveryId
  ): Promise<{ status: string; code: string; message: string }> {
    return this.client.delete<{
      status: string;
      code: string;
      message: string;
    }>(`${this.basePath}/${podId}`);
  }

  /**
   * Get proof of delivery for a specific transaction
   * @param transactionId Transaction ID
   * @returns Promise resolving to the proof of delivery record
   */
  async getByTransaction(
    transactionId: TransactionId
  ): Promise<ProofOfDeliveryResponse> {
    return this.client.get<ProofOfDeliveryResponse>(
      `/transactions/${transactionId}/proof-of-delivery`
    );
  }
}
