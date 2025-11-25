/**
 * @file tests/unit/utilities.test.ts
 * @description Unit tests for Utilities resource class
 */

import { Utilities } from '../../src/resources/utilities';
import { BaseClient } from '../../src/client/base-client';
import type { BaseQorPayResponse } from '../../src/types/common';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('Utilities', () => {
  let utilities: Utilities;
  let mockClient: jest.Mocked<BaseClient>;

  const mockBaseResponse: BaseQorPayResponse = {
    status: 'success',
    message: 'Operation completed successfully',
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    utilities = new Utilities(mockClient);
    jest.clearAllMocks();
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
          country: 'US',
          bank: 'Test Bank',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateCard(cardNumber);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/validate-card', {
        card_number: cardNumber,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid card number', async () => {
      const cardNumber = '1234567890123456';
      const mockResponse = {
        status: 'success',
        data: {
          valid: false,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateCard(cardNumber);

      expect(result.data.valid).toBe(false);
    });
  });

  describe('validateCvv', () => {
    it('should validate CVV with card number', async () => {
      const cvv = '123';
      const cardNumber = '4111111111111111';
      const mockResponse = {
        status: 'success',
        data: { valid: true },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateCvv(cvv, cardNumber);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/validate-cvv', {
        cvv,
        card_number: cardNumber,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should validate CVV without card number', async () => {
      const cvv = '456';
      mockClient.post.mockResolvedValue(mockBaseResponse);

      await utilities.validateCvv(cvv);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/validate-cvv', {
        cvv,
        card_number: undefined,
      });
    });
  });

  describe('validateExpiration', () => {
    it('should validate expiration with string values', async () => {
      const month = '12';
      const year = '2025';
      const mockResponse = {
        status: 'success',
        data: { valid: true },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateExpiration(month, year);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/utils/validate-expiration',
        {
          exp_month: month,
          exp_year: year,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should validate expiration with number values', async () => {
      const month = 6;
      const year = 2026;
      mockClient.post.mockResolvedValue(mockBaseResponse);

      await utilities.validateExpiration(month, year);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/utils/validate-expiration',
        {
          exp_month: 6,
          exp_year: 2026,
        }
      );
    });

    it('should validate expiration with 2-digit year', async () => {
      const month = '09';
      const year = '27';
      mockClient.post.mockResolvedValue(mockBaseResponse);

      await utilities.validateExpiration(month, year);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/utils/validate-expiration',
        {
          exp_month: '09',
          exp_year: '27',
        }
      );
    });
  });

  describe('validateRoutingNumber', () => {
    it('should validate routing number successfully', async () => {
      const routingNumber = '123456789';
      const mockResponse = {
        status: 'success',
        data: {
          valid: true,
          bank_name: 'Test Bank',
          location: 'New York, NY',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateRoutingNumber(routingNumber);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/validate-routing', {
        routing_number: routingNumber,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid routing number', async () => {
      const routingNumber = '12345678';
      const mockResponse = {
        status: 'success',
        data: { valid: false },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateRoutingNumber(routingNumber);

      expect(result.data.valid).toBe(false);
    });
  });

  describe('binLookup', () => {
    it('should perform BIN lookup with 6 digits', async () => {
      const bin = '411111';
      const mockResponse = {
        status: 'success',
        data: {
          bin: '411111',
          brand: 'visa',
          type: 'credit',
          category: 'traditional',
          country: 'US',
          bank_name: 'Test Bank',
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await utilities.binLookup(bin);

      expect(mockClient.get).toHaveBeenCalledWith('/utils/bin-lookup/411111');
      expect(result).toEqual(mockResponse);
    });

    it('should perform BIN lookup with 8 digits', async () => {
      const bin = '41111111';
      mockClient.get.mockResolvedValue(mockBaseResponse);

      await utilities.binLookup(bin);

      expect(mockClient.get).toHaveBeenCalledWith('/utils/bin-lookup/41111111');
    });
  });

  describe('checkAvsResult', () => {
    it('should check AVS result with only AVS code', async () => {
      const avsCode = 'Y';
      const mockResponse = {
        status: 'success',
        data: {
          avs_code: 'Y',
          avs_message: 'Address match, 5-digit zip match',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.checkAvsResult(avsCode);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/check-avs-result', {
        avs_code: avsCode,
        cvv_code: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should check AVS result with both AVS and CVV codes', async () => {
      const avsCode = 'N';
      const cvvCode = 'M';
      const mockResponse = {
        status: 'success',
        data: {
          avs_code: 'N',
          avs_message: 'No match',
          cvv_code: 'M',
          cvv_message: 'CVV match',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.checkAvsResult(avsCode, cvvCode);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/check-avs-result', {
        avs_code: avsCode,
        cvv_code: cvvCode,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateTestCard', () => {
    it('should generate a test Visa card', async () => {
      const brand = 'visa';
      const mockResponse = {
        status: 'success',
        data: {
          card_number: '4111111111111111',
          brand: 'visa',
          exp_month: '12',
          exp_year: '2025',
          cvv: '123',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.generateTestCard(brand);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/utils/generate-test-card',
        {
          brand: brand,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should generate a test Mastercard', async () => {
      const brand = 'mastercard';
      const mockResponse = {
        status: 'success',
        data: {
          card_number: '5555555555554444',
          brand: 'mastercard',
          exp_month: '09',
          exp_year: '2026',
          cvv: '456',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.generateTestCard(brand);

      expect(result.data.brand).toBe('mastercard');
    });
  });

  describe('validateAddress', () => {
    it('should validate US address', async () => {
      const address = {
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      };

      const mockResponse = {
        status: 'success',
        data: {
          valid: true,
          standardized_address: '123 MAIN ST',
          city: 'NEW YORK',
          state: 'NY',
          zip: '10001',
          county: 'New York County',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateAddress(address);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/utils/validate-address',
        address
      );
      expect(result.data.valid).toBe(true);
    });

    it('should validate address without country', async () => {
      const address = {
        address1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
      };

      mockClient.post.mockResolvedValue(mockBaseResponse);

      await utilities.validateAddress(address);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/utils/validate-address',
        address
      );
    });
  });

  describe('checkCvvResult', () => {
    it('should check CVV result code', async () => {
      const cvvr = 'M';
      const mockResponse = {
        status: 'success',
        data: {
          cvv_code: 'M',
          cvv_message: 'CVV match',
          description: 'The CVV code matches',
          recommendation: 'Proceed with transaction',
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await utilities.checkCvvResult(cvvr);

      expect(mockClient.get).toHaveBeenCalledWith('/utils/check-cvv-result/M');
      expect(result).toEqual(mockResponse);
    });

    it('should handle unknown CVV result code', async () => {
      const cvvr = 'X';
      mockClient.get.mockResolvedValue({
        status: 'success',
        data: {
          cvv_code: 'X',
          cvv_message: 'Unknown response code',
        },
      });

      const result = await utilities.checkCvvResult(cvvr);

      expect(result.data.cvv_message).toBe('Unknown response code');
    });
  });

  describe('getServerTime', () => {
    it('should get server time', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          server_time: '2024-01-01T12:00:00Z',
          timezone: 'UTC',
          timestamp: 1704110400,
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await utilities.getServerTime();

      expect(mockClient.get).toHaveBeenCalledWith('/utils/server-time');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateTaxId', () => {
    it('should validate EIN', async () => {
      const taxId = '12-3456789';
      const mockResponse = {
        status: 'success',
        data: {
          valid: true,
          type: 'EIN',
          format_valid: true,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateTaxId(taxId);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/validate-tax-id', {
        tax_id: taxId,
      });
      expect(result.data.valid).toBe(true);
    });

    it('should validate SSN', async () => {
      const taxId = '123-45-6789';
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: {
          valid: true,
          type: 'SSN',
          format_valid: true,
        },
      });

      const result = await utilities.validateTaxId(taxId);

      expect(result.data.type).toBe('SSN');
    });
  });

  describe('validateAccount', () => {
    it('should validate merchant account', async () => {
      const mid = '123456789012';
      const mockResponse = {
        status: 'success',
        data: {
          valid: true,
          mid: mid,
          status: 'active',
          business_name: 'Test Business',
          account_type: 'retail',
          created_date: '2023-01-01',
          last_activity: '2024-01-01',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateAccount(mid);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/validate-account', {
        mid: mid,
      });
      expect(result.data.status).toBe('active');
    });

    it('should handle invalid merchant account', async () => {
      const mid = '000000000000';
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: {
          valid: false,
          mid: mid,
          status: 'not_found',
        },
      });

      const result = await utilities.validateAccount(mid);

      expect(result.data.valid).toBe(false);
    });
  });

  describe('validateCardLuhn', () => {
    it('should validate card with enhanced Luhn check', async () => {
      const cardNumber = '4111111111111111';
      const mockResponse = {
        status: 'success',
        data: {
          valid: true,
          card_number: '4111111111111111',
          luhn_valid: true,
          brand: 'visa',
          type: 'credit',
          category: 'traditional',
          check_digit: '1',
          issuer_identifier: '411111',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateCardLuhn(cardNumber);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/utils/validate-card-luhn',
        {
          card_number: cardNumber,
        }
      );
      expect(result.data.luhn_valid).toBe(true);
    });
  });

  describe('lookupBin', () => {
    it('should perform enhanced BIN lookup', async () => {
      const bin = '411111';
      const mockResponse = {
        status: 'success',
        data: {
          bin: '411111',
          brand: 'visa',
          type: 'credit',
          category: 'traditional',
          country: 'US',
          country_code: 'US',
          bank_name: 'Test Bank',
          prepaid: false,
          corporate: false,
          debit: false,
          credit: true,
          durbin_regulated: true,
          international: false,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.lookupBin(bin);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/lookup-bin', {
        bin: bin,
      });
      expect(result.data.credit).toBe(true);
    });
  });

  describe('validateRoutingNumberEnhanced', () => {
    it('should validate routing number with enhanced details', async () => {
      const routingNumber = '123456789';
      const mockResponse = {
        status: 'success',
        data: {
          valid: true,
          routing_number: '123456789',
          bank_name: 'Test Bank',
          bank_city: 'New York',
          bank_state: 'NY',
          bank_zip: '10001',
          phone: '212-555-1234',
          website: 'https://testbank.com',
          fedwire: true,
          swift: 'TESTUS33',
          office: 'Main Office',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result =
        await utilities.validateRoutingNumberEnhanced(routingNumber);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/utils/validate-routing-enhanced',
        {
          routing_number: routingNumber,
        }
      );
      expect(result.data.fedwire).toBe(true);
    });
  });

  describe('validateZipCode', () => {
    it('should validate ZIP code with full details', async () => {
      const zipCode = '10001';
      const mockResponse = {
        status: 'success',
        data: {
          valid: true,
          postal_code: '10001',
          city: 'New York',
          state: 'NY',
          county: 'New York County',
          country: 'US',
          timezone: 'America/New_York',
          latitude: 40.7128,
          longitude: -74.006,
          area_codes: ['212', '646', '917'],
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await utilities.validateZipCode(zipCode);

      expect(mockClient.post).toHaveBeenCalledWith('/utils/validate-zip', {
        postal_code: zipCode,
      });
      expect(result.data.city).toBe('New York');
    });

    it('should handle invalid ZIP code', async () => {
      const zipCode = '00000';
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: {
          valid: false,
          postal_code: '00000',
        },
      });

      const result = await utilities.validateZipCode(zipCode);

      expect(result.data.valid).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors from validateCard', async () => {
      const cardNumber = 'invalid';
      const apiError = new Error('Invalid card format');
      mockClient.post.mockRejectedValue(apiError);

      await expect(utilities.validateCard(cardNumber)).rejects.toThrow(
        apiError
      );
    });

    it('should propagate API errors from binLookup', async () => {
      const bin = '123456';
      const apiError = new Error('BIN not found');
      mockClient.get.mockRejectedValue(apiError);

      await expect(utilities.binLookup(bin)).rejects.toThrow(apiError);
    });

    it('should propagate API errors from validateAddress', async () => {
      const address = {
        address1: '123 Main St',
        city: 'Nowhere',
        state: 'XX',
        zip: '00000',
      };

      const apiError = new Error('Address validation failed');
      mockClient.post.mockRejectedValue(apiError);

      await expect(utilities.validateAddress(address)).rejects.toThrow(
        apiError
      );
    });
  });

  describe('URL construction', () => {
    it('should handle special characters in BIN lookup', async () => {
      const bin = '4111#1';
      mockClient.get.mockResolvedValue(mockBaseResponse);

      await utilities.binLookup(bin);

      expect(mockClient.get).toHaveBeenCalledWith('/utils/bin-lookup/4111#1');
    });

    it('should handle special characters in CVV result check', async () => {
      const cvvr = 'M?';
      mockClient.get.mockResolvedValue(mockBaseResponse);

      await utilities.checkCvvResult(cvvr);

      expect(mockClient.get).toHaveBeenCalledWith('/utils/check-cvv-result/M?');
    });
  });
});
