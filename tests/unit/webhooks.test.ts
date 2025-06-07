/**
 * @file tests/unit/webhooks.test.ts
 * @description Unit tests for the Webhooks resource module
 */

import { Webhooks } from '../../src/resources/webhooks';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('Webhooks', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let webhooks: Webhooks;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    }) as jest.Mocked<BaseClient>;

    // Create the Webhooks instance with the mock client
    webhooks = new Webhooks(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWebhook', () => {
    const mockWebhookRequest = {
      url: 'https://example.com/webhook',
      description: 'Test webhook',
      events: ['payment.success', 'payment.failed'],
      metadata: {
        source: 'test',
        version: '1.0'
      }
    };

    const mockWebhookResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Webhook created successfully',
      data: {
        id: 'wh_123456',
        url: 'https://example.com/webhook',
        description: 'Test webhook',
        events: ['payment.success', 'payment.failed'],
        status: 'active' as const,
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z',
        metadata: {
          source: 'test',
          version: '1.0'
        }
      }
    };

    it('should create a webhook successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockWebhookResponse);

      // Call the method
      const result = await webhooks.createWebhook(mockWebhookRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/webhook',
        mockWebhookRequest
      );

      // Verify the result
      expect(result).toEqual(mockWebhookResponse);
      expect(result.data.id).toBe('wh_123456');
      expect(result.data.url).toBe(mockWebhookRequest.url);
      expect(result.data.events).toEqual(mockWebhookRequest.events);
    });

    it('should handle API errors when creating a webhook', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid webhook URL',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(webhooks.createWebhook(mockWebhookRequest)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/webhook',
        mockWebhookRequest
      );
    });
  });

  describe('getWebhook', () => {
    const mockWebhookId = 'wh_123456';
    const mockWebhookResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        id: 'wh_123456',
        url: 'https://example.com/webhook',
        description: 'Test webhook',
        events: ['payment.success', 'payment.failed'],
        status: 'active' as const,
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z'
      }
    };

    it('should get a webhook successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockWebhookResponse);

      // Call the method
      const result = await webhooks.getWebhook(mockWebhookId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/webhook/${mockWebhookId}`
      );

      // Verify the result
      expect(result).toEqual(mockWebhookResponse);
      expect(result.data.id).toBe(mockWebhookId);
    });

    it('should handle API errors when getting a webhook', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Webhook not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(webhooks.getWebhook(mockWebhookId)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/webhook/${mockWebhookId}`
      );
    });
  });

  describe('updateWebhook', () => {
    const mockWebhookId = 'wh_123456';
    const mockUpdateRequest = {
      url: 'https://example.com/webhook/updated',
      description: 'Updated webhook',
      events: ['payment.success', 'payment.failed', 'payment.refunded'],
      status: 'inactive' as const
    };

    const mockUpdateResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Webhook updated successfully',
      data: {
        id: 'wh_123456',
        url: 'https://example.com/webhook/updated',
        description: 'Updated webhook',
        events: ['payment.success', 'payment.failed', 'payment.refunded'],
        status: 'inactive' as const,
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-02T12:00:00Z'
      }
    };

    it('should update a webhook successfully', async () => {
      // Mock the put method to return a successful response
      mockClient.put.mockResolvedValue(mockUpdateResponse);

      // Call the method
      const result = await webhooks.updateWebhook(mockWebhookId, mockUpdateRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/webhook/${mockWebhookId}`,
        mockUpdateRequest
      );

      // Verify the result
      expect(result).toEqual(mockUpdateResponse);
      expect(result.data.id).toBe(mockWebhookId);
      expect(result.data.url).toBe(mockUpdateRequest.url);
      expect(result.data.status).toBe(mockUpdateRequest.status);
    });

    it('should handle API errors when updating a webhook', async () => {
      // Mock the put method to throw an API error
      const mockError = new QorPayApiError(
        'Webhook not found',
        404,
        'GW04'
      );
      mockClient.put.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(webhooks.updateWebhook(mockWebhookId, mockUpdateRequest)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/webhook/${mockWebhookId}`,
        mockUpdateRequest
      );
    });
  });

  describe('listWebhooks', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      status: 'active' as const,
      event: 'payment.success'
    };

    const mockWebhooksResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        webhooks: [
          {
            id: 'wh_123456',
            url: 'https://example.com/webhook1',
            description: 'Test webhook 1',
            events: ['payment.success', 'payment.failed'],
            status: 'active' as const,
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z'
          },
          {
            id: 'wh_789012',
            url: 'https://example.com/webhook2',
            description: 'Test webhook 2',
            events: ['payment.success'],
            status: 'active' as const,
            created_at: '2023-01-02T12:00:00Z',
            updated_at: '2023-01-02T12:00:00Z'
          }
        ],
        meta: {
          count: 2,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list webhooks successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockWebhooksResponse);

      // Call the method with query parameters
      const result = await webhooks.listWebhooks(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/webhook',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockWebhooksResponse);
      expect(result.data.webhooks.length).toBe(2);
      expect(result.data.webhooks[0].id).toBe('wh_123456');
    });

    it('should list webhooks successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockWebhooksResponse);

      // Call the method without query parameters
      const result = await webhooks.listWebhooks();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/webhook',
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockWebhooksResponse);
    });

    it('should handle API errors when listing webhooks', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid query parameters',
        400,
        'GW01'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(webhooks.listWebhooks(mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/webhook',
        mockQueryParams
      );
    });
  });

  describe('deleteWebhook', () => {
    const mockWebhookId = 'wh_123456';
    const mockDeleteResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Webhook deleted successfully'
    };

    it('should delete a webhook successfully', async () => {
      // Mock the delete method to return a successful response
      mockClient.delete.mockResolvedValue(mockDeleteResponse);

      // Call the method
      const result = await webhooks.deleteWebhook(mockWebhookId);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/webhook/${mockWebhookId}`
      );

      // Verify the result
      expect(result).toEqual(mockDeleteResponse);
      expect(result.message).toBe('Webhook deleted successfully');
    });

    it('should handle API errors when deleting a webhook', async () => {
      // Mock the delete method to throw an API error
      const mockError = new QorPayApiError(
        'Webhook not found',
        404,
        'GW04'
      );
      mockClient.delete.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(webhooks.deleteWebhook(mockWebhookId)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/webhook/${mockWebhookId}`
      );
    });
  });

  describe('listWebhookEvents', () => {
    const mockQueryParams = {
      webhook_id: 'wh_123456',
      event: 'payment.success',
      status: 'sent' as const,
      limit: 10,
      offset: 0
    };

    const mockEventsResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        events: [
          {
            id: 'evt_123456',
            webhook_id: 'wh_123456',
            event: 'payment.success',
            payload: {
              transaction_id: 'txn_123456',
              amount: '100.00',
              status: 'approved'
            },
            status: 'sent' as const,
            attempts: 1,
            last_attempt_at: '2023-01-01T12:05:00Z',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:05:00Z'
          },
          {
            id: 'evt_789012',
            webhook_id: 'wh_123456',
            event: 'payment.success',
            payload: {
              transaction_id: 'txn_789012',
              amount: '50.00',
              status: 'approved'
            },
            status: 'sent' as const,
            attempts: 1,
            last_attempt_at: '2023-01-02T12:05:00Z',
            created_at: '2023-01-02T12:00:00Z',
            updated_at: '2023-01-02T12:05:00Z'
          }
        ],
        meta: {
          count: 2,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list webhook events successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockEventsResponse);

      // Call the method with query parameters
      const result = await webhooks.listWebhookEvents(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/webhook/events',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockEventsResponse);
      expect(result.data.events.length).toBe(2);
      expect(result.data.events[0].webhook_id).toBe(mockQueryParams.webhook_id);
      expect(result.data.events[0].event).toBe(mockQueryParams.event);
    });

    it('should list webhook events successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockEventsResponse);

      // Call the method without query parameters
      const result = await webhooks.listWebhookEvents();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/webhook/events',
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockEventsResponse);
    });

    it('should handle API errors when listing webhook events', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid query parameters',
        400,
        'GW01'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(webhooks.listWebhookEvents(mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/webhook/events',
        mockQueryParams
      );
    });
  });

  describe('retryWebhookEvent', () => {
    const mockEventId = 'evt_123456';
    const mockRetryResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Webhook event retry initiated'
    };

    it('should retry a webhook event successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockRetryResponse);

      // Call the method
      const result = await webhooks.retryWebhookEvent(mockEventId);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        `/webhook/events/${mockEventId}/retry`,
        {}
      );

      // Verify the result
      expect(result).toEqual(mockRetryResponse);
      expect(result.message).toBe('Webhook event retry initiated');
    });

    it('should handle API errors when retrying a webhook event', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Event not found',
        404,
        'GW04'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(webhooks.retryWebhookEvent(mockEventId)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        `/webhook/events/${mockEventId}/retry`,
        {}
      );
    });
  });
});
