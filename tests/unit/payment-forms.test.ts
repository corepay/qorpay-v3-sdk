/**
 * @file tests/unit/payment-forms.test.ts
 * @description Unit tests for PaymentForms resource class
 */

import { PaymentForms } from '../../src/resources/payment-forms';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('PaymentForms', () => {
  let paymentForms: PaymentForms;
  let mockClient: jest.Mocked<BaseClient>;

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
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    paymentForms = new PaymentForms(mockClient);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with BaseClient instance', () => {
      expect(paymentForms['client']).toBe(mockClient);
      expect(paymentForms['basePath']).toBe('/payments/forms');
      expect(paymentForms['requestsPath']).toBe('/payments/requests');
    });
  });

  describe('createForm', () => {
    it('should create a payment form successfully', async () => {
      const formData = {
        title: 'New Payment Form',
        description: 'Test form description',
        amount: '100.00',
        currency: 'USD',
        expires_at: '2025-01-01T00:00:00Z',
      };

      mockClient.post.mockResolvedValue(mockFormResponse);

      const result = await paymentForms.createForm(formData);

      expect(mockClient.post).toHaveBeenCalledWith('/payments/forms', formData);
      expect(result).toEqual(mockFormResponse);
    });

    it('should propagate API errors', async () => {
      const formData = {
        title: 'Test Form',
      };

      const apiError = new QorPayApiError('Form creation failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(paymentForms.createForm(formData)).rejects.toThrow(apiError);
    });
  });

  describe('getForm', () => {
    it('should retrieve a payment form successfully', async () => {
      const formId = 'form_123456';

      mockClient.get.mockResolvedValue(mockFormResponse);

      const result = await paymentForms.getForm(formId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/forms/form_123456'
      );
      expect(result).toEqual(mockFormResponse);
    });

    it('should propagate API errors', async () => {
      const formId = 'form_invalid';

      const apiError = new QorPayApiError('Form not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentForms.getForm(formId)).rejects.toThrow(apiError);
    });
  });

  describe('updateForm', () => {
    it('should update a payment form successfully', async () => {
      const formId = 'form_123456';
      const updateData = {
        title: 'Updated Form Title',
        description: 'Updated description',
        amount: '150.00',
      };

      mockClient.put.mockResolvedValue(mockFormResponse);

      const result = await paymentForms.updateForm(formId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/payments/forms/form_123456',
        updateData
      );
      expect(result).toEqual(mockFormResponse);
    });

    it('should propagate API errors', async () => {
      const formId = 'form_invalid';
      const updateData = { title: 'Updated' };

      const apiError = new QorPayApiError('Form not found', 404);
      mockClient.put.mockRejectedValue(apiError);

      await expect(paymentForms.updateForm(formId, updateData)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('listForms', () => {
    it('should list payment forms with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        status: 'active',
      };

      mockClient.get.mockResolvedValue(mockFormsListResponse);

      const result = await paymentForms.listForms(params);

      expect(mockClient.get).toHaveBeenCalledWith('/payments/forms', params);
      expect(result).toEqual(mockFormsListResponse);
    });

    it('should list payment forms without parameters', async () => {
      mockClient.get.mockResolvedValue(mockFormsListResponse);

      const result = await paymentForms.listForms();

      expect(mockClient.get).toHaveBeenCalledWith('/payments/forms', undefined);
      expect(result).toEqual(mockFormsListResponse);
    });

    it('should propagate API errors', async () => {
      const apiError = new QorPayApiError('Failed to list forms', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentForms.listForms()).rejects.toThrow(apiError);
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

      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await paymentForms.deleteForm(formId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/payments/forms/form_123456'
      );
      expect(result).toEqual(deleteResponse);
    });

    it('should propagate API errors', async () => {
      const formId = 'form_invalid';

      const apiError = new QorPayApiError('Form not found', 404);
      mockClient.delete.mockRejectedValue(apiError);

      await expect(paymentForms.deleteForm(formId)).rejects.toThrow(apiError);
    });
  });

  describe('getRequest', () => {
    it('should retrieve a payment request successfully', async () => {
      const requestId = 'req_123456';

      mockClient.get.mockResolvedValue(mockRequestResponse);

      const result = await paymentForms.getRequest(requestId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/requests/req_123456'
      );
      expect(result).toEqual(mockRequestResponse);
    });

    it('should propagate API errors', async () => {
      const requestId = 'req_invalid';

      const apiError = new QorPayApiError('Request not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentForms.getRequest(requestId)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('listRequests', () => {
    it('should list payment requests with query parameters', async () => {
      const params = {
        limit: 20,
        offset: 0,
        status: 'completed',
      };

      mockClient.get.mockResolvedValue(mockRequestsListResponse);

      const result = await paymentForms.listRequests(params);

      expect(mockClient.get).toHaveBeenCalledWith('/payments/requests', params);
      expect(result).toEqual(mockRequestsListResponse);
    });

    it('should list payment requests without parameters', async () => {
      mockClient.get.mockResolvedValue(mockRequestsListResponse);

      const result = await paymentForms.listRequests();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/requests',
        undefined
      );
      expect(result).toEqual(mockRequestsListResponse);
    });

    it('should propagate API errors', async () => {
      const apiError = new QorPayApiError('Failed to list requests', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentForms.listRequests()).rejects.toThrow(apiError);
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

      mockClient.get.mockResolvedValue(mockRequestsListResponse);

      const result = await paymentForms.listRequestsByForm(formId, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/forms/form_123456/requests',
        params
      );
      expect(result).toEqual(mockRequestsListResponse);
    });

    it('should list requests for a form without parameters', async () => {
      const formId = 'form_123456';

      mockClient.get.mockResolvedValue(mockRequestsListResponse);

      const result = await paymentForms.listRequestsByForm(formId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/payments/forms/form_123456/requests',
        undefined
      );
      expect(result).toEqual(mockRequestsListResponse);
    });

    it('should propagate API errors', async () => {
      const formId = 'form_invalid';

      const apiError = new QorPayApiError('Form not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentForms.listRequestsByForm(formId)).rejects.toThrow(
        apiError
      );
    });
  });
});
