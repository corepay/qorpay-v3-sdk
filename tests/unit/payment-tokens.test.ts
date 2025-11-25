/**
 * @file tests/unit/payment-tokens.test.ts
 * @description Unit tests for the PaymentTokens resource module
 */

import { PaymentTokens } from '../../src/resources/payment-tokens';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('PaymentTokens', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let paymentTokens: PaymentTokens;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Create the PaymentTokens instance with the mock client
    paymentTokens = new PaymentTokens(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCardToken', () => {
    const mockCardTokenRequest = {
      card_number: '4111111111111111',
      card_exp: '1225',
      card_cvv: '123',
      card_holder: 'John Doe',
      customer_id: 'cust_123456',
    };

    const mockCardTokenResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        token: 'card_token_123',
        card_brand: 'visa',
        card_type: 'credit',
        last4: '1111',
        exp_month: '12',
        exp_year: '25',
        created_at: '2023-01-01T12:00:00Z',
      },
    };

    it('should create a card token successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockCardTokenResponse);

      // Call the method
      const result = await paymentTokens.createCardToken(mockCardTokenRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/tokens/card',
        mockCardTokenRequest
      );

      // Verify the result
      expect(result).toEqual(mockCardTokenResponse);
      expect(result.data.token).toBe('card_token_123');
      expect(result.data.last4).toBe('1111');
    });

    it('should handle API errors when creating a card token', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError('Invalid card number', 400, 'GW01');
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.createCardToken(mockCardTokenRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/tokens/card',
        mockCardTokenRequest
      );
    });
  });

  describe('getCardToken', () => {
    const mockToken = 'card_token_123';
    const mockTokenResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        token: 'card_token_123',
        card_brand: 'visa',
        card_type: 'credit',
        last4: '1111',
        exp_month: '12',
        exp_year: '25',
        created_at: '2023-01-01T12:00:00Z',
      },
    };

    it('should get a card token successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTokenResponse);

      // Call the method
      const result = await paymentTokens.getCardToken(mockToken);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(`/tokens/card/${mockToken}`);

      // Verify the result
      expect(result).toEqual(mockTokenResponse);
      expect(result.data.token).toBe(mockToken);
    });

    it('should handle API errors when getting a card token', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Token not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(paymentTokens.getCardToken(mockToken)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(`/tokens/card/${mockToken}`);
    });
  });

  describe('listCardTokensByCustomer', () => {
    const mockCustomerId = 'cust_123456';
    const mockParams = {
      limit: 10,
      offset: 0,
    };
    const mockTokensResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        tokens: [
          {
            token: 'card_token_123',
            card_brand: 'visa',
            card_type: 'credit',
            last4: '1111',
            exp_month: '12',
            exp_year: '25',
            created_at: '2023-01-01T12:00:00Z',
          },
          {
            token: 'card_token_456',
            card_brand: 'mastercard',
            card_type: 'credit',
            last4: '5678',
            exp_month: '10',
            exp_year: '24',
            created_at: '2023-02-01T12:00:00Z',
          },
        ],
        count: 2,
        total: 2,
      },
    };

    it('should list card tokens by customer successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTokensResponse);

      // Call the method
      const result = await paymentTokens.listCardTokensByCustomer(
        mockCustomerId,
        mockParams
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/tokens/card/customer/${mockCustomerId}`,
        mockParams
      );

      // Verify the result
      expect(result).toEqual(mockTokensResponse);
      expect(result.data.tokens).toHaveLength(2);
      expect(result.data.tokens[0].token).toBe('card_token_123');
    });

    it('should handle API errors when listing card tokens', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Customer not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.listCardTokensByCustomer(mockCustomerId, mockParams)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/tokens/card/customer/${mockCustomerId}`,
        mockParams
      );
    });
  });

  describe('deleteCardToken', () => {
    const mockDeleteParams = {
      token: 'card_token_123',
      customer_id: 'cust_123456',
    };
    const mockDeleteResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Token deleted successfully',
      data: {
        deleted: true,
        token: 'card_token_123',
      },
    };

    it('should delete a card token successfully with customer ID', async () => {
      // Mock the delete method to return a successful response
      mockClient.delete.mockResolvedValue(mockDeleteResponse);

      // Call the method
      const result = await paymentTokens.deleteCardToken(mockDeleteParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/tokens/card/${mockDeleteParams.token}`,
        { customer_id: mockDeleteParams.customer_id }
      );

      // Verify the result
      expect(result).toEqual(mockDeleteResponse);
      expect(result.data.deleted).toBe(true);
      expect(result.data.token).toBe(mockDeleteParams.token);
    });

    it('should delete a card token successfully without customer ID', async () => {
      // Mock the delete method to return a successful response
      mockClient.delete.mockResolvedValue(mockDeleteResponse);

      // Call the method without customer_id
      const result = await paymentTokens.deleteCardToken({
        token: mockDeleteParams.token,
      });

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/tokens/card/${mockDeleteParams.token}`,
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockDeleteResponse);
    });

    it('should handle API errors when deleting a card token', async () => {
      // Mock the delete method to throw an API error
      const mockError = new QorPayApiError('Token not found', 404, 'GW04');
      mockClient.delete.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.deleteCardToken(mockDeleteParams)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.delete).toHaveBeenCalledWith(
        `/tokens/card/${mockDeleteParams.token}`,
        { customer_id: mockDeleteParams.customer_id }
      );
    });
  });

  describe('updateCardToken', () => {
    const mockUpdateRequest = {
      token: 'card_token_123',
      card_exp: '1226',
      card_holder: 'Jane Doe',
      metadata: {
        updated: true,
      },
    };
    const mockUpdateResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Token updated successfully',
      data: {
        token: 'card_token_123',
        card_brand: 'visa',
        card_type: 'credit',
        last4: '1111',
        exp_month: '12',
        exp_year: '26',
        card_holder: 'Jane Doe',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-03-01T12:00:00Z',
      },
    };

    it('should update a card token successfully', async () => {
      // Mock the put method to return a successful response
      mockClient.put.mockResolvedValue(mockUpdateResponse);

      // Call the method
      const result = await paymentTokens.updateCardToken(mockUpdateRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/tokens/card/${mockUpdateRequest.token}`,
        mockUpdateRequest
      );

      // Verify the result
      expect(result).toEqual(mockUpdateResponse);
      expect(result.data.exp_year).toBe('26');
      expect(result.data.card_holder).toBe('Jane Doe');
    });

    it('should handle API errors when updating a card token', async () => {
      // Mock the put method to throw an API error
      const mockError = new QorPayApiError('Token not found', 404, 'GW04');
      mockClient.put.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.updateCardToken(mockUpdateRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/tokens/card/${mockUpdateRequest.token}`,
        mockUpdateRequest
      );
    });
  });

  describe('rotateCardToken', () => {
    const mockRotateRequest = {
      token: 'card_token_123',
      card_number: '4111111111111111',
      card_exp: '1226',
      card_cvv: '123',
    };
    const mockRotateResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Token rotated successfully',
      data: {
        token: 'card_token_123',
        card_brand: 'visa',
        card_type: 'credit',
        last4: '1111',
        exp_month: '12',
        exp_year: '26',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-03-01T12:00:00Z',
        rotation_id: 'rot_123456',
      },
    };

    it('should rotate a card token successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockRotateResponse);

      // Call the method
      const result = await paymentTokens.rotateCardToken(mockRotateRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        `/tokens/card/${mockRotateRequest.token}/rotate`,
        mockRotateRequest
      );

      // Verify the result
      expect(result).toEqual(mockRotateResponse);
      expect(result.data.rotation_id).toBe('rot_123456');
      expect(result.data.exp_year).toBe('26');
    });

    it('should handle API errors when rotating a card token', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError('Invalid card number', 400, 'GW01');
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.rotateCardToken(mockRotateRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        `/tokens/card/${mockRotateRequest.token}/rotate`,
        mockRotateRequest
      );
    });
  });

  describe('rollbackCardToken', () => {
    const mockRollbackRequest = {
      token: 'card_token_123',
      rotation_id: 'rot_123456',
    };
    const mockRollbackResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Token rotation rollback successful',
      data: {
        token: 'card_token_123',
        card_brand: 'visa',
        card_type: 'credit',
        last4: '1111',
        exp_month: '12',
        exp_year: '25',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-03-01T12:00:00Z',
      },
    };

    it('should rollback a card token rotation successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockRollbackResponse);

      // Call the method
      const result = await paymentTokens.rollbackCardToken(mockRollbackRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        `/tokens/card/${mockRollbackRequest.token}/rollback`,
        mockRollbackRequest
      );

      // Verify the result
      expect(result).toEqual(mockRollbackResponse);
      expect(result.data.exp_year).toBe('25');
    });

    it('should handle API errors when rolling back a card token rotation', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError('Invalid rotation ID', 400, 'GW08');
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.rollbackCardToken(mockRollbackRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        `/tokens/card/${mockRollbackRequest.token}/rollback`,
        mockRollbackRequest
      );
    });
  });

  describe('createAchToken', () => {
    const mockAchTokenRequest = {
      account_number: '123456789',
      routing_number: '021000021',
      account_type: 'checking',
      account_holder: 'John Doe',
      customer_id: 'cust_123456',
    };

    const mockAchTokenResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        token: 'ach_token_123',
        account_type: 'checking',
        last4: '6789',
        routing: '021000021',
        created_at: '2023-01-01T12:00:00Z',
      },
    };

    it('should create an ACH token successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockAchTokenResponse);

      // Call the method
      const result = await paymentTokens.createAchToken(mockAchTokenRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/tokens/ach',
        mockAchTokenRequest
      );

      // Verify the result
      expect(result).toEqual(mockAchTokenResponse);
      expect(result.data.token).toBe('ach_token_123');
      expect(result.data.last4).toBe('6789');
    });

    it('should handle API errors when creating an ACH token', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid routing number',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.createAchToken(mockAchTokenRequest)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/tokens/ach',
        mockAchTokenRequest
      );
    });
  });

  describe('getAchToken', () => {
    const mockToken = 'ach_token_123';
    const mockTokenResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        token: 'ach_token_123',
        account_type: 'checking',
        last4: '6789',
        routing: '021000021',
        created_at: '2023-01-01T12:00:00Z',
      },
    };

    it('should get an ACH token successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTokenResponse);

      // Call the method
      const result = await paymentTokens.getAchToken(mockToken);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(`/tokens/ach/${mockToken}`);

      // Verify the result
      expect(result).toEqual(mockTokenResponse);
      expect(result.data.token).toBe(mockToken);
    });

    it('should handle API errors when getting an ACH token', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Token not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(paymentTokens.getAchToken(mockToken)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(`/tokens/ach/${mockToken}`);
    });
  });

  describe('listAchTokensByCustomer', () => {
    const mockCustomerId = 'cust_123456';
    const mockParams = {
      limit: 10,
      offset: 0,
    };
    const mockTokensResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        tokens: [
          {
            token: 'ach_token_123',
            account_type: 'checking',
            last4: '6789',
            routing: '021000021',
            created_at: '2023-01-01T12:00:00Z',
          },
          {
            token: 'ach_token_456',
            account_type: 'savings',
            last4: '1234',
            routing: '021000021',
            created_at: '2023-02-01T12:00:00Z',
          },
        ],
        count: 2,
        total: 2,
      },
    };

    it('should list ACH tokens by customer successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockTokensResponse);

      // Call the method
      const result = await paymentTokens.listAchTokensByCustomer(
        mockCustomerId,
        mockParams
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/tokens/ach/customer/${mockCustomerId}`,
        mockParams
      );

      // Verify the result
      expect(result).toEqual(mockTokensResponse);
      expect(result.data.tokens).toHaveLength(2);
      expect(result.data.tokens[0].token).toBe('ach_token_123');
    });

    it('should handle API errors when listing ACH tokens', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError('Customer not found', 404, 'GW04');
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.listAchTokensByCustomer(mockCustomerId, mockParams)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/tokens/ach/customer/${mockCustomerId}`,
        mockParams
      );
    });
  });

  describe('listExpiringCardTokens', () => {
    const mockStartDate = new Date('2024-12-01');
    const mockEndDate = new Date('2024-12-31');
    const mockParams = {
      startDate: mockStartDate,
      endDate: mockEndDate,
      limit: 10,
      offset: 0,
    };

    const mockExpiringTokensResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        tokens: [
          {
            token: 'card_token_expiring1',
            card_type: 'visa',
            last_four: '1111',
            exp_date: '1224',
            card_holder: 'John Doe',
            customer_id: 'cust_123',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
        has_more: false,
        limit: 10,
        offset: 0,
      },
    };

    it('should successfully list expiring card tokens', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockExpiringTokensResponse);

      // Call the method
      const result = await paymentTokens.listExpiringCardTokens(mockParams);

      // Verify the client was called with correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/tokens/card/expiring', {
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        limit: 10,
        offset: 0,
        expiring_soon: true,
      });

      // Verify the result
      expect(result).toEqual(mockExpiringTokensResponse);
    });

    it('should handle optional parameters correctly', async () => {
      const paramsWithoutLimitOffset = {
        startDate: mockStartDate,
        endDate: mockEndDate,
      };

      mockClient.get.mockResolvedValue(mockExpiringTokensResponse);

      await paymentTokens.listExpiringCardTokens(paramsWithoutLimitOffset);

      expect(mockClient.get).toHaveBeenCalledWith('/tokens/card/expiring', {
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        limit: undefined,
        offset: undefined,
        expiring_soon: true,
      });
    });

    it('should validate that start date is provided', async () => {
      const invalidParams = {
        startDate: undefined as any,
        endDate: mockEndDate,
      };

      await expect(
        paymentTokens.listExpiringCardTokens(invalidParams)
      ).rejects.toThrow(
        'Start date and end date are required for expiring tokens filter'
      );
    });

    it('should validate that end date is provided', async () => {
      const invalidParams = {
        startDate: mockStartDate,
        endDate: undefined as any,
      };

      await expect(
        paymentTokens.listExpiringCardTokens(invalidParams)
      ).rejects.toThrow(
        'Start date and end date are required for expiring tokens filter'
      );
    });

    it('should validate that start date is before end date', async () => {
      const invalidParams = {
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-12-01'), // Before start date
      };

      await expect(
        paymentTokens.listExpiringCardTokens(invalidParams)
      ).rejects.toThrow('Start date must be before or equal to end date');
    });

    it('should allow start date equal to end date', async () => {
      const validParams = {
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-15'), // Same day
      };

      mockClient.get.mockResolvedValue(mockExpiringTokensResponse);

      await expect(
        paymentTokens.listExpiringCardTokens(validParams)
      ).resolves.toEqual(mockExpiringTokensResponse);

      expect(mockClient.get).toHaveBeenCalledWith('/tokens/card/expiring', {
        start_date: '2024-12-15',
        end_date: '2024-12-15',
        limit: undefined,
        offset: undefined,
        expiring_soon: true,
      });
    });

    it('should handle API errors when listing expiring tokens', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Internal server error',
        500,
        'GW01'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(
        paymentTokens.listExpiringCardTokens(mockParams)
      ).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/tokens/card/expiring', {
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        limit: 10,
        offset: 0,
        expiring_soon: true,
      });
    });

    it('should handle network errors when listing expiring tokens', async () => {
      // Mock the get method to throw a network error
      const networkError = new Error('Network timeout');
      mockClient.get.mockRejectedValue(networkError);

      // Expect the method to throw the network error
      await expect(
        paymentTokens.listExpiringCardTokens(mockParams)
      ).rejects.toThrow(networkError);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith('/tokens/card/expiring', {
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        limit: 10,
        offset: 0,
        expiring_soon: true,
      });
    });
  });
});
