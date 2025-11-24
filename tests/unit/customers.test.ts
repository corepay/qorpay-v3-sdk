/**
 * @file tests/unit/customers.test.ts
 * @description Unit tests for the Customers resource module
 */

import { Customers } from '../../src/resources/customers';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('Customers', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let customers: Customers;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Create the Customers instance with the mock client
    customers = new Customers(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    const mockCustomerRequest = {
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+15551234567',
      address1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postal_code: '12345',
      country: 'US',
      metadata: {
        source: 'web',
        user_id: '12345',
      },
    };

    const mockCustomerResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Customer created successfully',
      data: {
        id: 'cust_123456',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+15551234567',
        address1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postal_code: '12345',
        country: 'US',
        created_at: '2023-01-01T12:00:00Z',
        metadata: {
          source: 'web',
          user_id: '12345',
        },
      },
    };

    it('should create a customer successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockCustomerResponse);

      // Call the method
      const result = await customers.createCustomer(mockCustomerRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/customers',
        mockCustomerRequest
      );

      // Verify the result
      expect(result).toEqual(mockCustomerResponse);
      expect(result.data.id).toBe('cust_123456');
      expect(result.data.email).toBe(mockCustomerRequest.email);
    });

    it('should handle API errors when creating a customer', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError('Email already exists', 400, 'GW01');
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        customers.createCustomer(mockCustomerRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/customers',
        mockCustomerRequest
      );
    });
  });

  describe('updateCustomer', () => {
    const mockCustomerId = 'cust_123456';
    const mockCustomerRequest = {
      email: 'john.updated@example.com',
      phone: '+15559876543',
      address1: '456 New St',
      city: 'Newtown',
      state: 'NY',
      postal_code: '54321',
      country: 'US',
    };

    const mockCustomerResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Customer updated successfully',
      data: {
        id: 'cust_123456',
        email: 'john.updated@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+15559876543',
        address1: '456 New St',
        city: 'Newtown',
        state: 'NY',
        postal_code: '54321',
        country: 'US',
        updated_at: '2023-01-02T12:00:00Z',
      },
    };

    it('should update a customer successfully', async () => {
      // Mock the patch method to return a successful response
      mockClient.patch.mockResolvedValue(mockCustomerResponse);

      // Call the method
      const result = await customers.updateCustomer(
        mockCustomerId,
        mockCustomerRequest
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.patch).toHaveBeenCalledWith(
        `/customers/${mockCustomerId}`,
        mockCustomerRequest
      );

      // Verify the result
      expect(result).toEqual(mockCustomerResponse);
      expect(result.data.id).toBe(mockCustomerId);
      expect(result.data.email).toBe(mockCustomerRequest.email);
      expect(result.data.city).toBe(mockCustomerRequest.city);
    });

    it('should handle API errors when updating a customer', async () => {
      // Mock the patch method to throw an API error
      const mockError = new QorPayApiError('Customer not found', 404, 'GW04');
      mockClient.patch.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        customers.updateCustomer(mockCustomerId, mockCustomerRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.patch).toHaveBeenCalledWith(
        `/customers/${mockCustomerId}`,
        mockCustomerRequest
      );
    });
  });

  describe('listCustomers', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      email: 'john.doe@example.com',
    };

    const mockCustomerListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        customers: [
          {
            id: 'cust_123456',
            email: 'john.doe@example.com',
            first_name: 'John',
            last_name: 'Doe',
            created_at: '2023-01-01T12:00:00Z',
          },
          {
            id: 'cust_789012',
            email: 'jane.doe@example.com',
            first_name: 'Jane',
            last_name: 'Doe',
            created_at: '2023-01-02T12:00:00Z',
          },
        ],
        count: 2,
        total: 2,
      },
    };

    it('should list customers successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockCustomerListResponse);

      // Call the method with query parameters
      const result = await customers.listCustomers(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/customers',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockCustomerListResponse);
      expect(result.data.customers).toHaveLength(2);
      expect(result.data.customers[0].id).toBe('cust_123456');
    });

    it('should list customers successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockCustomerListResponse);

      // Call the method without query parameters
      const result = await customers.listCustomers();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/customers', undefined);

      // Verify the result
      expect(result).toEqual(mockCustomerListResponse);
    });

    it('should handle API errors when listing customers', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid query parameters',
        400,
        'GW01'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(customers.listCustomers(mockQueryParams)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/customers',
        mockQueryParams
      );
    });
  });

  describe('fetchCustomer', () => {
    const mockCustomerId = 'cust_123456';
    const mockCustomerResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        id: 'cust_123456',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+15551234567',
        address: {
          line1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postal_code: '12345',
          country: 'US',
        },
        created_at: '2023-01-01T12:00:00Z',
      },
    };

    it('should fetch a customer successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockCustomerResponse);

      // Call the method
      const result = await customers.fetchCustomer(mockCustomerId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/customers/${mockCustomerId}`
      );

      // Verify the result
      expect(result).toEqual(mockCustomerResponse);
      expect(result.data.id).toBe(mockCustomerId);
    });

    it('should handle API errors when fetching a customer', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Customer not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(customers.fetchCustomer(mockCustomerId)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/customers/${mockCustomerId}`
      );
    });
  });

  describe('deleteCustomer', () => {
    const mockCustomerId = 'cust_123456';
    const mockDeleteResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Customer deleted successfully',
      data: {
        deleted: true,
        id: 'cust_123456',
      },
    };

    it('should delete a customer successfully', async () => {
      // Mock the delete method to return a successful response
      mockClient.delete.mockResolvedValue(mockDeleteResponse);

      // Call the method
      const result = await customers.deleteCustomer(mockCustomerId);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/customers/${mockCustomerId}`
      );

      // Verify the result
      expect(result).toEqual(mockDeleteResponse);
      // @ts-expect-error Accessing nested data property that might not be typed
      expect(result.data.deleted).toBe(true);
      // @ts-expect-error Accessing nested data property that might not be typed
      expect(result.data.id).toBe(mockCustomerId);
    });

    it('should handle API errors when deleting a customer', async () => {
      // Mock the delete method to throw an API error
      const mockError = new QorPayApiError('Customer not found', 404, 'GW04');
      mockClient.delete.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(customers.deleteCustomer(mockCustomerId)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/customers/${mockCustomerId}`
      );
    });
  });

  describe('getCustomerPaymentMethods', () => {
    const mockCustomerId = 'cust_123456';
    const mockPaymentMethodsResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        payment_methods: [
          {
            id: 'pm_123456',
            type: 'card',
            card: {
              brand: 'visa',
              last4: '1111',
              exp_month: '12',
              exp_year: '25',
            },
            created_at: '2023-01-01T12:00:00Z',
          },
          {
            id: 'pm_789012',
            type: 'ach',
            ach: {
              account_type: 'checking',
              last4: '6789',
              routing: '021000021',
            },
            created_at: '2023-01-02T12:00:00Z',
          },
        ],
        count: 2,
      },
    };

    it('should get customer payment methods successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockPaymentMethodsResponse);

      // Call the method
      const result = await customers.getCustomerPaymentMethods(mockCustomerId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/customers/${mockCustomerId}/payment-methods`
      );

      // Verify the result
      expect(result).toEqual(mockPaymentMethodsResponse);
      // @ts-expect-error Accessing nested payment_methods array that might not be typed
      expect(result.data.payment_methods).toHaveLength(2);
      // @ts-expect-error Accessing payment method properties that might not be typed
      expect(result.data.payment_methods[0].type).toBe('card');
      // @ts-expect-error Accessing payment method properties that might not be typed
      expect(result.data.payment_methods[1].type).toBe('ach');
    });

    it('should handle API errors when getting customer payment methods', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Customer not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        customers.getCustomerPaymentMethods(mockCustomerId)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/customers/${mockCustomerId}/payment-methods`
      );
    });
  });
});
