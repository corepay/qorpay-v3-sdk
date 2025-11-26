/**
 * @file tests/unit/payment-tokens.test.ts
 * @description Tests for PaymentTokens resource class using real instances
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

describe('PaymentTokens', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockCardTokenResponse = {
    status: 'success',
    code: '200',
    message: 'Card token created successfully',
    data: {
      token_id: 'tok_123',
      card_last4: '4242',
      card_brand: 'visa',
      card_exp_month: '12',
      card_exp_year: '2025',
      created_at: '2023-01-01T00:00:00Z',
    },
  };

  const mockAchTokenResponse = {
    status: 'success',
    code: '200',
    message: 'ACH token created successfully',
    data: {
      token_id: 'tok_ach_123',
      account_last4: '6789',
      account_type: 'checking',
      bank_name: 'Test Bank',
      created_at: '2023-01-01T00:00:00Z',
    },
  };

  const mockTokenListResponse = {
    status: 'success',
    code: '200',
    message: 'Tokens retrieved successfully',
    data: {
      tokens: [
        {
          token_id: 'tok_123',
          card_last4: '4242',
          card_brand: 'visa',
        },
        {
          token_id: 'tok_456',
          card_last4: '5555',
          card_brand: 'mastercard',
        },
      ],
      pagination: {
        page: 1,
        per_page: 25,
        total: 2,
      },
    },
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('Card Tokens', () => {
    describe('createCardToken', () => {
      it('should create a new card token successfully', async () => {
        const tokenData = {
          card_number: '4242424242424242',
          card_exp_month: '12',
          card_exp_year: '2025',
          card_cvv: '123',
          customer_id: 'cust_123',
        };

        mockSuccessfulResponse(mockCardTokenResponse);

        const result = await client.paymentTokens.createCardToken(tokenData);

        expect(result).toEqual(mockCardTokenResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            url: '/tokens/card',
            data: expect.objectContaining({
              card_number: '4242424242424242',
              card_exp_month: '12',
              card_exp_year: '2025',
              customer_id: 'cust_123',
            }),
          })
        );
      });

      it('should create a token without customer_id', async () => {
        const tokenData = {
          card_number: '4242424242424242',
          card_exp_month: '12',
          card_exp_year: '2025',
          card_cvv: '123',
        };

        mockSuccessfulResponse(mockCardTokenResponse);

        const result = await client.paymentTokens.createCardToken(tokenData);

        expect(result).toEqual(mockCardTokenResponse);
      });
    });

    describe('getCardToken', () => {
      it('should fetch a specific card token by ID', async () => {
        const tokenId = 'tok_123';

        mockSuccessfulResponse(mockCardTokenResponse);

        const result = await client.paymentTokens.getCardToken(tokenId);

        expect(result).toEqual(mockCardTokenResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            url: `/tokens/card/${tokenId}`,
          })
        );
      });
    });

    describe('listCardTokensByCustomer', () => {
      it('should list card tokens for a customer without parameters', async () => {
        const customerId = 'cust_123';

        mockSuccessfulResponse(mockTokenListResponse);

        const result =
          await client.paymentTokens.listCardTokensByCustomer(customerId);

        expect(result).toEqual(mockTokenListResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            url: `/tokens/card/customer/${customerId}`,
          })
        );
      });

      it('should list card tokens with query parameters', async () => {
        const customerId = 'cust_123';
        const params = { page: 2, per_page: 10 };

        mockSuccessfulResponse(mockTokenListResponse);

        const result = await client.paymentTokens.listCardTokensByCustomer(
          customerId,
          params
        );

        expect(result).toEqual(mockTokenListResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            url: `/tokens/card/customer/${customerId}`,
            params,
          })
        );
      });
    });

    describe('deleteCardToken', () => {
      it('should delete a card token without customer_id', async () => {
        const tokenId = 'tok_123';

        mockSuccessfulResponse({ status: 'success', message: 'Token deleted' });

        const result = await client.paymentTokens.deleteCardToken({
          token: tokenId,
        });

        expect(result.status).toBe('success');
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'DELETE',
            url: `/tokens/card/${tokenId}`,
          })
        );
      });

      it('should delete a card token with customer_id', async () => {
        const tokenId = 'tok_123';
        const customerId = 'cust_123';

        mockSuccessfulResponse({ status: 'success', message: 'Token deleted' });

        const result = await client.paymentTokens.deleteCardToken({
          token: tokenId,
          customer_id: customerId,
        });

        expect(result.status).toBe('success');
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'DELETE',
            url: `/tokens/card/${tokenId}`,
          })
        );
      });
    });

    describe('updateCardToken', () => {
      it('should update a card token', async () => {
        const tokenId = 'tok_123';
        const updateData = {
          card_exp_month: '06',
          card_exp_year: '2026',
        };

        mockSuccessfulResponse(mockCardTokenResponse);

        const result = await client.paymentTokens.updateCardToken({
          token: tokenId,
          data: updateData,
        });

        expect(result).toEqual(mockCardTokenResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'PUT',
            url: `/tokens/card/${tokenId}`,
            data: {
              data: updateData,
              token: tokenId,
            },
          })
        );
      });
    });

    describe('rotateCardToken', () => {
      it('should rotate a card token', async () => {
        const tokenId = 'tok_123';

        mockSuccessfulResponse(mockCardTokenResponse);

        const result = await client.paymentTokens.rotateCardToken({
          token: tokenId,
        });

        expect(result).toEqual(mockCardTokenResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            url: `/tokens/card/${tokenId}/rotate`,
          })
        );
      });
    });

    describe('rollbackCardToken', () => {
      it('should rollback a card token rotation', async () => {
        const tokenId = 'tok_123';

        mockSuccessfulResponse(mockCardTokenResponse);

        const result = await client.paymentTokens.rollbackCardToken({
          token: tokenId,
        });

        expect(result).toEqual(mockCardTokenResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            url: `/tokens/card/${tokenId}/rollback`,
          })
        );
      });
    });
  });

  describe('ACH Tokens', () => {
    describe('createAchToken', () => {
      it('should create a new ACH token successfully', async () => {
        const tokenData = {
          account_number: '123456789',
          routing_number: '021000021',
          account_type: 'checking',
          customer_id: 'cust_123',
        };

        mockSuccessfulResponse(mockAchTokenResponse);

        const result = await client.paymentTokens.createAchToken(tokenData);

        expect(result).toEqual(mockAchTokenResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
            url: '/tokens/ach',
            data: expect.objectContaining({
              account_number: '123456789',
              routing_number: '021000021',
              account_type: 'checking',
              customer_id: 'cust_123',
            }),
          })
        );
      });

      it('should create an ACH token for savings account', async () => {
        const tokenData = {
          account_number: '123456789',
          routing_number: '021000021',
          account_type: 'savings',
        };

        mockSuccessfulResponse(mockAchTokenResponse);

        const result = await client.paymentTokens.createAchToken(tokenData);

        expect(result).toEqual(mockAchTokenResponse);
      });
    });

    describe('getAchToken', () => {
      it('should fetch a specific ACH token by ID', async () => {
        const tokenId = 'tok_ach_123';

        mockSuccessfulResponse(mockAchTokenResponse);

        const result = await client.paymentTokens.getAchToken(tokenId);

        expect(result).toEqual(mockAchTokenResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            url: `/tokens/ach/${tokenId}`,
          })
        );
      });
    });

    describe('listAchTokensByCustomer', () => {
      it('should list ACH tokens for a customer', async () => {
        const customerId = 'cust_123';

        mockSuccessfulResponse(mockTokenListResponse);

        const result =
          await client.paymentTokens.listAchTokensByCustomer(customerId);

        expect(result).toEqual(mockTokenListResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            url: `/tokens/ach/customer/${customerId}`,
          })
        );
      });

      it('should list ACH tokens with pagination', async () => {
        const customerId = 'cust_123';
        const params = { page: 1, per_page: 10 };

        mockSuccessfulResponse(mockTokenListResponse);

        const result = await client.paymentTokens.listAchTokensByCustomer(
          customerId,
          params
        );

        expect(result).toEqual(mockTokenListResponse);
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'GET',
            url: `/tokens/ach/customer/${customerId}`,
            params,
          })
        );
      });
    });
  });

  describe('listExpiringCardTokens', () => {
    it('should list expiring card tokens with date range', async () => {
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-31');

      mockSuccessfulResponse(mockTokenListResponse);

      const result = await client.paymentTokens.listExpiringCardTokens({
        startDate,
        endDate,
      });

      expect(result).toEqual(mockTokenListResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/tokens/card/expiring',
          params: expect.objectContaining({
            start_date: '2023-12-01',
            end_date: '2023-12-31',
            expiring_soon: true,
          }),
        })
      );
    });

    it('should throw error when start date is missing', async () => {
      await expect(
        client.paymentTokens.listExpiringCardTokens({
          startDate: null,
          endDate: new Date('2023-12-31'),
        })
      ).rejects.toThrow();
    });

    it('should throw error when end date is missing', async () => {
      await expect(
        client.paymentTokens.listExpiringCardTokens({
          startDate: new Date('2023-12-01'),
          endDate: null,
        })
      ).rejects.toThrow();
    });

    it('should throw error when start date is after end date', async () => {
      await expect(
        client.paymentTokens.listExpiringCardTokens({
          startDate: new Date('2023-12-31'),
          endDate: new Date('2023-12-01'),
        })
      ).rejects.toThrow();
    });

    it('should handle date conversion correctly', async () => {
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-31');

      mockSuccessfulResponse(mockTokenListResponse);

      const result = await client.paymentTokens.listExpiringCardTokens({
        startDate,
        endDate,
      });

      expect(result).toEqual(mockTokenListResponse);
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors from createCardToken', async () => {
      const tokenData = {
        card_number: 'invalid_card',
        card_exp_month: '12',
        card_exp_year: '2025',
      };

      mockFailedResponse('Invalid card number', 400);

      await expect(
        client.paymentTokens.createCardToken(tokenData)
      ).rejects.toThrow();
    });

    it('should propagate API errors from getCardToken', async () => {
      mockFailedResponse('Token not found', 404);

      await expect(
        client.paymentTokens.getCardToken('invalid_token')
      ).rejects.toThrow();
    });

    it('should propagate API errors from deleteCardToken', async () => {
      mockFailedResponse('Cannot delete token', 400);

      await expect(
        client.paymentTokens.deleteCardToken('tok_123')
      ).rejects.toThrow();
    });
  });

  describe('URL construction', () => {
    it('should properly encode tokens in URLs', async () => {
      const tokenId = 'tok_123/with/slashes';

      mockSuccessfulResponse(mockCardTokenResponse);

      await client.paymentTokens.getCardToken(tokenId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/tokens/card/${tokenId}`,
        })
      );
    });

    it('should handle customer IDs with special characters', async () => {
      const customerId = 'cust_123/with/special#chars';

      mockSuccessfulResponse(mockTokenListResponse);

      await client.paymentTokens.listCardTokensByCustomer(customerId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/tokens/card/customer/${customerId}`,
        })
      );
    });
  });
});
