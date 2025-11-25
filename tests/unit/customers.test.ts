/**
 * @file tests/unit/customers.test.ts
 * @description Unit tests for Customers resource class
 */

import { Customers } from '../../src/resources/customers';
import { BaseClient } from '../../src/client/base-client';
import type {
  CustomerRequest,
  CustomerResponse,
  CustomerListQueryParams,
  CustomerListResponse,
} from '../../src/types/customers';
import type { BaseQorPayResponse } from '../../src/types/common';

// Mock dependencies
jest.mock('../../src/client/base-client');
jest.mock('../../src/schemas', () => ({
  CustomerRequestSchema: {
    parse: jest.fn((data) => data),
  },
  CustomerListQueryParamsSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('Customers', () => {
  let customers: Customers;
  let mockClient: jest.Mocked<BaseClient>;

  const mockCustomerResponse: CustomerResponse = {
    customer_id: 'cust_123',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockCustomerListResponse: CustomerListResponse = {
    customers: [mockCustomerResponse],
    total_count: 1,
    has_more: false,
  };

  const mockBaseResponse: BaseQorPayResponse = {
    status: 'success',
    message: 'Operation completed successfully',
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    customers = new Customers(mockClient);
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a new customer successfully', async () => {
      const customerData: CustomerRequest = {
        email: 'new@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567890',
      };

      mockClient.post.mockResolvedValue(mockCustomerResponse);

      const result = await customers.createCustomer(customerData);

      expect(mockClient.post).toHaveBeenCalledWith('/customers', customerData);
      expect(result).toEqual(mockCustomerResponse);
    });

    it('should handle optional fields', async () => {
      const customerData: CustomerRequest = {
        first_name: 'Tom',
        last_name: 'Wilson',
        // email is optional
      };

      mockClient.post.mockResolvedValue(mockCustomerResponse);

      await customers.createCustomer(customerData);

      expect(mockClient.post).toHaveBeenCalledWith('/customers', customerData);
    });
  });

  describe('updateCustomer', () => {
    it('should update an existing customer successfully', async () => {
      const customerId = 'cust_123';
      const updateData: CustomerRequest = {
        email: 'updated@example.com',
        first_name: 'John',
        last_name: 'DoeUpdated',
      };

      mockClient.patch.mockResolvedValue(mockCustomerResponse);

      const result = await customers.updateCustomer(customerId, updateData);

      expect(mockClient.patch).toHaveBeenCalledWith(
        `/customers/${customerId}`,
        updateData
      );
      expect(result).toEqual(mockCustomerResponse);
    });

    it('should handle partial updates', async () => {
      const customerId = 'cust_123';
      const updateData: CustomerRequest = {
        phone: '+1987654321',
      };

      mockClient.patch.mockResolvedValue(mockCustomerResponse);

      await customers.updateCustomer(customerId, updateData);

      expect(mockClient.patch).toHaveBeenCalledWith(
        `/customers/${customerId}`,
        updateData
      );
    });
  });

  describe('listCustomers', () => {
    it('should list customers without filters', async () => {
      mockClient.get.mockResolvedValue(mockCustomerListResponse);

      const result = await customers.listCustomers();

      expect(mockClient.get).toHaveBeenCalledWith('/customers', undefined);
      expect(result).toEqual(mockCustomerListResponse);
    });

    it('should list customers with filters', async () => {
      const queryParams: CustomerListQueryParams = {
        limit: 10,
        offset: 0,
        email: 'test@example.com',
      };

      mockClient.get.mockResolvedValue(mockCustomerListResponse);

      const result = await customers.listCustomers(queryParams);

      expect(mockClient.get).toHaveBeenCalledWith('/customers', queryParams);
      expect(result).toEqual(mockCustomerListResponse);
    });

    it('should validate query parameters when provided', async () => {
      const queryParams: CustomerListQueryParams = {
        limit: 50,
        created_after: '2024-01-01T00:00:00Z',
      };

      mockClient.get.mockResolvedValue(mockCustomerListResponse);

      await customers.listCustomers(queryParams);

      const { CustomerListQueryParamsSchema } = require('../../src/schemas');
      expect(CustomerListQueryParamsSchema.parse).toHaveBeenCalledWith(
        queryParams
      );
    });
  });

  describe('fetchCustomer', () => {
    it('should fetch a specific customer by ID', async () => {
      const customerId = 'cust_123';

      mockClient.get.mockResolvedValue(mockCustomerResponse);

      const result = await customers.fetchCustomer(customerId);

      expect(mockClient.get).toHaveBeenCalledWith(`/customers/${customerId}`);
      expect(result).toEqual(mockCustomerResponse);
    });

    it('should handle special characters in customer ID', async () => {
      const customerId = 'cust_abc-123_def';

      mockClient.get.mockResolvedValue(mockCustomerResponse);

      await customers.fetchCustomer(customerId);

      expect(mockClient.get).toHaveBeenCalledWith(`/customers/${customerId}`);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer successfully', async () => {
      const customerId = 'cust_123';

      mockClient.delete.mockResolvedValue(mockBaseResponse);

      const result = await customers.deleteCustomer(customerId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/customers/${customerId}`
      );
      expect(result).toEqual(mockBaseResponse);
    });
  });

  describe('getCustomerPaymentMethods', () => {
    it('should fetch customer payment methods', async () => {
      const customerId = 'cust_123';
      const mockPaymentMethodsResponse = {
        payment_methods: [
          {
            id: 'pm_123',
            type: 'card',
            last4: '4242',
            brand: 'visa',
          },
        ],
        total_count: 1,
      };

      mockClient.get.mockResolvedValue(mockPaymentMethodsResponse);

      const result = await customers.getCustomerPaymentMethods(customerId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/customers/${customerId}/payment-methods`
      );
      expect(result).toEqual(mockPaymentMethodsResponse);
    });

    it('should handle empty payment methods list', async () => {
      const customerId = 'cust_456';
      const mockEmptyResponse = {
        payment_methods: [],
        total_count: 0,
      };

      mockClient.get.mockResolvedValue(mockEmptyResponse);

      const result = await customers.getCustomerPaymentMethods(customerId);

      expect(result).toEqual(mockEmptyResponse);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/customers/${customerId}/payment-methods`
      );
    });
  });

  describe('error handling', () => {
    it('should propagate API errors from createCustomer', async () => {
      const customerData: CustomerRequest = {
        email: 'test@example.com',
        first_name: 'Error',
        last_name: 'Test',
      };

      const apiError = new Error('Customer already exists');
      mockClient.post.mockRejectedValue(apiError);

      await expect(customers.createCustomer(customerData)).rejects.toThrow(
        apiError
      );
    });

    it('should propagate API errors from fetchCustomer', async () => {
      const customerId = 'nonexistent';

      const apiError = new Error('Customer not found');
      mockClient.get.mockRejectedValue(apiError);

      await expect(customers.fetchCustomer(customerId)).rejects.toThrow(
        apiError
      );
    });

    it('should propagate API errors from updateCustomer', async () => {
      const customerId = 'cust_123';
      const updateData: CustomerRequest = {
        email: 'invalid-email',
      };

      const validationError = new Error('Validation failed');
      mockClient.patch.mockRejectedValue(validationError);

      await expect(
        customers.updateCustomer(customerId, updateData)
      ).rejects.toThrow(validationError);
    });
  });

  describe('URL construction', () => {
    it('should properly encode customer IDs in URLs', async () => {
      const customerId = 'cust/with/slashes';

      mockClient.get.mockResolvedValue(mockCustomerResponse);

      await customers.fetchCustomer(customerId);

      expect(mockClient.get).toHaveBeenCalledWith(`/customers/${customerId}`);
    });

    it('should handle numeric customer IDs', async () => {
      const customerId = '12345';

      mockClient.get.mockResolvedValue(mockCustomerResponse);

      await customers.fetchCustomer(customerId);

      expect(mockClient.get).toHaveBeenCalledWith(`/customers/${customerId}`);
    });
  });
});
