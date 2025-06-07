/**
 * @file src/resources/transactions.ts
 * @description Resource module for transaction-related operations
 */

import type { BaseClient } from '../client/base-client';
import type { TransactionId, BatchId, ProfileId } from '../types/common';
import type {
  TransactionResponse,
  TransactionListResponse,
  AchTransactionListResponse,
  TransactionQueryParams,
  ListTransactionsQueryParams,
  ListAchTransactionsQueryParams,
} from '../types/transactions';

/**
 * Transactions resource class for transaction-related operations
 */
export class Transactions {
  private client: BaseClient;
  private basePath = '/transactions';
  private achBasePath = '/ach/transactions';

  /**
   * Creates a new Transactions resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Get a specific transaction by ID
   * @param transactionId Transaction ID
   * @returns Promise resolving to the transaction details
   */
  async getTransaction(
    transactionId: TransactionId
  ): Promise<TransactionResponse> {
    return this.client.get<TransactionResponse>(
      `${this.basePath}/${transactionId}`
    );
  }

  /**
   * List transactions with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of transactions
   */
  async listTransactions(
    params?: ListTransactionsQueryParams
  ): Promise<TransactionListResponse> {
    return this.client.get<TransactionListResponse>(this.basePath, params);
  }

  /**
   * List transactions for a specific profile/customer
   * @param profileId Profile/Customer ID
   * @param params Additional query parameters
   * @returns Promise resolving to the list of transactions for the profile
   */
  async listTransactionsByProfile(
    profileId: ProfileId,
    params?: TransactionQueryParams
  ): Promise<TransactionListResponse> {
    return this.client.get<TransactionListResponse>(
      `/profiles/${profileId}/transactions`,
      params
    );
  }

  /**
   * List transactions for a specific batch
   * @param batchId Batch ID
   * @param params Additional query parameters
   * @returns Promise resolving to the list of transactions for the batch
   */
  async listTransactionsByBatch(
    batchId: BatchId,
    params?: TransactionQueryParams
  ): Promise<TransactionListResponse> {
    return this.client.get<TransactionListResponse>(
      `/batches/${batchId}/transactions`,
      params
    );
  }

  /**
   * Get a specific ACH transaction by ID
   * @param transactionId Transaction ID
   * @returns Promise resolving to the ACH transaction details
   */
  async getAchTransaction(
    transactionId: TransactionId
  ): Promise<TransactionResponse> {
    return this.client.get<TransactionResponse>(
      `${this.achBasePath}/${transactionId}`
    );
  }

  /**
   * List ACH transactions with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of ACH transactions
   */
  async listAchTransactions(
    params?: ListAchTransactionsQueryParams
  ): Promise<AchTransactionListResponse> {
    return this.client.get<AchTransactionListResponse>(
      this.achBasePath,
      params
    );
  }
}
