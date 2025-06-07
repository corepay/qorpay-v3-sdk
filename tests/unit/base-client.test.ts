/**
 * @file tests/unit/base-client.test.ts
 * @description Integration tests for the BaseClient class using MSW
 */

import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError, QorPayNetworkError } from '../../src/errors';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';

// Set up MSW server for testing HTTP requests
const server = setupServer(
  // Handler for API errors with error status codes
  http.get('http://localhost/test-api-error', () => {
    return HttpResponse.json(
      {
        status: 'error',
        code: 'GW01',
        message: 'Invalid request',
      },
      { status: 400 }
    );
  }),

  // Handler for API errors with success status codes but error in body
  http.get('http://localhost/test-body-error', () => {
    return HttpResponse.json({
      status: 'error',
      code: 'GW02',
      message: 'Business logic error',
    });
  }),

  // Handler for network errors (timeout)
  http.get('http://localhost/test-network-error', async () => {
    await delay(2000); // Long delay to trigger timeout
    return HttpResponse.json({ status: 'ok' });
  }),

  // Handler for server errors
  http.get('http://localhost/test-server-error', () => {
    return HttpResponse.json(
      {
        status: 'error',
        code: 'SERVER01',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }),

  // Handler for unknown errors
  http.get('http://localhost/test-unknown-error', () => {
    return new Response(null, { status: 0 });
  }),

  // Handler for response data test
  http.get('http://localhost/test-response', () => {
    return HttpResponse.json({
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: { id: '123', name: 'Test' },
    });
  }),

  // Handler for empty response test
  http.delete('http://localhost/test-empty', () => {
    return new Response(null, { status: 204 });
  })
);

describe('BaseClient Integration', () => {
  // Start MSW server before tests
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  // Stop MSW server after tests
  afterAll(() => {
    server.close();
  });

  // Reset handlers between tests
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  describe('error handling', () => {
    const client = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
      baseURL: 'http://localhost',
      timeout: 1000, // Short timeout for faster tests
    });

    it('should handle API errors with error status codes', async () => {
      await expect(client.get('/test-api-error')).rejects.toThrow(
        QorPayApiError
      );
      await expect(client.get('/test-api-error')).rejects.toMatchObject({
        message: expect.stringContaining('Invalid request'),
        statusCode: 400,
        errorCode: 'GW01',
      });
    });

    it('should handle API errors with success status codes but error status in body', async () => {
      await expect(client.get('/test-body-error')).rejects.toThrow(
        QorPayApiError
      );
      await expect(client.get('/test-body-error')).rejects.toMatchObject({
        message: expect.stringContaining('Business logic error'),
        errorCode: 'GW02',
      });
    });

    it('should handle server errors', async () => {
      await expect(client.get('/test-server-error')).rejects.toThrow(
        QorPayApiError
      );
      await expect(client.get('/test-server-error')).rejects.toMatchObject({
        message: expect.stringContaining('Internal server error'),
        statusCode: 500,
        errorCode: 'SERVER01',
      });
    });

    it('should handle network errors', async () => {
      // Create a client with a very short timeout to trigger network errors
      const timeoutClient = new BaseClient({
        appKey: 'test-app-key',
        clientKey: 'test-client-key',
        baseURL: 'http://localhost',
        timeout: 100, // Very short timeout
      });

      await expect(timeoutClient.get('/test-network-error')).rejects.toThrow(
        QorPayNetworkError
      );
    });

    it('should handle unknown errors', async () => {
      await expect(client.get('/test-unknown-error')).rejects.toThrow();
    });
  });

  describe('response handling', () => {
    const client = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
      baseURL: 'http://localhost',
    });

    it('should return the response data directly', async () => {
      const responseData = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: { id: '123', name: 'Test' },
      };

      const result = await client.get('/test-response');
      expect(result).toEqual(responseData);
    });

    it('should handle empty response bodies', async () => {
      const result = await client.delete('/test-empty');
      expect(result).toBeNull();
    });
  });
});
