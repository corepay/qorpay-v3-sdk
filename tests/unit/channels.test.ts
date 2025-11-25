/**
 * @file tests/unit/channels.test.ts
 * @description Unit tests for Channels resource class
 */

import { Channels } from '../../src/resources/channels';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import type {
  ChannelMerchantRequest,
  ChannelMerchantResponse,
  ListMyMerchantsQueryParams,
  ListMyMerchantsResponsePayload,
  ListChannelDepositsQueryParams,
  ListChannelDepositsResponsePayload,
  ListChannelDisputesQueryParams,
  ListChannelDisputesResponsePayload,
  ListChannelTransactionsQueryParams,
  ListChannelTransactionsResponsePayload,
} from '../../src/resources/channels';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('Channels', () => {
  let channels: Channels;
  let mockClient: jest.Mocked<BaseClient>;

  const mockMerchantResponse: ChannelMerchantResponse = {
    status: 'success',
    code: '200',
    message: 'Merchant created successfully',
    reference_id: 'ref_123',
    data: {
      mid: 'merch_123456',
      name: 'Test Merchant',
      email: 'test@merchant.com',
      phone: '+1234567890',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      metadata: { custom_field: 'value' },
    },
  };

  const mockMerchantsListResponse: ListMyMerchantsResponsePayload = {
    status: 'success',
    code: '200',
    message: 'Merchants retrieved',
    reference_id: 'ref_123',
    data: {
      merchants: [mockMerchantResponse.data],
      total: 1,
      has_more: false,
    },
  };

  const mockDepositsResponse: ListChannelDepositsResponsePayload = {
    status: 'success',
    code: '200',
    message: 'Deposits retrieved',
    reference_id: 'ref_123',
    data: {
      deposits: [
        {
          id: 'dep_123',
          mid: 'merch_123456',
          amount: '1000.00',
          currency: 'USD',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      has_more: false,
    },
  };

  const mockDisputesResponse: ListChannelDisputesResponsePayload = {
    status: 'success',
    code: '200',
    message: 'Disputes retrieved',
    reference_id: 'ref_123',
    data: {
      disputes: [
        {
          id: 'disp_123',
          mid: 'merch_123456',
          amount: '50.00',
          currency: 'USD',
          status: 'open',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      has_more: false,
    },
  };

  const mockTransactionsResponse: ListChannelTransactionsResponsePayload = {
    status: 'success',
    code: '200',
    message: 'Transactions retrieved',
    reference_id: 'ref_123',
    data: {
      transactions: [
        {
          id: 'txn_123',
          mid: 'merch_123456',
          amount: '100.00',
          currency: 'USD',
          type: 'sale',
          status: 'approved',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      has_more: false,
    },
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    channels = new Channels(mockClient);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with BaseClient instance', () => {
      expect(channels['client']).toBe(mockClient);
      expect(channels['basePath']).toBe('/channel');
      expect(channels['merchantsPath']).toBe('/channel/merchants');
    });
  });

  describe('createMerchant', () => {
    it('should create a merchant successfully', async () => {
      const merchantData: ChannelMerchantRequest = {
        name: 'Test Merchant',
        email: 'test@merchant.com',
        phone: '+1234567890',
        business_type: 'company',
        tax_id: '12-3456789',
      };

      mockClient.post.mockResolvedValue(mockMerchantResponse);

      const result = await channels.createMerchant(merchantData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/channel/merchants',
        merchantData
      );
      expect(result).toEqual(mockMerchantResponse);
    });

    it('should propagate API errors', async () => {
      const merchantData: ChannelMerchantRequest = {
        name: 'Test Merchant',
      };

      const apiError = new QorPayApiError('Merchant creation failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(channels.createMerchant(merchantData)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('getMerchant', () => {
    it('should retrieve a merchant successfully', async () => {
      const merchantId = 'merch_123456';

      mockClient.get.mockResolvedValue(mockMerchantResponse);

      const result = await channels.getMerchant(merchantId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456'
      );
      expect(result).toEqual(mockMerchantResponse);
    });

    it('should propagate API errors', async () => {
      const merchantId = 'merch_invalid';

      const apiError = new QorPayApiError('Merchant not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(channels.getMerchant(merchantId)).rejects.toThrow(apiError);
    });
  });

  describe('updateMerchant', () => {
    it('should update a merchant successfully', async () => {
      const merchantId = 'merch_123456';
      const updateData: Partial<ChannelMerchantRequest> = {
        name: 'Updated Merchant Name',
        email: 'updated@merchant.com',
      };

      mockClient.put.mockResolvedValue(mockMerchantResponse);

      const result = await channels.updateMerchant(merchantId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456',
        updateData
      );
      expect(result).toEqual(mockMerchantResponse);
    });

    it('should propagate API errors', async () => {
      const merchantId = 'merch_invalid';
      const updateData = { name: 'Updated Name' };

      const apiError = new QorPayApiError('Merchant not found', 404);
      mockClient.put.mockRejectedValue(apiError);

      await expect(
        channels.updateMerchant(merchantId, updateData)
      ).rejects.toThrow(apiError);
    });
  });

  describe('listMyMerchants', () => {
    it('should list merchants with query parameters', async () => {
      const params: ListMyMerchantsQueryParams = {
        limit: 10,
        offset: 0,
        status: 'active',
      };

      mockClient.get.mockResolvedValue(mockMerchantsListResponse);

      const result = await channels.listMyMerchants(params);

      expect(mockClient.get).toHaveBeenCalledWith('/channel/merchants', params);
      expect(result).toEqual(mockMerchantsListResponse);
    });

    it('should list merchants without parameters', async () => {
      mockClient.get.mockResolvedValue(mockMerchantsListResponse);

      const result = await channels.listMyMerchants();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants',
        undefined
      );
      expect(result).toEqual(mockMerchantsListResponse);
    });

    it('should propagate API errors', async () => {
      const apiError = new QorPayApiError('Failed to list merchants', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(channels.listMyMerchants()).rejects.toThrow(apiError);
    });
  });

  describe('addMerchantBankAccount', () => {
    it('should add a bank account to a merchant successfully', async () => {
      const merchantId = 'merch_123456';
      const bankData = {
        account_number: '123456789',
        routing_number: '021000021',
        account_type: 'checking' as const,
        account_holder_name: 'John Doe',
      };

      mockClient.post.mockResolvedValue(mockMerchantResponse);

      const result = await channels.addMerchantBankAccount(
        merchantId,
        bankData
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/bank-accounts',
        bankData
      );
      expect(result).toEqual(mockMerchantResponse);
    });

    it('should propagate API errors', async () => {
      const merchantId = 'merch_invalid';
      const bankData = {
        account_number: '123456789',
        routing_number: '021000021',
        account_type: 'checking' as const,
        account_holder_name: 'John Doe',
      };

      const apiError = new QorPayApiError('Merchant not found', 404);
      mockClient.post.mockRejectedValue(apiError);

      await expect(
        channels.addMerchantBankAccount(merchantId, bankData)
      ).rejects.toThrow(apiError);
    });
  });

  describe('addMerchantOwner', () => {
    it('should add an owner to a merchant successfully', async () => {
      const merchantId = 'merch_123456';
      const ownerData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        title: 'CEO',
        ownership_percentage: 75,
        address: {
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US',
        },
        dob: '1980-01-01',
        ssn_last_four: '1234',
      };

      mockClient.post.mockResolvedValue(mockMerchantResponse);

      const result = await channels.addMerchantOwner(merchantId, ownerData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/owners',
        ownerData
      );
      expect(result).toEqual(mockMerchantResponse);
    });

    it('should work with minimal owner data', async () => {
      const merchantId = 'merch_123456';
      const minimalOwnerData = {
        first_name: 'Jane',
        last_name: 'Smith',
      };

      mockClient.post.mockResolvedValue(mockMerchantResponse);

      await channels.addMerchantOwner(merchantId, minimalOwnerData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/owners',
        minimalOwnerData
      );
    });

    it('should propagate API errors', async () => {
      const merchantId = 'merch_invalid';
      const ownerData = {
        first_name: 'John',
        last_name: 'Doe',
      };

      const apiError = new QorPayApiError('Merchant not found', 404);
      mockClient.post.mockRejectedValue(apiError);

      await expect(
        channels.addMerchantOwner(merchantId, ownerData)
      ).rejects.toThrow(apiError);
    });
  });

  describe('listMerchantDeposits', () => {
    it('should list deposits for a specific merchant', async () => {
      const merchantId = 'merch_123456';
      const params: ListChannelDepositsQueryParams = {
        limit: 20,
        offset: 0,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      mockClient.get.mockResolvedValue(mockDepositsResponse);

      const result = await channels.listMerchantDeposits(merchantId, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/deposits',
        params
      );
      expect(result).toEqual(mockDepositsResponse);
    });

    it('should list merchant deposits without parameters', async () => {
      const merchantId = 'merch_123456';

      mockClient.get.mockResolvedValue(mockDepositsResponse);

      const result = await channels.listMerchantDeposits(merchantId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/deposits',
        undefined
      );
      expect(result).toEqual(mockDepositsResponse);
    });

    it('should propagate API errors', async () => {
      const merchantId = 'merch_invalid';

      const apiError = new QorPayApiError('Merchant not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(channels.listMerchantDeposits(merchantId)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('listChannelDeposits', () => {
    it('should list all deposits across the channel', async () => {
      const params: ListChannelDepositsQueryParams = {
        limit: 50,
        offset: 0,
        status: 'completed',
      };

      mockClient.get.mockResolvedValue(mockDepositsResponse);

      const result = await channels.listChannelDeposits(params);

      expect(mockClient.get).toHaveBeenCalledWith('/channel/deposits', params);
      expect(result).toEqual(mockDepositsResponse);
    });

    it('should list channel deposits without parameters', async () => {
      mockClient.get.mockResolvedValue(mockDepositsResponse);

      const result = await channels.listChannelDeposits();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/deposits',
        undefined
      );
      expect(result).toEqual(mockDepositsResponse);
    });

    it('should propagate API errors', async () => {
      const apiError = new QorPayApiError('Failed to list deposits', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(channels.listChannelDeposits()).rejects.toThrow(apiError);
    });
  });

  describe('listMerchantDisputes', () => {
    it('should list disputes for a specific merchant', async () => {
      const merchantId = 'merch_123456';
      const params: ListChannelDisputesQueryParams = {
        limit: 10,
        offset: 0,
        status: 'open',
      };

      mockClient.get.mockResolvedValue(mockDisputesResponse);

      const result = await channels.listMerchantDisputes(merchantId, params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/disputes',
        params
      );
      expect(result).toEqual(mockDisputesResponse);
    });

    it('should list merchant disputes without parameters', async () => {
      const merchantId = 'merch_123456';

      mockClient.get.mockResolvedValue(mockDisputesResponse);

      const result = await channels.listMerchantDisputes(merchantId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/disputes',
        undefined
      );
      expect(result).toEqual(mockDisputesResponse);
    });

    it('should propagate API errors', async () => {
      const merchantId = 'merch_invalid';

      const apiError = new QorPayApiError('Merchant not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(channels.listMerchantDisputes(merchantId)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('listChannelDisputes', () => {
    it('should list all disputes across the channel', async () => {
      const params: ListChannelDisputesQueryParams = {
        limit: 25,
        offset: 0,
        start_date: '2024-01-01',
      };

      mockClient.get.mockResolvedValue(mockDisputesResponse);

      const result = await channels.listChannelDisputes(params);

      expect(mockClient.get).toHaveBeenCalledWith('/channel/disputes', params);
      expect(result).toEqual(mockDisputesResponse);
    });

    it('should list channel disputes without parameters', async () => {
      mockClient.get.mockResolvedValue(mockDisputesResponse);

      const result = await channels.listChannelDisputes();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/disputes',
        undefined
      );
      expect(result).toEqual(mockDisputesResponse);
    });

    it('should propagate API errors', async () => {
      const apiError = new QorPayApiError('Failed to list disputes', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(channels.listChannelDisputes()).rejects.toThrow(apiError);
    });
  });

  describe('listMerchantTransactions', () => {
    it('should list transactions for a specific merchant', async () => {
      const merchantId = 'merch_123456';
      const params: ListChannelTransactionsQueryParams = {
        limit: 100,
        offset: 0,
        type: 'sale',
        status: 'approved',
      };

      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      const result = await channels.listMerchantTransactions(
        merchantId,
        params
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/transactions',
        params
      );
      expect(result).toEqual(mockTransactionsResponse);
    });

    it('should list merchant transactions without parameters', async () => {
      const merchantId = 'merch_123456';

      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      const result = await channels.listMerchantTransactions(merchantId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/merchants/merch_123456/transactions',
        undefined
      );
      expect(result).toEqual(mockTransactionsResponse);
    });

    it('should propagate API errors', async () => {
      const merchantId = 'merch_invalid';

      const apiError = new QorPayApiError('Merchant not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(
        channels.listMerchantTransactions(merchantId)
      ).rejects.toThrow(apiError);
    });
  });

  describe('listChannelTransactions', () => {
    it('should list all transactions across the channel', async () => {
      const params: ListChannelTransactionsQueryParams = {
        limit: 50,
        offset: 0,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      const result = await channels.listChannelTransactions(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/transactions',
        params
      );
      expect(result).toEqual(mockTransactionsResponse);
    });

    it('should list channel transactions without parameters', async () => {
      mockClient.get.mockResolvedValue(mockTransactionsResponse);

      const result = await channels.listChannelTransactions();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/channel/transactions',
        undefined
      );
      expect(result).toEqual(mockTransactionsResponse);
    });

    it('should propagate API errors', async () => {
      const apiError = new QorPayApiError('Failed to list transactions', 500);
      mockClient.get.mockRejectedValue(apiError);

      await expect(channels.listChannelTransactions()).rejects.toThrow(
        apiError
      );
    });
  });
});
