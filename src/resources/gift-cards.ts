/**
 * @file src/resources/gift-cards.ts
 * @description Resource module for gift card-related operations
 */

import type { BaseClient } from '../client/base-client';
import type { Currency } from '../types/common';

/**
 * Gift card activation request
 */
export interface GiftCardActivateRequest {
  card_number: string;
  amount: string;
  currency: Currency;
  reference_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Gift card activation response
 */
export interface GiftCardActivateResponse {
  status: string;
  code: string;
  message: string;
  data: {
    card_number: string;
    amount: string;
    currency: Currency;
    balance: string;
    status: string;
    reference_id?: string;
  };
}

/**
 * Gift card balance check request
 */
export interface GiftCardBalanceRequest {
  card_number: string;
  reference_id?: string;
}

/**
 * Gift card balance check response
 */
export interface GiftCardBalanceResponse {
  status: string;
  code: string;
  message: string;
  data: {
    card_number: string;
    balance: string;
    currency: Currency;
    status: string;
    reference_id?: string;
  };
}

/**
 * Gift card deactivation request
 */
export interface GiftCardDeactivateRequest {
  card_number: string;
  reference_id?: string;
}

/**
 * Gift card deactivation response
 */
export interface GiftCardDeactivateResponse {
  status: string;
  code: string;
  message: string;
  data: {
    card_number: string;
    status: string;
    reference_id?: string;
  };
}

/**
 * Gift card load request
 */
export interface GiftCardLoadRequest {
  card_number: string;
  amount: string;
  currency: Currency;
  reference_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Gift card load response
 */
export interface GiftCardLoadResponse {
  status: string;
  code: string;
  message: string;
  data: {
    card_number: string;
    amount: string;
    currency: Currency;
    balance: string;
    status: string;
    reference_id?: string;
  };
}

/**
 * Gift card sale request
 */
export interface GiftCardSaleRequest {
  card_number: string;
  amount: string;
  currency: Currency;
  reference_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Gift card sale response
 */
export interface GiftCardSaleResponse {
  status: string;
  code: string;
  message: string;
  data: {
    card_number: string;
    amount: string;
    currency: Currency;
    balance: string;
    status: string;
    transaction_id: string;
    reference_id?: string;
  };
}

/**
 * Gift card refund request
 */
export interface GiftCardRefundRequest {
  card_number: string;
  amount: string;
  currency: Currency;
  transaction_id: string;
  reference_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Gift card refund response
 */
export interface GiftCardRefundResponse {
  status: string;
  code: string;
  message: string;
  data: {
    card_number: string;
    amount: string;
    currency: Currency;
    balance: string;
    status: string;
    transaction_id: string;
    reference_id?: string;
  };
}

/**
 * GiftCards resource class for gift card-related operations
 */
export class GiftCards {
  private client: BaseClient;
  private basePath = '/gift-cards';

  /**
   * Creates a new GiftCards resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Activate a gift card
   * @param data Gift card activation data
   * @returns Promise resolving to the activation result
   */
  async activate(
    data: GiftCardActivateRequest
  ): Promise<GiftCardActivateResponse> {
    return this.client.post<GiftCardActivateResponse>(
      `${this.basePath}/activate`,
      data
    );
  }

  /**
   * Check the balance of a gift card
   * @param data Gift card balance check data
   * @returns Promise resolving to the balance check result
   */
  async checkBalance(
    data: GiftCardBalanceRequest
  ): Promise<GiftCardBalanceResponse> {
    return this.client.post<GiftCardBalanceResponse>(
      `${this.basePath}/balance`,
      data
    );
  }

  /**
   * Deactivate a gift card
   * @param data Gift card deactivation data
   * @returns Promise resolving to the deactivation result
   */
  async deactivate(
    data: GiftCardDeactivateRequest
  ): Promise<GiftCardDeactivateResponse> {
    return this.client.post<GiftCardDeactivateResponse>(
      `${this.basePath}/deactivate`,
      data
    );
  }

  /**
   * Load funds onto a gift card
   * @param data Gift card load data
   * @returns Promise resolving to the load result
   */
  async load(data: GiftCardLoadRequest): Promise<GiftCardLoadResponse> {
    return this.client.post<GiftCardLoadResponse>(
      `${this.basePath}/load`,
      data
    );
  }

  /**
   * Process a sale using a gift card
   * @param data Gift card sale data
   * @returns Promise resolving to the sale result
   */
  async processSale(data: GiftCardSaleRequest): Promise<GiftCardSaleResponse> {
    return this.client.post<GiftCardSaleResponse>(
      `${this.basePath}/sale`,
      data
    );
  }

  /**
   * Process a refund to a gift card
   * @param data Gift card refund data
   * @returns Promise resolving to the refund result
   */
  async processRefund(
    data: GiftCardRefundRequest
  ): Promise<GiftCardRefundResponse> {
    return this.client.post<GiftCardRefundResponse>(
      `${this.basePath}/refund`,
      data
    );
  }
}
