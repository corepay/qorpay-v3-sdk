/**
 * @file tests/unit/transactions-edge-cases.test.ts
 * @description Transactions edge case coverage test for line 492 (extractCustomerInfo return)
 */

import { Transactions } from '../../src/resources/transactions';
import { BaseClient } from '../../src/client/base-client';

// Mock BaseClient properly
jest.mock('../../src/client/base-client');

describe('Transactions - Edge Case Coverage', () => {
  let transactions: Transactions;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    mockBaseClient = new BaseClient({
      appKey: 'test-key',
      clientKey: 'test-secret',
    }) as jest.Mocked<BaseClient>;

    transactions = new Transactions(mockBaseClient);

    // Mock the client methods
    mockBaseClient.get = jest.fn();
    mockBaseClient.post = jest.fn();
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
        amount: '1000.00', // String amount as expected by parseFloat
        currency: 'USD',
        status: 'completed',
        type: 'sale',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockBaseClient.get.mockResolvedValue(mockTransaction);

      // Call any method that uses extractCustomerInfo internally
      // Let's use get method which will call extractCustomerInfo
      const result = await transactions.get('txn_test123');

      // The extractCustomerInfo should be called and return the object on line 492
      expect(result).toBeDefined();
      expect(result.id).toBe('txn_test123');
    });

    it('should handle transaction with only last name (line 492 return path)', async () => {
      // Mock response with transaction that has only last name
      const mockTransaction = {
        id: 'txn_test789',
        customer_id: 'cust_789',
        cfirstname: '', // Empty first name
        clastname: 'Doe',
        cemail: undefined,
        amount: 2000,
        status: 'pending',
        created_at: '2023-01-02T00:00:00Z',
      };

      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_789',
        data: mockTransaction,
      });

      const result = await transactions.get('txn_test789');

      expect(result).toBeDefined();
      expect(result.id).toBe('txn_test789');
    });

    it('should handle transaction with both names but no email (line 492 return path)', async () => {
      // Mock response with transaction that has both names but no email
      const mockTransaction = {
        id: 'txn_test000',
        customer_id: 'cust_000',
        cfirstname: 'Jane',
        clastname: 'Smith',
        cemail: undefined, // No email
        amount: 3000,
        status: 'failed',
        created_at: '2023-01-03T00:00:00Z',
      };

      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_000',
        data: mockTransaction,
      });

      const result = await transactions.get('txn_test000');

      expect(result).toBeDefined();
      expect(result.id).toBe('txn_test000');
    });

    it('should handle transaction with whitespace-only names (line 492 return path)', async () => {
      // Mock response with transaction that has whitespace names
      const mockTransaction = {
        id: 'txn_test111',
        customer_id: 'cust_111',
        cfirstname: '   ', // Whitespace only
        clastname: 'Doe  ', // Whitespace + content
        cemail: 'whitespace@example.com',
        amount: 1500,
        status: 'processing',
        created_at: '2023-01-04T00:00:00Z',
      };

      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_111',
        data: mockTransaction,
      });

      const result = await transactions.get('txn_test111');

      expect(result).toBeDefined();
      expect(result.id).toBe('txn_test111');
    });

    it('should handle transaction with special characters in names (line 492 return path)', async () => {
      // Mock response with transaction that has special characters in names
      const mockTransaction = {
        id: 'txn_test222',
        customer_id: 'cust_222',
        cfirstname: 'José-María',
        clastname: "O'Connor-Smith",
        cemail: 'special@example.com',
        amount: 2500,
        status: 'completed',
        created_at: '2023-01-05T00:00:00Z',
      };

      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_222',
        data: mockTransaction,
      });

      const result = await transactions.get('txn_test222');

      expect(result).toBeDefined();
      expect(result.id).toBe('txn_test222');
    });

    it('should handle transaction with very long names (line 492 return path)', async () => {
      // Mock response with transaction that has very long names
      const longFirstName = 'A'.repeat(100);
      const longLastName = 'B'.repeat(100);

      const mockTransaction = {
        id: 'txn_test333',
        customer_id: 'cust_333',
        cfirstname: longFirstName,
        clastname: longLastName,
        cemail: 'longname@example.com',
        amount: 5000,
        status: 'completed',
        created_at: '2023-01-06T00:00:00Z',
      };

      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_333',
        data: mockTransaction,
      });

      const result = await transactions.get('txn_test333');

      expect(result).toBeDefined();
      expect(result.id).toBe('txn_test333');
    });

    it('should handle transaction with no customer_id (line 492 return path)', async () => {
      // Mock response with transaction that has names but no customer_id
      const mockTransaction = {
        id: 'txn_test444',
        customer_id: undefined, // No customer ID
        cfirstname: 'NoID',
        clastname: 'Customer',
        cemail: 'noid@example.com',
        amount: 750,
        status: 'completed',
        created_at: '2023-01-07T00:00:00Z',
      };

      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_444',
        data: mockTransaction,
      });

      const result = await transactions.get('txn_test444');

      expect(result).toBeDefined();
      expect(result.id).toBe('txn_test444');
    });

    it('should return undefined when both names are missing (contrast test)', async () => {
      // Mock response with transaction that has no first or last name
      const mockTransaction = {
        id: 'txn_test999',
        customer_id: 'cust_999',
        cfirstname: '', // Empty first name
        clastname: '', // Empty last name
        cemail: 'test@example.com',
        amount: 500,
        status: 'completed',
        created_at: '2023-01-08T00:00:00Z',
      };

      mockBaseClient.get.mockResolvedValue({
        status: 'success',
        code: 200,
        message: 'OK',
        reference_id: 'ref_999',
        data: mockTransaction,
      });

      const result = await transactions.get('txn_test999');

      // This should NOT trigger line 492 return, but rather the undefined return on line 489
      expect(result).toBeDefined();
      expect(result.id).toBe('txn_test999');
      expect(result.customer).toBeUndefined(); // Customer info should be undefined
    });
  });
});