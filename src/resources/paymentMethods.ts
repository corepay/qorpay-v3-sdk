// src/resources/paymentMethods.ts
import type { BaseClient } from '../client/base-client';
import type {
  PaymentMethod,
  PaymentMethodListResponse,
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
  ListExpiringPaymentMethodsParams,
} from '../types/paymentMethods';
import type { BaseQorPayResponse } from '../types/common';

// Response types for API calls
interface PaymentMethodAPIResponse extends BaseQorPayResponse {
  id: string;
  type: 'card' | 'ach';
  customer_id: string;
  created_at: string;
  updated_at?: string;
  card_brand?: string;
  card_last4?: string;
  exp_month?: string;
  exp_year?: string;
  ach_account_type?: 'checking' | 'savings';
  ach_account_last4?: string;
  ach_routing_number?: string;
  ach_bank_name?: string;
  metadata?: Record<string, unknown>;
}

interface PaymentMethodListAPIResponse extends BaseQorPayResponse {
  data?: {
    methods?: PaymentMethodAPIResponse[];
    total?: number;
    has_more?: boolean;
  };
}
import {
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
  ListExpiringPaymentMethodsSchema,
} from '../schemas/paymentMethods';

/**
 * PaymentMethods resource – handles tokenized cards and ACH accounts.
 * Provides a clean, REST‑compliant interface that abstracts QorPay's
 * inconsistent endpoint signatures.
 */
export class PaymentMethods {
  private client: BaseClient;

  constructor(client: BaseClient) {
    this.client = client;
  }

  /** Create a new payment method (card or ACH) */
  async create(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    const validated = CreatePaymentMethodSchema.parse(data);
    const payload = this.toQorPayCreate(validated);
    const resp = await this.client.post<PaymentMethodAPIResponse>(
      '/payment/methods',
      payload
    );
    return this.fromQorPay(resp);
  }

  /** Retrieve a payment method by its ID */
  async get(id: string): Promise<PaymentMethod> {
    const resp = await this.client.get<PaymentMethodAPIResponse>(
      `/payment/methods/${id}`
    );
    return this.fromQorPay(resp);
  }

  /** List all payment methods for a given customer */
  async list(
    customerId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<PaymentMethodListResponse> {
    const resp = await this.client.get<PaymentMethodListAPIResponse>(
      `/payment/methods/${customerId}`,
      params
    );
    return {
      status: resp.status,
      code: resp.code,
      message: resp.message,
      reference_id: resp.reference_id,
      data: (resp.data?.methods ?? []).map((method) => this.fromQorPay(method)),
      pagination: {
        limit: typeof params?.limit === 'number' ? params.limit : 50,
        offset: typeof params?.offset === 'number' ? params.offset : 0,
        total: typeof resp.data?.total === 'number' ? resp.data.total : 0,
        hasMore: resp.data?.has_more === true,
      },
    };
  }

  /** Update mutable fields of a payment method */
  async update(data: UpdatePaymentMethodRequest): Promise<PaymentMethod> {
    const validated = UpdatePaymentMethodSchema.parse(data);
    const payload = this.toQorPayUpdate(validated);
    const resp = await this.client.patch<PaymentMethodAPIResponse>(
      `/payment/methods/${validated.id}`,
      payload
    );
    return this.fromQorPay(resp);
  }

  /** Delete a payment method */
  async delete(id: string): Promise<void> {
    await this.client.delete<BaseQorPayResponse>(`/payment/methods/${id}`);
  }

  /** List expiring payment methods */
  async listExpiring(
    params?: ListExpiringPaymentMethodsParams
  ): Promise<PaymentMethodListResponse> {
    if (params) {
      ListExpiringPaymentMethodsSchema.parse(params);
    }
    const resp = await this.client.get<PaymentMethodListAPIResponse>(
      '/payment/methods/expiring',
      params
    );
    return {
      status: resp.status,
      code: resp.code,
      message: resp.message,
      reference_id: resp.reference_id,
      data: (resp.data?.methods ?? []).map((method) => this.fromQorPay(method)),
      pagination: {
        limit: typeof params?.limit === 'number' ? params.limit : 50,
        offset: typeof params?.offset === 'number' ? params.offset : 0,
        total: typeof resp.data?.total === 'number' ? resp.data.total : 0,
        hasMore: resp.data?.has_more === true,
      },
    };
  }

  // -----------------------------------------------------------------
  // Private transformation helpers
  // -----------------------------------------------------------------

  /** Convert clean SDK request → QorPay payload */
  private toQorPayCreate(
    req: CreatePaymentMethodRequest
  ): Record<string, unknown> {
    const base: Record<string, unknown> = {
      customer_id: req.customerId,
      type: req.type,
    };

    if (req.type === 'card' && req.card) {
      return {
        ...base,
        card_number: req.card.number,
        exp_month: req.card.expiryMonth,
        exp_year: req.card.expiryYear,
        cvv: req.card.cvv,
        name: req.card.name,
      };
    }

    if (req.type === 'ach' && req.ach) {
      return {
        ...base,
        ach_account_number: req.ach.accountNumber,
        ach_routing_number: req.ach.routingNumber,
        ach_account_type: req.ach.accountType,
        name: req.ach.name,
      };
    }

    return base;
  }

  /** Convert clean SDK update → QorPay payload */
  private toQorPayUpdate(
    req: UpdatePaymentMethodRequest
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = { id: req.id };

    if (req.card) {
      if (req.card.expiryMonth) {
        payload.exp_month = req.card.expiryMonth;
      }
      if (req.card.expiryYear) {
        payload.exp_year = req.card.expiryYear;
      }
      if (req.card.name) {
        payload.name = req.card.name;
      }
    }

    if (req.ach?.name) {
      payload.name = req.ach.name;
    }

    if (req.metadata) {
      payload.metadata = req.metadata;
    }

    return payload;
  }

  /** Convert QorPay response → clean SDK model */
  private fromQorPay(q: PaymentMethodAPIResponse): PaymentMethod {
    const pm: PaymentMethod = {
      id: q.id,
      type: q.type,
      customerId: q.customer_id,
      createdAt: new Date(q.created_at),
      updatedAt: q.updated_at ? new Date(q.updated_at) : undefined,
    };

    if (q.type === 'card') {
      pm.card = {
        brand: q.card_brand || '',
        last4: q.card_last4 || '',
        expiryMonth: q.exp_month || '',
        expiryYear: q.exp_year || '',
      };
    }

    if (q.type === 'ach') {
      pm.ach = {
        accountType: q.ach_account_type || 'checking',
        last4: q.ach_account_last4 || '',
        routingNumber: q.ach_routing_number || '',
        bankName: q.ach_bank_name,
      };
    }

    if (q.metadata) {
      pm.metadata = q.metadata;
    }

    return pm;
  }
}
