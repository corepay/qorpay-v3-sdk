/**
 * @file tests/unit/channels.test.ts
 * @description Unit tests for the Channels resource module
 */

import { Channels } from '../../src/resources/channels';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('Channels', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let channels: Channels;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    }) as jest.Mocked<BaseClient>;

    // Create the Channels instance with the mock client
    channels = new Channels(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMerchant', () => {
    const mockMerchantRequest = {
      business_name: 'Test Business',
      business_type: 'corporation',
      business_description: 'Test business description',
      website: 'https://testbusiness.com',
      business_address: {
        address1: '123 Business St',
        city: 'Business City',
        state: 'CA',
        postal_code: '12345',
        country: 'US'
      },
      contact_info: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@testbusiness.com',
        phone: '+15551234567'
      },
      tax_id: '123456789',
      owners: [{
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@testbusiness.com',
        phone: '+15551234567',
        title: 'CEO',
        ownership_percentage: 100,
        dob: '1980-01-01',
        ssn_last_four: '1234'
      }],
      bank_accounts: [{
        account_number: '123456789',
        routing_number: '021000021',
        account_type: 'checking' as const,
        account_holder_name: 'Test Business'
      }]
    };

    const mockMerchantResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Merchant created successfully',
      data: {
        merchant: {
          mid: 'mid_123456',
          name: 'Test Business',
          email: 'john@testbusiness.com',
          phone: '+15551234567',
          status: 'active',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z'
        }
      }
    };

    it('should create a merchant successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockMerchantResponse);

      // Call the method
      const result = await channels.createMerchant(mockMerchantRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/channel/merchants',
        mockMerchantRequest
      );

      // Verify the result
      expect(result).toEqual(mockMerchantResponse);
      expect(result.data.merchant.mid).toBe('mid_123456');
      expect(result.data.merchant.name).toBe('Test Business');
    });

    it('should handle API errors when creating a merchant', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid merchant data',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.createMerchant(mockMerchantRequest)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/channel/merchants',
        mockMerchantRequest
      );
    });
  });

  describe('getMerchant', () => {
    const mockMid = 'mid_123456';
    const mockMerchantResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        merchant: {
          mid: 'mid_123456',
          name: 'Test Business',
          email: 'john@testbusiness.com',
          phone: '+15551234567',
          status: 'active',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-01T12:00:00Z'
        }
      }
    };

    it('should get a merchant successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockMerchantResponse);

      // Call the method
      const result = await channels.getMerchant(mockMid);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/channel/merchants/${mockMid}`
      );

      // Verify the result
      expect(result).toEqual(mockMerchantResponse);
      expect(result.data.merchant.mid).toBe(mockMid);
    });

    it('should handle API errors when getting a merchant', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Merchant not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.getMerchant(mockMid)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/channel/merchants/${mockMid}`
      );
    });
  });

  describe('updateMerchant', () => {
    const mockMid = 'mid_123456';
    const mockUpdateData = {
      business_name: 'Updated Business Name',
      website: 'https://updatedbusiness.com'
    };

    const mockUpdateResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Merchant updated successfully',
      data: {
        merchant: {
          mid: 'mid_123456',
          name: 'Updated Business Name',
          email: 'john@testbusiness.com',
          phone: '+15551234567',
          status: 'active',
          created_at: '2023-01-01T12:00:00Z',
          updated_at: '2023-01-02T12:00:00Z'
        }
      }
    };

    it('should update a merchant successfully', async () => {
      // Mock the put method to return a successful response
      mockClient.put.mockResolvedValue(mockUpdateResponse);

      // Call the method
      const result = await channels.updateMerchant(mockMid, mockUpdateData);

      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/channel/merchants/${mockMid}`,
        mockUpdateData
      );

      // Verify the result
      expect(result).toEqual(mockUpdateResponse);
      expect(result.data.merchant.name).toBe('Updated Business Name');
    });

    it('should handle API errors when updating a merchant', async () => {
      // Mock the put method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid update data',
        400,
        'GW01'
      );
      mockClient.put.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.updateMerchant(mockMid, mockUpdateData)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/channel/merchants/${mockMid}`,
        mockUpdateData
      );
    });
  });

  describe('listMyMerchants', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      status: 'active'
    };

    const mockMerchantListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        merchants: [
          {
            mid: 'mid_123456',
            name: 'Test Business 1',
            email: 'test1@business.com',
            status: 'active',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z'
          },
          {
            mid: 'mid_789012',
            name: 'Test Business 2',
            email: 'test2@business.com',
            status: 'active',
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

    it('should list merchants successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockMerchantListResponse);

      // Call the method with query parameters
      const result = await channels.listMyMerchants(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockMerchantListResponse);
      expect(result.data.merchants.length).toBe(2);
      expect(result.data.merchants[0].mid).toBe('mid_123456');
    });

    it('should list merchants successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockMerchantListResponse);

      // Call the method without query parameters
      const result = await channels.listMyMerchants();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants',
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockMerchantListResponse);
    });

    it('should handle API errors when listing merchants', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Access denied',
        403,
        'GW03'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.listMyMerchants(mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants',
        mockQueryParams
      );
    });
  });

  describe('listMerchantDeposits', () => {
    const mockMid = 'mid_123456';
    const mockQueryParams = {
      limit: 10,
      offset: 0
    };

    const mockDepositsResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        deposits: [
          {
            id: 'dep_123456',
            mid: 'mid_123456',
            amount: '1000.00',
            currency: 'USD',
            status: 'completed',
            deposit_date: '2023-01-01T12:00:00Z',
            settlement_date: '2023-01-02T12:00:00Z'
          }
        ],
        meta: {
          count: 1,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list merchant deposits successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositsResponse);

      // Call the method
      const result = await channels.listMerchantDeposits(mockMid, mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/channel/merchants/${mockMid}/deposits`,
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockDepositsResponse);
      expect(result.data.deposits[0].mid).toBe(mockMid);
    });

    it('should handle API errors when listing merchant deposits', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Merchant not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.listMerchantDeposits(mockMid, mockQueryParams)).rejects.toThrow(mockError);
    });
  });

  describe('listChannelDeposits', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0
    };

    const mockDepositsResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        deposits: [
          {
            id: 'dep_123456',
            mid: 'mid_123456',
            amount: '1000.00',
            currency: 'USD',
            status: 'completed',
            deposit_date: '2023-01-01T12:00:00Z'
          }
        ],
        meta: {
          count: 1,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list channel deposits successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDepositsResponse);

      // Call the method
      const result = await channels.listChannelDeposits(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/deposits',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockDepositsResponse);
    });

    it('should handle API errors when listing channel deposits', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Access denied',
        403,
        'GW03'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.listChannelDeposits(mockQueryParams)).rejects.toThrow(mockError);
    });
  });

  describe('listMerchantDisputes', () => {
    const mockMid = 'mid_123456';
    const mockQueryParams = {
      limit: 10,
      offset: 0
    };

    const mockDisputesResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        disputes: [
          {
            id: 'disp_123456',
            mid: 'mid_123456',
            transaction_id: 'txn_123456',
            amount: '100.00',
            currency: 'USD',
            reason: 'fraud',
            status: 'open',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z'
          }
        ],
        meta: {
          count: 1,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list merchant disputes successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDisputesResponse);

      // Call the method
      const result = await channels.listMerchantDisputes(mockMid, mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/channel/merchants/${mockMid}/disputes`,
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockDisputesResponse);
      expect(result.data.disputes[0].mid).toBe(mockMid);
    });

    it('should handle API errors when listing merchant disputes', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Merchant not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.listMerchantDisputes(mockMid, mockQueryParams)).rejects.toThrow(mockError);
    });
  });

  describe('listChannelDisputes', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0
    };

    const mockDisputesResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        disputes: [
          {
            id: 'disp_123456',
            mid: 'mid_123456',
            transaction_id: 'txn_123456',
            amount: '100.00',
            currency: 'USD',
            reason: 'fraud',
            status: 'open',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z'
          }
        ],
        meta: {
          count: 1,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list channel disputes successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockDisputesResponse);

      // Call the method
      const result = await channels.listChannelDisputes(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/disputes',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockDisputesResponse);
    });

    it('should handle API errors when listing channel disputes', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Access denied',
        403,
        'GW03'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.listChannelDisputes(mockQueryParams)).rejects.toThrow(mockError);
    });
  });

  describe('listMerchantTransactions', () => {
    const mockMid = 'mid_123456';
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      status: 'approved'
    };

    const mockTransactionsResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        transactions: [
          {
            id: 'txn_123456',
            mid: 'mid_123456',
            amount: '100.00',
            currency: 'USD',
            status: 'approved',
            type: 'sale',
            payment_method: 'card',
            created_at: '2023-01-01T12:00:00Z',
            customer_id: 'cust_123456',
            reference_id: 'ref_123456'
          }
        ],
        meta: {
          count: 1,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list merchant transactions successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      // Call the method
      const result = await channels.listMerchantTransactions(mockMid, mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/channel/merchants/${mockMid}/transactions`,
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockTransactionsResponse);
      expect(result.data.transactions[0].mid).toBe(mockMid);
    });

    it('should handle API errors when listing merchant transactions', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Merchant not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.listMerchantTransactions(mockMid, mockQueryParams)).rejects.toThrow(mockError);
    });
  });

  describe('listChannelTransactions', () => {
    const mockQueryParams = {
      limit: 10,
      offset: 0,
      status: 'approved'
    };

    const mockTransactionsResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        transactions: [
          {
            id: 'txn_123456',
            mid: 'mid_123456',
            amount: '100.00',
            currency: 'USD',
            status: 'approved',
            type: 'sale',
            payment_method: 'card',
            created_at: '2023-01-01T12:00:00Z'
          }
        ],
        meta: {
          count: 1,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list channel transactions successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      // Call the method
      const result = await channels.listChannelTransactions(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/transactions',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockTransactionsResponse);
    });

    it('should list channel transactions successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      // Call the method without query parameters
      const result = await channels.listChannelTransactions();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/transactions',
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockTransactionsResponse);
    });

    it('should handle API errors when listing channel transactions', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Access denied',
        403,
        'GW03'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(channels.listChannelTransactions(mockQueryParams)).rejects.toThrow(mockError);
    });
  });
});
