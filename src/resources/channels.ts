/**
 * @file src/resources/channels.ts
 * @description Resource module for channel/marketplace-related operations
 */

import { BaseClient } from '../client/base-client';
import {
  BaseQorPayResponse,
  QueryParams,
  Mid,
  CustomerId,
  BatchId,
} from '../types/common';

/**
 * Channel merchant object structure
 */
export interface ChannelMerchant {
  mid: Mid;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

/**
 * Channel merchant bank account object
 */
export interface ChannelMerchantBank {
  id: string;
  mid: Mid;
  account_type: string;
  account_last_four: string;
  routing_number_last_four: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Channel merchant owner object
 */
export interface ChannelMerchantOwner {
  id: string;
  mid: Mid;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  title?: string;
  ownership_percentage?: number;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  dob?: string; // ISO date string
  ssn_last_four?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Channel merchant create/update request
 */
export interface ChannelMerchantRequest {
  name: string;
  email?: string;
  phone?: string;
  business_type?: 'individual' | 'company' | 'non_profit' | 'government';
  tax_id?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  owners?: Array<{
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    title?: string;
    ownership_percentage?: number;
    address?: {
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
    dob?: string; // ISO date string
    ssn_last_four?: string;
  }>;
  bank_accounts?: Array<{
    account_number: string;
    routing_number: string;
    account_type: 'checking' | 'savings';
    account_holder_name: string;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Response payload for creating/getting a channel merchant
 */
export interface ChannelMerchantResponse extends BaseQorPayResponse {
  data: {
    merchant: ChannelMerchant;
    owners?: ChannelMerchantOwner[];
    bank_accounts?: ChannelMerchantBank[];
  };
}

/**
 * Query parameters for listing merchants
 */
export interface ListMyMerchantsQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  status?: string;
  created_start?: string;
  created_end?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing merchants
 */
export interface ListMyMerchantsResponsePayload extends BaseQorPayResponse {
  data: {
    merchants: ChannelMerchant[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Channel deposit object
 */
export interface ChannelDeposit {
  id: string;
  mid: Mid;
  amount: string;
  currency: string;
  status: string;
  deposit_date: string;
  settlement_date?: string;
  batch_id?: BatchId;
  transaction_count?: number;
  metadata?: Record<string, any>;
}

/**
 * Query parameters for listing channel deposits
 */
export interface ListChannelDepositsQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  mid?: Mid;
  status?: string;
  deposit_date_start?: string;
  deposit_date_end?: string;
  settlement_date_start?: string;
  settlement_date_end?: string;
  batch_id?: BatchId;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing channel deposits
 */
export interface ListChannelDepositsResponsePayload extends BaseQorPayResponse {
  data: {
    deposits: ChannelDeposit[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Channel dispute object
 */
export interface ChannelDispute {
  id: string;
  mid: Mid;
  transaction_id: string;
  amount: string;
  currency: string;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  case_number?: string;
  metadata?: Record<string, any>;
}

/**
 * Query parameters for listing channel disputes
 */
export interface ListChannelDisputesQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  mid?: Mid;
  status?: string;
  created_start?: string;
  created_end?: string;
  due_date_start?: string;
  due_date_end?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing channel disputes
 */
export interface ListChannelDisputesResponsePayload {
  status: string;
  code: string;
  message: string;
  data: {
    disputes: ChannelDispute[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Channel transaction object
 */
export interface ChannelTransaction {
  id: string;
  mid: Mid;
  amount: string;
  currency: string;
  status: string;
  type: string;
  payment_method: string;
  created_at: string;
  updated_at?: string;
  customer_id?: CustomerId;
  reference_id?: string;
  order_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Query parameters for listing channel transactions
 */
export interface ListChannelTransactionsQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  mid?: Mid;
  status?: string;
  type?: string;
  created_start?: string;
  created_end?: string;
  amount_min?: string | number;
  amount_max?: string | number;
  currency?: string;
  customer_id?: CustomerId;
  reference_id?: string;
  order_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing channel transactions
 */
export interface ListChannelTransactionsResponsePayload
  extends BaseQorPayResponse {
  data: {
    transactions: ChannelTransaction[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Channels resource class for channel/marketplace-related operations
 */
export class Channels {
  private client: BaseClient;
  private basePath = '/channel';
  private merchantsPath = '/channel/merchants';

  /**
   * Creates a new Channels resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a new merchant under your channel
   * @param data Merchant data
   * @returns Promise resolving to the created merchant
   */
  async createMerchant(
    data: ChannelMerchantRequest
  ): Promise<ChannelMerchantResponse> {
    return this.client.post<ChannelMerchantResponse>(this.merchantsPath, data);
  }

  /**
   * Get a specific merchant by ID
   * @param mid Merchant ID
   * @returns Promise resolving to the merchant details
   */
  async getMerchant(mid: Mid): Promise<ChannelMerchantResponse> {
    return this.client.get<ChannelMerchantResponse>(
      `${this.merchantsPath}/${mid}`
    );
  }

  /**
   * Update an existing merchant
   * @param mid Merchant ID
   * @param data Merchant data to update
   * @returns Promise resolving to the updated merchant
   */
  async updateMerchant(
    mid: Mid,
    data: Partial<ChannelMerchantRequest>
  ): Promise<ChannelMerchantResponse> {
    return this.client.put<ChannelMerchantResponse>(
      `${this.merchantsPath}/${mid}`,
      data
    );
  }

  /**
   * List merchants under your channel with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of merchants
   */
  async listMyMerchants(
    params?: ListMyMerchantsQueryParams
  ): Promise<ListMyMerchantsResponsePayload> {
    return this.client.get<ListMyMerchantsResponsePayload>(
      this.merchantsPath,
      params
    );
  }

  /**
   * Add a bank account to a merchant
   * @param mid Merchant ID
   * @param data Bank account data
   * @returns Promise resolving to the updated merchant with bank account
   */
  async addMerchantBankAccount(
    mid: Mid,
    data: {
      account_number: string;
      routing_number: string;
      account_type: 'checking' | 'savings';
      account_holder_name: string;
    }
  ): Promise<ChannelMerchantResponse> {
    return this.client.post<ChannelMerchantResponse>(
      `${this.merchantsPath}/${mid}/bank-accounts`,
      data
    );
  }

  /**
   * Add an owner to a merchant
   * @param mid Merchant ID
   * @param data Owner data
   * @returns Promise resolving to the updated merchant with owner
   */
  async addMerchantOwner(
    mid: Mid,
    data: {
      first_name: string;
      last_name: string;
      email?: string;
      phone?: string;
      title?: string;
      ownership_percentage?: number;
      address?: {
        address1?: string;
        address2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
      dob?: string; // ISO date string
      ssn_last_four?: string;
    }
  ): Promise<ChannelMerchantResponse> {
    return this.client.post<ChannelMerchantResponse>(
      `${this.merchantsPath}/${mid}/owners`,
      data
    );
  }

  /**
   * List deposits for a specific merchant
   * @param mid Merchant ID
   * @param params Query parameters
   * @returns Promise resolving to the list of deposits for the merchant
   */
  async listMerchantDeposits(
    mid: Mid,
    params?: ListChannelDepositsQueryParams
  ): Promise<ListChannelDepositsResponsePayload> {
    return this.client.get<ListChannelDepositsResponsePayload>(
      `${this.merchantsPath}/${mid}/deposits`,
      params
    );
  }

  /**
   * List all deposits across all merchants in your channel
   * @param params Query parameters
   * @returns Promise resolving to the list of deposits
   */
  async listChannelDeposits(
    params?: ListChannelDepositsQueryParams
  ): Promise<ListChannelDepositsResponsePayload> {
    return this.client.get<ListChannelDepositsResponsePayload>(
      `${this.basePath}/deposits`,
      params
    );
  }

  /**
   * List disputes for a specific merchant
   * @param mid Merchant ID
   * @param params Query parameters
   * @returns Promise resolving to the list of disputes for the merchant
   */
  async listMerchantDisputes(
    mid: Mid,
    params?: ListChannelDisputesQueryParams
  ): Promise<ListChannelDisputesResponsePayload> {
    return this.client.get<ListChannelDisputesResponsePayload>(
      `${this.merchantsPath}/${mid}/disputes`,
      params
    );
  }

  /**
   * List all disputes across all merchants in your channel
   * @param params Query parameters
   * @returns Promise resolving to the list of disputes
   */
  async listChannelDisputes(
    params?: ListChannelDisputesQueryParams
  ): Promise<ListChannelDisputesResponsePayload> {
    return this.client.get<ListChannelDisputesResponsePayload>(
      `${this.basePath}/disputes`,
      params
    );
  }

  /**
   * List transactions for a specific merchant
   * @param mid Merchant ID
   * @param params Query parameters
   * @returns Promise resolving to the list of transactions for the merchant
   */
  async listMerchantTransactions(
    mid: Mid,
    params?: ListChannelTransactionsQueryParams
  ): Promise<ListChannelTransactionsResponsePayload> {
    return this.client.get<ListChannelTransactionsResponsePayload>(
      `${this.merchantsPath}/${mid}/transactions`,
      params
    );
  }

  /**
   * List all transactions across all merchants in your channel
   * @param params Query parameters
   * @returns Promise resolving to the list of transactions
   */
  async listChannelTransactions(
    params?: ListChannelTransactionsQueryParams
  ): Promise<ListChannelTransactionsResponsePayload> {
    return this.client.get<ListChannelTransactionsResponsePayload>(
      `${this.basePath}/transactions`,
      params
    );
  }
}
