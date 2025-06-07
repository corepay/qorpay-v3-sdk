/**
 * @file tests/integration/utilities.integration.test.ts
 * @description Integration tests for the Utilities module using MSW
 */

import { QorPayClient, QorPayApiError } from '../../src';
import mswServer from './setup/msw-server';
import { http } from 'msw';
import { QORPAY_BASE_URLS } from '../../src/types/common';

// Test credentials (from README)
const TEST_APP_KEY = 'T6554252567241061980';
const TEST_CLIENT_KEY = '01dffeb784c64d098c8c691ea589eb82';

// Test data
const validCardNumber = '4111111111111111';
const invalidCardNumber = '4111111111111112'; // Invalid checksum
const validCvv = '123';
const invalidCvv = '12'; // Too short
const validExpMonth = '12';
const validExpYear = '25';
const invalidExpMonth = '13'; // Invalid month
const validRoutingNumber = '021000021'; // JP Morgan Chase
const invalidRoutingNumber = '123456789'; // Invalid format
const validBin = '411111'; // Visa
const invalidBin = '999999'; // Non-existent
const validAvsCode = 'Y';
const validCvvCode = 'M';
const validAddress = '123 Main St';
const validPostalCode = '12345';
const validTaxId = '123456789'; // Fictional EIN

describe('Utilities Integration Tests', () => {
  let qorpay: QorPayClient;
  
  // Set up the MSW server before all tests
  beforeAll(() => {
    mswServer.start();
  });
  
  // Reset handlers between tests
  beforeEach(() => {
    mswServer.reset();
    
    // Create a new client for each test
    qorpay = new QorPayClient({
      appKey: TEST_APP_KEY,
      clientKey: TEST_CLIENT_KEY,
      environment: 'sandbox',
      // Set a short timeout for faster test failures
      timeout: 3000
    });
  });
  
  // Stop the server after all tests
  afterAll(() => {
    mswServer.stop();
  });

  describe('Card Validation', () => {
    it('should validate a valid card number', async () => {
      // Mock a successful validation response
      mswServer.mockEndpoint('post', '/utils/validate-card', {
        data: {
          valid: true,
          brand: 'visa',
          type: 'credit',
          country: 'US',
          bank: 'JPMORGAN CHASE BANK, N.A.'
        }
      });
      
      const response = await qorpay.utilities.validateCard(validCardNumber);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.valid).toBe(true);
      expect(response.data.brand).toBe('visa');
      expect(response.data.type).toBe('credit');
      expect(response.data.country).toBe('US');
    });
    
    it('should identify an invalid card number', async () => {
      // Mock an invalid card response
      mswServer.mockEndpoint('post', '/utils/validate-card', {
        data: {
          valid: false
        }
      });
      
      const response = await qorpay.utilities.validateCard(invalidCardNumber);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.valid).toBe(false);
    });
    
    it('should handle API errors during card validation', async () => {
      // Mock an API error
      mswServer.mockEndpoint('post', '/utils/validate-card', {
        status: 400,
        errorCode: 'GW01',
        errorMessage: 'Invalid card number format'
      });
      
      await expect(qorpay.utilities.validateCard(invalidCardNumber)).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateCard(invalidCardNumber)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid card number format'),
        statusCode: 400,
        errorCode: 'GW01'
      });
    });
  });

  describe('CVV Validation', () => {
    it('should validate a valid CVV code', async () => {
      // Mock a successful validation response
      mswServer.mockEndpoint('post', '/utils/validate-cvv', {
        status: 200,
        data: {
          valid: true
        }
      });
      
      const response = await qorpay.utilities.validateCvv(validCvv);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.message).toBe('CVV is valid');
    });
    
    it('should validate CVV with card number context', async () => {
      // Mock a successful validation response
      mswServer.mockEndpoint('post', '/utils/validate-cvv', {
        status: 200,
        data: {
          valid: true
        }
      });
      
      const response = await qorpay.utilities.validateCvv(validCvv, validCardNumber);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.message).toBe('CVV is valid for this card type');
    });
    
    it('should identify an invalid CVV code', async () => {
      // Mock an invalid CVV response
      mswServer.mockEndpoint('post', '/utils/validate-cvv', {
        status: 400,
        errorCode: 'GW02',
        errorMessage: 'CVV is invalid'
      });
      
      await expect(qorpay.utilities.validateCvv(invalidCvv)).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateCvv(invalidCvv)).rejects.toMatchObject({
        message: expect.stringContaining('CVV is invalid'),
        errorCode: 'GW02'
      });
    });
  });

  describe('Expiration Date Validation', () => {
    it('should validate a valid expiration date', async () => {
      // Mock a successful validation response
      mswServer.mockEndpoint('post', '/utils/validate-expiration', {
        status: 200,
        data: {
          valid: true
        }
      });
      
      const response = await qorpay.utilities.validateExpiration(validExpMonth, validExpYear);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.message).toBe('Expiration date is valid');
    });
    
    it('should identify an expired date', async () => {
      // Mock an expired date response
      mswServer.mockEndpoint('post', '/utils/validate-expiration', {
        status: 400,
        errorCode: 'GW03',
        errorMessage: 'Card has expired'
      });
      
      // Use a past year
      const pastYear = (new Date().getFullYear() - 1).toString().substring(2);
      
      await expect(qorpay.utilities.validateExpiration(validExpMonth, pastYear)).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateExpiration(validExpMonth, pastYear)).rejects.toMatchObject({
        message: expect.stringContaining('Card has expired'),
        errorCode: 'GW03'
      });
    });
    
    it('should identify an invalid month', async () => {
      // Mock an invalid month response
      mswServer.mockEndpoint('post', '/utils/validate-expiration', {
        status: 400,
        errorCode: 'GW04',
        errorMessage: 'Invalid month'
      });
      
      await expect(qorpay.utilities.validateExpiration(invalidExpMonth, validExpYear)).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateExpiration(invalidExpMonth, validExpYear)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid month'),
        errorCode: 'GW04'
      });
    });
    
    it('should handle numeric month and year inputs', async () => {
      // Mock a successful validation response
      mswServer.mockEndpoint('post', '/utils/validate-expiration', {
        status: 200,
        data: {
          valid: true
        }
      });
      
      const response = await qorpay.utilities.validateExpiration(12, 25);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.message).toBe('Expiration date is valid');
    });
  });

  describe('Routing Number Validation', () => {
    it('should validate a valid routing number', async () => {
      // Mock a successful validation response
      mswServer.mockEndpoint('post', '/utils/validate-routing', {
        data: {
          valid: true,
          bank_name: 'JP MORGAN CHASE',
          location: 'NEW YORK, NY'
        }
      });
      
      const response = await qorpay.utilities.validateRoutingNumber(validRoutingNumber);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.valid).toBe(true);
      expect(response.data.bank_name).toBe('JP MORGAN CHASE');
      expect(response.data.location).toBe('NEW YORK, NY');
    });
    
    it('should identify an invalid routing number', async () => {
      // Mock an invalid routing number response
      mswServer.mockEndpoint('post', '/utils/validate-routing', {
        data: {
          valid: false
        }
      });
      
      const response = await qorpay.utilities.validateRoutingNumber(invalidRoutingNumber);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.valid).toBe(false);
      expect(response.data.bank_name).toBeUndefined();
    });
    
    it('should handle API errors during routing validation', async () => {
      // Mock an API error
      mswServer.mockEndpoint('post', '/utils/validate-routing', {
        status: 400,
        errorCode: 'ACH01',
        errorMessage: 'Invalid routing number format'
      });
      
      await expect(qorpay.utilities.validateRoutingNumber(invalidRoutingNumber)).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateRoutingNumber(invalidRoutingNumber)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid routing number format'),
        statusCode: 400,
        errorCode: 'ACH01'
      });
    });
  });

  describe('BIN Lookup', () => {
    it('should return details for a valid BIN', async () => {
      // Mock a successful BIN lookup response
      mswServer.mockEndpoint('get', `/utils/bin-lookup/${validBin}`, {
        data: {
          bin: validBin,
          brand: 'visa',
          type: 'credit',
          category: 'consumer',
          country: 'US',
          bank_name: 'JPMORGAN CHASE BANK, N.A.',
          bank_url: 'https://www.chase.com',
          bank_phone: '1-800-432-3117',
          bank_city: 'New York'
        }
      });
      
      const response = await qorpay.utilities.binLookup(validBin);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.bin).toBe(validBin);
      expect(response.data.brand).toBe('visa');
      expect(response.data.country).toBe('US');
      expect(response.data.bank_name).toBe('JPMORGAN CHASE BANK, N.A.');
    });
    
    it('should handle unknown BIN numbers', async () => {
      // Mock an unknown BIN response
      mswServer.mockEndpoint('get', `/utils/bin-lookup/${invalidBin}`, {
        status: 404,
        errorCode: 'BIN01',
        errorMessage: 'BIN not found'
      });
      
      await expect(qorpay.utilities.binLookup(invalidBin)).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.binLookup(invalidBin)).rejects.toMatchObject({
        message: expect.stringContaining('BIN not found'),
        statusCode: 404,
        errorCode: 'BIN01'
      });
    });
    
    it('should handle API errors during BIN lookup', async () => {
      // Mock an API error
      mswServer.mockEndpoint('get', `/utils/bin-lookup/${validBin}`, {
        status: 400,
        errorCode: 'BIN02',
        errorMessage: 'Invalid BIN format'
      });
      
      await expect(qorpay.utilities.binLookup(validBin)).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.binLookup(validBin)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid BIN format'),
        statusCode: 400,
        errorCode: 'BIN02'
      });
    });
  });

  describe('AVS/CVV Result Checking', () => {
    it('should return descriptions for AVS code only', async () => {
      // Mock a successful AVS lookup response
      mswServer.mockEndpoint('get', '/utils/check-avs', {
        data: {
          avs_code: validAvsCode,
          avs_message: 'Street address and 5-digit postal code match'
        }
      });
      
      const response = await qorpay.utilities.checkAvsResult(validAvsCode);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.avs_code).toBe(validAvsCode);
      expect(response.data.avs_message).toBe('Street address and 5-digit postal code match');
      expect(response.data.cvv_code).toBeUndefined();
    });
    
    it('should return descriptions for both AVS and CVV codes', async () => {
      // Mock a successful AVS+CVV lookup response
      mswServer.mockEndpoint('get', '/utils/check-avs', {
        data: {
          avs_code: validAvsCode,
          avs_message: 'Street address and 5-digit postal code match',
          cvv_code: validCvvCode,
          cvv_message: 'CVV match'
        }
      });
      
      const response = await qorpay.utilities.checkAvsResult(validAvsCode, validCvvCode);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.avs_code).toBe(validAvsCode);
      expect(response.data.avs_message).toBe('Street address and 5-digit postal code match');
      expect(response.data.cvv_code).toBe(validCvvCode);
      expect(response.data.cvv_message).toBe('CVV match');
    });
    
    it('should handle unknown AVS codes', async () => {
      // Mock an unknown AVS code response
      mswServer.mockEndpoint('get', '/utils/check-avs', {
        data: {
          avs_code: 'X',
          avs_message: 'Unknown AVS code'
        }
      });
      
      const response = await qorpay.utilities.checkAvsResult('X');
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.avs_message).toBe('Unknown AVS code');
    });
  });

  describe('Test Card Generation', () => {
    it('should generate a random test card without brand parameter', async () => {
      // Mock a test card generation response
      mswServer.mockEndpoint('get', '/utils/test-card', {
        data: {
          card_number: '4111111111111111',
          brand: 'visa',
          exp_month: '12',
          exp_year: '25',
          cvv: '123'
        }
      });
      
      const response = await qorpay.utilities.generateTestCard();
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.card_number).toBe('4111111111111111');
      expect(response.data.brand).toBe('visa');
      expect(response.data.exp_month).toBe('12');
      expect(response.data.exp_year).toBe('25');
      expect(response.data.cvv).toBe('123');
    });
    
    it('should generate a test card for a specific brand', async () => {
      // Mock a test card generation response for Mastercard
      mswServer.mockEndpoint('get', '/utils/test-card', {
        data: {
          card_number: '5555555555554444',
          brand: 'mastercard',
          exp_month: '12',
          exp_year: '25',
          cvv: '123'
        }
      });
      
      const response = await qorpay.utilities.generateTestCard('mastercard');
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.card_number).toBe('5555555555554444');
      expect(response.data.brand).toBe('mastercard');
    });
    
    it('should handle unsupported card brands', async () => {
      // Mock an error response for unsupported brand
      mswServer.mockEndpoint('get', '/utils/test-card', {
        status: 400,
        errorCode: 'CARD01',
        errorMessage: 'Unsupported card brand'
      });
      
      await expect(qorpay.utilities.generateTestCard('unknown_brand')).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.generateTestCard('unknown_brand')).rejects.toMatchObject({
        message: expect.stringContaining('Unsupported card brand'),
        statusCode: 400,
        errorCode: 'CARD01'
      });
    });
  });

  describe('Address Validation', () => {
    it('should validate a US address', async () => {
      // Mock a successful address validation response
      mswServer.mockEndpoint('post', '/utils/validate-address', {
        status: 200,
        data: {
          valid: true,
          normalized_address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'US'
          }
        }
      });
      
      const response = await qorpay.utilities.validateAddress(validAddress, validPostalCode);
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.message).toBe('Address is valid');
    });
    
    it('should validate an address with custom country code', async () => {
      // Mock a successful address validation response for Canada
      mswServer.mockEndpoint('post', '/utils/validate-address', {
        status: 200,
        data: {
          valid: true
        }
      });
      
      const response = await qorpay.utilities.validateAddress(validAddress, validPostalCode, 'CA');
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.message).toBe('Address is valid');
    });
    
    it('should identify an invalid address', async () => {
      // Mock an invalid address response
      mswServer.mockEndpoint('post', '/utils/validate-address', {
        status: 400,
        errorCode: 'ADDR01',
        errorMessage: 'Invalid postal code format'
      });
      
      await expect(qorpay.utilities.validateAddress(validAddress, 'INVALID')).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateAddress(validAddress, 'INVALID')).rejects.toMatchObject({
        message: expect.stringContaining('Invalid postal code format'),
        errorCode: 'ADDR01'
      });
    });
  });

  describe('Server Time', () => {
    it('should retrieve the current server time', async () => {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const currentIsoDate = new Date().toISOString();
      
      // Mock a server time response
      mswServer.mockEndpoint('get', '/utils/time', {
        data: {
          timestamp: currentTimestamp,
          iso_date: currentIsoDate
        }
      });
      
      const response = await qorpay.utilities.getServerTime();
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.data.timestamp).toBe(currentTimestamp);
      expect(response.data.iso_date).toBe(currentIsoDate);
    });
    
    it('should handle server errors during time retrieval', async () => {
      // Mock a server error
      mswServer.mockEndpoint('get', '/utils/time', {
        status: 500,
        errorCode: 'SERVER01',
        errorMessage: 'Internal server error'
      });
      
      await expect(qorpay.utilities.getServerTime()).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.getServerTime()).rejects.toMatchObject({
        message: expect.stringContaining('Internal server error'),
        statusCode: 500,
        errorCode: 'SERVER01'
      });
    });
  });

  describe('Tax ID Validation', () => {
    it('should validate a valid EIN', async () => {
      // Mock a successful tax ID validation response
      mswServer.mockEndpoint('post', '/utils/validate-tax-id', {
        status: 200,
        data: {
          valid: true,
          type: 'EIN'
        }
      });
      
      const response = await qorpay.utilities.validateTaxId(validTaxId, 'ein');
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.message).toBe('Tax ID is valid');
    });
    
    it('should validate a valid SSN', async () => {
      // Mock a successful tax ID validation response
      mswServer.mockEndpoint('post', '/utils/validate-tax-id', {
        status: 200,
        data: {
          valid: true,
          type: 'SSN'
        }
      });
      
      const response = await qorpay.utilities.validateTaxId('123456789', 'ssn');
      
      // Verify the response
      expect(response.status).toBe('approved');
      expect(response.message).toBe('Tax ID is valid');
    });
    
    it('should identify an invalid tax ID', async () => {
      // Mock an invalid tax ID response
      mswServer.mockEndpoint('post', '/utils/validate-tax-id', {
        status: 400,
        errorCode: 'TAX01',
        errorMessage: 'Invalid tax ID format'
      });
      
      await expect(qorpay.utilities.validateTaxId('123', 'ein')).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateTaxId('123', 'ein')).rejects.toMatchObject({
        message: expect.stringContaining('Invalid tax ID format'),
        errorCode: 'TAX01'
      });
    });
    
    it('should handle unsupported tax ID types', async () => {
      // Mock an unsupported tax ID type response
      mswServer.mockEndpoint('post', '/utils/validate-tax-id', {
        status: 400,
        errorCode: 'TAX02',
        errorMessage: 'Unsupported tax ID type'
      });
      
      await expect(qorpay.utilities.validateTaxId(validTaxId, 'unsupported_type')).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateTaxId(validTaxId, 'unsupported_type')).rejects.toMatchObject({
        message: expect.stringContaining('Unsupported tax ID type'),
        errorCode: 'TAX02'
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network connectivity issues', async () => {
      // Mock a network error by making MSW throw
      mswServer.mockEndpoint('post', '/utils/validate-card', {
        status: 0,
        errorCode: 'NETWORK',
        errorMessage: 'Network Error'
      });
      
      await expect(qorpay.utilities.validateCard(validCardNumber)).rejects.toThrow();
    });
    
    it('should handle rate limiting', async () => {
      // Mock rate limiting for all utility endpoints
      mswServer.mockRateLimit();
      
      await expect(qorpay.utilities.validateCard(validCardNumber)).rejects.toThrow(QorPayApiError);
      await expect(qorpay.utilities.validateCard(validCardNumber)).rejects.toMatchObject({
        message: expect.stringContaining('Rate limit exceeded'),
        statusCode: 429,
        errorCode: 'RATE01'
      });
    });
    
    it('should handle authentication failures', async () => {
      // Create a client with invalid credentials
      const invalidClient = new QorPayClient({
        appKey: 'invalid-app-key',
        clientKey: 'invalid-client-key',
        environment: 'sandbox'
      });
      
      // Mock authentication failure
      mswServer.mockAuthFailure();
      
      await expect(invalidClient.utilities.validateCard(validCardNumber)).rejects.toThrow(QorPayApiError);
      await expect(invalidClient.utilities.validateCard(validCardNumber)).rejects.toMatchObject({
        message: expect.stringContaining('Invalid API credentials'),
        statusCode: 401,
        errorCode: 'AUTH01'
      });
    });
    
    it('should handle timeouts gracefully', async () => {
      // Set a very short timeout for this test
      const timeoutClient = new QorPayClient({
        appKey: TEST_APP_KEY,
        clientKey: TEST_CLIENT_KEY,
        environment: 'sandbox',
        timeout: 100 // 100ms timeout
      });
      
      // Mock a response that takes longer than the timeout
      mswServer.mockTimeout(500); // 500ms delay
      
      await expect(timeoutClient.utilities.validateCard(validCardNumber)).rejects.toThrow();
    });
    
    it('should handle malformed responses', async () => {
      // Mock a malformed response by returning invalid JSON
      mswServer.server.use(
        http.post(`${QORPAY_BASE_URLS.sandbox}/utils/validate-card`, () => {
          return new Response('This is not valid JSON', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
      );
      
      await expect(qorpay.utilities.validateCard(validCardNumber)).rejects.toThrow();
    });
  });
});
