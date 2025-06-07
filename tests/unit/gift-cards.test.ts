/**
 * @file tests/unit/gift-cards.test.ts
 * @description Unit tests for the GiftCards resource module
 */

import { GiftCards } from '../../src/resources/gift-cards';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('GiftCards', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let giftCards: GiftCards;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Create the GiftCards instance with the mock client
    giftCards = new GiftCards(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('activate', () => {
    const mockActivateRequest = {
      card_number: '6006491234567890',
      amount: '100.00',
      currency: 'USD' as const,
      reference_id: 'gc_activate_123',
      metadata: {
        source: 'api',
      },
    };

    const mockActivateResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Gift card activated successfully',
      data: {
        card_number: '6006491234567890',
        amount: '100.00',
        currency: 'USD' as const,
        balance: '100.00',
        status: 'active',
        reference_id: 'gc_activate_123',
      },
    };

    it('should activate a gift card successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockActivateResponse);

      // Call the method
      const result = await giftCards.activate(mockActivateRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/activate',
        mockActivateRequest
      );

      // Verify the result
      expect(result).toEqual(mockActivateResponse);
      expect(result.data.card_number).toBe('6006491234567890');
      expect(result.data.balance).toBe('100.00');
      expect(result.data.status).toBe('active');
    });

    it('should handle API errors when activating a gift card', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid gift card number',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(giftCards.activate(mockActivateRequest)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/activate',
        mockActivateRequest
      );
    });
  });

  describe('checkBalance', () => {
    const mockBalanceRequest = {
      card_number: '6006491234567890',
      reference_id: 'gc_balance_123',
    };

    const mockBalanceResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Balance retrieved successfully',
      data: {
        card_number: '6006491234567890',
        balance: '75.50',
        currency: 'USD' as const,
        status: 'active',
        reference_id: 'gc_balance_123',
      },
    };

    it('should check gift card balance successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockBalanceResponse);

      // Call the method
      const result = await giftCards.checkBalance(mockBalanceRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/balance',
        mockBalanceRequest
      );

      // Verify the result
      expect(result).toEqual(mockBalanceResponse);
      expect(result.data.card_number).toBe('6006491234567890');
      expect(result.data.balance).toBe('75.50');
      expect(result.data.status).toBe('active');
    });

    it('should handle API errors when checking balance', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError('Gift card not found', 404, 'GW04');
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(giftCards.checkBalance(mockBalanceRequest)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/balance',
        mockBalanceRequest
      );
    });
  });

  describe('deactivate', () => {
    const mockDeactivateRequest = {
      card_number: '6006491234567890',
      reference_id: 'gc_deactivate_123',
    };

    const mockDeactivateResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Gift card deactivated successfully',
      data: {
        card_number: '6006491234567890',
        status: 'inactive',
        reference_id: 'gc_deactivate_123',
      },
    };

    it('should deactivate a gift card successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockDeactivateResponse);

      // Call the method
      const result = await giftCards.deactivate(mockDeactivateRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/deactivate',
        mockDeactivateRequest
      );

      // Verify the result
      expect(result).toEqual(mockDeactivateResponse);
      expect(result.data.card_number).toBe('6006491234567890');
      expect(result.data.status).toBe('inactive');
    });

    it('should handle API errors when deactivating a gift card', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Gift card already inactive',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(giftCards.deactivate(mockDeactivateRequest)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/deactivate',
        mockDeactivateRequest
      );
    });
  });

  describe('load', () => {
    const mockLoadRequest = {
      card_number: '6006491234567890',
      amount: '50.00',
      currency: 'USD' as const,
      reference_id: 'gc_load_123',
      metadata: {
        source: 'reload',
      },
    };

    const mockLoadResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Gift card loaded successfully',
      data: {
        card_number: '6006491234567890',
        amount: '50.00',
        currency: 'USD' as const,
        balance: '125.50',
        status: 'active',
        reference_id: 'gc_load_123',
      },
    };

    it('should load funds onto a gift card successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockLoadResponse);

      // Call the method
      const result = await giftCards.load(mockLoadRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/load',
        mockLoadRequest
      );

      // Verify the result
      expect(result).toEqual(mockLoadResponse);
      expect(result.data.card_number).toBe('6006491234567890');
      expect(result.data.amount).toBe('50.00');
      expect(result.data.balance).toBe('125.50');
    });

    it('should handle API errors when loading a gift card', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Insufficient funds for load',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(giftCards.load(mockLoadRequest)).rejects.toThrow(mockError);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/load',
        mockLoadRequest
      );
    });
  });

  describe('processSale', () => {
    const mockSaleRequest = {
      card_number: '6006491234567890',
      amount: '25.00',
      currency: 'USD' as const,
      reference_id: 'gc_sale_123',
      metadata: {
        order_id: 'order_456',
      },
    };

    const mockSaleResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Gift card sale processed successfully',
      data: {
        card_number: '6006491234567890',
        amount: '25.00',
        currency: 'USD' as const,
        balance: '100.50',
        status: 'active',
        transaction_id: 'gc_txn_123456',
        reference_id: 'gc_sale_123',
      },
    };

    it('should process a gift card sale successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockSaleResponse);

      // Call the method
      const result = await giftCards.processSale(mockSaleRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/sale',
        mockSaleRequest
      );

      // Verify the result
      expect(result).toEqual(mockSaleResponse);
      expect(result.data.card_number).toBe('6006491234567890');
      expect(result.data.amount).toBe('25.00');
      expect(result.data.balance).toBe('100.50');
      expect(result.data.transaction_id).toBe('gc_txn_123456');
    });

    it('should handle API errors when processing a gift card sale', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Insufficient gift card balance',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(giftCards.processSale(mockSaleRequest)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/sale',
        mockSaleRequest
      );
    });
  });

  describe('processRefund', () => {
    const mockRefundRequest = {
      card_number: '6006491234567890',
      amount: '15.00',
      currency: 'USD' as const,
      transaction_id: 'gc_txn_123456',
      reference_id: 'gc_refund_123',
      metadata: {
        reason: 'customer_request',
      },
    };

    const mockRefundResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Gift card refund processed successfully',
      data: {
        card_number: '6006491234567890',
        amount: '15.00',
        currency: 'USD' as const,
        balance: '115.50',
        status: 'active',
        transaction_id: 'gc_refund_123456',
        reference_id: 'gc_refund_123',
      },
    };

    it('should process a gift card refund successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockRefundResponse);

      // Call the method
      const result = await giftCards.processRefund(mockRefundRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/refund',
        mockRefundRequest
      );

      // Verify the result
      expect(result).toEqual(mockRefundResponse);
      expect(result.data.card_number).toBe('6006491234567890');
      expect(result.data.amount).toBe('15.00');
      expect(result.data.balance).toBe('115.50');
      expect(result.data.transaction_id).toBe('gc_refund_123456');
    });

    it('should handle API errors when processing a gift card refund', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Original transaction not found',
        404,
        'GW04'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(giftCards.processRefund(mockRefundRequest)).rejects.toThrow(
        mockError
      );

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/refund',
        mockRefundRequest
      );
    });
  });
});
