/**
 * @file src/resources/ach-payments.ts
 * @description Resource module for ACH payment operations
 */

import { BaseClient } from '../client/base-client';
import {
  BaseQorPayResponse,
  TransactionDataWrapper,
  TransactionId,
  AchDebitRequestData,
  AchCreditRequestData,
  AchVoidRequestData,
  AchRefundRequestData,
  AchSaleResponsePayload,
  AchCreditResponsePayload,
  AchVoidResponsePayload,
  AchRefundResponsePayload,
} from '../types';

/**
 * ACH Payments resource class for ACH payment operations
 */
export class AchPayments {
  private client: BaseClient;
  private basePath = '/payment/ach';

  /**
   * Creates a new ACH Payments resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Process an ACH debit (withdrawal from customer's account)
   * @param data ACH debit request data
   * @returns Promise resolving to the ACH debit response
   */
  async debit(
    data: TransactionDataWrapper<AchDebitRequestData>
  ): Promise<AchSaleResponsePayload> {
    return this.client.post<AchSaleResponsePayload>(
      `${this.basePath}/debit`,
      data
    );
  }

  /**
   * Process an ACH credit (deposit to customer's account)
   * @param data ACH credit request data
   * @returns Promise resolving to the ACH credit response
   */
  async credit(
    data: TransactionDataWrapper<AchCreditRequestData>
  ): Promise<AchCreditResponsePayload> {
    return this.client.post<AchCreditResponsePayload>(
      `${this.basePath}/credit`,
      data
    );
  }

  /**
   * Void an ACH transaction
   * @param data ACH void request data
   * @returns Promise resolving to the ACH void response
   */
  async void(
    data: TransactionDataWrapper<AchVoidRequestData>
  ): Promise<AchVoidResponsePayload> {
    return this.client.post<AchVoidResponsePayload>(
      `${this.basePath}/void`,
      data
    );
  }

  /**
   * Refund an ACH transaction
   * @param data ACH refund request data
   * @returns Promise resolving to the ACH refund response
   */
  async refund(
    data: TransactionDataWrapper<AchRefundRequestData>
  ): Promise<AchRefundResponsePayload> {
    return this.client.post<AchRefundResponsePayload>(
      `${this.basePath}/refund`,
      data
    );
  }

  /**
   * Verify an ACH account
   * @param data ACH verification request data
   * @returns Promise resolving to the ACH verification response
   */
  async verify(
    data: TransactionDataWrapper<AchDebitRequestData>
  ): Promise<BaseQorPayResponse> {
    return this.client.post<BaseQorPayResponse>(
      `${this.basePath}/verify`,
      data
    );
  }

  /**
   * Get details of a specific ACH transaction
   * @param transactionId Transaction ID
   * @returns Promise resolving to the ACH transaction details
   */
  async getTransaction(
    transactionId: TransactionId
  ): Promise<AchSaleResponsePayload> {
    return this.client.get<AchSaleResponsePayload>(
      `${this.basePath}/transaction/${transactionId}`
    );
  }
}
