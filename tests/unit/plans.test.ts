/**
 * @file tests/unit/plans.test.ts
 * @description Unit tests for the Plans resource module
 */

import { Plans } from '../../src/resources/plans';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('Plans', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let plans: Plans;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    }) as jest.Mocked<BaseClient>;

    // Create the Plans instance with the mock client
    plans = new Plans(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPlan', () => {
    const mockCreatePlanRequest = {
      name: 'Monthly Subscription',
      description: 'Monthly subscription plan for premium features',
      amount: '29.99',
      currency: 'USD',
      interval: 'month' as const,
      interval_count: 1,
      trial_period_days: 7,
      metadata: {
        feature_set: 'premium'
      }
    };

    const mockCreatePlanResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Plan created successfully',
      data: {
        id: 'plan_123456',
        name: 'Monthly Subscription',
        description: 'Monthly subscription plan for premium features',
        amount: '29.99',
        currency: 'USD',
        interval: 'month' as const,
        interval_count: 1,
        trial_period_days: 7,
        status: 'active' as const,
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z',
        metadata: {
          feature_set: 'premium'
        }
      }
    };

    it('should create a plan successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockCreatePlanResponse);

      // Call the method
      const result = await plans.createPlan(mockCreatePlanRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/plans',
        mockCreatePlanRequest
      );

      // Verify the result
      expect(result).toEqual(mockCreatePlanResponse);
      expect(result.data.id).toBe('plan_123456');
      expect(result.data.name).toBe('Monthly Subscription');
      expect(result.data.amount).toBe('29.99');
      expect(result.data.interval).toBe('month');
      expect(result.data.status).toBe('active');
    });

    it('should handle API errors when creating a plan', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid plan data',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(plans.createPlan(mockCreatePlanRequest)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/plans',
        mockCreatePlanRequest
      );
    });
  });

  describe('getPlan', () => {
    const mockPlanId = 'plan_123456';
    const mockGetPlanResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        id: 'plan_123456',
        name: 'Monthly Subscription',
        description: 'Monthly subscription plan',
        amount: '29.99',
        currency: 'USD',
        interval: 'month' as const,
        interval_count: 1,
        trial_period_days: 7,
        status: 'active' as const,
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z'
      }
    };

    it('should get a plan successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockGetPlanResponse);

      // Call the method
      const result = await plans.getPlan(mockPlanId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/plans/${mockPlanId}`
      );

      // Verify the result
      expect(result).toEqual(mockGetPlanResponse);
      expect(result.data.id).toBe(mockPlanId);
      expect(result.data.name).toBe('Monthly Subscription');
    });

    it('should handle API errors when getting a plan', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Plan not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(plans.getPlan(mockPlanId)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/plans/${mockPlanId}`
      );
    });
  });

  describe('updatePlan', () => {
    const mockPlanId = 'plan_123456';
    const mockUpdatePlanRequest = {
      name: 'Updated Monthly Subscription',
      amount: '39.99',
      trial_period_days: 14
    };

    const mockUpdatePlanResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Plan updated successfully',
      data: {
        id: 'plan_123456',
        name: 'Updated Monthly Subscription',
        description: 'Monthly subscription plan',
        amount: '39.99',
        currency: 'USD',
        interval: 'month' as const,
        interval_count: 1,
        trial_period_days: 14,
        status: 'active' as const,
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-02T12:00:00Z'
      }
    };

    it('should update a plan successfully', async () => {
      // Mock the put method to return a successful response
      mockClient.put.mockResolvedValue(mockUpdatePlanResponse);

      // Call the method
      const result = await plans.updatePlan(mockPlanId, mockUpdatePlanRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/plans/${mockPlanId}`,
        mockUpdatePlanRequest
      );

      // Verify the result
      expect(result).toEqual(mockUpdatePlanResponse);
      expect(result.data.name).toBe('Updated Monthly Subscription');
      expect(result.data.amount).toBe('39.99');
      expect(result.data.trial_period_days).toBe(14);
    });

    it('should handle API errors when updating a plan', async () => {
      // Mock the put method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid update data',
        400,
        'GW01'
      );
      mockClient.put.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(plans.updatePlan(mockPlanId, mockUpdatePlanRequest)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/plans/${mockPlanId}`,
        mockUpdatePlanRequest
      );
    });
  });

  describe('listPlans', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      status: 'active' as const,
      created_start: '2023-01-01',
      created_end: '2023-01-31'
    };

    const mockListPlansResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        plans: [
          {
            id: 'plan_123456',
            name: 'Monthly Subscription',
            description: 'Monthly plan',
            amount: '29.99',
            currency: 'USD',
            interval: 'month' as const,
            interval_count: 1,
            trial_period_days: 7,
            status: 'active' as const,
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z'
          },
          {
            id: 'plan_789012',
            name: 'Annual Subscription',
            description: 'Annual plan',
            amount: '299.99',
            currency: 'USD',
            interval: 'year' as const,
            interval_count: 1,
            trial_period_days: 30,
            status: 'active' as const,
            created_at: '2023-01-15T12:00:00Z',
            updated_at: '2023-01-15T12:00:00Z'
          }
        ],
        meta: {
          count: 2,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list plans successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockListPlansResponse);

      // Call the method with query parameters
      const result = await plans.listPlans(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/plans',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockListPlansResponse);
      expect(result.data.plans.length).toBe(2);
      expect(result.data.plans[0].id).toBe('plan_123456');
      expect(result.data.plans[1].interval).toBe('year');
      expect(result.data.meta.count).toBe(2);
    });

    it('should list plans successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockListPlansResponse);

      // Call the method without query parameters
      const result = await plans.listPlans();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/plans',
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockListPlansResponse);
    });

    it('should handle API errors when listing plans', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Access denied',
        403,
        'GW03'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(plans.listPlans(mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/plans',
        mockQueryParams
      );
    });
  });

  describe('deletePlan', () => {
    const mockPlanId = 'plan_123456';
    const mockDeletePlanResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Plan deleted successfully'
    };

    it('should delete a plan successfully', async () => {
      // Mock the delete method to return a successful response
      mockClient.delete.mockResolvedValue(mockDeletePlanResponse);

      // Call the method
      const result = await plans.deletePlan(mockPlanId);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/plans/${mockPlanId}`
      );

      // Verify the result
      expect(result).toEqual(mockDeletePlanResponse);
      expect(result.status).toBe('approved');
      expect(result.message).toBe('Plan deleted successfully');
    });

    it('should handle API errors when deleting a plan', async () => {
      // Mock the delete method to throw an API error
      const mockError = new QorPayApiError(
        'Plan not found',
        404,
        'GW04'
      );
      mockClient.delete.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(plans.deletePlan(mockPlanId)).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/plans/${mockPlanId}`
      );
    });
  });

  describe('subscribeToPlan', () => {
    const mockPlanId = 'plan_123456';
    const mockCustomerId = 'cust_123456';
    const mockSubscriptionData = {
      payment_method: 'card' as const,
      payment_token: 'token_123456',
      start_date: '2023-02-01T00:00:00Z',
      metadata: {
        source: 'api'
      }
    };

    const mockSubscriptionResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Subscription created successfully',
      data: {
        subscription_id: 'sub_123456'
      }
    };

    it('should subscribe to a plan successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockSubscriptionResponse);

      // Call the method
      const result = await plans.subscribeToPlan(mockPlanId, mockCustomerId, mockSubscriptionData);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        `/plans/${mockPlanId}/subscriptions`,
        {
          customer_id: mockCustomerId,
          ...mockSubscriptionData
        }
      );

      // Verify the result
      expect(result).toEqual(mockSubscriptionResponse);
      expect(result.data.subscription_id).toBe('sub_123456');
    });

    it('should handle API errors when subscribing to a plan', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid payment token',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(plans.subscribeToPlan(mockPlanId, mockCustomerId, mockSubscriptionData)).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        `/plans/${mockPlanId}/subscriptions`,
        {
          customer_id: mockCustomerId,
          ...mockSubscriptionData
        }
      );
    });
  });

  describe('cancelSubscription', () => {
    const mockSubscriptionId = 'sub_123456';
    const mockCancelSubscriptionResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Subscription cancelled successfully'
    };

    it('should cancel a subscription successfully', async () => {
      // Mock the delete method to return a successful response
      mockClient.delete.mockResolvedValue(mockCancelSubscriptionResponse);

      // Call the method
      const result = await plans.cancelSubscription(mockSubscriptionId);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/subscriptions/${mockSubscriptionId}`
      );

      // Verify the result
      expect(result).toEqual(mockCancelSubscriptionResponse);
      expect(result.status).toBe('approved');
      expect(result.message).toBe('Subscription cancelled successfully');
    });

    it('should handle API errors when cancelling a subscription', async () => {
      // Mock the delete method to throw an API error
      const mockError = new QorPayApiError(
        'Subscription not found',
        404,
        'GW04'
      );
      mockClient.delete.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(plans.cancelSubscription(mockSubscriptionId)).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/subscriptions/${mockSubscriptionId}`
      );
    });
  });
});
