/**
 * @file src/resources/ach-payments.ts
 * @description Resource class for QorPay V3 ACH/Bank Transfer Payment operations.
 */

import { BaseClient } from '../client/base-client';
import {
  TransactionDataWrapper,
  PaymentAchDebitRequestData,
  SaleAuthResponsePayload,
  PaymentAchCreditRequestData,
  PaymentAchVoidRequestData,
  PaymentActionResponsePayload,
  PaymentAchRefundRequestData,
} from '../types';

export class AchPayments {
  private client: BaseClient;

  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Process an ACH/Bank Transfer debit (withdrawal).
   * @param data The ACH debit request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/ach-debit} (Example URL)
   */
  async debit(
    data: PaymentAchDebitRequestData
  ): Promise<SaleAuthResponsePayload> {
    const requestBody: TransactionDataWrapper<PaymentAchDebitRequestData> = {
      transaction_data: data,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/ach/debit',
      requestBody
    );
  }

  /**
   * Process an ACH/Bank Transfer credit (deposit).
   * @param data The ACH credit request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/ach-credit} (Example URL)
   */
  async credit(
    data: PaymentAchCreditRequestData
  ): Promise<SaleAuthResponsePayload> {
    const requestBody: TransactionDataWrapper<PaymentAchCreditRequestData> = {
      transaction_data: data,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/ach/credit',
      requestBody
    );
  }

  /**
   * Cancel / Void an ACH/Bank Transfer debit or credit.
   * @param data The ACH void request data.
   * @returns A promise resolving to the payment action response.
   * @see {@link https://docs.qorcommerce.io/reference/ach-void} (Example URL)
   */
  async void(
    data: PaymentAchVoidRequestData
  ): Promise<PaymentActionResponsePayload> {
    const requestBody: TransactionDataWrapper<PaymentAchVoidRequestData> = {
      transaction_data: data,
    };
    return this.client.post<PaymentActionResponsePayload, typeof requestBody>(
      '/ach/void',
      requestBody
    );
  }

  /**
   * Provide a full or partial refund on an ACH/Bank Transfer debit.
   * @param data The ACH refund request data.
   * @returns A promise resolving to the payment action response.
   * @see {@link https://docs.qorcommerce.io/reference/ach-refund} (Example URL)
   */
  async refund(
    data: PaymentAchRefundRequestData
  ): Promise<PaymentActionResponsePayload> {
    const requestBody: TransactionDataWrapper<PaymentAchRefundRequestData> = {
      transaction_data: data,
    };
    return this.client.post<PaymentActionResponsePayload, typeof requestBody>(
      '/ach/refund',
      requestBody
    );
  }
}
