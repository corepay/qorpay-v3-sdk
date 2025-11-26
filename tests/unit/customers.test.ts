/**
 * @file tests/unit/customers.test.ts
 * @description Tests for Customers resource class using real instances
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

describe('Customers', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockCustomerResponse = {
    status: 'success',
    code: '200',
    message: 'Customer created successfully',
    data: {
      customer_id: 'cust_123',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      created_at: '2023-01-01T00:00:00Z',
    },
  };

  const mockCustomerListResponse = {
    status: 'success',
    code: '200',
    message: 'Customers retrieved successfully',
    data: {
      customers: [
        {
          customer_id: 'cust_123',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
        },
        {
          customer_id: 'cust_456',
          email: 'jane@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
        },
      ],
      pagination: {
        page: 1,
        per_page: 25,
        total: 2,
      },
    },
  };

  const mockPaymentMethodsResponse = {
    status: 'success',
    code: '200',
    message: 'Payment methods retrieved successfully',
    data: {
      payment_methods: [
        {
          method_id: 'pm_123',
          type: 'card',
          last4: '4242',
          brand: 'visa',
        },
        {
          method_id: 'pm_456',
          type: 'bank_account',
          last4: '6789',
        },
      ],
    },
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a new customer successfully', async () => {
      const customerData = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+15551234567',
      };

      mockSuccessfulResponse(mockCustomerResponse);

      const result = await client.customers.createCustomer(customerData);

      expect(result).toEqual(mockCustomerResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/customers',
          data: expect.objectContaining({
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            phone: '+15551234567',
          }),
        })
      );
    });

    it('should handle optional fields', async () => {
      const customerData = {
        email: 'minimal@example.com',
        first_name: 'Minimal',
      };

      mockSuccessfulResponse(mockCustomerResponse);

      const result = await client.customers.createCustomer(customerData);

      expect(result).toEqual(mockCustomerResponse);
    });
  });

  describe('updateCustomer', () => {
    it('should update an existing customer successfully', async () => {
      const customerId = 'cust_123';
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        phone: '+15559876543',
      };

      mockSuccessfulResponse(mockCustomerResponse);

      const result = await client.customers.updateCustomer(
        customerId,
        updateData
      );

      expect(result).toEqual(mockCustomerResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: `/customers/${customerId}`,
          data: expect.objectContaining({
            first_name: 'Updated',
            last_name: 'Name',
            phone: '+15559876543',
          }),
        })
      );
    });

    it('should handle partial updates', async () => {
      const customerId = 'cust_123';
      const updateData = {
        email: 'updated@example.com',
      };

      mockSuccessfulResponse(mockCustomerResponse);

      const result = await client.customers.updateCustomer(
        customerId,
        updateData
      );

      expect(result).toEqual(mockCustomerResponse);
    });
  });

  describe('listCustomers', () => {
    it('should list customers without filters', async () => {
      mockSuccessfulResponse(mockCustomerListResponse);

      const result = await client.customers.listCustomers();

      expect(result).toEqual(mockCustomerListResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/customers',
        })
      );
    });

    it('should list customers with filters', async () => {
      const filters = {
        page: 2,
        per_page: 10,
        search: 'john',
      };

      mockSuccessfulResponse(mockCustomerListResponse);

      const result = await client.customers.listCustomers(filters);

      expect(result).toEqual(mockCustomerListResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/customers',
          params: filters,
        })
      );
    });

    it('should validate query parameters when provided', async () => {
      const filters = {
        page: 1,
        per_page: 50,
        email: 'test@example.com',
      };

      mockSuccessfulResponse(mockCustomerListResponse);

      const result = await client.customers.listCustomers(filters);

      expect(result).toEqual(mockCustomerListResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/customers',
          params: filters,
        })
      );
    });
  });

  describe('fetchCustomer', () => {
    it('should fetch a specific customer by ID', async () => {
      const customerId = 'cust_123';

      mockSuccessfulResponse(mockCustomerResponse);

      const result = await client.customers.fetchCustomer(customerId);

      expect(result).toEqual(mockCustomerResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/customers/${customerId}`,
        })
      );
    });

    it('should handle special characters in customer ID', async () => {
      const customerId = 'cust_123/with/special#chars';

      mockSuccessfulResponse(mockCustomerResponse);

      const result = await client.customers.fetchCustomer(customerId);

      expect(result).toEqual(mockCustomerResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/customers/${customerId}`,
        })
      );
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer successfully', async () => {
      const customerId = 'cust_123';

      mockSuccessfulResponse({
        status: 'success',
        message: 'Customer deleted',
      });

      const result = await client.customers.deleteCustomer(customerId);

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: `/customers/${customerId}`,
        })
      );
    });
  });

  describe('getCustomerPaymentMethods', () => {
    it('should fetch customer payment methods', async () => {
      const customerId = 'cust_123';

      mockSuccessfulResponse(mockPaymentMethodsResponse);

      const result =
        await client.customers.getCustomerPaymentMethods(customerId);

      expect(result).toEqual(mockPaymentMethodsResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/customers/${customerId}/payment-methods`,
        })
      );
    });

    it('should handle empty payment methods list', async () => {
      const customerId = 'cust_456';
      const emptyResponse = {
        status: 'success',
        data: { payment_methods: [] },
      };

      mockSuccessfulResponse(emptyResponse);

      const result =
        await client.customers.getCustomerPaymentMethods(customerId);

      expect(result.data.payment_methods).toEqual([]);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/customers/${customerId}/payment-methods`,
        })
      );
    });
  });

  describe('error handling', () => {
    it('should propagate API errors from createCustomer', async () => {
      const customerData = {
        email: 'invalid-email',
        first_name: 'John',
      };

      mockFailedResponse('Invalid email format', 400);

      await expect(
        client.customers.createCustomer(customerData)
      ).rejects.toThrow();
    });

    it('should propagate API errors from fetchCustomer', async () => {
      mockFailedResponse('Customer not found', 404);

      await expect(
        client.customers.fetchCustomer('invalid-customer')
      ).rejects.toThrow();
    });

    it('should propagate API errors from updateCustomer', async () => {
      const customerId = 'nonexistent';
      const updateData = { first_name: 'Updated' };

      mockFailedResponse('Customer not found', 404);

      await expect(
        client.customers.updateCustomer(customerId, updateData)
      ).rejects.toThrow();
    });
  });

  describe('URL construction', () => {
    it('should properly encode customer IDs in URLs', async () => {
      const customerId = 'cust_123/with/slashes';

      mockSuccessfulResponse(mockCustomerResponse);

      await client.customers.fetchCustomer(customerId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/customers/${customerId}`,
        })
      );
    });

    it('should handle numeric customer IDs', async () => {
      const customerId = '123456789';

      mockSuccessfulResponse(mockCustomerResponse);

      await client.customers.fetchCustomer(customerId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/customers/${customerId}`,
        })
      );
    });
  });
});
