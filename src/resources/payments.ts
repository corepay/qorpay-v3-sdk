/**
 * @file src/resources/payments.ts
 * @description Resource class for QorPay V3 Credit/Debit Card Payment operations.
 */

import type { BaseClient } from '../client/base-client';
import type {
  TransactionDataWrapper,
  PaymentSaleManualRequestData,
  SaleAuthResponsePayload,
  PaymentSaleCashDiscountRequestData,
  PaymentSaleSwipeRequestData,
  PaymentSaleTokenRequestData,
  PaymentSaleLvl3RequestData,
  PaymentSale3DSRequestData,
  PaymentSalePinRequestData,
  PaymentSalePosRequestData,
  PaymentRecurringSetupRequestData,
  PaymentRecurringExistingRequestData,
  PaymentRecurringMyRequestData,
  PaymentAuthRequestData,
  PaymentAuthTokenRequestData,
  PaymentVoidRequestData,
  PaymentActionResponsePayload,
  PaymentRefundRequestData,
  PaymentCaptureRequestData,
} from '../types';

import {
  PaymentSaleManualRequestSchema,
  PaymentSaleCashDiscountRequestSchema,
  PaymentSaleSwipeRequestSchema,
  PaymentSaleTokenRequestSchema,
  PaymentRecurringSetupRequestSchema,
  PaymentRecurringExistingRequestSchema,
  PaymentRecurringMyRequestSchema,
  PaymentAuthRequestSchema,
  PaymentAuthTokenRequestSchema,
  PaymentVoidRequestSchema,
  PaymentRefundRequestSchema,
  PaymentCaptureRequestSchema,
} from '../schemas';

export class Payments {
  private client: BaseClient;

  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Process a payment with a keyed/manually entered credit/debit card (eComm).
   * @param data The payment sale manual request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-manual} (Example URL)
   */
  async saleManual(
    data: PaymentSaleManualRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentSaleManualRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentSaleManualRequestData> = {
      transaction_data: validatedData as PaymentSaleManualRequestData,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/sale/manual/',
      requestBody
    );
  }

  /**
   * Process a sale with a cash discount.
   * @param data The payment sale cash discount request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-cashdiscount} (Example URL)
   */
  async saleCashDiscount(
    data: PaymentSaleCashDiscountRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentSaleCashDiscountRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentSaleCashDiscountRequestData> =
      {
        transaction_data: validatedData as PaymentSaleCashDiscountRequestData,
      };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/sale/cashdiscount',
      requestBody
    );
  }

  /**
   * Process a payment with a swiped credit/debit card (requires track data).
   * Note: OpenAPI spec for this endpoint (POST /payment/sale/swipe) is missing a requestBody.
   * Assuming it requires PaymentSaleSwipeRequestData based on common patterns.
   * @param data The payment sale swipe request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-swipe} (Example URL)
   */
  async saleSwipe(
    data: PaymentSaleSwipeRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentSaleSwipeRequestSchema.parse(data);
    // OpenAPI spec for /payment/sale/swipe does not define a requestBody.
    // Assuming TransactionDataWrapper based on other sale endpoints.
    const requestBody: TransactionDataWrapper<PaymentSaleSwipeRequestData> = {
      transaction_data: validatedData as PaymentSaleSwipeRequestData,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/sale/swipe',
      requestBody // This might need adjustment if the API expects a different structure or no body.
    );
  }

  /**
   * Process a sale with a card token.
   * @param data The payment sale token request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-token} (Example URL)
   */
  async saleToken(
    data: PaymentSaleTokenRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentSaleTokenRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentSaleTokenRequestData> = {
      transaction_data: validatedData as PaymentSaleTokenRequestData,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/sale/token',
      requestBody
    );
  }

  /**
   * Process a payment with Level 2 or 3 data.
   * @param data The payment sale Level 2/3 request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-lvl3} (Example URL)
   */
  async saleLvl2Lvl3(
    data: PaymentSaleLvl3RequestData
  ): Promise<SaleAuthResponsePayload> {
    // Schema not yet implemented for Lvl3
    const requestBody: TransactionDataWrapper<PaymentSaleLvl3RequestData> = {
      transaction_data: data,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/sale/lvl2_3',
      requestBody
    );
  }

  /**
   * Process a payment with authenticated 3-D Secure information.
   * @param data The payment sale 3DS request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-3ds} (Example URL)
   */
  async sale3DS(
    data: PaymentSale3DSRequestData
  ): Promise<SaleAuthResponsePayload> {
    // Schema not yet implemented for 3DS
    const requestBody: TransactionDataWrapper<PaymentSale3DSRequestData> = {
      transaction_data: data,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/sale/3ds',
      requestBody
    );
  }

  /**
   * Process a PIN Debit purchase.
   * @param data The payment sale PIN debit request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-pin} (Example URL)
   */
  async salePin(
    data: PaymentSalePinRequestData
  ): Promise<SaleAuthResponsePayload> {
    // Schema not yet implemented for PIN
    const requestBody: TransactionDataWrapper<PaymentSalePinRequestData> = {
      transaction_data: data,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/sale/pin',
      requestBody
    );
  }

  /**
   * Process a purchase through a point of sale system.
   * @param data The payment sale POS request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-pos} (Example URL)
   */
  async salePos(
    data: PaymentSalePosRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentSaleManualRequestSchema.parse(data); // Uses same schema as manual
    const requestBody: TransactionDataWrapper<PaymentSalePosRequestData> = {
      transaction_data: validatedData as PaymentSalePosRequestData,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/sale/pos',
      requestBody
    );
  }

  /**
   * Setup and process a recurring credit/debit card sale.
   * @param data The recurring payment setup request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-recurring-setup} (Example URL)
   */
  async recurringSetup(
    data: PaymentRecurringSetupRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentRecurringSetupRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentRecurringSetupRequestData> =
      {
        transaction_data: validatedData as PaymentRecurringSetupRequestData,
      };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/recurring/setup',
      requestBody
    );
  }

  /**
   * Process an existing recurring credit/debit card purchase initially run by the QorCommerce platform.
   * @param data The existing recurring payment request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-recurring} (Example URL)
   */
  async recurringExisting(
    data: PaymentRecurringExistingRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentRecurringExistingRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentRecurringExistingRequestData> =
      {
        transaction_data: validatedData as PaymentRecurringExistingRequestData,
      };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/recurring',
      requestBody
    );
  }

  /**
   * Re-Process your existing purchase (merchant-initiated recurring).
   * @param data The "my recurring" payment request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-sale-recurring_my} (Example URL)
   */
  async recurringMy(
    data: PaymentRecurringMyRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentRecurringMyRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentRecurringMyRequestData> = {
      transaction_data: validatedData as PaymentRecurringMyRequestData,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/my_recurring',
      requestBody
    );
  }

  /**
   * Pre-Authorize an amount on a credit/debit card.
   * @param data The authorization request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-auth} (Example URL)
   */
  async authorize(
    data: PaymentAuthRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentAuthRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentAuthRequestData> = {
      transaction_data: validatedData as PaymentAuthRequestData,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/authorize',
      requestBody
    );
  }

  /**
   * Pre-Authorize an amount on a credit/debit card using a card token.
   * @param data The authorization with token request data.
   * @returns A promise resolving to the sale/auth response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-auth-token} (Example URL)
   */
  async authorizeToken(
    data: PaymentAuthTokenRequestData
  ): Promise<SaleAuthResponsePayload> {
    const validatedData = PaymentAuthTokenRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentAuthTokenRequestData> = {
      transaction_data: validatedData as PaymentAuthTokenRequestData,
    };
    return this.client.post<SaleAuthResponsePayload, typeof requestBody>(
      '/payment/authorize/token',
      requestBody
    );
  }

  /**
   * Cancel / Void a Sale or Authorization.
   * @param data The void request data.
   * @returns A promise resolving to the payment action response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-void} (Example URL)
   */
  async void(
    data: PaymentVoidRequestData
  ): Promise<PaymentActionResponsePayload> {
    const validatedData = PaymentVoidRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentVoidRequestData> = {
      transaction_data: validatedData as PaymentVoidRequestData,
    };
    return this.client.post<PaymentActionResponsePayload, typeof requestBody>(
      '/payment/void',
      requestBody
    );
  }

  /**
   * Provide a full or partial refund on a Sale or Capture.
   * @param data The refund request data.
   * @returns A promise resolving to the payment action response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-refund} (Example URL)
   */
  async refund(
    data: PaymentRefundRequestData
  ): Promise<PaymentActionResponsePayload> {
    const validatedData = PaymentRefundRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentRefundRequestData> = {
      transaction_data: validatedData as PaymentRefundRequestData,
    };
    return this.client.post<PaymentActionResponsePayload, typeof requestBody>(
      '/payment/refund',
      requestBody
    );
  }

  /**
   * Capture funds previously Pre-Authorized on a credit/debit card.
   * @param data The capture request data.
   * @returns A promise resolving to the payment action response.
   * @see {@link https://docs.qorcommerce.io/reference/payment-capture} (Example URL)
   */
  async capture(
    data: PaymentCaptureRequestData
  ): Promise<PaymentActionResponsePayload> {
    const validatedData = PaymentCaptureRequestSchema.parse(data);
    const requestBody: TransactionDataWrapper<PaymentCaptureRequestData> = {
      transaction_data: validatedData as PaymentCaptureRequestData,
    };
    return this.client.post<PaymentActionResponsePayload, typeof requestBody>(
      '/payment/capture',
      requestBody
    );
  }
}
