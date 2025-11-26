/**
 * @file tests/unit/gift-cards.test.ts
 * @description Tests for GiftCards resource class using real instances
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

describe('GiftCards', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockGiftCardResponse = {
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

  const mockBalanceResponse = {
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

  const mockDeactivateResponse = {
    status: 'success',
    code: '200',
    message: 'Gift card deactivated successfully',
    data: {
      card_number: '4111111111111111',
      status: 'inactive',
      reference_id: 'ref_123',
    },
  };

  const mockLoadResponse = {
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

  const mockSaleResponse = {
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

  const mockRefundResponse = {
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
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize gift cards resource', () => {
      expect(client.giftCards).toBeDefined();
      expect(typeof client.giftCards.activate).toBe('function');
      expect(typeof client.giftCards.checkBalance).toBe('function');
      expect(typeof client.giftCards.deactivate).toBe('function');
      expect(typeof client.giftCards.load).toBe('function');
      expect(typeof client.giftCards.processSale).toBe('function');
      expect(typeof client.giftCards.processRefund).toBe('function');
    });
  });

  describe('activate', () => {
    it('should activate a gift card successfully', async () => {
      const activateData = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
        reference_id: 'ref_123',
        metadata: { customer_id: 'cust_123' },
      };

      mockSuccessfulResponse(mockGiftCardResponse);

      const result = await client.giftCards.activate(activateData);

      expect(result).toEqual(mockGiftCardResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/gift-cards/activate',
          data: expect.objectContaining({
            card_number: '4111111111111111',
            amount: '100.00',
            currency: 'USD',
            reference_id: 'ref_123',
          }),
        })
      );
    });

    it('should activate a gift card with minimal data', async () => {
      const activateData = {
        card_number: '4111111111111111',
        amount: '50.00',
        currency: 'USD',
      };

      mockSuccessfulResponse(mockGiftCardResponse);

      const result = await client.giftCards.activate(activateData);

      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should propagate API errors', async () => {
      const activateData = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
      };

      mockFailedResponse('Invalid gift card', 400);

      await expect(client.giftCards.activate(activateData)).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      const activateData = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
      };

      mockFailedResponse('Network error', 500);

      await expect(client.giftCards.activate(activateData)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required card_number
        amount: '100.00',
        currency: 'USD',
      };

      // Zod validation should throw before HTTP call
      await expect(
        client.giftCards.activate(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('checkBalance', () => {
    it('should check gift card balance successfully', async () => {
      const balanceData = {
        card_number: '4111111111111111',
      };

      mockSuccessfulResponse(mockBalanceResponse);

      const result = await client.giftCards.checkBalance(balanceData);

      expect(result).toEqual(mockBalanceResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/gift-cards/balance',
          data: { card_number: '4111111111111111' },
        })
      );
    });

    it('should check balance with minimal data', async () => {
      const balanceData = {
        card_number: '4111111111111111',
      };

      mockSuccessfulResponse(mockBalanceResponse);

      const result = await client.giftCards.checkBalance(balanceData);

      expect(result).toEqual(mockBalanceResponse);
    });

    it('should propagate API errors', async () => {
      const balanceData = {
        card_number: 'invalid_card',
      };

      mockFailedResponse('Card not found', 404);

      await expect(
        client.giftCards.checkBalance(balanceData)
      ).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      const balanceData = {
        card_number: '4111111111111111',
      };

      mockFailedResponse('Network error', 500);

      await expect(
        client.giftCards.checkBalance(balanceData)
      ).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidData = {};

      await expect(
        client.giftCards.checkBalance(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('deactivate', () => {
    it('should deactivate a gift card successfully', async () => {
      const deactivateData = {
        card_number: '4111111111111111',
        reference_id: 'ref_123',
      };

      mockSuccessfulResponse(mockDeactivateResponse);

      const result = await client.giftCards.deactivate(deactivateData);

      expect(result).toEqual(mockDeactivateResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/gift-cards/deactivate',
          data: expect.objectContaining({
            card_number: '4111111111111111',
            reference_id: 'ref_123',
          }),
        })
      );
    });

    it('should deactivate with minimal data', async () => {
      const deactivateData = {
        card_number: '4111111111111111',
      };

      mockSuccessfulResponse(mockDeactivateResponse);

      const result = await client.giftCards.deactivate(deactivateData);

      expect(result).toEqual(mockDeactivateResponse);
    });

    it('should propagate API errors', async () => {
      const deactivateData = {
        card_number: 'invalid_card',
      };

      mockFailedResponse('Card not found', 404);

      await expect(
        client.giftCards.deactivate(deactivateData)
      ).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      const deactivateData = {
        card_number: '4111111111111111',
      };

      mockFailedResponse('Network error', 500);

      await expect(
        client.giftCards.deactivate(deactivateData)
      ).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidData = {};

      await expect(
        client.giftCards.deactivate(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('load', () => {
    it('should load a gift card successfully', async () => {
      const loadData = {
        card_number: '4111111111111111',
        amount: '50.00',
        currency: 'USD',
        reference_id: 'ref_123',
      };

      mockSuccessfulResponse(mockLoadResponse);

      const result = await client.giftCards.load(loadData);

      expect(result).toEqual(mockLoadResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/gift-cards/load',
          data: expect.objectContaining({
            card_number: '4111111111111111',
            amount: '50.00',
            currency: 'USD',
          }),
        })
      );
    });

    it('should load with minimal data', async () => {
      const loadData = {
        card_number: '4111111111111111',
        amount: '25.00',
      };

      mockSuccessfulResponse(mockLoadResponse);

      const result = await client.giftCards.load(loadData);

      expect(result).toEqual(mockLoadResponse);
    });

    it('should propagate API errors', async () => {
      const loadData = {
        card_number: 'invalid_card',
        amount: '50.00',
      };

      mockFailedResponse('Card not found', 404);

      await expect(client.giftCards.load(loadData)).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      const loadData = {
        card_number: '4111111111111111',
        amount: '50.00',
      };

      mockFailedResponse('Network error', 500);

      await expect(client.giftCards.load(loadData)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        amount: '50.00',
        // Missing required card_number
      };

      await expect(client.giftCards.load(invalidData as any)).rejects.toThrow();
    });

    it('should validate amount format', async () => {
      const invalidData = {
        card_number: '4111111111111111',
        amount: 'invalid_amount',
      };

      await expect(client.giftCards.load(invalidData as any)).rejects.toThrow();
    });
  });

  describe('processSale', () => {
    it('should process a gift card sale successfully', async () => {
      const saleData = {
        card_number: '4111111111111111',
        amount: '25.00',
        currency: 'USD',
        reference_id: 'ref_123',
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.giftCards.processSale(saleData);

      expect(result).toEqual(mockSaleResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/gift-cards/sale',
          data: expect.objectContaining({
            card_number: '4111111111111111',
            amount: '25.00',
            currency: 'USD',
          }),
        })
      );
    });

    it('should process sale with minimal data', async () => {
      const saleData = {
        card_number: '4111111111111111',
        amount: '10.00',
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.giftCards.processSale(saleData);

      expect(result).toEqual(mockSaleResponse);
    });

    it('should propagate API errors', async () => {
      const saleData = {
        card_number: 'insufficient_funds_card',
        amount: '100.00',
      };

      mockFailedResponse('Insufficient funds', 402);

      await expect(client.giftCards.processSale(saleData)).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      const saleData = {
        card_number: '4111111111111111',
        amount: '25.00',
      };

      mockFailedResponse('Network error', 500);

      await expect(client.giftCards.processSale(saleData)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        amount: '25.00',
        // Missing required card_number
      };

      await expect(
        client.giftCards.processSale(invalidData as any)
      ).rejects.toThrow();
    });

    it('should validate amount is positive', async () => {
      const invalidData = {
        card_number: '4111111111111111',
        amount: '-10.00',
      };

      await expect(
        client.giftCards.processSale(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('processRefund', () => {
    it('should process a gift card refund successfully', async () => {
      const refundData = {
        card_number: '4111111111111111',
        amount: '25.00',
        transaction_id: 'txn_123',
        reference_id: 'ref_124',
      };

      mockSuccessfulResponse(mockRefundResponse);

      const result = await client.giftCards.processRefund(refundData);

      expect(result).toEqual(mockRefundResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/gift-cards/refund',
          data: expect.objectContaining({
            card_number: '4111111111111111',
            amount: '25.00',
            transaction_id: 'txn_123',
          }),
        })
      );
    });

    it('should process refund with minimal data', async () => {
      const refundData = {
        card_number: '4111111111111111',
        amount: '25.00',
        transaction_id: 'txn_123',
      };

      mockSuccessfulResponse(mockRefundResponse);

      const result = await client.giftCards.processRefund(refundData);

      expect(result).toEqual(mockRefundResponse);
    });

    it('should propagate API errors', async () => {
      const refundData = {
        card_number: '4111111111111111',
        amount: '25.00',
        transaction_id: 'invalid_txn',
      };

      mockFailedResponse('Transaction not found', 404);

      await expect(
        client.giftCards.processRefund(refundData)
      ).rejects.toThrow();
    });

    it('should propagate network errors', async () => {
      const refundData = {
        card_number: '4111111111111111',
        amount: '25.00',
        transaction_id: 'txn_123',
      };

      mockFailedResponse('Network error', 500);

      await expect(
        client.giftCards.processRefund(refundData)
      ).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        amount: '25.00',
        // Missing required card_number and transaction_id
      };

      await expect(
        client.giftCards.processRefund(invalidData as any)
      ).rejects.toThrow();
    });

    it('should validate transaction ID is provided', async () => {
      const invalidData = {
        card_number: '4111111111111111',
        amount: '25.00',
        // Missing required transaction_id
      };

      await expect(
        client.giftCards.processRefund(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle card number with spaces', async () => {
      const activateData = {
        card_number: '4111 1111 1111 1111',
        amount: '100.00',
        currency: 'USD',
      };

      mockSuccessfulResponse(mockGiftCardResponse);

      const result = await client.giftCards.activate(activateData);

      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should handle zero amount for activation', async () => {
      const activateData = {
        card_number: '4111111111111111',
        amount: '0.00',
        currency: 'USD',
      };

      mockSuccessfulResponse(mockGiftCardResponse);

      const result = await client.giftCards.activate(activateData);

      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should handle maximum decimal precision for amounts', async () => {
      const saleData = {
        card_number: '4111111111111111',
        amount: '99.99',
      };

      mockSuccessfulResponse(mockSaleResponse);

      const result = await client.giftCards.processSale(saleData);

      expect(result).toEqual(mockSaleResponse);
    });

    it('should handle empty metadata object', async () => {
      const activateData = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
        metadata: {},
      };

      mockSuccessfulResponse(mockGiftCardResponse);

      const result = await client.giftCards.activate(activateData);

      expect(result).toEqual(mockGiftCardResponse);
    });

    it('should handle missing optional reference_id', async () => {
      const activateData = {
        card_number: '4111111111111111',
        amount: '100.00',
        currency: 'USD',
        // reference_id is optional
      };

      mockSuccessfulResponse(mockGiftCardResponse);

      const result = await client.giftCards.activate(activateData);

      expect(result).toEqual(mockGiftCardResponse);
    });
  });
});
