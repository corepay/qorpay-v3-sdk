/**
 * @file tests/unit/transactions-direct-extractCustomerInfo.test.ts
 * @description Tests for transactionsDirectExtractCustomerInfo resource class WITHOUT internal mocks
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import { QorPayApiError } from '../../src/errors';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
  expectApiCall,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

/**
 * @file tests/unit/transactions-direct-extractCustomerInfo.test.ts
 * @description Direct tests for extractCustomerInfo method to cover line 492
 */

import { Transactions } from '../../src/resources/transactions';

// Mock BaseClient properly

describe('Transactions - Direct extractCustomerInfo Tests', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('extractCustomerInfo method - direct line 492 coverage', () => {
    it('should return customer object when only cfirstname exists (line 492)', () => {
      const transaction = {
        transaction_id: 'txn_test123',
        customer_id: 'cust_456',
        cfirstname: 'John',
        clastname: '', // Empty last name
        cemail: 'john@example.com',
        amount: '1000.00',
        status: 'completed',
      };

      // Access the private method via type casting
      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 492 return statement
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 'cust_456',
        name: 'John', // Space trimmed by trim()
        email: 'john@example.com',
      });
    });

    it('should return customer object when only clastname exists (line 492)', () => {
      const transaction = {
        transaction_id: 'txn_test789',
        customer_id: 'cust_789',
        cfirstname: '', // Empty first name
        clastname: 'Doe',
        cemail: undefined,
        amount: '2000.00',
        status: 'pending',
      };

      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 492 return statement
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 'cust_789',
        name: 'Doe', // Leading space trimmed by trim()
        email: undefined,
      });
    });

    it('should return customer object when both names exist (line 492)', () => {
      const transaction = {
        transaction_id: 'txn_test000',
        customer_id: 'cust_000',
        cfirstname: 'Jane',
        clastname: 'Smith',
        cemail: 'jane@example.com',
        amount: '3000.00',
        status: 'failed',
      };

      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 492 return statement
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 'cust_000',
        name: 'Jane Smith',
        email: 'jane@example.com',
      });
    });

    it('should handle whitespace-only names properly (line 492)', () => {
      const transaction = {
        transaction_id: 'txn_test111',
        customer_id: 'cust_111',
        cfirstname: '   ', // Whitespace only
        clastname: 'Doe  ', // Whitespace + content
        cemail: 'whitespace@example.com',
        amount: '1500.00',
        status: 'processing',
      };

      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 492 return statement
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 'cust_111',
        name: 'Doe', // Whitespace trimmed by trim()
        email: 'whitespace@example.com',
      });
    });

    it('should handle special characters in names (line 492)', () => {
      const transaction = {
        transaction_id: 'txn_test222',
        customer_id: 'cust_222',
        cfirstname: 'José-María',
        clastname: "O'Connor-Smith",
        cemail: 'special@example.com',
        amount: '2500.00',
        status: 'completed',
      };

      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 492 return statement
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 'cust_222',
        name: "José-María O'Connor-Smith",
        email: 'special@example.com',
      });
    });

    it('should handle missing customer_id (line 492)', () => {
      const transaction = {
        transaction_id: 'txn_test333',
        customer_id: undefined, // No customer ID
        cfirstname: 'NoID',
        clastname: 'Customer',
        cemail: 'noid@example.com',
        amount: '5000.00',
        status: 'completed',
      };

      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 492 return statement
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: undefined,
        name: 'NoID Customer',
        email: 'noid@example.com',
      });
    });

    it('should return undefined when both names are empty (contrast to line 492)', () => {
      const transaction = {
        transaction_id: 'txn_test999',
        customer_id: 'cust_999',
        cfirstname: '', // Empty first name
        clastname: '', // Empty last name
        cemail: 'test@example.com',
        amount: '500.00',
        status: 'completed',
      };

      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 489 return undefined (NOT line 492)
      expect(result).toBeUndefined();
    });

    it('should return undefined when both names are null/undefined (contrast to line 492)', () => {
      const transaction = {
        transaction_id: 'txn_test888',
        customer_id: 'cust_888',
        cfirstname: undefined, // Undefined first name
        clastname: null, // Null last name
        cemail: 'null@example.com',
        amount: '750.00',
        status: 'completed',
      };

      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 489 return undefined (NOT line 492)
      expect(result).toBeUndefined();
    });

    it('should handle very long names (line 492)', () => {
      const longFirstName = 'A'.repeat(100);
      const longLastName = 'B'.repeat(100);

      const transaction = {
        transaction_id: 'txn_test444',
        customer_id: 'cust_444',
        cfirstname: longFirstName,
        clastname: longLastName,
        cemail: 'longname@example.com',
        amount: '10000.00',
        status: 'completed',
      };

      const extractCustomerInfo = (client.transactions as any)
        .extractCustomerInfo;
      const result = extractCustomerInfo.call(client.transactions, transaction);

      // Should trigger line 492 return statement
      expect(result).toBeDefined();
      expect(result).toEqual({
        id: 'cust_444',
        name: `${longFirstName} ${longLastName}`,
        email: 'longname@example.com',
      });
    });
  });
});
