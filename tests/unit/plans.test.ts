/**
 * @file tests/unit/plans.test.ts
 * @description Tests for plans resource class using real instances
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('Plans', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockPlan = {
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

  const mockPlanListResponse = {
    status: 'success',
    data: {
      plans: [mockPlan, { ...mockPlan, id: 'plan_789012', name: 'Basic Plan' }],
      total_count: 2,
      has_more: false,
    },
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize plans resource', () => {
      expect(client.plans).toBeDefined();
      expect(typeof client.plans.createPlan).toBe('function');
      expect(typeof client.plans.getPlan).toBe('function');
      expect(typeof client.plans.updatePlan).toBe('function');
      expect(typeof client.plans.listPlans).toBe('function');
    });
  });

  describe('createPlan', () => {
    it('should create a plan successfully', async () => {
      const planData = {
        name: 'Premium Plan',
        description: 'Premium subscription plan',
        amount: '29.99',
        currency: 'USD',
        interval: 'month',
        trial_period_days: 14,
        metadata: { tier: 'premium' },
      };

      mockSuccessfulResponse(mockPlan);

      const result = await client.plans.createPlan(planData);

      expect(result).toEqual(mockPlan);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/plans',
          data: expect.objectContaining({
            name: 'Premium Plan',
            amount: '29.99',
            currency: 'USD',
            interval: 'month',
            trial_period_days: 14,
          }),
        })
      );
    });

    it('should create a plan with minimal data', async () => {
      const planData = {
        name: 'Basic Plan',
        amount: '9.99',
        currency: 'USD',
        interval: 'month',
      };

      mockSuccessfulResponse({
        ...mockPlan,
        id: 'plan_basic',
        name: 'Basic Plan',
        amount: '9.99',
      });

      const result = await client.plans.createPlan(planData);

      expect(result.name).toBe('Basic Plan');
      expect(result.amount).toBe('9.99');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/plans',
          data: expect.objectContaining({
            name: 'Basic Plan',
            amount: '9.99',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const planData = {
        name: 'Invalid Plan',
        amount: '-10.00', // Invalid amount
        currency: 'USD',
        interval: 'month',
      };

      mockFailedResponse('Invalid plan data', 400);

      await expect(client.plans.createPlan(planData)).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      const planData = {
        name: 'Network Plan',
        amount: '19.99',
        currency: 'USD',
        interval: 'month',
      };

      mockFailedResponse('Network error', 500);

      await expect(client.plans.createPlan(planData)).rejects.toThrow();
    });
  });

  describe('getPlan', () => {
    it('should retrieve a plan successfully', async () => {
      const planId = 'plan_123456';

      mockSuccessfulResponse(mockPlan);

      const result = await client.plans.getPlan(planId);

      expect(result).toEqual(mockPlan);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/plans/${planId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Plan not found', 404);

      await expect(client.plans.getPlan('invalid_plan')).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      mockFailedResponse('Network error', 500);

      await expect(client.plans.getPlan('plan_123456')).rejects.toThrow();
    });

    it('should handle empty plan ID', async () => {
      mockFailedResponse('Plan ID is required', 400);

      await expect(client.plans.getPlan('')).rejects.toThrow();
    });
  });

  describe('updatePlan', () => {
    it('should update a plan successfully', async () => {
      const planId = 'plan_123456';
      const updateData = {
        name: 'Updated Premium Plan',
        amount: '39.99',
        description: 'Updated premium subscription plan',
      };

      mockSuccessfulResponse({
        ...mockPlan,
        name: 'Updated Premium Plan',
        amount: '39.99',
        description: 'Updated premium subscription plan',
      });

      const result = await client.plans.updatePlan(planId, updateData);

      expect(result.name).toBe('Updated Premium Plan');
      expect(result.amount).toBe('39.99');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: `/plans/${planId}`,
          data: expect.objectContaining({
            name: 'Updated Premium Plan',
            amount: '39.99',
          }),
        })
      );
    });

    it('should update plan with minimal data', async () => {
      const planId = 'plan_123456';
      const updateData = {
        description: 'New description only',
      };

      mockSuccessfulResponse({
        ...mockPlan,
        description: 'New description only',
      });

      const result = await client.plans.updatePlan(planId, updateData);

      expect(result.description).toBe('New description only');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: `/plans/${planId}`,
          data: expect.objectContaining({
            description: 'New description only',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const updateData = {
        amount: '-10.00',
      };

      mockFailedResponse('Invalid update data', 400);

      await expect(
        client.plans.updatePlan('invalid_plan', updateData)
      ).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      const updateData = {
        name: 'Network Updated Plan',
      };

      mockFailedResponse('Network error', 500);

      await expect(
        client.plans.updatePlan('plan_123456', updateData)
      ).rejects.toThrow();
    });
  });

  describe('listPlans', () => {
    it('should list plans successfully', async () => {
      const params = {
        limit: 10,
        offset: 0,
        status: 'active',
      };

      mockSuccessfulResponse(mockPlanListResponse);

      const result = await client.plans.listPlans(params);

      expect(result.data.plans).toHaveLength(2);
      expect(result.data.total_count).toBe(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/plans',
          params,
        })
      );
    });

    it('should list plans without parameters', async () => {
      mockSuccessfulResponse(mockPlanListResponse);

      const result = await client.plans.listPlans();

      expect(result.data.plans).toHaveLength(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/plans',
        })
      );
    });

    it('should list plans with date filters', async () => {
      const params = {
        created_after: '2024-01-01',
        created_before: '2024-01-31',
      };

      mockSuccessfulResponse({
        ...mockPlanListResponse,
        data: {
          plans: [mockPlan],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await client.plans.listPlans(params);

      expect(result.data.plans).toHaveLength(1);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/plans',
          params,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve plans', 500);

      await expect(client.plans.listPlans()).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      mockFailedResponse('Network error', 500);

      await expect(client.plans.listPlans({ limit: 10 })).rejects.toThrow();
    });

    it('should handle empty list response', async () => {
      mockSuccessfulResponse({
        status: 'success',
        data: {
          plans: [],
          total_count: 0,
          has_more: false,
        },
      });

      const result = await client.plans.listPlans();

      expect(result.data.plans).toEqual([]);
      expect(result.data.total_count).toBe(0);
    });
  });
});
