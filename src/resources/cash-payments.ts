/**
 * @file src/resources/cash-payments.ts
 * @description Resource class for QorPay V3 Cash Payment operations.
 */

import { BaseClient } from '../client/base-client';
import {
  TransactionDataWrapper,
  PaymentCashRequestData,
  SaleAuthResponsePayload
} from '../types';

export class CashPayments {
  private client: BaseClient;

  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Record a cash payment transaction.
   * @param data The cash payment request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/cash-payment} (Example URL)
   */
  async recordCashPayment(
    data: PaymentCashRequestData
  ): Promise<SaleAuthResponsePayload> {
    const requestBody: TransactionDataWrapper<PaymentCashRequestData> = {
      transaction_data: data,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/cash',
      requestBody
    );
  }
}
