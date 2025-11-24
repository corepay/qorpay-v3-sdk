// Payment Methods Types

import type { BaseQorPayResponse, QueryParams } from './common';

/**
 * Clean representation of a stored payment method (tokenized card/ACH)
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'ach';
  customerId: string;
  createdAt: Date;
  updatedAt?: Date;
  // Card specific fields
  card?: {
    brand: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
  };
  // ACH specific fields
  ach?: {
    accountType: 'checking' | 'savings';
    last4: string;
    routingNumber: string;
    bankName?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface PaymentMethodResponse extends BaseQorPayResponse {
  data: PaymentMethod;
}

export interface PaymentMethodListResponse extends BaseQorPayResponse {
  data: PaymentMethod[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Request payloads for creating/updating payment methods
 */
export interface CreatePaymentMethodRequest {
  customerId: string;
  type: 'card' | 'ach';
  // Card payload
  card?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv?: string;
    name?: string;
  };
  // ACH payload
  ach?: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    name?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentMethodRequest {
  id: string;
  // Only mutable fields
  metadata?: Record<string, unknown>;
  // For card expiry updates etc.
  card?: {
    expiryMonth?: string;
    expiryYear?: string;
    name?: string;
  };
  ach?: {
    name?: string;
  };
}

export interface ListExpiringPaymentMethodsParams extends QueryParams {
  /** Number of months ahead to consider as expiring */
  withinMonths?: number;
}
