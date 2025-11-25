/**
 * @file tests/unit/webhooks.test.ts
 * @description Unit tests for Webhooks resource class
 */

import { Webhooks } from '../../src/resources/webhooks';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('Webhooks', () => {
  let webhooks: Webhooks;
  let mockClient: jest.Mocked<BaseClient>;

  const mockWebhookResponse = {
    status: 'success',
    code: '200',
    message: 'Webhook retrieved successfully',
    reference_id: 'ref_123',
    data: {
      id: 'webhook_123456',
      url: 'https://example.com/webhook',
      secret: 'secret_123',
      events: ['payment.completed', 'payment.failed'],
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  };

  const mockWebhooksListResponse = {
    status: 'success',
    code: '200',
    message: 'Webhooks retrieved',
    reference_id: 'ref_123',
    data: {
      webhooks: [mockWebhookResponse.data],
      total: 1,
      has_more: false,
    },
  };

  const mockWebhookEventsResponse = {
    status: 'success',
    code: '200',
    message: 'Webhook events retrieved',
    reference_id: 'ref_123',
    data: {
      events: [
        {
          id: 'event_123',
          webhook_id: 'webhook_123456',
          event_type: 'payment.completed',
          status: 'delivered',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      has_more: false,
    },
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    webhooks = new Webhooks(mockClient);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with BaseClient instance', () => {
      expect(webhooks['client']).toBe(mockClient);
    });
  });

  describe('createWebhook', () => {
    it('should create a webhook successfully', async () => {
      const webhookData = {
        url: 'https://example.com/webhook',
        secret: 'my_secret_key',
        events: ['payment.completed', 'payment.failed'],
        description: 'Test webhook',
      };

      mockClient.post.mockResolvedValue(mockWebhookResponse);

      const result = await webhooks.createWebhook(webhookData);

      expect(mockClient.post).toHaveBeenCalledWith('/webhook', webhookData);
      expect(result).toEqual(mockWebhookResponse);
    });

    it('should propagate API errors', async () => {
      const webhookData = {
        url: 'https://example.com/webhook',
      };

      const apiError = new QorPayApiError('Webhook creation failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(webhooks.createWebhook(webhookData)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('getWebhook', () => {
    it('should retrieve a webhook successfully', async () => {
      const webhookId = 'webhook_123456';

      mockClient.get.mockResolvedValue(mockWebhookResponse);

      const result = await webhooks.getWebhook(webhookId);

      expect(mockClient.get).toHaveBeenCalledWith('/webhook/webhook_123456');
      expect(result).toEqual(mockWebhookResponse);
    });

    it('should propagate API errors', async () => {
      const webhookId = 'webhook_invalid';

      const apiError = new QorPayApiError('Webhook not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(webhooks.getWebhook(webhookId)).rejects.toThrow(apiError);
    });
  });

  describe('updateWebhook', () => {
    it('should update a webhook successfully', async () => {
      const webhookId = 'webhook_123456';
      const updateData = {
        url: 'https://example.com/webhook-updated',
        events: ['payment.completed'],
      };

      mockClient.put.mockResolvedValue(mockWebhookResponse);

      const result = await webhooks.updateWebhook(webhookId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/webhook/webhook_123456',
        updateData
      );
      expect(result).toEqual(mockWebhookResponse);
    });

    it('should propagate API errors', async () => {
      const webhookId = 'webhook_invalid';
      const updateData = { url: 'https://example.com/webhook' };

      const apiError = new QorPayApiError('Webhook not found', 404);
      mockClient.put.mockRejectedValue(apiError);

      await expect(
        webhooks.updateWebhook(webhookId, updateData)
      ).rejects.toThrow(apiError);
    });
  });

  describe('listWebhooks', () => {
    it('should list webhooks with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        status: 'active',
      };

      mockClient.get.mockResolvedValue(mockWebhooksListResponse);

      const result = await webhooks.listWebhooks(params);

      expect(mockClient.get).toHaveBeenCalledWith('/webhook', params);
      expect(result).toEqual(mockWebhooksListResponse);
    });

    it('should list webhooks without parameters', async () => {
      mockClient.get.mockResolvedValue(mockWebhooksListResponse);

      const result = await webhooks.listWebhooks();

      expect(mockClient.get).toHaveBeenCalledWith('/webhook', undefined);
      expect(result).toEqual(mockWebhooksListResponse);
    });

    it('should propagate API errors', async () => {
      const apiError = new QorPayApiError('Failed to list webhooks', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(webhooks.listWebhooks()).rejects.toThrow(apiError);
    });
  });

  describe('deleteWebhook', () => {
    it('should delete a webhook successfully', async () => {
      const webhookId = 'webhook_123456';
      const deleteResponse = {
        status: 'success',
        code: '200',
        message: 'Webhook deleted successfully',
      };

      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await webhooks.deleteWebhook(webhookId);

      expect(mockClient.delete).toHaveBeenCalledWith('/webhook/webhook_123456');
      expect(result).toEqual(deleteResponse);
    });

    it('should propagate API errors', async () => {
      const webhookId = 'webhook_invalid';

      const apiError = new QorPayApiError('Webhook not found', 404);
      mockClient.delete.mockRejectedValue(apiError);

      await expect(webhooks.deleteWebhook(webhookId)).rejects.toThrow(apiError);
    });
  });

  describe('listWebhookEvents', () => {
    it('should list webhook events with parameters', async () => {
      const params = {
        limit: 20,
        offset: 0,
        status: 'failed',
      };

      mockClient.get.mockResolvedValue(mockWebhookEventsResponse);

      const result = await webhooks.listWebhookEvents(params);

      expect(mockClient.get).toHaveBeenCalledWith('/webhook/events', params);
      expect(result).toEqual(mockWebhookEventsResponse);
    });

    it('should list webhook events without parameters', async () => {
      mockClient.get.mockResolvedValue(mockWebhookEventsResponse);

      const result = await webhooks.listWebhookEvents();

      expect(mockClient.get).toHaveBeenCalledWith('/webhook/events', undefined);
      expect(result).toEqual(mockWebhookEventsResponse);
    });

    it('should propagate API errors', async () => {
      const apiError = new QorPayApiError('Failed to list webhook events', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(webhooks.listWebhookEvents()).rejects.toThrow(apiError);
    });
  });

  describe('listEvents', () => {
    it('should list events for a specific webhook', async () => {
      const hookId = 'webhook_123456';

      mockClient.get.mockResolvedValue(mockWebhookEventsResponse);

      const result = await webhooks.listEvents(hookId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/webhook/webhook_123456/events'
      );
      expect(result).toEqual(mockWebhookEventsResponse);
    });

    it('should propagate API errors', async () => {
      const hookId = 'webhook_invalid';

      const apiError = new QorPayApiError('Webhook not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(webhooks.listEvents(hookId)).rejects.toThrow(apiError);
    });
  });

  describe('retryWebhookEvent', () => {
    it('should retry a webhook event successfully', async () => {
      const eventId = 'event_123';
      const retryResponse = {
        status: 'success',
        code: '200',
        message: 'Webhook event retry initiated',
      };

      mockClient.post.mockResolvedValue(retryResponse);

      const result = await webhooks.retryWebhookEvent(eventId);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/webhook/events/event_123/retry',
        {}
      );
      expect(result).toEqual(retryResponse);
    });

    it('should propagate API errors', async () => {
      const eventId = 'event_invalid';

      const apiError = new QorPayApiError('Event not found', 404);
      mockClient.post.mockRejectedValue(apiError);

      await expect(webhooks.retryWebhookEvent(eventId)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('retryEvent', () => {
    it('should retry a webhook event (alias method)', async () => {
      const eventId = 'event_123';
      const retryResponse = {
        ...mockWebhookResponse,
        data: {
          id: 'event_123',
          webhook_id: 'webhook_123456',
          event_type: 'payment.completed',
          status: 'delivered',
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      mockClient.post.mockResolvedValue(retryResponse);

      const result = await webhooks.retryEvent(eventId);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/webhook/events/event_123/retry',
        {}
      );
      expect(result).toEqual(retryResponse);
    });

    it('should propagate API errors', async () => {
      const eventId = 'event_invalid';

      const apiError = new QorPayApiError('Event not found', 404);
      mockClient.post.mockRejectedValue(apiError);

      await expect(webhooks.retryEvent(eventId)).rejects.toThrow(apiError);
    });
  });
});
