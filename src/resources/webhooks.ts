/**
 * @file src/resources/webhooks.ts
 * @description Resource module for webhook-related operations
 */

import { BaseClient } from '../client/base-client';
import {
  BaseQorPayResponse,
  QueryParams,
  WebhookId
} from '../types/common';

/**
 * Webhook object structure
 */
export interface Webhook {
  id: WebhookId;
  url: string;
  description?: string;
  events: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

/**
 * Query parameters for listing webhooks
 */
export interface ListWebhooksQueryParams extends QueryParams {
  limit?: number;
  offset?: number;
  status?: 'active' | 'inactive';
  event?: string;
  created_start?: string;
  created_end?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Response payload for listing webhooks
 */
export interface ListWebhooksResponsePayload extends BaseQorPayResponse {
  data: {
    webhooks: Webhook[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Response payload for getting a webhook
 */
export interface GetWebhookResponsePayload extends BaseQorPayResponse {
  data: Webhook;
}

/**
 * Request payload for creating a webhook
 */
export interface CreateWebhookRequestPayload {
  url: string;
  description?: string;
  events: string[];
  metadata?: Record<string, any>;
}

/**
 * Request payload for updating a webhook
 */
export interface UpdateWebhookRequestPayload {
  url?: string;
  description?: string;
  events?: string[];
  status?: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

/**
 * Webhook event object structure
 */
export interface WebhookEvent {
  id: string;
  webhook_id: WebhookId;
  event: string;
  payload: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  last_attempt_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Response payload for listing webhook events
 */
export interface ListWebhookEventsResponsePayload extends BaseQorPayResponse {
  data: {
    events: WebhookEvent[];
    meta: {
      count: number;
      limit: number;
      offset: number;
    };
  };
}

/**
 * Query parameters for listing webhook events
 */
export interface ListWebhookEventsQueryParams extends QueryParams {
  webhook_id?: WebhookId;
  event?: string;
  status?: 'pending' | 'sent' | 'failed';
  created_start?: string;
  created_end?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Webhooks resource class for webhook-related operations
 */
export class WebhooksResource {
  private client: BaseClient;

  /**
   * Creates a new Webhooks resource instance
   * @param client BaseClient instance
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a new webhook
   * @param data Webhook data
   * @returns Promise resolving to the created webhook
   */
  async createWebhook(data: CreateWebhookRequestPayload): Promise<GetWebhookResponsePayload> {
    return this.client.post<GetWebhookResponsePayload>('/webhook', data);
  }

  /**
   * Get a specific webhook by ID
   * @param webhookId Webhook ID
   * @returns Promise resolving to the webhook
   */
  async getWebhook(webhookId: WebhookId): Promise<GetWebhookResponsePayload> {
    return this.client.get<GetWebhookResponsePayload>(`/webhook/${webhookId}`);
  }

  /**
   * Update an existing webhook
   * @param webhookId Webhook ID
   * @param data Webhook data to update
   * @returns Promise resolving to the updated webhook
   */
  async updateWebhook(
    webhookId: WebhookId,
    data: UpdateWebhookRequestPayload
  ): Promise<GetWebhookResponsePayload> {
    return this.client.put<GetWebhookResponsePayload>(`/webhook/${webhookId}`, data);
  }

  /**
   * List webhooks with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of webhooks
   */
  async listWebhooks(params?: ListWebhooksQueryParams): Promise<ListWebhooksResponsePayload> {
    return this.client.get<ListWebhooksResponsePayload>('/webhook', params);
  }

  /**
   * Delete a webhook
   * @param webhookId Webhook ID
   * @returns Promise resolving to the deletion confirmation
   */
  async deleteWebhook(webhookId: WebhookId): Promise<{ status: string; code: string; message: string }> {
    return this.client.delete<{ status: string; code: string; message: string }>(`/webhook/${webhookId}`);
  }

  /**
   * List webhook events with optional filtering
   * @param params Query parameters
   * @returns Promise resolving to the list of webhook events
   */
  async listWebhookEvents(params?: ListWebhookEventsQueryParams): Promise<ListWebhookEventsResponsePayload> {
    return this.client.get<ListWebhookEventsResponsePayload>('/webhook/events', params);
  }

  /**
   * Retry a failed webhook event
   * @param eventId Event ID
   * @returns Promise resolving to the retry confirmation
   */
  async retryWebhookEvent(eventId: string): Promise<{ status: string; code: string; message: string }> {
    return this.client.post<{ status: string; code: string; message: string }>(
      `/webhook/events/${eventId}/retry`,
      {}
    );
  }
}
