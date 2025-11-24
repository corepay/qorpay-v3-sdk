/**
 * @file src/resources/payment-forms.ts
 * @description Resource module for payment form/link-related operations
 */

import type { BaseClient } from '../client/base-client';
import type { QueryParams, FormId, RequestId, Maybe } from '../types/common';

/**
 * Payment form/link object structure
 */
export interface PaymentForm {
  id: FormId;
  name: string;
  description?: Maybe<string>;
  status: string;
  url: string;
  amount?: Maybe<string>;
  currency?: Maybe<string>;
  expiration?: Maybe<string>;
  created_at: string;
  updated_at: string;
  metadata?: Maybe<Record<string, unknown>>;
}

/**
 * Payment form request object
 */
export interface PaymentRequest {
  id: RequestId;
  form_id: FormId;
  status: string;
  amount: string;
  currency: string;
  customer?: {
    email?: Maybe<string>;
    name?: Maybe<string>;
    phone?: Maybe<string>;
  };
  expiration?: Maybe<string>;
  created_at: string;
  updated_at: string;
  completed_at?: Maybe<string>;
  transaction_id?: Maybe<string>;
  metadata?: Maybe<Record<string, unknown>>;
}

/**
 * Query parameters for listing payment forms
 */
export interface ListFormsQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  status?: string;
  created_start?: string;
  created_end?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Query parameters for listing payment requests
 */
export interface ListRequestsQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  status?: string;
  created_start?: string;
  created_end?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing payment forms
 */
export interface ListFormsResponsePayload {
  status: string;
  code: string;
  message: string;
  data: {
    forms: PaymentForm[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Response payload for getting a payment form
 */
export interface GetFormResponsePayload {
  status: string;
  code: string;
  message: string;
  data: PaymentForm;
}

/**
 * Response payload for listing payment requests
 */
export interface ListRequestsResponsePayload {
  status: string;
  code: string;
  message: string;
  data: {
    requests: PaymentRequest[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Response payload for getting a payment request
 */
export interface GetRequestResponsePayload {
  status: string;
  code: string;
  message: string;
  data: PaymentRequest;
}

/**
 * Request payload for creating a payment form
 */
export interface CreateFormRequestPayload {
  name: string;
  description?: string;
  amount?: string;
  currency?: string;
  expiration?: string; // ISO date string
  metadata?: Record<string, unknown>;
}

/**
 * Request payload for updating a payment form
 */
export interface UpdateFormRequestPayload {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  amount?: string;
  currency?: string;
  expiration?: string; // ISO date string
  metadata?: Record<string, unknown>;
}

/**
 * PaymentForms resource class for payment form/link-related operations
 */
export class PaymentForms {
  private client: BaseClient;
  private basePath = '/payment-forms';
  private requestsPath = '/payment-requests';

  /**
   * Creates a new PaymentForms resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a new payment form/link
   * @param data Payment form data
   * @returns Promise resolving to the created payment form
   */
  async createForm(
    data: CreateFormRequestPayload
  ): Promise<GetFormResponsePayload> {
    return this.client.post<GetFormResponsePayload>(this.basePath, data);
  }

  /**
   * Get a specific payment form by ID
   * @param formId Form ID
   * @returns Promise resolving to the payment form
   */
  async getForm(formId: FormId): Promise<GetFormResponsePayload> {
    return this.client.get<GetFormResponsePayload>(
      `${this.basePath}/${formId}`
    );
  }

  /**
   * Update an existing payment form
   * @param formId Form ID
   * @param data Payment form data to update
   * @returns Promise resolving to the updated payment form
   */
  async updateForm(
    formId: FormId,
    data: UpdateFormRequestPayload
  ): Promise<GetFormResponsePayload> {
    return this.client.put<GetFormResponsePayload>(
      `${this.basePath}/${formId}`,
      data
    );
  }

  /**
   * List payment forms with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of payment forms
   */
  async listForms(
    params?: ListFormsQueryParams
  ): Promise<ListFormsResponsePayload> {
    return this.client.get<ListFormsResponsePayload>(this.basePath, params);
  }

  /**
   * Delete a payment form
   * @param formId Form ID
   * @returns Promise resolving to the deletion confirmation
   */
  async deleteForm(
    formId: FormId
  ): Promise<{ status: string; code: string; message: string }> {
    return this.client.delete<{
      status: string;
      code: string;
      message: string;
    }>(`${this.basePath}/${formId}`);
  }

  /**
   * Get a specific payment request by ID
   * @param requestId Request ID
   * @returns Promise resolving to the payment request
   */
  async getRequest(requestId: RequestId): Promise<GetRequestResponsePayload> {
    return this.client.get<GetRequestResponsePayload>(
      `${this.requestsPath}/${requestId}`
    );
  }

  /**
   * List payment requests with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of payment requests
   */
  async listRequests(
    params?: ListRequestsQueryParams
  ): Promise<ListRequestsResponsePayload> {
    return this.client.get<ListRequestsResponsePayload>(
      this.requestsPath,
      params
    );
  }

  /**
   * List payment requests for a specific form
   * @param formId Form ID
   * @param params Query parameters
   * @returns Promise resolving to the list of payment requests for the form
   */
  async listRequestsByForm(
    formId: FormId,
    params?: ListRequestsQueryParams
  ): Promise<ListRequestsResponsePayload> {
    return this.client.get<ListRequestsResponsePayload>(
      `${this.basePath}/${formId}/requests`,
      params
    );
  }
}
