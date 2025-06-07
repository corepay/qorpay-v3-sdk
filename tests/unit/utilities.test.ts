/**
 * @file tests/unit/utilities.test.ts
 * @description Unit tests for the Utilities resource module
 */

import { Utilities } from '../../src/resources/utilities';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

// Sample test data
const sampleCardNumber = '4111111111111111';
const sampleCvv = '123';
const sampleBin = '411111';
const sampleRoutingNumber = '021000021';
const sampleAddress = '123 Main St';
const samplePostalCode = '12345';
const sampleTaxId = '123456789';

// Sample response data
const sampleCardValidationResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Success',
  data: {
    valid: true,
    brand: 'visa',
    type: 'credit',
    country: 'US',
    bank: 'JPMORGAN CHASE BANK, N.A.',
  },
};

const sampleBinLookupResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Success',
  data: {
    bin: '411111',
    brand: 'visa',
    type: 'credit',
    category: 'consumer',
    country: 'US',
    bank_name: 'JPMORGAN CHASE BANK, N.A.',
    bank_url: 'https://www.chase.com',
    bank_phone: '1-800-432-3117',
    bank_city: 'New York',
  },
};

const sampleRoutingValidationResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Success',
  data: {
    valid: true,
    bank_name: 'JP MORGAN CHASE',
    location: 'NEW YORK, NY',
  },
};

const sampleTestCardResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Success',
  data: {
    card_number: '4111111111111111',
    brand: 'visa',
    exp_month: '12',
    exp_year: '25',
    cvv: '123',
  },
};

const sampleAvsResultResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Success',
  data: {
    avs_code: 'Y',
    avs_message: 'Street address and 5-digit postal code match',
    cvv_code: 'M',
    cvv_message: 'CVV match',
  },
};

const sampleServerTimeResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Success',
  data: {
    timestamp: 1609459200,
    iso_date: '2021-01-01T00:00:00Z',
  },
};

describe('Utilities', () => {
  let utilities: Utilities;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new mocked BaseClient instance
    mockBaseClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
    }) as jest.Mocked<BaseClient>;

    // Mock the post and get methods to return success responses by default
    mockBaseClient.post = jest
      .fn()
      .mockResolvedValue(sampleCardValidationResponse);
    mockBaseClient.get = jest.fn().mockResolvedValue(sampleBinLookupResponse);

    // Create a new Utilities instance with the mocked BaseClient
    utilities = new Utilities(mockBaseClient);
  });

  describe('validateCard', () => {
    it('should call the correct endpoint with the card number', async () => {
      await utilities.validateCard(sampleCardNumber);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/utils/validate-card', {
        card_number: sampleCardNumber,
      });
    });

    it('should return the validation result', async () => {
      const response = await utilities.validateCard(sampleCardNumber);

      expect(response).toEqual(sampleCardValidationResponse);
      expect(response.data.valid).toBe(true);
      expect(response.data.brand).toBe('visa');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid card number format',
        400,
        'GW01',
        {
          status: 'error',
          code: 'GW01',
          message: 'Invalid card number format',
        }
      );

      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);

      await expect(utilities.validateCard(sampleCardNumber)).rejects.toThrow(
        QorPayApiError
      );
      await expect(
        utilities.validateCard(sampleCardNumber)
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid card number format'),
        statusCode: 400,
        errorCode: 'GW01',
      });
    });
  });

  describe('validateCvv', () => {
    it('should call the correct endpoint with the cvv only', async () => {
      await utilities.validateCvv(sampleCvv);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/utils/validate-cvv', {
        cvv: sampleCvv,
        card_number: undefined,
      });
    });

    it('should include card number when provided', async () => {
      await utilities.validateCvv(sampleCvv, sampleCardNumber);

      expect(mockBaseClient.post).toHaveBeenCalledWith('/utils/validate-cvv', {
        cvv: sampleCvv,
        card_number: sampleCardNumber,
      });
    });

    it('should return the validation result', async () => {
      const cvvResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'CVV is valid',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(cvvResponse);

      const response = await utilities.validateCvv(sampleCvv);

      expect(response).toEqual(cvvResponse);
    });
  });

  describe('validateExpiration', () => {
    it('should call the correct endpoint with month and year', async () => {
      const month = '12';
      const year = '25';

      await utilities.validateExpiration(month, year);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/utils/validate-expiration',
        { exp_month: month, exp_year: year }
      );
    });

    it('should handle numeric month and year', async () => {
      const month = 12;
      const year = 2025;

      await utilities.validateExpiration(month, year);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/utils/validate-expiration',
        { exp_month: month, exp_year: year }
      );
    });

    it('should return the validation result', async () => {
      const expirationResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Expiration date is valid',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(expirationResponse);

      const response = await utilities.validateExpiration('12', '25');

      expect(response).toEqual(expirationResponse);
    });
  });

  describe('validateRoutingNumber', () => {
    it('should call the correct endpoint with the routing number', async () => {
      mockBaseClient.post = jest
        .fn()
        .mockResolvedValue(sampleRoutingValidationResponse);

      await utilities.validateRoutingNumber(sampleRoutingNumber);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/utils/validate-routing',
        { routing_number: sampleRoutingNumber }
      );
    });

    it('should return the validation result', async () => {
      mockBaseClient.post = jest
        .fn()
        .mockResolvedValue(sampleRoutingValidationResponse);

      const response =
        await utilities.validateRoutingNumber(sampleRoutingNumber);

      expect(response).toEqual(sampleRoutingValidationResponse);
      expect(response.data.valid).toBe(true);
      expect(response.data.bank_name).toBe('JP MORGAN CHASE');
    });
  });

  describe('binLookup', () => {
    it('should call the correct endpoint with the BIN', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleBinLookupResponse);

      await utilities.binLookup(sampleBin);

      expect(mockBaseClient.get).toHaveBeenCalledWith(
        `/utils/bin-lookup/${sampleBin}`
      );
    });

    it('should return the BIN lookup result', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleBinLookupResponse);

      const response = await utilities.binLookup(sampleBin);

      expect(response).toEqual(sampleBinLookupResponse);
      expect(response.data.bin).toBe('411111');
      expect(response.data.brand).toBe('visa');
      expect(response.data.bank_name).toBe('JPMORGAN CHASE BANK, N.A.');
    });

    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError(
        'Invalid BIN format',
        400,
        'GW01',
        {
          status: 'error',
          code: 'GW01',
          message: 'Invalid BIN format',
        }
      );

      mockBaseClient.get = jest.fn().mockRejectedValue(errorResponse);

      await expect(utilities.binLookup(sampleBin)).rejects.toThrow(
        QorPayApiError
      );
      await expect(utilities.binLookup(sampleBin)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid BIN format'),
        statusCode: 400,
        errorCode: 'GW01',
      });
    });
  });

  describe('checkAvsResult', () => {
    it('should call the correct endpoint with AVS code only', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleAvsResultResponse);

      await utilities.checkAvsResult('Y');

      expect(mockBaseClient.get).toHaveBeenCalledWith('/utils/check-avs', {
        avs_code: 'Y',
      });
    });

    it('should include CVV code when provided', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleAvsResultResponse);

      await utilities.checkAvsResult('Y', 'M');

      expect(mockBaseClient.get).toHaveBeenCalledWith('/utils/check-avs', {
        avs_code: 'Y',
        cvv_code: 'M',
      });
    });

    it('should return the AVS/CVV result', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleAvsResultResponse);

      const response = await utilities.checkAvsResult('Y', 'M');

      expect(response).toEqual(sampleAvsResultResponse);
      expect(response.data.avs_message).toBe(
        'Street address and 5-digit postal code match'
      );
      expect(response.data.cvv_message).toBe('CVV match');
    });
  });

  describe('generateTestCard', () => {
    it('should call the correct endpoint without brand parameter', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleTestCardResponse);

      await utilities.generateTestCard();

      expect(mockBaseClient.get).toHaveBeenCalledWith('/utils/test-card', {});
    });

    it('should include brand parameter when provided', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleTestCardResponse);

      await utilities.generateTestCard('visa');

      expect(mockBaseClient.get).toHaveBeenCalledWith('/utils/test-card', {
        brand: 'visa',
      });
    });

    it('should return the test card data', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleTestCardResponse);

      const response = await utilities.generateTestCard('visa');

      expect(response).toEqual(sampleTestCardResponse);
      expect(response.data.card_number).toBe('4111111111111111');
      expect(response.data.brand).toBe('visa');
    });
  });

  describe('validateAddress', () => {
    it('should call the correct endpoint with address and postal code', async () => {
      const addressResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Address is valid',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(addressResponse);

      await utilities.validateAddress(sampleAddress, samplePostalCode);

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/utils/validate-address',
        {
          address: sampleAddress,
          postal_code: samplePostalCode,
          country_code: 'US', // Default
        }
      );
    });

    it('should include custom country code when provided', async () => {
      const addressResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Address is valid',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(addressResponse);

      await utilities.validateAddress(sampleAddress, samplePostalCode, 'CA');

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/utils/validate-address',
        {
          address: sampleAddress,
          postal_code: samplePostalCode,
          country_code: 'CA',
        }
      );
    });
  });

  describe('getServerTime', () => {
    it('should call the correct endpoint', async () => {
      mockBaseClient.get = jest
        .fn()
        .mockResolvedValue(sampleServerTimeResponse);

      await utilities.getServerTime();

      expect(mockBaseClient.get).toHaveBeenCalledWith('/utils/time');
    });

    it('should return the server time data', async () => {
      mockBaseClient.get = jest
        .fn()
        .mockResolvedValue(sampleServerTimeResponse);

      const response = await utilities.getServerTime();

      expect(response).toEqual(sampleServerTimeResponse);
      expect(response.data.timestamp).toBe(1609459200);
      expect(response.data.iso_date).toBe('2021-01-01T00:00:00Z');
    });
  });

  describe('validateTaxId', () => {
    it('should call the correct endpoint with tax ID and type', async () => {
      const taxIdResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Tax ID is valid',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(taxIdResponse);

      await utilities.validateTaxId(sampleTaxId, 'ein');

      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/utils/validate-tax-id',
        { tax_id: sampleTaxId, type: 'ein' }
      );
    });

    it('should return the validation result', async () => {
      const taxIdResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Tax ID is valid',
      };

      mockBaseClient.post = jest.fn().mockResolvedValue(taxIdResponse);

      const response = await utilities.validateTaxId(sampleTaxId, 'ein');

      expect(response).toEqual(taxIdResponse);
    });
  });
});
