/**
 * @file src/resources/customers.ts
 * @description Customers resource for managing QorPay customer profiles.
 */

import type { BaseClient } from '../client/base-client';
import type {
  CustomerId,
  QueryParams,
  BaseQorPayResponse,
} from '../types/common';

import type {
  CustomerRequest,
  CustomerResponse,
  CustomerListQueryParams,
  CustomerListResponse,
} from '../types/customers';

/**
 * Resource class for managing customer profiles
 */
import {
  CustomerRequestSchema,
  CustomerListQueryParamsSchema,
} from '../schemas';

export class Customers {
  private client: BaseClient;

  /**
   * Creates a new Customers instance
   *
   * @param client - The BaseClient instance to use for API calls
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Create a new customer profile
   *
   * @param requestBody - The customer details
   * @returns Promise resolving to the created customer
   */
  public async createCustomer(
    requestBody: CustomerRequest
  ): Promise<CustomerResponse> {
    const validatedData = CustomerRequestSchema.parse(requestBody);
    return this.client.post<CustomerResponse, CustomerRequest>(
      '/customers',
      validatedData as CustomerRequest
    );
  }

  /**
   * Update an existing customer profile
   *
   * @param customerId - The ID of the customer to update
   * @param requestBody - The updated customer details
   * @returns Promise resolving to the updated customer
   */
  public async updateCustomer(
    customerId: CustomerId,
    requestBody: CustomerRequest
  ): Promise<CustomerResponse> {
    const validatedData = CustomerRequestSchema.parse(requestBody);
    return this.client.patch<CustomerResponse, CustomerRequest>(
      `/customers/${customerId}`,
      validatedData as CustomerRequest
    );
  }

  /**
   * List customers with optional filtering
   *
   * @param params - Query parameters for filtering customers
   * @returns Promise resolving to a list of customers
   */
  public async listCustomers(
    params?: CustomerListQueryParams
  ): Promise<CustomerListResponse> {
    if (params) {
      CustomerListQueryParamsSchema.parse(params);
    }
    return this.client.get<CustomerListResponse>(
      '/customers',
      params as QueryParams
    );
  }

  /**
   * Fetch a specific customer by ID
   *
   * @param customerId - The ID of the customer to fetch
   * @returns Promise resolving to the customer details
   */
  public async fetchCustomer(
    customerId: CustomerId
  ): Promise<CustomerResponse> {
    return this.client.get<CustomerResponse>(`/customers/${customerId}`);
  }

  /**
   * Delete a customer profile
   *
   * @param customerId - The ID of the customer to delete
   * @returns Promise resolving to the deletion status
   */
  public async deleteCustomer(
    customerId: CustomerId
  ): Promise<BaseQorPayResponse> {
    return this.client.delete<BaseQorPayResponse>(`/customers/${customerId}`);
  }

  /**
   * Get a customer's saved payment methods
   *
   * @param customerId - The ID of the customer
   * @returns Promise resolving to the customer's payment methods
   */
  public async getCustomerPaymentMethods(
    customerId: CustomerId
  ): Promise<BaseQorPayResponse> {
    return this.client.get<BaseQorPayResponse>(
      `/customers/${customerId}/payment-methods`
    );
  }
}
