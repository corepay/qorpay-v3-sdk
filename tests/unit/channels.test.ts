/**
 * @file tests/unit/channels.test.ts
 * @description Tests for channels resource class using real instances
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

describe('Channels', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockMerchant = {
    id: 'merchant_123',
    business_name: 'Test Business',
    legal_name: 'Test Business LLC',
    doing_business_as: 'Test Store',
    email: 'test@example.com',
    phone: '+15551234567',
    address: {
      line1: '123 Main St',
      city: 'Test City',
      state: 'CA',
      postal_code: '90210',
      country: 'US',
    },
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockMerchantListResponse = {
    status: 'success',
    data: {
      merchants: [
        mockMerchant,
        {
          ...mockMerchant,
          id: 'merchant_456',
          business_name: 'Another Business',
        },
      ],
      total_count: 2,
      has_more: false,
    },
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize channels resource', () => {
      expect(client.channels).toBeDefined();
      expect(typeof client.channels.createMerchant).toBe('function');
      expect(typeof client.channels.getMerchant).toBe('function');
      expect(typeof client.channels.updateMerchant).toBe('function');
      expect(typeof client.channels.listMyMerchants).toBe('function');
      expect(typeof client.channels.addMerchantBankAccount).toBe('function');
      expect(typeof client.channels.addMerchantOwner).toBe('function');
    });
  });

  describe('createMerchant', () => {
    it('should create a merchant successfully', async () => {
      const merchantData = {
        business_name: 'New Business',
        legal_name: 'New Business LLC',
        email: 'new@example.com',
        phone: '+15559876543',
        address: {
          line1: '456 Oak Ave',
          city: 'New City',
          state: 'NY',
          postal_code: '10001',
          country: 'US',
        },
      };

      mockSuccessfulResponse(mockMerchant);

      const result = await client.channels.createMerchant(merchantData);

      expect(result).toEqual(mockMerchant);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/channel/merchants',
          data: expect.objectContaining({
            business_name: 'New Business',
            legal_name: 'New Business LLC',
            email: 'new@example.com',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const merchantData = {
        business_name: '',
        email: 'invalid-email',
      };

      mockFailedResponse('Invalid merchant data', 400);

      await expect(
        client.channels.createMerchant(merchantData)
      ).rejects.toThrow();
    });
  });

  describe('getMerchant', () => {
    it('should retrieve a merchant successfully', async () => {
      const merchantId = 'merchant_123';

      mockSuccessfulResponse(mockMerchant);

      const result = await client.channels.getMerchant(merchantId);

      expect(result).toEqual(mockMerchant);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/channel/merchants/${merchantId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Merchant not found', 404);

      await expect(
        client.channels.getMerchant('invalid_merchant')
      ).rejects.toThrow();
    });
  });

  describe('updateMerchant', () => {
    it('should update a merchant successfully', async () => {
      const merchantId = 'merchant_123';
      const updateData = {
        business_name: 'Updated Business Name',
        phone: '+15551112233',
      };

      mockSuccessfulResponse({
        ...mockMerchant,
        business_name: 'Updated Business Name',
        phone: '+15551112233',
      });

      const result = await client.channels.updateMerchant(
        merchantId,
        updateData
      );

      expect(result.business_name).toBe('Updated Business Name');
      expect(result.phone).toBe('+15551112233');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: `/channel/merchants/${merchantId}`,
          data: expect.objectContaining({
            business_name: 'Updated Business Name',
            phone: '+15551112233',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const updateData = {
        business_name: '',
      };

      mockFailedResponse('Invalid update data', 400);

      await expect(
        client.channels.updateMerchant('invalid_merchant', updateData)
      ).rejects.toThrow();
    });
  });

  describe('listMyMerchants', () => {
    it('should list merchants with query parameters', async () => {
      const params = {
        limit: 25,
        offset: 0,
        status: 'active',
      };

      mockSuccessfulResponse(mockMerchantListResponse);

      const result = await client.channels.listMyMerchants(params);

      expect(result.data.merchants).toHaveLength(2);
      expect(result.data.total_count).toBe(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/channel/merchants',
          params,
        })
      );
    });

    it('should list merchants without parameters', async () => {
      mockSuccessfulResponse(mockMerchantListResponse);

      const result = await client.channels.listMyMerchants();

      expect(result.data.merchants).toHaveLength(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/channel/merchants',
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve merchants', 500);

      await expect(client.channels.listMyMerchants()).rejects.toThrow();
    });
  });

  describe('addMerchantBankAccount', () => {
    it('should add a bank account to a merchant successfully', async () => {
      const merchantId = 'merchant_123';
      const bankAccountData = {
        account_number: '123456789',
        routing_number: '021000021',
        account_type: 'checking',
        account_holder_name: 'Test Holder',
      };

      mockSuccessfulResponse({
        status: 'success',
        message: 'Bank account added successfully',
      });

      const result = await client.channels.addMerchantBankAccount(
        merchantId,
        bankAccountData
      );

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: `/channel/merchants/${merchantId}/bank-accounts`,
          data: expect.objectContaining({
            account_number: '123456789',
            routing_number: '021000021',
            account_type: 'checking',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const bankAccountData = {
        account_number: '',
        routing_number: 'invalid',
        account_type: 'invalid',
      };

      mockFailedResponse('Invalid bank account details', 400);

      await expect(
        client.channels.addMerchantBankAccount('merchant_123', bankAccountData)
      ).rejects.toThrow();
    });
  });

  describe('addMerchantOwner', () => {
    it('should add an owner to a merchant successfully', async () => {
      const merchantId = 'merchant_123';
      const ownerData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+15551234567',
        date_of_birth: '1980-01-01',
      };

      mockSuccessfulResponse({
        status: 'success',
        message: 'Owner added successfully',
        data: {
          owner_id: 'owner_123',
        },
      });

      const result = await client.channels.addMerchantOwner(
        merchantId,
        ownerData
      );

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: `/channel/merchants/${merchantId}/owners`,
          data: expect.objectContaining({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const ownerData = {
        first_name: '',
        email: 'invalid-email',
      };

      mockFailedResponse('Invalid owner data', 400);

      await expect(
        client.channels.addMerchantOwner('merchant_123', ownerData)
      ).rejects.toThrow();
    });
  });
});
