/**
 * @file tests/unit/payment-forms.test.ts
 * @description Tests for paymentForms resource class WITHOUT internal mocks
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import { QorPayApiError } from '../../src/errors';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
  expectApiCall,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('PaymentForms', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockFormResponse = {
    status: 'success',
    code: '200',
    message: 'Payment form retrieved successfully',
    reference_id: 'ref_123',
    data: {
      id: 'form_123456',
      title: 'Payment Form',
      description: 'Test payment form',
      amount: '100.00',
      currency: 'USD',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      expires_at: '2025-01-01T00:00:00Z',
    },
  };

  const mockFormsListResponse = {
    status: 'success',
    code: '200',
    message: 'Payment forms retrieved',
    reference_id: 'ref_123',
    data: {
      forms: [mockFormResponse.data],
      total: 1,
      has_more: false,
    },
  };

  const mockRequestResponse = {
    status: 'success',
    code: '200',
    message: 'Payment request retrieved successfully',
    reference_id: 'ref_123',
    data: {
      id: 'req_123456',
      form_id: 'form_123456',
      amount: '100.00',
      currency: 'USD',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      completed_at: '2024-01-01T00:30:00Z',
    },
  };

  const mockRequestsListResponse = {
    status: 'success',
    code: '200',
    message: 'Payment requests retrieved',
    reference_id: 'ref_123',
    data: {
      requests: [mockRequestResponse.data],
      total: 1,
      has_more: false,
    },
  };

  beforeEach(() => {
    // Create REAL client instance with mocked network only
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize payment forms resource', () => {
      expect(client.paymentForms).toBeDefined();
      expect(typeof client.paymentForms.createForm).toBe('function');
      expect(typeof client.paymentForms.getForm).toBe('function');
      expect(typeof client.paymentForms.updateForm).toBe('function');
      expect(typeof client.paymentForms.deleteForm).toBe('function');
      expect(typeof client.paymentForms.listForms).toBe('function');
      expect(typeof client.paymentForms.getRequest).toBe('function');
      expect(typeof client.paymentForms.listRequests).toBe('function');
      expect(typeof client.paymentForms.listRequestsByForm).toBe('function');
    });
  });

  describe('createForm', () => {
    it('should create a payment form successfully', async () => {
      const formData = {
        name: 'New Payment Form',
        description: 'Test form description',
        amount: '100.00',
        currency: 'USD',
        expiration: '2025-01-01T00:00:00Z',
      };

      mockSuccessfulResponse(mockFormResponse);

      const result = await client.paymentForms.createForm(formData);

      expectApiCall('POST', '/payments/forms', formData);
      expect(result).toEqual(mockFormResponse);
    });

    it('should propagate API errors', async () => {
      const formData = {
        name: 'Test Form',
      };

      const apiError = new QorPayApiError('Form creation failed', 400);
      mockFailedResponse('Form creation failed', 400);

      await expect(client.paymentForms.createForm(formData)).rejects.toThrow();
    });
  });

  describe('getForm', () => {
    it('should retrieve a payment form successfully', async () => {
      const formId = 'form_123456';

      mockSuccessfulResponse(mockFormResponse);

      const result = await client.paymentForms.getForm(formId);

      expectApiCall('GET', '/payments/forms/form_123456');
      expect(result).toEqual(mockFormResponse);
    });

    it('should propagate API errors', async () => {
      const formId = 'form_invalid';

      mockFailedResponse('Form not found', 404);

      await expect(client.paymentForms.getForm(formId)).rejects.toThrow();
    });
  });

  describe('updateForm', () => {
    it('should update a payment form successfully', async () => {
      const formId = 'form_123456';
      const updateData = {
        name: 'Updated Form Title',
        description: 'Updated description',
        amount: '150.00',
      };

      mockSuccessfulResponse(mockFormResponse);

      const result = await client.paymentForms.updateForm(formId, updateData);

      expectApiCall('PUT', '/payments/forms/form_123456', updateData);
      expect(result).toEqual(mockFormResponse);
    });

    it('should propagate API errors', async () => {
      const formId = 'form_invalid';
      const updateData = { name: 'Updated' };

      mockFailedResponse('Form not found', 404);

      await expect(
        client.paymentForms.updateForm(formId, updateData)
      ).rejects.toThrow();
    });
  });

  describe('listForms', () => {
    it('should list payment forms with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        status: 'active',
      };

      mockSuccessfulResponse(mockFormsListResponse);

      const result = await client.paymentForms.listForms(params);

      expectApiCall('GET', '/payments/forms', undefined, params);
      expect(result).toEqual(mockFormsListResponse);
    });

    it('should list payment forms without parameters', async () => {
      mockSuccessfulResponse(mockFormsListResponse);

      const result = await client.paymentForms.listForms();

      expectApiCall('GET', '/payments/forms');
      expect(result).toEqual(mockFormsListResponse);
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Failed to list forms', 500);

      await expect(client.paymentForms.listForms()).rejects.toThrow();
    });
  });

  describe('deleteForm', () => {
    it('should delete a payment form successfully', async () => {
      const formId = 'form_123456';
      const deleteResponse = {
        status: 'success',
        code: '200',
        message: 'Form deleted successfully',
      };

      mockSuccessfulResponse(deleteResponse);

      const result = await client.paymentForms.deleteForm(formId);

      expectApiCall('DELETE', '/payments/forms/form_123456');
      expect(result).toEqual(deleteResponse);
    });

    it('should propagate API errors', async () => {
      const formId = 'form_invalid';

      mockFailedResponse('Form not found', 404);

      await expect(client.paymentForms.deleteForm(formId)).rejects.toThrow();
    });
  });

  describe('getRequest', () => {
    it('should retrieve a payment request successfully', async () => {
      const requestId = 'req_123456';

      mockSuccessfulResponse(mockRequestResponse);

      const result = await client.paymentForms.getRequest(requestId);

      expectApiCall('GET', '/payments/requests/req_123456');
      expect(result).toEqual(mockRequestResponse);
    });

    it('should propagate API errors', async () => {
      const requestId = 'req_invalid';

      mockFailedResponse('Request not found', 404);

      await expect(client.paymentForms.getRequest(requestId)).rejects.toThrow();
    });
  });

  describe('listRequests', () => {
    it('should list payment requests with query parameters', async () => {
      const params = {
        limit: 20,
        offset: 0,
        status: 'completed',
      };

      mockSuccessfulResponse(mockRequestsListResponse);

      const result = await client.paymentForms.listRequests(params);

      expectApiCall('GET', '/payments/requests', undefined, params);
      expect(result).toEqual(mockRequestsListResponse);
    });

    it('should list payment requests without parameters', async () => {
      mockSuccessfulResponse(mockRequestsListResponse);

      const result = await client.paymentForms.listRequests();

      expectApiCall('GET', '/payments/requests');
      expect(result).toEqual(mockRequestsListResponse);
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Failed to list requests', 500);

      await expect(client.paymentForms.listRequests()).rejects.toThrow();
    });
  });

  describe('listRequestsByForm', () => {
    it('should list requests for a specific form with parameters', async () => {
      const formId = 'form_123456';
      const params = {
        limit: 15,
        offset: 0,
        status: 'pending',
      };

      mockSuccessfulResponse(mockRequestsListResponse);

      const result = await client.paymentForms.listRequestsByForm(
        formId,
        params
      );

      expectApiCall(
        'GET',
        '/payments/forms/form_123456/requests',
        undefined,
        params
      );
      expect(result).toEqual(mockRequestsListResponse);
    });

    it('should list requests for a form without parameters', async () => {
      const formId = 'form_123456';

      mockSuccessfulResponse(mockRequestsListResponse);

      const result = await client.paymentForms.listRequestsByForm(formId);

      expectApiCall('GET', '/payments/forms/form_123456/requests');
      expect(result).toEqual(mockRequestsListResponse);
    });

    it('should propagate API errors', async () => {
      const formId = 'form_invalid';

      mockFailedResponse('Form not found', 404);

      await expect(
        client.paymentForms.listRequestsByForm(formId)
      ).rejects.toThrow();
    });
  });
});
