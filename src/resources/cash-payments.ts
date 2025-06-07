/**
 * @file src/resources/cash-payments.ts
 * @description Resource module for cash payment operations
 */

import { BaseClient } from '../client/base-client';
import {
  BaseQorPayResponse,
  TransactionDataWrapper,
  CashSaleTransactionData,
  CashSaleResponsePayload,
} from '../types';

/**
 * Cash Payments resource class for cash payment operations
 */
export class CashPayments {
  private client: BaseClient;
  private basePath = '/payment/cash';

  /**
   * Creates a new Cash Payments resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Record a cash payment
   * @param data Cash payment request data
   * @returns Promise resolving to the cash payment response
   */
  async recordPayment(
    data: TransactionDataWrapper<CashSaleTransactionData>
  ): Promise<CashSaleResponsePayload> {
    return this.client.post<CashSaleResponsePayload>(
      `${this.basePath}/sale`,
      data
    );
  }

  /**
   * Void a cash payment
   * @param transactionId Transaction ID of the payment to void
   * @returns Promise resolving to the void response
   */
  async voidPayment(transactionId: string): Promise<BaseQorPayResponse> {
    return this.client.post<BaseQorPayResponse>(`${this.basePath}/void`, {
      transaction_id: transactionId,
    });
  }

  /**
   * Refund a cash payment
   * @param transactionId Transaction ID of the payment to refund
   * @param amount Amount to refund (optional, defaults to full amount)
   * @returns Promise resolving to the refund response
   */
  async refundPayment(
    transactionId: string,
    amount?: string
  ): Promise<BaseQorPayResponse> {
    const data = {
      transaction_id: transactionId,
      ...(amount && { amount }),
    };

    return this.client.post<BaseQorPayResponse>(
      `${this.basePath}/refund`,
      data
    );
  }
}
