/**
 * @file tests/unit/payment-forms.test.ts
 * @description Unit tests for the PaymentForms resource module
 */

import { PaymentForms } from '../../src/resources/payment-forms';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('PaymentForms', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let paymentForms: PaymentForms;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Create the PaymentForms instance with the mock client
    paymentForms = new PaymentForms(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createForm', () => {
    const mockCreateFormRequest = {
      name: 'Test Payment Form',
      description: 'A test payment form for unit testing',
      amount: '100.00',
      currency: 'USD',
      expiration: '2024-12-31T23:59:59Z',
      metadata: {
        source: 'api_test',
      },
    };

    const mockCreateFormResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Payment form created successfully',
      data: {
        id: 'form_123456',
        name: 'Test Payment Form',
        description: 'A test payment form for unit testing',
        status: 'active',
        url: 'https://pay.qorcommerce.io/form/form_123456',
        amount: '100.00',
        currency: 'USD',
        expiration: '2024-12-31T23:59:59Z',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z',
        metadata: {
          source: 'api_test',
        },
      },
    };

    it('should create a payment form successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockCreateFormResponse);

      // Call the method
      const result = await paymentForms.createForm(mockCreateFormRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/forms',
        mockCreateFormRequest
      );

      // Verify the result
      expect(result).toEqual(mockCreateFormResponse);
      expect(result.data.id).toBe('form_123456');
      expect(result.data.name).toBe('Test Payment Form');
      expect(result.data.status).toBe('active');
    });

    it('should handle API errors when creating a payment form', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError('Invalid form data', 400, 'GW01');
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentForms.createForm(mockCreateFormRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/payment/forms',
        mockCreateFormRequest
      );
    });
  });

  describe('getForm', () => {
    const mockFormId = 'form_123456';
    const mockGetFormResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        id: 'form_123456',
        name: 'Test Payment Form',
        description: 'A test payment form',
        status: 'active',
        url: 'https://pay.qorcommerce.io/form/form_123456',
        amount: '100.00',
        currency: 'USD',
        expiration: '2024-12-31T23:59:59Z',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z',
      },
    };

    it('should get a payment form successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockGetFormResponse);

      // Call the method
      const result = await paymentForms.getForm(mockFormId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/payment/forms/${mockFormId}`
      );

      // Verify the result
      expect(result).toEqual(mockGetFormResponse);
      expect(result.data.id).toBe(mockFormId);
    });

    it('should handle API errors when getting a payment form', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Payment form not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(paymentForms.getForm(mockFormId)).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/payment/forms/${mockFormId}`
      );
    });
  });

  describe('updateForm', () => {
    const mockFormId = 'form_123456';
    const mockUpdateFormRequest = {
      name: 'Updated Payment Form',
      status: 'inactive' as const,
      amount: '150.00',
    };

    const mockUpdateFormResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Payment form updated successfully',
      data: {
        id: 'form_123456',
        name: 'Updated Payment Form',
        description: 'A test payment form',
        status: 'inactive',
        url: 'https://pay.qorcommerce.io/form/form_123456',
        amount: '150.00',
        currency: 'USD',
        expiration: '2024-12-31T23:59:59Z',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-02T12:00:00Z',
      },
    };

    it('should update a payment form successfully', async () => {
      // Mock the put method to return a successful response
      mockClient.put.mockResolvedValue(mockUpdateFormResponse);

      // Call the method
      const result = await paymentForms.updateForm(
        mockFormId,
        mockUpdateFormRequest
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/payment/forms/${mockFormId}`,
        mockUpdateFormRequest
      );

      // Verify the result
      expect(result).toEqual(mockUpdateFormResponse);
      expect(result.data.name).toBe('Updated Payment Form');
      expect(result.data.status).toBe('inactive');
      expect(result.data.amount).toBe('150.00');
    });

    it('should handle API errors when updating a payment form', async () => {
      // Mock the put method to throw an API error
      const mockError = new QorPayApiError('Invalid update data', 400, 'GW01');
      mockClient.put.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentForms.updateForm(mockFormId, mockUpdateFormRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/payment/forms/${mockFormId}`,
        mockUpdateFormRequest
      );
    });
  });

  describe('listForms', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      status: 'active',
      created_start: '2023-01-01',
      created_end: '2023-01-31',
    };

    const mockListFormsResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        forms: [
          {
            id: 'form_123456',
            name: 'Test Payment Form 1',
            description: 'First test form',
            status: 'active',
            url: 'https://pay.qorcommerce.io/form/form_123456',
            amount: '100.00',
            currency: 'USD',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z',
          },
          {
            id: 'form_789012',
            name: 'Test Payment Form 2',
            description: 'Second test form',
            status: 'active',
            url: 'https://pay.qorcommerce.io/form/form_789012',
            amount: '200.00',
            currency: 'USD',
            created_at: '2023-01-15T12:00:00Z',
            updated_at: '2023-01-15T12:00:00Z',
          },
        ],
        meta: {
          count: 2,
          limit: 10,
          offset: 0,
        },
      },
    };

    it('should list payment forms successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockListFormsResponse);

      // Call the method with query parameters
      const result = await paymentForms.listForms(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/forms',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockListFormsResponse);
      expect(result.data.forms).toHaveLength(2);
      expect(result.data.forms[0].id).toBe('form_123456');
      expect(result.data.meta.count).toBe(2);
    });

    it('should list payment forms successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockListFormsResponse);

      // Call the method without query parameters
      const result = await paymentForms.listForms();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/payment/forms', undefined);

      // Verify the result
      expect(result).toEqual(mockListFormsResponse);
    });

    it('should handle API errors when listing payment forms', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Access denied', 403, 'GW03');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(paymentForms.listForms(mockQueryParams)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/forms',
        mockQueryParams
      );
    });
  });

  describe('deleteForm', () => {
    const mockFormId = 'form_123456';
    const mockDeleteFormResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Payment form deleted successfully',
    };

    it('should delete a payment form successfully', async () => {
      // Mock the delete method to return a successful response
      mockClient.delete.mockResolvedValue(mockDeleteFormResponse);

      // Call the method
      const result = await paymentForms.deleteForm(mockFormId);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/payment/forms/${mockFormId}`
      );

      // Verify the result
      expect(result).toEqual(mockDeleteFormResponse);
      expect(result.status).toBe('approved');
      expect(result.message).toBe('Payment form deleted successfully');
    });

    it('should handle API errors when deleting a payment form', async () => {
      // Mock the delete method to throw an API error
      const mockError = new QorPayApiError(
        'Payment form not found',
        404,
        'GW04'
      );
      mockClient.delete.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(paymentForms.deleteForm(mockFormId)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/payment/forms/${mockFormId}`
      );
    });
  });

  describe('getRequest', () => {
    const mockRequestId = 'req_123456';
    const mockGetRequestResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        id: 'req_123456',
        form_id: 'form_123456',
        status: 'pending',
        amount: '100.00',
        currency: 'USD',
        customer: {
          email: 'customer@example.com',
          name: 'John Doe',
          phone: '+15551234567',
        },
        expiration: '2024-01-15T23:59:59Z',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z',
        completed_at: null,
        transaction_id: null,
      },
    };

    it('should get a payment request successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockGetRequestResponse);

      // Call the method
      const result = await paymentForms.getRequest(mockRequestId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/payment/requests/${mockRequestId}`
      );

      // Verify the result
      expect(result).toEqual(mockGetRequestResponse);
      expect(result.data.id).toBe(mockRequestId);
      expect(result.data.status).toBe('pending');
    });

    it('should handle API errors when getting a payment request', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Payment request not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(paymentForms.getRequest(mockRequestId)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/payment/requests/${mockRequestId}`
      );
    });
  });

  describe('listRequests', () => {
    const mockQueryParams = {
      limit: 5,
      offset: 0,
      status: 'completed',
    };

    const mockListRequestsResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        requests: [
          {
            id: 'req_123456',
            form_id: 'form_123456',
            status: 'completed',
            amount: '100.00',
            currency: 'USD',
            customer: {
              email: 'customer1@example.com',
              name: 'John Doe',
            },
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T13:00:00Z',
            completed_at: '2023-01-01T13:00:00Z',
            transaction_id: 'txn_123456',
          },
        ],
        meta: {
          count: 1,
          limit: 5,
          offset: 0,
        },
      },
    };

    it('should list payment requests successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockListRequestsResponse);

      // Call the method
      const result = await paymentForms.listRequests(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/payment/requests',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockListRequestsResponse);
      expect(result.data.requests).toHaveLength(1);
      expect(result.data.requests[0].status).toBe('completed');
    });

    it('should handle API errors when listing payment requests', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Access denied', 403, 'GW03');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(paymentForms.listRequests(mockQueryParams)).rejects.toThrow(
        mockError
      );
    });
  });

  describe('listRequestsByForm', () => {
    const mockFormId = 'form_123456';
    const mockQueryParams = {
      limit: 5,
      offset: 0,
    };

    const mockListRequestsByFormResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        requests: [
          {
            id: 'req_123456',
            form_id: 'form_123456',
            status: 'pending',
            amount: '100.00',
            currency: 'USD',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z',
          },
        ],
        meta: {
          count: 1,
          limit: 5,
          offset: 0,
        },
      },
    };

    it('should list payment requests by form successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockListRequestsByFormResponse);

      // Call the method
      const result = await paymentForms.listRequestsByForm(
        mockFormId,
        mockQueryParams
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/payment/forms/${mockFormId}/requests`,
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockListRequestsByFormResponse);
      expect(result.data.requests[0].form_id).toBe(mockFormId);
    });

    it('should handle API errors when listing payment requests by form', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Form not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentForms.listRequestsByForm(mockFormId, mockQueryParams)
      ).rejects.toThrow(mockError);
    });
  });
});
