/**
 * @file tests/unit/utilities.test.ts
 * @description Tests for utilities resource class using real instances
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

describe('Utilities', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize utilities resource', () => {
      expect(client.utilities).toBeDefined();
      expect(typeof client.utilities.validateCard).toBe('function');
      expect(typeof client.utilities.validateCvv).toBe('function');
      expect(typeof client.utilities.validateExpiration).toBe('function');
      expect(typeof client.utilities.validateRoutingNumber).toBe('function');
      expect(typeof client.utilities.binLookup).toBe('function');
      expect(typeof client.utilities.lookupBin).toBe('function');
      expect(typeof client.utilities.validateAddress).toBe('function');
      expect(typeof client.utilities.validateAccount).toBe('function');
      expect(typeof client.utilities.validateTaxId).toBe('function');
      expect(typeof client.utilities.generateTestCard).toBe('function');
      expect(typeof client.utilities.getServerTime).toBe('function');
    });
  });

  describe('validateCard', () => {
    it('should validate a credit card number successfully', async () => {
      const cardNumber = '4111111111111111';
      const mockResponse = {
        status: 'success',
        data: {
          valid: true,
          brand: 'visa',
          type: 'credit',
          category: 'traditional',
          prepaid: false,
          commercial: false,
          bin: '411111',
          country: 'US',
          bank: 'Test Bank',
          level: 'standard',
        },
      };

      mockSuccessfulResponse(mockResponse);

      const result = await client.utilities.validateCard(cardNumber);

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-card',
          data: { card_number: cardNumber },
        })
      );
    });

    it('should handle invalid card number', async () => {
      const cardNumber = 'invalid-card';

      mockFailedResponse('Invalid card number', 400);

      await expect(client.utilities.validateCard(cardNumber)).rejects.toThrow();
    });

    it('should handle empty card number', async () => {
      mockFailedResponse('Card number is required', 400);

      await expect(client.utilities.validateCard('')).rejects.toThrow();
    });
  });

  describe('validateCvv', () => {
    it('should validate CVV with card number', async () => {
      const cvv = '123';
      const cardNumber = '4111111111111111';

      mockSuccessfulResponse({
        status: 'success',
        data: { valid: true },
      });

      const result = await client.utilities.validateCvv(cvv, cardNumber);

      expect(result.data.valid).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-cvv',
          data: { cvv, card_number: cardNumber },
        })
      );
    });

    it('should validate CVV without card number', async () => {
      const cvv = '123';

      mockSuccessfulResponse({
        status: 'success',
        data: { valid: true },
      });

      const result = await client.utilities.validateCvv(cvv);

      expect(result.data.valid).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-cvv',
          data: { cvv },
        })
      );
    });

    it('should handle invalid CVV', async () => {
      const cvv = '12';

      mockFailedResponse('Invalid CVV', 400);

      await expect(client.utilities.validateCvv(cvv)).rejects.toThrow();
    });
  });

  describe('validateExpiration', () => {
    it('should validate expiration with string values', async () => {
      const month = '12';
      const year = '2025';

      mockSuccessfulResponse({
        status: 'success',
        data: { valid: true },
      });

      const result = await client.utilities.validateExpiration(month, year);

      expect(result.data.valid).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-expiration',
          data: { exp_month: month, exp_year: year },
        })
      );
    });

    it('should validate expiration with number values', async () => {
      const month = 6;
      const year = 2026;

      mockSuccessfulResponse({
        status: 'success',
        data: { valid: true },
      });

      const result = await client.utilities.validateExpiration(month, year);

      expect(result.data.valid).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-expiration',
          data: { exp_month: 6, exp_year: 2026 },
        })
      );
    });

    it('should validate expiration with 2-digit year', async () => {
      const month = '12';
      const year = '25';

      mockSuccessfulResponse({
        status: 'success',
        data: { valid: true },
      });

      const result = await client.utilities.validateExpiration(month, year);

      expect(result.data.valid).toBe(true);
    });

    it('should handle expired date', async () => {
      const month = '01';
      const year = '2020';

      mockSuccessfulResponse({
        status: 'success',
        data: { valid: false, error: 'Card expired' },
      });

      const result = await client.utilities.validateExpiration(month, year);

      expect(result.data.valid).toBe(false);
      expect(result.data.error).toBe('Card expired');
    });
  });

  describe('validateRoutingNumber', () => {
    it('should validate routing number successfully', async () => {
      const routingNumber = '021000021';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          valid: true,
          bank_name: 'Chase Bank',
          routing_number: '021000021',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
        },
      });

      const result =
        await client.utilities.validateRoutingNumber(routingNumber);

      expect(result.data.valid).toBe(true);
      expect(result.data.bank_name).toBe('Chase Bank');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-routing',
          data: { routing_number: routingNumber },
        })
      );
    });

    it('should handle invalid routing number', async () => {
      const routingNumber = 'invalid';

      mockFailedResponse('Invalid routing number', 400);

      await expect(
        client.utilities.validateRoutingNumber(routingNumber)
      ).rejects.toThrow();
    });

    it('should handle routing number with incorrect length', async () => {
      const routingNumber = '123';

      mockFailedResponse('Routing number must be 9 digits', 400);

      await expect(
        client.utilities.validateRoutingNumber(routingNumber)
      ).rejects.toThrow();
    });
  });

  describe('binLookup', () => {
    it('should perform BIN lookup successfully', async () => {
      const bin = '411111';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          bin: '411111',
          brand: 'visa',
          type: 'credit',
          category: 'traditional',
          country: 'US',
          country_name: 'United States',
          bank: 'Test Bank',
          level: 'standard',
          website: 'https://testbank.com',
          phone: '1-800-TEST-BANK',
        },
      });

      const result = await client.utilities.binLookup(bin);

      expect(result.data.bin).toBe('411111');
      expect(result.data.brand).toBe('visa');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/utils/bin-lookup/411111',
        })
      );
    });

    it('should handle invalid BIN', async () => {
      const bin = 'invalid';

      mockFailedResponse('Invalid BIN', 400);

      await expect(client.utilities.binLookup(bin)).rejects.toThrow();
    });

    it('should handle BIN not found', async () => {
      const bin = '999999';

      mockFailedResponse('BIN not found', 404);

      await expect(client.utilities.binLookup(bin)).rejects.toThrow();
    });
  });

  describe('validateAddress', () => {
    it('should validate address successfully', async () => {
      const address = '123 Main St, New York, NY 10001';
      const postalCode = '10001';
      const countryCode = 'US';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          valid: true,
          standardized_address: {
            line1: '123 MAIN ST',
            city: 'NEW YORK',
            state: 'NY',
            zip: '10001-1234',
            country: 'US',
          },
        },
      });

      const result = await client.utilities.validateAddress(
        address,
        postalCode,
        countryCode
      );

      expect(result.data.valid).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-address',
          data: {
            address,
            postal_code: postalCode,
            country_code: countryCode,
          },
        })
      );
    });

    it('should handle invalid address', async () => {
      const address = '';
      const postalCode = '';

      mockFailedResponse('Invalid address', 400);

      await expect(
        client.utilities.validateAddress(address, postalCode)
      ).rejects.toThrow();
    });
  });

  describe('validateAccount', () => {
    it('should validate account successfully', async () => {
      const mid = '123456789';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          valid: true,
          account_type: 'checking',
        },
      });

      const result = await client.utilities.validateAccount(mid);

      expect(result.data.valid).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/utilities/account/123456789',
        })
      );
    });

    it('should handle invalid account', async () => {
      const mid = 'invalid';

      mockFailedResponse('Invalid account details', 400);

      await expect(client.utilities.validateAccount(mid)).rejects.toThrow();
    });
  });

  describe('validateTaxId', () => {
    it('should validate tax ID successfully', async () => {
      const taxId = '123456789';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          valid: true,
          type: 'ssn',
        },
      });

      const result = await client.utilities.validateTaxId(taxId);

      expect(result.data.valid).toBe(true);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/utils/validate-tax-id',
          data: { tax_id: taxId },
        })
      );
    });

    it('should handle invalid tax ID', async () => {
      const taxId = 'invalid';

      mockFailedResponse('Invalid tax ID', 400);

      await expect(client.utilities.validateTaxId(taxId)).rejects.toThrow();
    });
  });

  describe('generateTestCard', () => {
    it('should generate test card successfully', async () => {
      const brand = 'visa';

      mockSuccessfulResponse({
        status: 'success',
        data: {
          card_number: '4111111111111111',
          cvv: '123',
          expiration: '12/25',
          brand: 'visa',
          type: 'credit',
        },
      });

      const result = await client.utilities.generateTestCard(brand);

      expect(result.data.card_number).toBe('4111111111111111');
      expect(result.data.brand).toBe('visa');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/utils/test-card',
          params: { brand },
        })
      );
    });

    it('should generate test card without parameters', async () => {
      mockSuccessfulResponse({
        status: 'success',
        data: {
          card_number: '4111111111111111',
          cvv: '123',
          expiration: '12/25',
          brand: 'visa',
          type: 'credit',
        },
      });

      const result = await client.utilities.generateTestCard();

      expect(result.data.card_number).toBe('4111111111111111');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/utils/test-card',
        })
      );
    });

    it('should handle invalid card parameters', async () => {
      const brand = 'invalid';

      mockFailedResponse('Invalid card parameters', 400);

      await expect(client.utilities.generateTestCard(brand)).rejects.toThrow();
    });
  });

  describe('getServerTime', () => {
    it('should get server time successfully', async () => {
      mockSuccessfulResponse({
        status: 'success',
        data: {
          timestamp: 1705307400,
          iso_date: '2024-01-15T10:30:00Z',
        },
      });

      const result = await client.utilities.getServerTime();

      expect(result.data.timestamp).toBe(1705307400);
      expect(result.data.iso_date).toBe('2024-01-15T10:30:00Z');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/utils/time',
        })
      );
    });

    it('should handle server time retrieval error', async () => {
      mockFailedResponse('Unable to retrieve server time', 500);

      await expect(client.utilities.getServerTime()).rejects.toThrow();
    });
  });
});
