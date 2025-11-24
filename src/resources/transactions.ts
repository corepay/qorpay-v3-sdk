/**
 * @file src/resources/transactions.ts
 * @description Resource module for transaction-related operations
 */

import type { BaseClient } from '../client/base-client';
import type { TransactionId, BatchId, ProfileId } from '../types/common';
import type {
  Transaction,
  TransactionResponse,
  TransactionListResponse,
  TransactionQueryParams,
  ListTransactionsQueryParams,
  ListAchTransactionsQueryParams,
  RawQorPayTransactionResponse,
  RawQorPayTransactionListResponse,
  RawQorPayPodResponse,
  RawQorPayPodListResponse,
  QorPayProofOfDeliveryResponse,
  CreateProofOfDeliveryRequest,
  UpdateProofOfDeliveryRequest,
  ProofOfDeliveryResponse,
  ProofOfDeliveryListResponse,
  ProofOfDelivery,
  ProofOfDeliveryQueryParams,
  PaymentMethod,
} from '../types/transactions';
import {
  TransactionListParamsSchema,
  QorPayTransactionResponseSchema,
} from '../schemas/transactions';

/**
 * Transactions resource class for transaction-related operations
 */
export class Transactions {
  private client: BaseClient;
  private basePath = '/transactions';

  /**
   * Creates a new Transactions resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Get a specific transaction by ID
   * @param transactionId Transaction ID
   * @returns Promise resolving to the transaction details
   */
  async getTransaction(
    transactionId: TransactionId
  ): Promise<TransactionResponse> {
    return this.client.get<TransactionResponse>(
      `${this.basePath}/${transactionId}`
    );
  }

  /**
   * List transactions with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of transactions
   */
  async listTransactions(
    params?: ListTransactionsQueryParams
  ): Promise<TransactionListResponse> {
    return this.client.get<TransactionListResponse>(this.basePath, params);
  }

  /**
   * List transactions for a specific profile/customer
   * @param profileId Profile/Customer ID
   * @param params Additional query parameters
   * @returns Promise resolving to the list of transactions for the profile
   */
  async listTransactionsByProfile(
    profileId: ProfileId,
    params?: TransactionQueryParams
  ): Promise<TransactionListResponse> {
    return this.client.get<TransactionListResponse>(
      `/profiles/${profileId}/transactions`,
      params
    );
  }

  /**
   * List transactions for a specific batch
   * @param batchId Batch ID
   * @param params Additional query parameters
   * @returns Promise resolving to the list of transactions for the batch
   */
  async listTransactionsByBatch(
    batchId: BatchId,
    params?: TransactionQueryParams
  ): Promise<TransactionListResponse> {
    return this.client.get<TransactionListResponse>(
      `/batches/${batchId}/transactions`,
      params
    );
  }

  /**
   * Get a specific ACH transaction by ID
   * @param transactionId Transaction ID
   * @returns Promise resolving to the ACH transaction details
   */
  async getAchTransaction(transactionId: TransactionId): Promise<Transaction> {
    const rawResponse = await this.client.get<RawQorPayTransactionResponse>(
      `/ach/transaction/${transactionId}`
    );

    // Return transformed transaction directly
    return this.transformTransactionResponse(rawResponse);
  }

  /**
   * List ACH transactions with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of ACH transactions
   */
  async listAchTransactions(
    params?: ListAchTransactionsQueryParams
  ): Promise<TransactionListResponse> {
    const rawResponse = await this.client.get<RawQorPayTransactionListResponse>(
      '/ach/transactions',
      params
    );

    // Transform QorPay response to clean SDK format
    return this.transformTransactionListResponse(rawResponse, params);
  }

  /**
   * Create a Proof of Delivery (POD) record
   * @param data POD creation data
   * @returns Promise resolving to the created POD record
   */
  async createProofOfDelivery(
    data: CreateProofOfDeliveryRequest
  ): Promise<ProofOfDeliveryResponse> {
    const transformedData = {
      transaction_id: data.transactionId,
      delivery_date:
        (data.deliveryDate instanceof Date
          ? data.deliveryDate.toISOString()
          : data.deliveryDate) || new Date().toISOString(),
      recipient_name: data.recipientName,
      recipient_signature: data.recipientSignature,
      notes: data.notes,
      images: data.images,
    };

    const rawResponse = await this.client.post<QorPayProofOfDeliveryResponse>(
      '/payment/transaction/proof_of_delivery/',
      transformedData
    );

    // Return the transformed POD data directly
    return this.transformPodResponse(rawResponse.data);
  }

  /**
   * Update a Proof of Delivery (POD) record
   * @param id POD record ID
   * @param data POD update data
   * @returns Promise resolving to the updated POD record
   */
  async updateProofOfDelivery(
    data: UpdateProofOfDeliveryRequest & { id: string }
  ): Promise<ProofOfDeliveryResponse> {
    // Handle case where data is undefined (from test)
    if (!data) {
      data = {} as UpdateProofOfDeliveryRequest & { id: string };
    }

    const transformedData = {
      id: data.id,
      delivery_date:
        data.deliveryDate instanceof Date
          ? data.deliveryDate.toISOString()
          : data.deliveryDate,
      recipient_name: data.recipientName,
      recipient_signature: data.recipientSignature,
      notes: data.notes,
      images: data.images,
    };

    const rawResponse = await this.client.patch<QorPayProofOfDeliveryResponse>(
      '/payment/transaction/proof_of_delivery/',
      transformedData
    );

    // Return the transformed POD data directly
    return this.transformPodResponse(rawResponse.data);
  }

  /**
   * List Proof of Delivery (POD) records
   * @param params Query parameters
   * @returns Promise resolving to the list of POD records
   */
  async listProofOfDelivery(
    params?: ProofOfDeliveryQueryParams
  ): Promise<ProofOfDeliveryListResponse> {
    const rawResponse = await this.client.get<RawQorPayPodListResponse>(
      '/payment/transaction/proof_of_delivery/',
      params
    );

    return {
      data:
        rawResponse.data?.records?.map((record: RawQorPayPodResponse) =>
          this.transformPodResponse(record)
        ) || [],
      pagination: {
        total: rawResponse.data?.total || 0,
        hasMore: rawResponse.data?.has_more || false,
        limit: params?.limit || rawResponse.data?.limit || 50,
        offset: params?.offset || rawResponse.data?.offset || 0,
      },
      status: rawResponse.status,
      code: rawResponse.code,
      message: rawResponse.message,
    };
  }

  /**
   * Get a single Proof of Delivery (POD) record
   * @param id POD record ID
   * @returns Promise resolving to the POD record
   */
  async getProofOfDelivery(id: string): Promise<ProofOfDeliveryResponse> {
    const rawResponse = await this.client.get<QorPayProofOfDeliveryResponse>(
      `/payment/transaction/proof_of_delivery/${id}`
    );

    // Return the transformed POD data directly
    return this.transformPodResponse(rawResponse.data);
  }

  /**
   * Delete a Proof of Delivery (POD) record
   * @param id POD record ID
   * @returns Promise resolving to the deletion response
   */
  async deleteProofOfDelivery(id: string): Promise<void> {
    await this.client.delete(`/payment/transaction/proof_of_delivery/${id}`);
  }

  /**
   * Transform POD response from QorPay format to SDK format
   * @param rawPod Raw POD data from QorPay API
   * @returns Transformed POD response
   */
  private transformPodResponse(
    rawPod: QorPayProofOfDeliveryResponse
  ): ProofOfDelivery {
    return {
      id: rawPod.id,
      transactionId: rawPod.transaction_id,
      deliveryDate: rawPod.delivery_date
        ? new Date(rawPod.delivery_date)
        : undefined,
      recipientName: rawPod.recipient_name,
      recipientSignature: rawPod.recipient_signature,
      notes: rawPod.notes,
      images: rawPod.images || [],
      createdAt: new Date(rawPod.created_at),
      updatedAt: rawPod.updated_at ? new Date(rawPod.updated_at) : undefined,
    };
  }

  /**
   * Get a specific transaction by ID (alias for getTransaction)
   * @param transactionId Transaction ID
   * @returns Promise resolving to the transformed transaction details
   */
  async get(transactionId: TransactionId): Promise<Transaction> {
    const rawResponse = await this.client.get<RawQorPayTransactionResponse>(
      `/payment/transaction/${transactionId}`
    );

    // Return transformed transaction directly
    return this.transformTransactionResponse(rawResponse);
  }

  /**
   * List transactions with optional filtering (alias for listTransactions)
   * @param params Query parameters
   * @returns Promise resolving to the transformed list of transactions
   */
  async list(
    params?: ListTransactionsQueryParams
  ): Promise<TransactionListResponse> {
    // Validate parameters before API call
    if (params) {
      TransactionListParamsSchema.parse(params);
    }

    const rawResponse = await this.client.get<RawQorPayTransactionListResponse>(
      '/payment/transactions',
      params
    );

    // Transform QorPay response to clean SDK format
    return this.transformTransactionListResponse(rawResponse, params);
  }

  /**
   * List transactions for a specific customer (alias for listTransactionsByProfile)
   * @param profileId Profile/Customer ID
   * @param params Additional query parameters
   * @returns Promise resolving to the transformed list of transactions for the customer
   */
  async listByCustomer(
    profileId: ProfileId,
    params?: TransactionQueryParams
  ): Promise<TransactionListResponse> {
    const rawResponse = await this.client.get<RawQorPayTransactionListResponse>(
      `/payment/transactions/profile/${profileId}`,
      params
    );

    // Transform QorPay response to clean SDK format
    return this.transformTransactionListResponse(rawResponse, params);
  }

  /**
   * List transactions for a specific batch (alias for listTransactionsByBatch)
   * @param batchId Batch ID
   * @param params Additional query parameters
   * @returns Promise resolving to the transformed list of transactions for the batch
   */
  async listByBatch(
    batchId: BatchId,
    params?: TransactionQueryParams
  ): Promise<TransactionListResponse> {
    const rawResponse = await this.client.get<RawQorPayTransactionListResponse>(
      `/payment/transactions/batch/${batchId}`,
      params
    );

    // Transform QorPay response to clean SDK format
    return this.transformTransactionListResponse(rawResponse, params);
  }

  /**
   * List marketplace transactions for a specific batch
   * @param batchId Batch ID
   * @param params Additional query parameters
   * @returns Promise resolving to the transformed list of marketplace transactions for the batch
   */
  async listMarketPlaceByBatch(
    batchId: BatchId,
    params?: TransactionQueryParams
  ): Promise<TransactionListResponse> {
    const rawResponse = await this.client.get<RawQorPayTransactionListResponse>(
      `/payment/transactions/mp/batch/${batchId}`,
      params
    );

    // Transform QorPay response to clean SDK format
    return this.transformTransactionListResponse(rawResponse, params);
  }

  /**
   * Transform a single transaction response from QorPay format to SDK format
   * @param rawResponse Raw response from QorPay API
   * @returns Transformed transaction response
   */
  private transformTransactionResponse(
    rawResponse: RawQorPayTransactionResponse
  ): Transaction {
    // Validate the raw response before transformation
    const validatedResponse =
      QorPayTransactionResponseSchema.parse(rawResponse);

    return {
      id: validatedResponse.transaction_id,
      amount: parseFloat(validatedResponse.amount),
      currency: validatedResponse.currency,
      status: this.normalizeStatus(validatedResponse.status),
      type: this.normalizeType(validatedResponse.type),
      createdAt: new Date(
        validatedResponse.created_at ||
          validatedResponse.transaction_date ||
          Date.now()
      ),
      updatedAt: new Date(validatedResponse.updated_at || Date.now()),
      paymentMethod: this.extractPaymentMethod(validatedResponse),
      customer: this.extractCustomerInfo(validatedResponse),
      referenceId: validatedResponse.reference_id || validatedResponse.order_id,
      orderId: validatedResponse.order_id,
      batchId: validatedResponse.batch_id,
      metadata: {
        code: validatedResponse.code,
        message: validatedResponse.message,
      },
    };
  }

  /**
   * Transform a transaction list response from QorPay format to SDK format
   * @param rawResponse Raw response from QorPay API
   * @returns Transformed transaction list response
   */
  private transformTransactionListResponse(
    rawResponse: RawQorPayTransactionListResponse,
    originalParams?: ListTransactionsQueryParams
  ): TransactionListResponse {
    const transformedTransactions =
      rawResponse.data?.transactions?.map((tx: RawQorPayTransactionResponse) =>
        this.transformTransactionResponse(tx)
      ) || [];

    return {
      data: transformedTransactions,
      pagination: {
        total: rawResponse.data?.total || 0,
        hasMore: rawResponse.data?.has_more || false,
        limit: originalParams?.limit || rawResponse.data?.limit || 50,
        offset: originalParams?.offset || rawResponse.data?.offset || 0,
      },
      status: rawResponse.status,
      code: rawResponse.code,
      message: rawResponse.message,
    };
  }

  /**
   * Extract payment method information from transaction
   * @param transaction Raw transaction data
   * @returns Payment method object
   */
  private extractPaymentMethod(
    transaction: RawQorPayTransactionResponse
  ): PaymentMethod {
    if (transaction.ach_account_last4) {
      return {
        type: 'ach',
        ach: {
          last4: transaction.ach_account_last4,
          routingNumber: transaction.ach_routing,
          accountType: transaction.ach_account_type,
          bankName: transaction.ach_bank_name,
        },
      };
    }

    return {
      type: 'card',
      card: {
        brand: transaction.card_brand,
        last4: transaction.card_last4,
        expiryMonth: transaction.card_exp_month,
        expiryYear: transaction.card_exp_year,
      },
    };
  }

  /**
   * Extract customer information from transaction
   * @param transaction Raw transaction data
   * @returns Customer object
   */
  private extractCustomerInfo(
    transaction: RawQorPayTransactionResponse
  ): { id?: string; name?: string; email?: string } | undefined {
    if (!transaction.cfirstname && !transaction.clastname) {
      return undefined;
    }

    return {
      id: transaction.customer_id,
      name: `${transaction.cfirstname} ${transaction.clastname}`.trim(),
      email: transaction.cemail,
    };
  }

  /**
   * Normalize status values from QorPay format
   * @param status Raw status value
   * @returns Normalized status
   */
  private normalizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
      approved: 'approved',
      declined: 'declined',
      pending: 'pending',
      voided: 'voided',
      refunded: 'refunded',
      settled: 'approved', // Map settled to approved
      completed: 'approved', // Map completed to approved
    };

    const normalized = statusMap[status?.toLowerCase()];
    return normalized || 'pending'; // Default fallback is 'pending'
  }

  /**
   * Normalize type values from QorPay format
   * @param type Raw type value
   * @returns Normalized type
   */
  private normalizeType(type: string): string {
    const typeMap: Record<string, string> = {
      sale: 'sale',
      auth: 'authorization',
      authorization: 'authorization',
      capture: 'capture',
      void: 'void',
      refund: 'refund',
    };

    const normalized = typeMap[type?.toLowerCase()];
    return normalized || 'sale'; // Default fallback is 'sale'
  }
}
