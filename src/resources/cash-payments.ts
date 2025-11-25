/**
 * @file src/resources/cash-payments.ts
 * @description Resource module for cash payment operations
 */

import type { BaseClient } from '../client/base-client';
import type {
  BaseQorPayResponse,
  TransactionDataWrapper,
  CashSaleTransactionData,
  CashSaleResponsePayload,
} from '../types';

/**
 * Cash payment request interface
 */
export interface CashPaymentRequest {
  amount: string | number;
  currency?: string;
  description?: string;
  customer_id?: string;
  order_id?: string;
  reference_id?: string;
  register_id?: string;
  tender_type?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Cash payment response interface
 */
export interface CashPaymentResponse extends BaseQorPayResponse {
  data: {
    transaction_id: string;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
    register_id?: string;
    tender_type?: string;
  };
}

/**
 * Cash Payments resource class for cash payment operations
 */
export class CashPayments {
  private client: BaseClient;
  private basePath = '/payments/cash';

  /**
   * Creates a new Cash Payments resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a new cash payment
   * @param data Cash payment request data
   * @returns Promise resolving to the cash payment response
   */
  async create(data: CashPaymentRequest): Promise<CashPaymentResponse> {
    return this.client.post<CashPaymentResponse>(`${this.basePath}`, data);
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
