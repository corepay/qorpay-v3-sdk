/**
 * @file src/client/qorpay-client.ts
 * @description Main client for interacting with the QorPay API.
 */

import { BaseClient } from './base-client';
import { QorPayClientConfig, Environment } from '../types/common';

// Import all resource modules
import { Payments } from '../resources/payments';
import { AchPayments } from '../resources/ach-payments';
import { CashPayments } from '../resources/cash-payments';
import { GiftCards } from '../resources/gift-cards';
import { PaymentTokens } from '../resources/payment-tokens';
import { Transactions } from '../resources/transactions';
import { ProofOfDelivery } from '../resources/proof-of-delivery';
import { Customers } from '../resources/customers';
import { Plans } from '../resources/plans';
import { Disputes } from '../resources/disputes';
import { Deposits } from '../resources/deposits';
import { Webhooks } from '../resources/webhooks';
import { PaymentForms } from '../resources/payment-forms';
import { Channels } from '../resources/channels';
import { Utilities } from '../resources/utilities';

/**
 * Main client for interacting with the QorPay API.
 * Provides access to all resource modules for different API endpoints.
 */
export class QorPayClient {
  private baseClient: BaseClient;
  private baseUrl: string;
  private environment: Environment;

  // Resource modules
  public readonly payments: Payments;
  public readonly achPayments: AchPayments;
  public readonly cashPayments: CashPayments;
  public readonly giftCards: GiftCards;
  public readonly paymentTokens: PaymentTokens;
  public readonly transactions: Transactions;
  public readonly proofOfDelivery: ProofOfDelivery;
  public readonly customers: Customers;
  public readonly plans: Plans;
  public readonly disputes: Disputes;
  public readonly deposits: Deposits;
  public readonly webhooks: Webhooks;
  public readonly paymentForms: PaymentForms;
  public readonly channels: Channels;
  public readonly utilities: Utilities;

  /**
   * Creates a new QorPayClient instance.
   * 
   * @param config - Configuration options for the client
   */
  constructor(config: QorPayClientConfig) {
    this.baseClient = new BaseClient(config);
    this.baseUrl = config.baseURL || (config.environment === 'production' 
      ? 'https://api.qorcommerce.io/api/v3' 
      : 'https://sandbox-api.qorcommerce.io/api/v3');
    this.environment = config.environment || 'sandbox';

    // Initialize all resource modules with the base client
    this.payments = new Payments(this.baseClient);
    this.achPayments = new AchPayments(this.baseClient);
    this.cashPayments = new CashPayments(this.baseClient);
    this.giftCards = new GiftCards(this.baseClient);
    this.paymentTokens = new PaymentTokens(this.baseClient);
    this.transactions = new Transactions(this.baseClient);
    this.proofOfDelivery = new ProofOfDelivery(this.baseClient);
    this.customers = new Customers(this.baseClient);
    this.plans = new Plans(this.baseClient);
    this.disputes = new Disputes(this.baseClient);
    this.deposits = new Deposits(this.baseClient);
    this.webhooks = new Webhooks(this.baseClient);
    this.paymentForms = new PaymentForms(this.baseClient);
    this.channels = new Channels(this.baseClient);
    this.utilities = new Utilities(this.baseClient);
  }

  /**
   * Gets the base URL being used by the client.
   * 
   * @returns The base URL for API requests
   */
  public getBaseURL(): string {
    return this.baseUrl;
  }

  /**
   * Gets the environment (sandbox/production) being used by the client.
   * 
   * @returns The current environment
   */
  public getEnvironment(): string {
    return this.environment;
  }
}
