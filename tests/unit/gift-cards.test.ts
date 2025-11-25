/**
 * @file tests/unit/gift-cards.test.ts
 * @description Unit tests for GiftCards resource class
 */

import { GiftCards } from '../../src/resources/gift-cards';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import type {
  GiftCardActivateRequest,
  GiftCardActivateResponse,
  GiftCardBalanceRequest,
  GiftCardBalanceResponse,
  GiftCardDeactivateRequest,
  GiftCardDeactivateResponse,
  GiftCardLoadRequest,
  GiftCardLoadResponse,
  GiftCardSaleRequest,
  GiftCardSaleResponse,
  GiftCardRefundRequest,
  GiftCardRefundResponse,
} from '../../src/resources/gift-cards';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('GiftCards', () => {
  let giftCards: GiftCards;
  let mockClient: jest.Mocked<BaseClient>;

  const mockGiftCardResponse: GiftCardActivateResponse = {
    status: 'success',
    code: '200',
    message: 'Gift card operation successful',
    data: {
      card_number: '4111111111111111',
      amount: '100.00',
      currency: 'USD',
      balance: '100.00',
      status: 'active',
      reference_id: 'ref_123',
    },
  };

  const mockBalanceResponse: GiftCardBalanceResponse = {
    status: 'success',
    code: '200',
    message: 'Balance check successful',
    data: {
      card_number: '4111111111111111',
      balance: '100.00',
      currency: 'USD',
      status: 'active',
      reference_id: 'ref_123',
    },
  };

  const mockDeactivateResponse: GiftCardDeactivateResponse = {
    status: 'success',
    code: '200',
    message: 'Gift card deactivated successfully',
    data: {
      card_number: '4111111111111111',
      status: 'inactive',
      reference_id: 'ref_123',
    },
  };

  const mockLoadResponse: GiftCardLoadResponse = {
    status: 'success',
    code: '200',
    message: 'Gift card loaded successfully',
    data: {
      card_number: '4111111111111111',
      amount: '50.00',
      currency: 'USD',
      balance: '150.00',
      status: 'active',
      reference_id: 'ref_123',
    },
  };

  const mockSaleResponse: GiftCardSaleResponse = {
    status: 'success',
    code: '200',
    message: 'Gift card sale processed successfully',
    data: {
      card_number: '4111111111111111',
      amount: '25.00',
      currency: 'USD',
      balance: '125.00',
      status: 'active',
      transaction_id: 'txn_123',
      reference_id: 'ref_123',
    },
  };

  const mockRefundResponse: GiftCardRefundResponse = {
    status: 'success',
    code: '200',
    message: 'Gift card refund processed successfully',
    data: {
      card_number: '4111111111111111',
      amount: '25.00',
      currency: 'USD',
      balance: '150.00',
      status: 'active',
      transaction_id: 'txn_124',
      reference_id: 'ref_124',
    },
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    giftCards = new GiftCards(mockClient);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with BaseClient instance', () => {
      expect(giftCards['client']).toBe(mockClient);
      expect(giftCards['basePath']).toBe('/gift-cards');
    });
  });

  describe('activate', () => {
    it('should activate a gift card successfully', async () => {
      const activateData: GiftCardActivateRequest = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
        reference_id: 'ref_123',
        metadata: { customer_id: 'cust_123' },
      };

      mockClient.post.mockResolvedValue(mockGiftCardResponse);

      const result = await giftCards.activate(activateData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/activate',
        activateData
      );
      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should activate a gift card with minimal data', async () => {
      const minimalData: GiftCardActivateRequest = {
        card_number: '4111111111111111',
        amount: '50.00',
        currency: 'USD',
      };

      mockClient.post.mockResolvedValue(mockGiftCardResponse);

      const result = await giftCards.activate(minimalData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/activate',
        minimalData
      );
      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should propagate API errors', async () => {
      const activateData: GiftCardActivateRequest = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
      };

      const apiError = new QorPayApiError('Gift card activation failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(giftCards.activate(activateData)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const activateData: GiftCardActivateRequest = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(giftCards.activate(activateData)).rejects.toThrow(
        networkError
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        card_number: '',
        amount: '100.00',
        currency: 'USD',
      };

      let error: Error;
      try {
        await giftCards.activate(invalidData as GiftCardActivateRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('checkBalance', () => {
    it('should check gift card balance successfully', async () => {
      const balanceData: GiftCardBalanceRequest = {
        card_number: '4111111111111111',
        reference_id: 'ref_123',
      };

      mockClient.post.mockResolvedValue(mockBalanceResponse);

      const result = await giftCards.checkBalance(balanceData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/balance',
        balanceData
      );
      expect(result).toEqual(mockBalanceResponse);
    });

    it('should check balance with minimal data', async () => {
      const minimalData: GiftCardBalanceRequest = {
        card_number: '4111111111111111',
      };

      mockClient.post.mockResolvedValue(mockBalanceResponse);

      const result = await giftCards.checkBalance(minimalData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/balance',
        minimalData
      );
      expect(result).toEqual(mockBalanceResponse);
    });

    it('should propagate API errors', async () => {
      const balanceData: GiftCardBalanceRequest = {
        card_number: '4111111111111111',
      };

      const apiError = new QorPayApiError('Gift card not found', 404);
      mockClient.post.mockRejectedValue(apiError);

      await expect(giftCards.checkBalance(balanceData)).rejects.toThrow(
        apiError
      );
    });

    it('should propagate network errors', async () => {
      const balanceData: GiftCardBalanceRequest = {
        card_number: '4111111111111111',
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(giftCards.checkBalance(balanceData)).rejects.toThrow(
        networkError
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        card_number: '',
      };

      let error: Error;
      try {
        await giftCards.checkBalance(invalidData as GiftCardBalanceRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a gift card successfully', async () => {
      const deactivateData: GiftCardDeactivateRequest = {
        card_number: '4111111111111111',
        reference_id: 'ref_123',
      };

      mockClient.post.mockResolvedValue(mockDeactivateResponse);

      const result = await giftCards.deactivate(deactivateData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/deactivate',
        deactivateData
      );
      expect(result).toEqual(mockDeactivateResponse);
    });

    it('should deactivate with minimal data', async () => {
      const minimalData: GiftCardDeactivateRequest = {
        card_number: '4111111111111111',
      };

      mockClient.post.mockResolvedValue(mockDeactivateResponse);

      const result = await giftCards.deactivate(minimalData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/deactivate',
        minimalData
      );
      expect(result).toEqual(mockDeactivateResponse);
    });

    it('should propagate API errors', async () => {
      const deactivateData: GiftCardDeactivateRequest = {
        card_number: '4111111111111111',
      };

      const apiError = new QorPayApiError('Gift card deactivation failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(giftCards.deactivate(deactivateData)).rejects.toThrow(
        apiError
      );
    });

    it('should propagate network errors', async () => {
      const deactivateData: GiftCardDeactivateRequest = {
        card_number: '4111111111111111',
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(giftCards.deactivate(deactivateData)).rejects.toThrow(
        networkError
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        card_number: '',
      };

      let error: Error;
      try {
        await giftCards.deactivate(invalidData as GiftCardDeactivateRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('load', () => {
    it('should load a gift card successfully', async () => {
      const loadData: GiftCardLoadRequest = {
        card_number: '4111111111111111',
        amount: '50.00',
        currency: 'USD',
        reference_id: 'ref_123',
        metadata: { source: 'cash' },
      };

      mockClient.post.mockResolvedValue(mockLoadResponse);

      const result = await giftCards.load(loadData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/load',
        loadData
      );
      expect(result).toEqual(mockLoadResponse);
    });

    it('should load with minimal data', async () => {
      const minimalData: GiftCardLoadRequest = {
        card_number: '4111111111111111',
        amount: '50.00',
        currency: 'USD',
      };

      mockClient.post.mockResolvedValue(mockLoadResponse);

      const result = await giftCards.load(minimalData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/load',
        minimalData
      );
      expect(result).toEqual(mockLoadResponse);
    });

    it('should propagate API errors', async () => {
      const loadData: GiftCardLoadRequest = {
        card_number: '4111111111111111',
        amount: '50.00',
        currency: 'USD',
      };

      const apiError = new QorPayApiError('Gift card load failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(giftCards.load(loadData)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const loadData: GiftCardLoadRequest = {
        card_number: '4111111111111111',
        amount: '50.00',
        currency: 'USD',
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(giftCards.load(loadData)).rejects.toThrow(networkError);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        card_number: '',
        amount: '50.00',
        currency: 'USD',
      };

      let error: Error;
      try {
        await giftCards.load(invalidData as GiftCardLoadRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });

    it('should validate amount format', async () => {
      const invalidData = {
        card_number: '4111111111111111',
        amount: 'invalid',
        currency: 'USD',
      };

      let error: Error;
      try {
        await giftCards.load(invalidData as GiftCardLoadRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('processSale', () => {
    it('should process a gift card sale successfully', async () => {
      const saleData: GiftCardSaleRequest = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
        reference_id: 'ref_123',
        metadata: { store_id: 'store_001' },
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await giftCards.processSale(saleData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/sale',
        saleData
      );
      expect(result).toEqual(mockSaleResponse);
    });

    it('should process sale with minimal data', async () => {
      const minimalData: GiftCardSaleRequest = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
      };

      mockClient.post.mockResolvedValue(mockSaleResponse);

      const result = await giftCards.processSale(minimalData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/sale',
        minimalData
      );
      expect(result).toEqual(mockSaleResponse);
    });

    it('should propagate API errors', async () => {
      const saleData: GiftCardSaleRequest = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
      };

      const apiError = new QorPayApiError('Insufficient balance', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(giftCards.processSale(saleData)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const saleData: GiftCardSaleRequest = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(giftCards.processSale(saleData)).rejects.toThrow(
        networkError
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        card_number: '',
        amount: '25.00',
        currency: 'USD',
      };

      let error: Error;
      try {
        await giftCards.processSale(invalidData as GiftCardSaleRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });

    it('should validate amount is positive', async () => {
      const invalidData = {
        card_number: '4111111111111111',
        amount: '-10.00',
        currency: 'USD',
      };

      let error: Error;
      try {
        await giftCards.processSale(invalidData as GiftCardSaleRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('processRefund', () => {
    it('should process a gift card refund successfully', async () => {
      const refundData: GiftCardRefundRequest = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
        transaction_id: 'txn_123',
        reference_id: 'ref_124',
        metadata: { reason: 'customer_return' },
      };

      mockClient.post.mockResolvedValue(mockRefundResponse);

      const result = await giftCards.processRefund(refundData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/refund',
        refundData
      );
      expect(result).toEqual(mockRefundResponse);
    });

    it('should process refund with minimal data', async () => {
      const minimalData: GiftCardRefundRequest = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
        transaction_id: 'txn_123',
      };

      mockClient.post.mockResolvedValue(mockRefundResponse);

      const result = await giftCards.processRefund(minimalData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/refund',
        minimalData
      );
      expect(result).toEqual(mockRefundResponse);
    });

    it('should propagate API errors', async () => {
      const refundData: GiftCardRefundRequest = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
        transaction_id: 'txn_123',
      };

      const apiError = new QorPayApiError('Refund failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(giftCards.processRefund(refundData)).rejects.toThrow(
        apiError
      );
    });

    it('should propagate network errors', async () => {
      const refundData: GiftCardRefundRequest = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
        transaction_id: 'txn_123',
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(giftCards.processRefund(refundData)).rejects.toThrow(
        networkError
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        card_number: '',
        amount: '25.00',
        currency: 'USD',
        transaction_id: '',
      };

      let error: Error;
      try {
        await giftCards.processRefund(invalidData as GiftCardRefundRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });

    it('should validate transaction ID is provided', async () => {
      const invalidData = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
        transaction_id: '',
      };

      let error: Error;
      try {
        await giftCards.processRefund(invalidData as GiftCardRefundRequest);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle card number with spaces', async () => {
      const activateData: GiftCardActivateRequest = {
        card_number: '4111 1111 1111 1111',
        amount: '100.00',
        currency: 'USD',
      };

      mockClient.post.mockResolvedValue(mockGiftCardResponse);

      const result = await giftCards.activate(activateData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/activate',
        activateData
      );
      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should handle zero amount for activation', async () => {
      const activateData: GiftCardActivateRequest = {
        card_number: '4111111111111111',
        amount: '0.00',
        currency: 'USD',
      };

      mockClient.post.mockResolvedValue(mockGiftCardResponse);

      const result = await giftCards.activate(activateData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/activate',
        activateData
      );
      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should handle maximum decimal precision for amounts', async () => {
      const loadData: GiftCardLoadRequest = {
        card_number: '4111111111111111',
        amount: '99.99',
        currency: 'USD',
      };

      mockClient.post.mockResolvedValue(mockLoadResponse);

      const result = await giftCards.load(loadData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/load',
        loadData
      );
      expect(result).toEqual(mockLoadResponse);
    });

    it('should handle empty metadata object', async () => {
      const activateData: GiftCardActivateRequest = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
        metadata: {},
      };

      mockClient.post.mockResolvedValue(mockGiftCardResponse);

      const result = await giftCards.activate(activateData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/activate',
        activateData
      );
      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should handle missing optional reference_id', async () => {
      const balanceData: GiftCardBalanceRequest = {
        card_number: '4111111111111111',
      };

      mockClient.post.mockResolvedValue(mockBalanceResponse);

      const result = await giftCards.checkBalance(balanceData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/gift-cards/balance',
        balanceData
      );
      expect(result).toEqual(mockBalanceResponse);
    });
  });
});
