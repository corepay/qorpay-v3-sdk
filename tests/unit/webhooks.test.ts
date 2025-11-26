/**
 * @file tests/unit/webhooks.test.ts
 * @description Tests for webhooks resource class using real instances
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

describe('Webhooks', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockWebhook = {
    id: 'webhook_123456',
    url: 'https://example.com/webhook',
    secret: 'secret_123',
    events: ['payment.completed', 'payment.failed'],
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockWebhookListResponse = {
    status: 'success',
    data: {
      webhooks: [
        mockWebhook,
        {
          ...mockWebhook,
          id: 'webhook_789012',
          url: 'https://example2.com/webhook',
        },
      ],
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
    it('should initialize webhooks resource', () => {
      expect(client.webhooks).toBeDefined();
      expect(typeof client.webhooks.createWebhook).toBe('function');
      expect(typeof client.webhooks.getWebhook).toBe('function');
      expect(typeof client.webhooks.updateWebhook).toBe('function');
      expect(typeof client.webhooks.deleteWebhook).toBe('function');
      expect(typeof client.webhooks.listWebhooks).toBe('function');
      expect(typeof client.webhooks.listWebhookEvents).toBe('function');
    });
  });

  describe('createWebhook', () => {
    it('should create a webhook successfully', async () => {
      const webhookData = {
        url: 'https://example.com/new-webhook',
        events: ['payment.completed'],
        secret: 'new_secret_456',
      };

      mockSuccessfulResponse(mockWebhook);

      const result = await client.webhooks.createWebhook(webhookData);

      expect(result).toEqual(mockWebhook);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/webhook',
          data: expect.objectContaining({
            url: 'https://example.com/new-webhook',
            events: ['payment.completed'],
            secret: 'new_secret_456',
          }),
        })
      );
    });

    it('should create webhook with minimal data', async () => {
      const webhookData = {
        url: 'https://example.com/minimal-webhook',
        events: ['payment.completed'],
      };

      mockSuccessfulResponse({
        ...mockWebhook,
        id: 'webhook_minimal',
        url: 'https://example.com/minimal-webhook',
      });

      const result = await client.webhooks.createWebhook(webhookData);

      expect(result.url).toBe('https://example.com/minimal-webhook');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/webhook',
          data: expect.objectContaining({
            url: 'https://example.com/minimal-webhook',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const webhookData = {
        url: 'invalid-url',
        events: [],
      };

      mockFailedResponse('Invalid webhook data', 400);

      await expect(
        client.webhooks.createWebhook(webhookData)
      ).rejects.toThrow();
    });
  });

  describe('getWebhook', () => {
    it('should retrieve a webhook successfully', async () => {
      const webhookId = 'webhook_123456';

      mockSuccessfulResponse(mockWebhook);

      const result = await client.webhooks.getWebhook(webhookId);

      expect(result).toEqual(mockWebhook);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/webhook/${webhookId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Webhook not found', 404);

      await expect(
        client.webhooks.getWebhook('invalid_webhook')
      ).rejects.toThrow();
    });

    it('should handle empty webhook ID', async () => {
      mockFailedResponse('Webhook ID is required', 400);

      await expect(client.webhooks.getWebhook('')).rejects.toThrow();
    });
  });

  describe('updateWebhook', () => {
    it('should update a webhook successfully', async () => {
      const webhookId = 'webhook_123456';
      const updateData = {
        url: 'https://example.com/updated-webhook',
        events: ['payment.completed', 'payment.failed', 'payment.refunded'],
      };

      mockSuccessfulResponse({
        ...mockWebhook,
        url: 'https://example.com/updated-webhook',
        events: ['payment.completed', 'payment.failed', 'payment.refunded'],
      });

      const result = await client.webhooks.updateWebhook(webhookId, updateData);

      expect(result.url).toBe('https://example.com/updated-webhook');
      expect(result.events).toContain('payment.refunded');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: `/webhook/${webhookId}`,
          data: expect.objectContaining({
            url: 'https://example.com/updated-webhook',
            events: ['payment.completed', 'payment.failed', 'payment.refunded'],
          }),
        })
      );
    });

    it('should update webhook with partial data', async () => {
      const webhookId = 'webhook_123456';
      const updateData = {
        secret: 'updated_secret_789',
      };

      mockSuccessfulResponse({
        ...mockWebhook,
        secret: 'updated_secret_789',
      });

      const result = await client.webhooks.updateWebhook(webhookId, updateData);

      expect(result.secret).toBe('updated_secret_789');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: `/webhook/${webhookId}`,
          data: expect.objectContaining({
            secret: 'updated_secret_789',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const updateData = {
        url: '',
      };

      mockFailedResponse('Invalid update data', 400);

      await expect(
        client.webhooks.updateWebhook('invalid_webhook', updateData)
      ).rejects.toThrow();
    });
  });

  describe('deleteWebhook', () => {
    it('should delete a webhook successfully', async () => {
      const webhookId = 'webhook_123456';

      mockSuccessfulResponse({
        status: 'success',
        message: 'Webhook deleted successfully',
      });

      const result = await client.webhooks.deleteWebhook(webhookId);

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: `/webhook/${webhookId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Webhook not found', 404);

      await expect(
        client.webhooks.deleteWebhook('invalid_webhook')
      ).rejects.toThrow();
    });
  });

  describe('listWebhooks', () => {
    it('should list webhooks with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        status: 'active',
      };

      mockSuccessfulResponse(mockWebhookListResponse);

      const result = await client.webhooks.listWebhooks(params);

      expect(result.data.webhooks).toHaveLength(2);
      expect(result.data.total_count).toBe(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/webhook',
          params,
        })
      );
    });

    it('should list webhooks without parameters', async () => {
      mockSuccessfulResponse(mockWebhookListResponse);

      const result = await client.webhooks.listWebhooks();

      expect(result.data.webhooks).toHaveLength(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/webhook',
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve webhooks', 500);

      await expect(client.webhooks.listWebhooks()).rejects.toThrow();
    });

    it('should handle empty list response', async () => {
      mockSuccessfulResponse({
        status: 'success',
        data: {
          webhooks: [],
          total_count: 0,
          has_more: false,
        },
      });

      const result = await client.webhooks.listWebhooks();

      expect(result.data.webhooks).toEqual([]);
      expect(result.data.total_count).toBe(0);
    });
  });

  describe('listWebhookEvents', () => {
    it('should retrieve available webhook events', async () => {
      const mockEventsResponse = {
        status: 'success',
        data: {
          events: [
            {
              name: 'payment.completed',
              description: 'Payment completed successfully',
            },
            { name: 'payment.failed', description: 'Payment failed' },
            { name: 'payment.refunded', description: 'Payment was refunded' },
          ],
        },
      };

      mockSuccessfulResponse(mockEventsResponse);

      const result = await client.webhooks.listWebhookEvents();

      expect(result.data.events).toHaveLength(3);
      expect(result.data.events[0].name).toBe('payment.completed');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/webhook/events',
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve webhook events', 500);

      await expect(client.webhooks.listWebhookEvents()).rejects.toThrow();
    });

    it('should handle empty events list', async () => {
      mockSuccessfulResponse({
        status: 'success',
        data: {
          events: [],
        },
      });

      const result = await client.webhooks.listWebhookEvents();

      expect(result.data.events).toEqual([]);
    });
  });
});
