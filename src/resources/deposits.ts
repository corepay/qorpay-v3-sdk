/**
 * @file src/resources/deposits.ts
 * @description Resource module for deposit-related operations
 */

import type { BaseClient } from '../client/base-client';
import type {
  DepositId,
  ListDepositsQueryParams,
  ListDepositsResponsePayload,
  GetDepositResponsePayload,
} from '../types';
import type { QueryParams } from '../types/common';
import type { TransactionListResponse } from '../types/transactions';
import { ListDepositsParamsSchema, DepositIdParamSchema } from '../schemas';

// Re-export types from central types module for backward compatibility
export type {
  Deposit,
  DepositDetails,
  DepositTransaction,
  ListDepositsQueryParams,
  ListDepositsResponsePayload,
  GetDepositResponsePayload,
  ListDepositsParams,
} from '../types';

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
    // Validate deposit ID parameter
    DepositIdParamSchema.parse(depositId);

    return this.client.get<GetDepositResponsePayload>(
      `${this.basePath}/${depositId}`
    );
  }

  /**
   * List deposits with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of deposits
   */
  /**
   * List deposits with year and status filtering (as required by QorPay API)
   * @param params Parameters including year, status, and optional query parameters
   * @returns Promise resolving to the list of deposits
   */
  async listDeposits(
    year: number,
    status: string,
    params?: Omit<ListDepositsQueryParams, 'status'>
  ): Promise<ListDepositsResponsePayload> {
    // Validate input parameters
    const validatedParams = ListDepositsParamsSchema.parse({
      year,
      status,
      queryParams: params,
    });

    const queryParams = {
      ...validatedParams.queryParams,
      status: validatedParams.status,
    };

    return this.client.get<ListDepositsResponsePayload>(
      `${this.basePath}/${validatedParams.year}/${validatedParams.status}`,
      queryParams
    );
  }

  /**
   * Fetch detailed deposit information including transaction breakdown
   * @param depositId Deposit ID
   * @returns Promise resolving to detailed deposit information
   */
  async getDepositDetail(
    depositId: DepositId
  ): Promise<GetDepositResponsePayload> {
    // Validate deposit ID parameter
    DepositIdParamSchema.parse(depositId);

    return this.client.get<GetDepositResponsePayload>(
      `${this.basePath}/detail/${depositId}`
    );
  }

  /**
   * List transactions associated with a specific deposit
   * @param id Deposit ID
   * @param params Optional query parameters for pagination and filtering
   * @returns Promise resolving to the list of transactions for the deposit
   */
  async listDepositTransactions(
    id: string,
    params?: QueryParams
  ): Promise<TransactionListResponse> {
    // Validate deposit ID parameter
    DepositIdParamSchema.parse(id);

    return this.client.get<TransactionListResponse>(
      `${this.basePath}/${id}/transactions`,
      params
    );
  }
}
