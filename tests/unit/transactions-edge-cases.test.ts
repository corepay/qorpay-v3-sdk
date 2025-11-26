/**
 * @file tests/unit/transactions-edge-cases.test.ts
 * @description Tests for transactionsEdgeCases resource class WITHOUT internal mocks
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
 * @file tests/unit/transactions-edge-cases.test.ts
 * @description Transactions edge case coverage test for line 492 (extractCustomerInfo return)
 */

import { Transactions } from '../../src/resources/transactions';

// Mock BaseClient properly

describe('Transactions - Edge Case Coverage', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('extractCustomerInfo method - line 492 coverage', () => {
    it('should handle transaction with only first name (line 492 return path)', async () => {
      // Mock response with transaction that has only first name
      const mockTransaction = {
        transaction_id: 'txn_test123',
        customer_id: 'cust_456',
        cfirstname: 'John',
        clastname: '', // Empty last name
        cemail: 'john@example.com',
      };

      // Access the private method through reflection for testing
      const extractCustomerInfo = (
        client.transactions as any
      ).extractCustomerInfo.bind(client.transactions);
      const result = extractCustomerInfo(mockTransaction);

      // Should return customer info object on line 492
      expect(result).toBeDefined();
      expect(result.id).toBe('cust_456');
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should handle transaction with only last name (line 492 return path)', async () => {
      // Mock transaction with only last name
      const mockTransaction = {
        transaction_id: 'txn_test789',
        customer_id: 'cust_789',
        cfirstname: '', // Empty first name
        clastname: 'Doe',
        cemail: undefined,
      };

      // Access the private method through reflection for testing
      const extractCustomerInfo = (
        client.transactions as any
      ).extractCustomerInfo.bind(client.transactions);
      const result = extractCustomerInfo(mockTransaction);

      // Should return customer info object on line 492
      expect(result).toBeDefined();
      expect(result.id).toBe('cust_789');
      expect(result.name).toBe('Doe');
      expect(result.email).toBeUndefined();
    });

    it('should handle transaction with both names but no email (line 492 return path)', async () => {
      // Mock transaction with both names but no email
      const mockTransaction = {
        transaction_id: 'txn_test000',
        customer_id: 'cust_000',
        cfirstname: 'Jane',
        clastname: 'Smith',
        cemail: undefined, // No email
      };

      // Access the private method through reflection for testing
      const extractCustomerInfo = (
        client.transactions as any
      ).extractCustomerInfo.bind(client.transactions);
      const result = extractCustomerInfo(mockTransaction);

      // Should return customer info object on line 492
      expect(result).toBeDefined();
      expect(result.id).toBe('cust_000');
      expect(result.name).toBe('Jane Smith');
      expect(result.email).toBeUndefined();
    });

    it('should handle transaction with whitespace-only names (line 492 return path)', async () => {
      // Mock transaction with whitespace names
      const mockTransaction = {
        transaction_id: 'txn_test111',
        customer_id: 'cust_111',
        cfirstname: '   ', // Whitespace only
        clastname: 'Doe  ', // Whitespace + content
        cemail: 'whitespace@example.com',
      };

      // Access the private method through reflection for testing
      const extractCustomerInfo = (
        client.transactions as any
      ).extractCustomerInfo.bind(client.transactions);
      const result = extractCustomerInfo(mockTransaction);

      // Should return customer info object on line 492
      expect(result).toBeDefined();
      expect(result.id).toBe('cust_111');
      expect(result.name).toBe('Doe'); // .trim() removes whitespace
      expect(result.email).toBe('whitespace@example.com');
    });

    it('should handle transaction with special characters in names (line 492 return path)', async () => {
      // Mock transaction with special characters in names
      const mockTransaction = {
        transaction_id: 'txn_test222',
        customer_id: 'cust_222',
        cfirstname: 'José-María',
        clastname: "O'Connor-Smith",
        cemail: 'special@example.com',
      };

      // Access the private method through reflection for testing
      const extractCustomerInfo = (
        client.transactions as any
      ).extractCustomerInfo.bind(client.transactions);
      const result = extractCustomerInfo(mockTransaction);

      // Should return customer info object on line 492
      expect(result).toBeDefined();
      expect(result.id).toBe('cust_222');
      expect(result.name).toBe("José-María O'Connor-Smith");
      expect(result.email).toBe('special@example.com');
    });

    it('should handle transaction with very long names (line 492 return path)', async () => {
      // Mock transaction with very long names
      const longFirstName = 'A'.repeat(100);
      const longLastName = 'B'.repeat(100);

      const mockTransaction = {
        transaction_id: 'txn_test333',
        customer_id: 'cust_333',
        cfirstname: longFirstName,
        clastname: longLastName,
        cemail: 'longname@example.com',
      };

      // Access the private method through reflection for testing
      const extractCustomerInfo = (
        client.transactions as any
      ).extractCustomerInfo.bind(client.transactions);
      const result = extractCustomerInfo(mockTransaction);

      // Should return customer info object on line 492
      expect(result).toBeDefined();
      expect(result.id).toBe('cust_333');
      expect(result.name).toBe(`${longFirstName} ${longLastName}`);
      expect(result.email).toBe('longname@example.com');
    });

    it('should handle transaction with no customer_id (line 492 return path)', async () => {
      // Mock transaction with names but no customer_id
      const mockTransaction = {
        transaction_id: 'txn_test444',
        customer_id: undefined, // No customer ID
        cfirstname: 'NoID',
        clastname: 'Customer',
        cemail: 'noid@example.com',
      };

      // Access the private method through reflection for testing
      const extractCustomerInfo = (
        client.transactions as any
      ).extractCustomerInfo.bind(client.transactions);
      const result = extractCustomerInfo(mockTransaction);

      // Should return customer info object on line 492
      expect(result).toBeDefined();
      expect(result.id).toBeUndefined();
      expect(result.name).toBe('NoID Customer');
      expect(result.email).toBe('noid@example.com');
    });

    it('should return undefined when both names are missing (contrast test)', async () => {
      // Mock transaction with no first or last name (should trigger line 489 undefined return)
      const mockTransaction = {
        transaction_id: 'txn_test999',
        customer_id: 'cust_999',
        cfirstname: '', // Empty first name
        clastname: '', // Empty last name
        cemail: 'test@example.com',
      };

      // Access the private method through reflection for testing
      const extractCustomerInfo = (
        client.transactions as any
      ).extractCustomerInfo.bind(client.transactions);
      const result = extractCustomerInfo(mockTransaction);

      // This should trigger the undefined return on line 489, not line 492 return
      expect(result).toBeUndefined();
    });
  });
});
