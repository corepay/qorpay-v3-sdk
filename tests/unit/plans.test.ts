/**
 * @file tests/unit/plans.test.ts
 * @description Unit tests for Plans resource class
 */

import { Plans } from '../../src/resources/plans';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import type {
  Plan,
  PlanRequestPayload,
  ListPlansQueryParams,
  ListPlansResponsePayload,
  GetPlanResponsePayload,
} from '../../src/resources/plans';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('Plans', () => {
  let plans: Plans;
  let mockClient: jest.Mocked<BaseClient>;

  const mockPlan: Plan = {
    id: 'plan_123456',
    name: 'Premium Plan',
    description: 'Premium subscription plan',
    amount: '29.99',
    currency: 'USD',
    interval: 'month',
    interval_count: 1,
    trial_period_days: 14,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    metadata: { tier: 'premium' },
  };

  const mockPlanResponse: GetPlanResponsePayload = {
    status: 'success',
    code: '200',
    message: 'Plan retrieved successfully',
    reference_id: 'ref_123',
    data: mockPlan,
  };

  const mockPlansListResponse: ListPlansResponsePayload = {
    status: 'success',
    code: '200',
    message: 'Plans retrieved',
    reference_id: 'ref_123',
    data: {
      plans: [mockPlan],
      meta: {
        count: 1,
        limit: 10,
        offset: 0,
      },
    },
  };

  beforeEach(() => {
    mockClient = new BaseClient({ appKey: 'test', clientKey: 'test' }) as jest.Mocked<BaseClient>;
    plans = new Plans(mockClient);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with BaseClient instance', () => {
      expect(plans['client']).toBe(mockClient);
    });
  });

  describe('createPlan', () => {
    it('should create a plan successfully', async () => {
      const planData: PlanRequestPayload = {
        name: 'Premium Plan',
        description: 'Premium subscription plan',
        amount: '29.99',
        currency: 'USD',
        interval: 'month',
        interval_count: 1,
        trial_period_days: 14,
        metadata: { tier: 'premium' },
      };

      mockClient.post.mockResolvedValue(mockPlanResponse);

      const result = await plans.createPlan(planData);

      expect(mockClient.post).toHaveBeenCalledWith('/plans', planData);
      expect(result).toEqual(mockPlanResponse);
    });

    it('should create a plan with minimal data', async () => {
      const minimalData: PlanRequestPayload = {
        name: 'Basic Plan',
        amount: '9.99',
        currency: 'USD',
        interval: 'month',
        interval_count: 1,
      };

      mockClient.post.mockResolvedValue(mockPlanResponse);

      const result = await plans.createPlan(minimalData);

      expect(mockClient.post).toHaveBeenCalledWith('/plans', minimalData);
      expect(result).toEqual(mockPlanResponse);
    });

    it('should propagate API errors', async () => {
      const planData: PlanRequestPayload = {
        name: 'Premium Plan',
        amount: '29.99',
        currency: 'USD',
        interval: 'month',
        interval_count: 1,
      };

      const apiError = new QorPayApiError('Plan creation failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(plans.createPlan(planData)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const planData: PlanRequestPayload = {
        name: 'Premium Plan',
        amount: '29.99',
        currency: 'USD',
        interval: 'month',
        interval_count: 1,
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(plans.createPlan(planData)).rejects.toThrow(networkError);
    });
  });

  describe('getPlan', () => {
    it('should retrieve a plan successfully', async () => {
      const planId = 'plan_123456';

      mockClient.get.mockResolvedValue(mockPlanResponse);

      const result = await plans.getPlan(planId);

      expect(mockClient.get).toHaveBeenCalledWith('/plans/plan_123456');
      expect(result).toEqual(mockPlanResponse);
    });

    it('should propagate API errors', async () => {
      const planId = 'plan_invalid';

      const apiError = new QorPayApiError('Plan not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(plans.getPlan(planId)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const planId = 'plan_123456';

      const networkError = new Error('Network failure');
      mockClient.get.mockRejectedValue(networkError);

      await expect(plans.getPlan(planId)).rejects.toThrow(networkError);
    });

    it('should handle empty plan ID', async () => {
      const emptyPlanId = '';

      mockClient.get.mockResolvedValue(mockPlanResponse);

      const result = await plans.getPlan(emptyPlanId);

      expect(mockClient.get).toHaveBeenCalledWith('/plans/');
      expect(result).toEqual(mockPlanResponse);
    });
  });

  describe('updatePlan', () => {
    it('should update a plan successfully', async () => {
      const planId = 'plan_123456';
      const updateData: Partial<PlanRequestPayload> = {
        name: 'Updated Premium Plan',
        amount: '39.99',
        metadata: { tier: 'premium_plus' },
      };

      mockClient.put.mockResolvedValue(mockPlanResponse);

      const result = await plans.updatePlan(planId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/plans/plan_123456', updateData);
      expect(result).toEqual(mockPlanResponse);
    });

    it('should update plan with minimal data', async () => {
      const planId = 'plan_123456';
      const minimalData: Partial<PlanRequestPayload> = {
        description: 'Updated description',
      };

      mockClient.put.mockResolvedValue(mockPlanResponse);

      const result = await plans.updatePlan(planId, minimalData);

      expect(mockClient.put).toHaveBeenCalledWith('/plans/plan_123456', minimalData);
      expect(result).toEqual(mockPlanResponse);
    });

    it('should propagate API errors', async () => {
      const planId = 'plan_123456';
      const updateData: Partial<PlanRequestPayload> = {
        name: 'Updated Plan',
      };

      const apiError = new QorPayApiError('Plan update failed', 400);
      mockClient.put.mockRejectedValue(apiError);

      await expect(plans.updatePlan(planId, updateData)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const planId = 'plan_123456';
      const updateData: Partial<PlanRequestPayload> = {};

      const networkError = new Error('Network failure');
      mockClient.put.mockRejectedValue(networkError);

      await expect(plans.updatePlan(planId, updateData)).rejects.toThrow(networkError);
    });
  });

  describe('listPlans', () => {
    it('should list plans successfully', async () => {
      const params: ListPlansQueryParams = {
        limit: 10,
        offset: 0,
        status: 'active',
      };

      mockClient.get.mockResolvedValue(mockPlansListResponse);

      const result = await plans.listPlans(params);

      expect(mockClient.get).toHaveBeenCalledWith('/plans', params);
      expect(result).toEqual(mockPlansListResponse);
    });

    it('should list plans without parameters', async () => {
      mockClient.get.mockResolvedValue(mockPlansListResponse);

      const result = await plans.listPlans();

      expect(mockClient.get).toHaveBeenCalledWith('/plans', undefined);
      expect(result).toEqual(mockPlansListResponse);
    });

    it('should list plans with date filters', async () => {
      const params: ListPlansQueryParams = {
        created_start: '2024-01-01',
        created_end: '2024-12-31',
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      mockClient.get.mockResolvedValue(mockPlansListResponse);

      const result = await plans.listPlans(params);

      expect(mockClient.get).toHaveBeenCalledWith('/plans', params);
      expect(result).toEqual(mockPlansListResponse);
    });

    it('should propagate API errors', async () => {
      const params = { limit: 10 };

      const apiError = new QorPayApiError('Failed to list plans', 400);
      mockClient.get.mockRejectedValue(apiError);

      await expect(plans.listPlans(params)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const networkError = new Error('Network failure');
      mockClient.get.mockRejectedValue(networkError);

      await expect(plans.listPlans()).rejects.toThrow(networkError);
    });

    it('should handle empty list response', async () => {
      const emptyListResponse: ListPlansResponsePayload = {
        status: 'success',
        code: '200',
        message: 'No plans found',
        reference_id: 'ref_123',
        data: {
          plans: [],
          meta: {
            count: 0,
            limit: 10,
            offset: 0,
          },
        },
      };

      mockClient.get.mockResolvedValue(emptyListResponse);

      const result = await plans.listPlans({ status: 'inactive' });

      expect(result.data.plans).toHaveLength(0);
      expect(result.data.meta.count).toBe(0);
    });
  });

  describe('deletePlan', () => {
    it('should delete a plan successfully', async () => {
      const planId = 'plan_123456';
      const deleteResponse = {
        status: 'success',
        code: '200',
        message: 'Plan deleted successfully',
      };

      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await plans.deletePlan(planId);

      expect(mockClient.delete).toHaveBeenCalledWith('/plans/plan_123456');
      expect(result).toEqual(deleteResponse);
    });

    it('should propagate API errors', async () => {
      const planId = 'plan_123456';

      const apiError = new QorPayApiError('Plan not found', 404);
      mockClient.delete.mockRejectedValue(apiError);

      await expect(plans.deletePlan(planId)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const planId = 'plan_123456';

      const networkError = new Error('Network failure');
      mockClient.delete.mockRejectedValue(networkError);

      await expect(plans.deletePlan(planId)).rejects.toThrow(networkError);
    });

    it('should handle empty plan ID', async () => {
      const emptyPlanId = '';

      mockClient.delete.mockResolvedValue({
        status: 'success',
        code: '200',
        message: 'Plan deleted successfully',
      });

      const result = await plans.deletePlan(emptyPlanId);

      expect(mockClient.delete).toHaveBeenCalledWith('/plans/');
      expect(result.message).toBe('Plan deleted successfully');
    });
  });

  describe('subscribeToPlan', () => {
    it('should subscribe customer to plan successfully', async () => {
      const planId = 'plan_123456';
      const customerId = 'cust_123456';
      const subscriptionData = {
        payment_method: 'card' as const,
        payment_token: 'tok_123456',
        start_date: '2024-02-01',
        metadata: { source: 'web' },
      };

      const subscriptionResponse = {
        status: 'success',
        code: '200',
        message: 'Subscription created successfully',
        reference_id: 'ref_123',
        data: {
          subscription_id: 'sub_123456',
        },
      };

      mockClient.post.mockResolvedValue(subscriptionResponse);

      const result = await plans.subscribeToPlan(planId, customerId, subscriptionData);

      expect(mockClient.post).toHaveBeenCalledWith('/plans/plan_123456/subscriptions', {
        customer_id: customerId,
        ...subscriptionData,
      });
      expect(result).toEqual(subscriptionResponse);
    });

    it('should subscribe with minimal data', async () => {
      const planId = 'plan_123456';
      const customerId = 'cust_123456';
      const minimalData = {
        payment_method: 'ach' as const,
        payment_token: 'tok_123456',
      };

      const subscriptionResponse = {
        status: 'success',
        code: '200',
        message: 'Subscription created successfully',
        reference_id: 'ref_123',
        data: {
          subscription_id: 'sub_123456',
        },
      };

      mockClient.post.mockResolvedValue(subscriptionResponse);

      const result = await plans.subscribeToPlan(planId, customerId, minimalData);

      expect(mockClient.post).toHaveBeenCalledWith('/plans/plan_123456/subscriptions', {
        customer_id: customerId,
        ...minimalData,
      });
      expect(result).toEqual(subscriptionResponse);
    });

    it('should propagate API errors', async () => {
      const planId = 'plan_123456';
      const customerId = 'cust_123456';
      const subscriptionData = {
        payment_method: 'card' as const,
        payment_token: 'tok_123456',
      };

      const apiError = new QorPayApiError('Subscription failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(plans.subscribeToPlan(planId, customerId, subscriptionData)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const planId = 'plan_123456';
      const customerId = 'cust_123456';
      const subscriptionData = {
        payment_method: 'card' as const,
        payment_token: 'tok_123456',
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(plans.subscribeToPlan(planId, customerId, subscriptionData)).rejects.toThrow(networkError);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const subscriptionId = 'sub_123456';
      const cancelResponse = {
        status: 'success',
        code: '200',
        message: 'Subscription cancelled successfully',
      };

      mockClient.delete.mockResolvedValue(cancelResponse);

      const result = await plans.cancelSubscription(subscriptionId);

      expect(mockClient.delete).toHaveBeenCalledWith('/subscriptions/sub_123456');
      expect(result).toEqual(cancelResponse);
    });

    it('should propagate API errors', async () => {
      const subscriptionId = 'sub_invalid';

      const apiError = new QorPayApiError('Subscription not found', 404);
      mockClient.delete.mockRejectedValue(apiError);

      await expect(plans.cancelSubscription(subscriptionId)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const subscriptionId = 'sub_123456';

      const networkError = new Error('Network failure');
      mockClient.delete.mockRejectedValue(networkError);

      await expect(plans.cancelSubscription(subscriptionId)).rejects.toThrow(networkError);
    });

    it('should handle empty subscription ID', async () => {
      const emptySubscriptionId = '';

      mockClient.delete.mockResolvedValue({
        status: 'success',
        code: '200',
        message: 'Subscription cancelled successfully',
      });

      const result = await plans.cancelSubscription(emptySubscriptionId);

      expect(mockClient.delete).toHaveBeenCalledWith('/subscriptions/');
      expect(result.message).toBe('Subscription cancelled successfully');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in plan IDs', async () => {
      const planId = 'plan_123-456_789';

      mockClient.get.mockResolvedValue(mockPlanResponse);

      const result = await plans.getPlan(planId);

      expect(mockClient.get).toHaveBeenCalledWith('/plans/plan_123-456_789');
      expect(result).toEqual(mockPlanResponse);
    });

    it('should handle all interval types', async () => {
      const intervals = ['day', 'week', 'month', 'year'] as const;

      for (const interval of intervals) {
        const planData: PlanRequestPayload = {
          name: `${interval}ly Plan`,
          amount: '9.99',
          currency: 'USD',
          interval,
          interval_count: 1,
        };

        mockClient.post.mockResolvedValue(mockPlanResponse);

        const result = await plans.createPlan(planData);

        expect(mockClient.post).toHaveBeenCalledWith('/plans', planData);
        expect(result).toEqual(mockPlanResponse);

        jest.clearAllMocks();
      }
    });

    it('should handle large interval counts', async () => {
      const planData: PlanRequestPayload = {
        name: 'Biennial Plan',
        amount: '199.99',
        currency: 'USD',
        interval: 'month',
        interval_count: 24,
      };

      mockClient.post.mockResolvedValue(mockPlanResponse);

      const result = await plans.createPlan(planData);

      expect(mockClient.post).toHaveBeenCalledWith('/plans', planData);
      expect(result).toEqual(mockPlanResponse);
    });

    it('should handle zero trial period', async () => {
      const planData: PlanRequestPayload = {
        name: 'No Trial Plan',
        amount: '19.99',
        currency: 'USD',
        interval: 'month',
        interval_count: 1,
        trial_period_days: 0,
      };

      mockClient.post.mockResolvedValue(mockPlanResponse);

      const result = await plans.createPlan(planData);

      expect(mockClient.post).toHaveBeenCalledWith('/plans', planData);
      expect(result).toEqual(mockPlanResponse);
    });
  });
});