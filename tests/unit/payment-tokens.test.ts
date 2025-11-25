/**
 * @file tests/unit/payment-tokens.test.ts
 * @description Unit tests for PaymentTokens resource class
 */

import { PaymentTokens } from '../../src/resources/payment-tokens';
import { BaseClient } from '../../src/client/base-client';
import type {
  CreateCardTokenRequest,
  CreateCardTokenResponse,
  CreateAchTokenRequest,
  CreateAchTokenResponse,
  FetchCardTokenByIdResponse,
  FetchAchTokenByIdResponse,
  FetchCardTokenByCustomerResponse,
  FetchAchTokenByCustomerResponse,
  DeleteCardTokenParams,
  DeleteCardTokenResponse,
  UpdateCardTokenRequest,
  UpdateCardTokenResponse,
  RotateCardTokenRequest,
  RotateCardTokenResponse,
  RollbackCardTokenRequest,
  RollbackCardTokenResponse,
} from '../../src/types/paymentTokens';
import type { PaymentToken, AchToken } from '../../src/types/common';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('PaymentTokens', () => {
  let paymentTokens: PaymentTokens;
  let mockClient: jest.Mocked<BaseClient>;

  const mockCardTokenResponse: CreateCardTokenResponse = {
    token: 'tok_123456',
    card_last4: '4242',
    card_exp_month: '12',
    card_exp_year: '2025',
    card_brand: 'visa',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockAchTokenResponse: CreateAchTokenResponse = {
    token: 'ach_123456',
    ach_account_last4: '6789',
    ach_routing: '123456789',
    ach_account_type: 'checking',
    ach_bank_name: 'Test Bank',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockClient = new BaseClient({ appKey: 'test', clientKey: 'test' }) as jest.Mocked<BaseClient>;
    paymentTokens = new PaymentTokens(mockClient);
    jest.clearAllMocks();
  });

  describe('Card Tokens', () => {
    describe('createCardToken', () => {
      it('should create a new card token successfully', async () => {
        const tokenData: CreateCardTokenRequest = {
          mid: '123456',
          creditcard: '4111111111111111',
          ccexp: '1225',
          cvv: '123',
          customer_id: 'cust_123',
        };

        mockClient.post.mockResolvedValue(mockCardTokenResponse);

        const result = await paymentTokens.createCardToken(tokenData);

        expect(mockClient.post).toHaveBeenCalledWith('/tokens/card', tokenData);
        expect(result).toEqual(mockCardTokenResponse);
      });

      it('should create a token without customer_id', async () => {
        const tokenData: CreateCardTokenRequest = {
          mid: '123456',
          creditcard: '5555555555554444',
          ccexp: '0826',
          cvv: '456',
        };

        mockClient.post.mockResolvedValue(mockCardTokenResponse);

        await paymentTokens.createCardToken(tokenData);

        expect(mockClient.post).toHaveBeenCalledWith('/tokens/card', tokenData);
      });
    });

    describe('getCardToken', () => {
      it('should fetch a specific card token by ID', async () => {
        const token: PaymentToken = 'tok_123456';
        const fetchResponse: FetchCardTokenByIdResponse = {
          ...mockCardTokenResponse,
          customer_id: 'cust_123',
          is_default: true,
        };

        mockClient.get.mockResolvedValue(fetchResponse);

        const result = await paymentTokens.getCardToken(token);

        expect(mockClient.get).toHaveBeenCalledWith('/tokens/card/tok_123456');
        expect(result).toEqual(fetchResponse);
      });
    });

    describe('listCardTokensByCustomer', () => {
      it('should list card tokens for a customer without parameters', async () => {
        const customerId = 'cust_123';
        const listResponse: FetchCardTokenByCustomerResponse = {
          tokens: [mockCardTokenResponse],
          total_count: 1,
          has_more: false,
        };

        mockClient.get.mockResolvedValue(listResponse);

        const result = await paymentTokens.listCardTokensByCustomer(customerId);

        expect(mockClient.get).toHaveBeenCalledWith(
          '/tokens/card/customer/cust_123',
          undefined
        );
        expect(result).toEqual(listResponse);
      });

      it('should list card tokens with query parameters', async () => {
        const customerId = 'cust_456';
        const params = {
          limit: 10,
          offset: 5,
          is_default: true,
        };

        mockClient.get.mockResolvedValue({
          tokens: [],
          total_count: 0,
          has_more: false,
        });

        await paymentTokens.listCardTokensByCustomer(customerId, params);

        expect(mockClient.get).toHaveBeenCalledWith(
          '/tokens/card/customer/cust_456',
          params
        );
      });
    });

    describe('deleteCardToken', () => {
      it('should delete a card token without customer_id', async () => {
        const params: DeleteCardTokenParams = {
          token: 'tok_123456',
        };

        const deleteResponse: DeleteCardTokenResponse = {
          deleted: true,
          message: 'Token deleted successfully',
        };

        mockClient.delete.mockResolvedValue(deleteResponse);

        const result = await paymentTokens.deleteCardToken(params);

        expect(mockClient.delete).toHaveBeenCalledWith(
          '/tokens/card/tok_123456',
          undefined
        );
        expect(result).toEqual(deleteResponse);
      });

      it('should delete a card token with customer_id', async () => {
        const params: DeleteCardTokenParams = {
          token: 'tok_789',
          customer_id: 'cust_456',
        };

        mockClient.delete.mockResolvedValue({ deleted: true });

        await paymentTokens.deleteCardToken(params);

        expect(mockClient.delete).toHaveBeenCalledWith(
          '/tokens/card/tok_789',
          { customer_id: 'cust_456' }
        );
      });
    });

    describe('updateCardToken', () => {
      it('should update a card token', async () => {
        const updateData: UpdateCardTokenRequest = {
          token: 'tok_123456',
          is_default: true,
          customer_id: 'cust_789',
        };

        const updateResponse: UpdateCardTokenResponse = {
          ...mockCardTokenResponse,
          is_default: true,
          customer_id: 'cust_789',
        };

        mockClient.put.mockResolvedValue(updateResponse);

        const result = await paymentTokens.updateCardToken(updateData);

        expect(mockClient.put).toHaveBeenCalledWith(
          '/tokens/card/tok_123456',
          updateData
        );
        expect(result).toEqual(updateResponse);
      });
    });

    describe('rotateCardToken', () => {
      it('should rotate a card token', async () => {
        const rotateData: RotateCardTokenRequest = {
          token: 'tok_123456',
          creditcard: '4242424242424242',
          ccexp: '1227',
          cvv: '123',
        };

        const rotateResponse: RotateCardTokenResponse = {
          new_token: 'tok_789012',
          old_token: 'tok_123456',
          card_last4: '4242',
          card_exp_month: '12',
          card_exp_year: '2027',
          rotation_date: '2024-01-15T00:00:00Z',
        };

        mockClient.post.mockResolvedValue(rotateResponse);

        const result = await paymentTokens.rotateCardToken(rotateData);

        expect(mockClient.post).toHaveBeenCalledWith(
          '/tokens/card/tok_123456/rotate',
          rotateData
        );
        expect(result).toEqual(rotateResponse);
      });
    });

    describe('rollbackCardToken', () => {
      it('should rollback a card token rotation', async () => {
        const rollbackData: RollbackCardTokenRequest = {
          token: 'tok_789012',
          rollback_reason: 'Customer request',
        };

        const rollbackResponse: RollbackCardTokenResponse = {
          rolled_back: true,
          current_token: 'tok_123456',
          previous_token: 'tok_789012',
          rollback_date: '2024-01-16T00:00:00Z',
        };

        mockClient.post.mockResolvedValue(rollbackResponse);

        const result = await paymentTokens.rollbackCardToken(rollbackData);

        expect(mockClient.post).toHaveBeenCalledWith(
          '/tokens/card/tok_789012/rollback',
          rollbackData
        );
        expect(result).toEqual(rollbackResponse);
      });
    });
  });

  describe('ACH Tokens', () => {
    describe('createAchToken', () => {
      it('should create a new ACH token successfully', async () => {
        const achData: CreateAchTokenRequest = {
          mid: '123456',
          account_number: '123456789',
          routing_number: '987654321',
          account_type: 'checking',
          customer_id: 'cust_123',
        };

        mockClient.post.mockResolvedValue(mockAchTokenResponse);

        const result = await paymentTokens.createAchToken(achData);

        expect(mockClient.post).toHaveBeenCalledWith('/tokens/ach', achData);
        expect(result).toEqual(mockAchTokenResponse);
      });

      it('should create an ACH token for savings account', async () => {
        const achData: CreateAchTokenRequest = {
          mid: '123456',
          account_number: '987654321',
          routing_number: '123456789',
          account_type: 'savings',
          customer_id: 'cust_456',
        };

        mockClient.post.mockResolvedValue({
          ...mockAchTokenResponse,
          ach_account_type: 'savings',
        });

        await paymentTokens.createAchToken(achData);

        expect(mockClient.post).toHaveBeenCalledWith('/tokens/ach', achData);
      });
    });

    describe('getAchToken', () => {
      it('should fetch a specific ACH token by ID', async () => {
        const token: AchToken = 'ach_123456';
        const fetchResponse: FetchAchTokenByIdResponse = {
          ...mockAchTokenResponse,
          customer_id: 'cust_123',
          is_default: false,
        };

        mockClient.get.mockResolvedValue(fetchResponse);

        const result = await paymentTokens.getAchToken(token);

        expect(mockClient.get).toHaveBeenCalledWith('/tokens/ach/ach_123456');
        expect(result).toEqual(fetchResponse);
      });
    });

    describe('listAchTokensByCustomer', () => {
      it('should list ACH tokens for a customer', async () => {
        const customerId = 'cust_123';
        const listResponse: FetchAchTokenByCustomerResponse = {
          tokens: [mockAchTokenResponse],
          total_count: 1,
          has_more: false,
        };

        mockClient.get.mockResolvedValue(listResponse);

        const result = await paymentTokens.listAchTokensByCustomer(customerId);

        expect(mockClient.get).toHaveBeenCalledWith(
          '/tokens/ach/customer/cust_123',
          undefined
        );
        expect(result).toEqual(listResponse);
      });

      it('should list ACH tokens with pagination', async () => {
        const customerId = 'cust_456';
        const params = {
          limit: 20,
          offset: 10,
        };

        mockClient.get.mockResolvedValue({
          tokens: [mockAchTokenResponse],
          total_count: 1,
          has_more: false,
        });

        await paymentTokens.listAchTokensByCustomer(customerId, params);

        expect(mockClient.get).toHaveBeenCalledWith(
          '/tokens/ach/customer/cust_456',
          params
        );
      });
    });
  });

  describe('listExpiringCardTokens', () => {
    it('should list expiring card tokens with date range', async () => {
      const params = {
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        limit: 50,
        offset: 0,
      };

      const expiringResponse: FetchCardTokenByCustomerResponse = {
        tokens: [mockCardTokenResponse],
        total_count: 1,
        has_more: false,
      };

      mockClient.get.mockResolvedValue(expiringResponse);

      const result = await paymentTokens.listExpiringCardTokens(params);

      expect(mockClient.get).toHaveBeenCalledWith('/tokens/card/expiring', {
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        limit: 50,
        offset: 0,
        expiring_soon: true,
      });
      expect(result).toEqual(expiringResponse);
    });

    it('should throw error when start date is missing', async () => {
      const params = {
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
      };

      const invalidParams = {
        endDate: params.endDate,
        limit: 10,
      };

      await expect(
        paymentTokens.listExpiringCardTokens(invalidParams as any)
      ).rejects.toThrow('Start date and end date are required for expiring tokens filter');
    });

    it('should throw error when end date is missing', async () => {
      const params = {
        startDate: new Date('2024-12-01'),
        limit: 10,
      };

      await expect(
        paymentTokens.listExpiringCardTokens(params as any)
      ).rejects.toThrow('Start date and end date are required for expiring tokens filter');
    });

    it('should throw error when start date is after end date', async () => {
      const params = {
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-12-01'),
        limit: 10,
      };

      await expect(
        paymentTokens.listExpiringCardTokens(params)
      ).rejects.toThrow('Start date must be before or equal to end date');
    });

    it('should handle date conversion correctly', async () => {
      const params = {
        startDate: new Date('2024-01-15T10:30:00Z'),
        endDate: new Date('2024-01-20T15:45:00Z'),
      };

      mockClient.get.mockResolvedValue({
        tokens: [],
        total_count: 0,
        has_more: false,
      });

      await paymentTokens.listExpiringCardTokens(params);

      expect(mockClient.get).toHaveBeenCalledWith('/tokens/card/expiring', {
        start_date: '2024-01-15', // Time component removed
        end_date: '2024-01-20', // Time component removed
        limit: undefined,
        offset: undefined,
        expiring_soon: true,
      });
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors from createCardToken', async () => {
      const tokenData: CreateCardTokenRequest = {
        mid: '123456',
        creditcard: '4000000000000002', // Declined card
        ccexp: '1225',
        cvv: '123',
      };

      const apiError = new Error('Card declined');
      mockClient.post.mockRejectedValue(apiError);

      await expect(paymentTokens.createCardToken(tokenData)).rejects.toThrow(apiError);
    });

    it('should propagate API errors from getCardToken', async () => {
      const token: PaymentToken = 'nonexistent_token';

      const apiError = new Error('Token not found');
      mockClient.get.mockRejectedValue(apiError);

      await expect(paymentTokens.getCardToken(token)).rejects.toThrow(apiError);
    });

    it('should propagate API errors from deleteCardToken', async () => {
      const params: DeleteCardTokenParams = {
        token: 'tok_123456',
      };

      const apiError = new Error('Cannot delete token - associated with active subscription');
      mockClient.delete.mockRejectedValue(apiError);

      await expect(paymentTokens.deleteCardToken(params)).rejects.toThrow(apiError);
    });
  });

  describe('URL construction', () => {
    it('should properly encode tokens in URLs', async () => {
      const tokenWithSpecialChars: PaymentToken = 'tok/with/special-chars_123';

      mockClient.get.mockResolvedValue(mockCardTokenResponse);

      await paymentTokens.getCardToken(tokenWithSpecialChars);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/tokens/card/${tokenWithSpecialChars}`
      );
    });

    it('should handle customer IDs with special characters', async () => {
      const customerId = 'cust/with/special/chars';

      mockClient.get.mockResolvedValue({ tokens: [], total_count: 0, has_more: false });

      await paymentTokens.listCardTokensByCustomer(customerId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/tokens/card/customer/${customerId}`,
        undefined
      );
    });
  });
});