/**
 * @file src/resources/payment-tokens.ts
 * @description Resource module for payment token-related operations
 */

import { BaseClient } from '../client/base-client';
import {
  CustomerId,
  PaymentToken,
  AchToken
} from '../types/common';
import {
  CreateCardTokenRequest,
  CreateCardTokenResponse,
  CreateAchTokenRequest,
  CreateAchTokenResponse,
  FetchCardTokensQueryParams,
  FetchCardTokenByIdResponse,
  FetchCardTokenByCustomerResponse,
  FetchAchTokensQueryParams,
  FetchAchTokenByIdResponse,
  FetchAchTokenByCustomerResponse,
  DeleteCardTokenParams,
  DeleteCardTokenResponse,
  UpdateCardTokenRequest,
  UpdateCardTokenResponse,
  RotateCardTokenRequest,
  RotateCardTokenResponse,
  RollbackCardTokenRequest,
  RollbackCardTokenResponse
} from '../types/paymentTokens';

/**
 * PaymentTokens resource class for payment token-related operations
 */
export class PaymentTokens {
  private client: BaseClient;
  private cardTokensPath = '/tokens/card';
  private achTokensPath = '/tokens/ach';

  /**
   * Creates a new PaymentTokens resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a new card token
   * @param data Card token data
   * @returns Promise resolving to the created card token
   */
  async createCardToken(data: CreateCardTokenRequest): Promise<CreateCardTokenResponse> {
    return this.client.post<CreateCardTokenResponse>(
      this.cardTokensPath,
      data
    );
  }

  /**
   * Get a specific card token by ID
   * @param token Card token
   * @returns Promise resolving to the card token
   */
  async getCardToken(token: PaymentToken): Promise<FetchCardTokenByIdResponse> {
    return this.client.get<FetchCardTokenByIdResponse>(
      `${this.cardTokensPath}/${token}`
    );
  }

  /**
   * List card tokens for a specific customer
   * @param customerId Customer ID
   * @param params Additional query parameters
   * @returns Promise resolving to the list of card tokens for the customer
   */
  async listCardTokensByCustomer(
    customerId: CustomerId,
    params?: FetchCardTokensQueryParams
  ): Promise<FetchCardTokenByCustomerResponse> {
    return this.client.get<FetchCardTokenByCustomerResponse>(
      `${this.cardTokensPath}/customer/${customerId}`,
      params
    );
  }

  /**
   * Delete a card token
   * @param params Token and optional customer ID
   * @returns Promise resolving to the deletion confirmation
   */
  async deleteCardToken(
    params: DeleteCardTokenParams
  ): Promise<DeleteCardTokenResponse> {
    return this.client.delete<DeleteCardTokenResponse>(
      `${this.cardTokensPath}/${params.token}`,
      params.customer_id ? { customer_id: params.customer_id } : undefined
    );
  }

  /**
   * Update a card token
   * @param data Card token update data
   * @returns Promise resolving to the updated card token
   */
  async updateCardToken(data: UpdateCardTokenRequest): Promise<UpdateCardTokenResponse> {
    return this.client.put<UpdateCardTokenResponse>(
      `${this.cardTokensPath}/${data.token}`,
      data
    );
  }

  /**
   * Rotate a card token (replace card number while keeping the same token)
   * @param data Card token rotation data
   * @returns Promise resolving to the rotated card token
   */
  async rotateCardToken(data: RotateCardTokenRequest): Promise<RotateCardTokenResponse> {
    return this.client.post<RotateCardTokenResponse>(
      `${this.cardTokensPath}/${data.token}/rotate`,
      data
    );
  }

  /**
   * Rollback a card token rotation
   * @param data Card token rollback data
   * @returns Promise resolving to the rollback confirmation
   */
  async rollbackCardToken(data: RollbackCardTokenRequest): Promise<RollbackCardTokenResponse> {
    return this.client.post<RollbackCardTokenResponse>(
      `${this.cardTokensPath}/${data.token}/rollback`,
      data
    );
  }

  /**
   * Create a new ACH token
   * @param data ACH token data
   * @returns Promise resolving to the created ACH token
   */
  async createAchToken(data: CreateAchTokenRequest): Promise<CreateAchTokenResponse> {
    return this.client.post<CreateAchTokenResponse>(
      this.achTokensPath,
      data
    );
  }

  /**
   * Get a specific ACH token by ID
   * @param token ACH token
   * @returns Promise resolving to the ACH token
   */
  async getAchToken(token: AchToken): Promise<FetchAchTokenByIdResponse> {
    return this.client.get<FetchAchTokenByIdResponse>(
      `${this.achTokensPath}/${token}`
    );
  }

  /**
   * List ACH tokens for a specific customer
   * @param customerId Customer ID
   * @param params Additional query parameters
   * @returns Promise resolving to the list of ACH tokens for the customer
   */
  async listAchTokensByCustomer(
    customerId: CustomerId,
    params?: FetchAchTokensQueryParams
  ): Promise<FetchAchTokenByCustomerResponse> {
    return this.client.get<FetchAchTokenByCustomerResponse>(
      `${this.achTokensPath}/customer/${customerId}`,
      params
    );
  }
}
