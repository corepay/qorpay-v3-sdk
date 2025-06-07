/**
 * @file src/resources/plans.ts
 * @description Resource module for subscription plan-related operations
 */

import { BaseClient } from '../client/base-client';
import {
  BaseQorPayResponse,
  QueryParams,
  PlanId,
  CustomerId
} from '../types/common';

/**
 * Plan object structure
 */
export interface Plan {
  id: PlanId;
  name: string;
  description?: string;
  amount: string;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days?: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

/**
 * Query parameters for listing plans
 */
export interface ListPlansQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  status?: 'active' | 'inactive';
  created_start?: string;
  created_end?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing plans
 */
export interface ListPlansResponsePayload extends BaseQorPayResponse {
  data: {
    plans: Plan[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Response payload for getting a plan
 */
export interface GetPlanResponsePayload extends BaseQorPayResponse {
  data: Plan;
}

/**
 * Request payload for creating or updating a plan
 */
export interface PlanRequestPayload {
  name: string;
  description?: string;
  amount: string;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days?: number;
  metadata?: Record<string, any>;
}

/**
 * Plans resource class for subscription plan-related operations
 */
export class Plans {
  private client: BaseClient;

  /**
   * Creates a new Plans resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a new subscription plan
   * @param data Plan data
   * @returns Promise resolving to the created plan
   */
  async createPlan(data: PlanRequestPayload): Promise<GetPlanResponsePayload> {
    return this.client.post<GetPlanResponsePayload>('/plans', data);
  }

  /**
   * Get a specific plan by ID
   * @param planId Plan ID
   * @returns Promise resolving to the plan
   */
  async getPlan(planId: PlanId): Promise<GetPlanResponsePayload> {
    return this.client.get<GetPlanResponsePayload>(`/plans/${planId}`);
  }

  /**
   * Update an existing plan
   * @param planId Plan ID
   * @param data Plan data to update
   * @returns Promise resolving to the updated plan
   */
  async updatePlan(
    planId: PlanId,
    data: Partial<PlanRequestPayload>
  ): Promise<GetPlanResponsePayload> {
    return this.client.put<GetPlanResponsePayload>(`/plans/${planId}`, data);
  }

  /**
   * List plans with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of plans
   */
  async listPlans(params?: ListPlansQueryParams): Promise<ListPlansResponsePayload> {
    return this.client.get<ListPlansResponsePayload>('/plans', params);
  }

  /**
   * Delete a plan
   * @param planId Plan ID
   * @returns Promise resolving to the deletion confirmation
   */
  async deletePlan(planId: PlanId): Promise<{ status: string; code: string; message: string }> {
    return this.client.delete<{ status: string; code: string; message: string }>(`/plans/${planId}`);
  }

  /**
   * Subscribe a customer to a plan
   * @param planId Plan ID
   * @param customerId Customer ID
   * @param data Subscription data
   * @returns Promise resolving to the subscription
   */
  async subscribeToPlan(
    planId: PlanId,
    customerId: CustomerId,
    data: {
      payment_method: 'card' | 'ach';
      payment_token: string;
      start_date?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<BaseQorPayResponse & { data: { subscription_id: string } }> {
    return this.client.post<BaseQorPayResponse & { data: { subscription_id: string } }>(
      `/plans/${planId}/subscriptions`,
      {
        customer_id: customerId,
        ...data
      }
    );
  }

  /**
   * Cancel a subscription
   * @param subscriptionId Subscription ID
   * @returns Promise resolving to the cancellation confirmation
   */
  async cancelSubscription(
    subscriptionId: string
  ): Promise<{ status: string; code: string; message: string }> {
    return this.client.delete<{ status: string; code: string; message: string }>(
      `/subscriptions/${subscriptionId}`
    );
  }
}
