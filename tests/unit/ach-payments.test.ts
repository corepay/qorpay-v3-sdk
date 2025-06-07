/**
 * @file tests/unit/ach-payments.test.ts
 * @description Unit tests for the AchPayments resource module
 */

import { AchPayments } from '../../src/resources/ach-payments';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

// Sample test data
const sampleDebitData = {
  amount: '250.00',
  account_number: '9876543210',
  routing_number: '021000021',
  account_type: 'checking',
  account_holder_name: 'John Doe',
  sec_code: 'WEB',
  reference_id: 'ach_order_123456'
};

const sampleCreditData = {
  amount: '500.00',
  account_number: '9876543210',
  routing_number: '021000021',
  account_type: 'checking',
  account_holder_name: 'John Doe',
  sec_code: 'PPD',
  reference_id: 'ach_credit_123456'
};

const sampleVoidData = {
  transaction_id: 'ach_txn_12345',
  reason: 'Customer request'
};

const sampleRefundData = {
  transaction_id: 'ach_txn_12345',
  amount: '250.00',
  reason: 'Customer request'
};

const sampleVerifyData = {
  account_number: '9876543210',
  routing_number: '021000021',
  account_type: 'checking',
  account_holder_name: 'John Doe'
};

const sampleTransactionId = 'ach_txn_12345';

// Sample response data
const sampleDebitResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'ACH debit initiated',
  data: {
    transaction_id: 'ach_txn_12345',
    amount: '250.00',
    status: 'pending',
    created_at: '2023-01-01T12:00:00Z',
    account: {
      last4: '3210',
      routing: '021000021',
      type: 'checking',
      holder_name: 'John Doe'
    },
    estimated_settlement_date: '2023-01-04T12:00:00Z'
  }
};

const sampleCreditResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'ACH credit initiated',
  data: {
    transaction_id: 'ach_txn_67890',
    amount: '500.00',
    status: 'pending',
    created_at: '2023-01-01T12:00:00Z',
    account: {
      last4: '3210',
      routing: '021000021',
      type: 'checking',
      holder_name: 'John Doe'
    },
    estimated_settlement_date: '2023-01-04T12:00:00Z'
  }
};

const sampleVoidResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'ACH transaction voided',
  data: {
    transaction_id: 'ach_txn_12345',
    status: 'voided',
    updated_at: '2023-01-01T14:00:00Z'
  }
};

const sampleRefundResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'ACH refund initiated',
  data: {
    transaction_id: 'ach_txn_refund_12345',
    original_transaction_id: 'ach_txn_12345',
    amount: '250.00',
    status: 'pending',
    created_at: '2023-01-01T14:30:00Z',
    estimated_settlement_date: '2023-01-04T14:30:00Z'
  }
};

const sampleVerifyResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'ACH account verification initiated',
  data: {
    verification_id: 'verify_12345',
    status: 'pending',
    created_at: '2023-01-01T15:00:00Z'
  }
};

const sampleTransactionResponse = {
  status: 'approved',
  code: 'GW00',
  message: 'Transaction found',
  data: {
    transaction_id: 'ach_txn_12345',
    amount: '250.00',
    status: 'settled',
    created_at: '2023-01-01T12:00:00Z',
    settled_at: '2023-01-04T12:00:00Z',
    account: {
      last4: '3210',
      routing: '021000021',
      type: 'checking',
      holder_name: 'John Doe'
    }
  }
};

describe('AchPayments', () => {
  let achPayments: AchPayments;
  let mockBaseClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new mocked BaseClient instance
    mockBaseClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    }) as jest.Mocked<BaseClient>;
    
    // Mock the post and get methods to return success responses by default
    mockBaseClient.post = jest.fn().mockResolvedValue(sampleDebitResponse);
    mockBaseClient.get = jest.fn().mockResolvedValue(sampleTransactionResponse);
    
    // Create a new AchPayments instance with the mocked BaseClient
    achPayments = new AchPayments(mockBaseClient);
  });

  describe('debit', () => {
    it('should call the correct endpoint with wrapped transaction data', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleDebitResponse);
      
      await achPayments.debit({ transaction_data: sampleDebitData });
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/ach/debit',
        { transaction_data: sampleDebitData }
      );
    });
    
    it('should return the debit response', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleDebitResponse);
      
      const response = await achPayments.debit({ transaction_data: sampleDebitData });
      
      expect(response).toEqual(sampleDebitResponse);
      expect(response.data.transaction_id).toBe('ach_txn_12345');
      expect(response.data.status).toBe('pending');
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Invalid account information', 400, 'ACH01', { 
        status: 'error',
        code: 'ACH01',
        message: 'Invalid account information'
      });
      
      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(achPayments.debit({ transaction_data: sampleDebitData })).rejects.toThrow(QorPayApiError);
      await expect(achPayments.debit({ transaction_data: sampleDebitData })).rejects.toMatchObject({
        message: expect.stringContaining('Invalid account information'),
        statusCode: 400,
        errorCode: 'ACH01'
      });
    });
  });

  describe('credit', () => {
    it('should call the correct endpoint with wrapped transaction data', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleCreditResponse);
      
      await achPayments.credit({ transaction_data: sampleCreditData });
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/ach/credit',
        { transaction_data: sampleCreditData }
      );
    });
    
    it('should return the credit response', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleCreditResponse);
      
      const response = await achPayments.credit({ transaction_data: sampleCreditData });
      
      expect(response).toEqual(sampleCreditResponse);
      expect(response.data.transaction_id).toBe('ach_txn_67890');
      expect(response.data.amount).toBe('500.00');
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Daily credit limit exceeded', 400, 'ACH02', { 
        status: 'error',
        code: 'ACH02',
        message: 'Daily credit limit exceeded'
      });
      
      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(achPayments.credit({ transaction_data: sampleCreditData })).rejects.toThrow(QorPayApiError);
      await expect(achPayments.credit({ transaction_data: sampleCreditData })).rejects.toMatchObject({
        message: expect.stringContaining('Daily credit limit exceeded'),
        statusCode: 400,
        errorCode: 'ACH02'
      });
    });
  });

  describe('void', () => {
    it('should call the correct endpoint with wrapped transaction data', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleVoidResponse);
      
      await achPayments.void({ transaction_data: sampleVoidData });
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/ach/void',
        { transaction_data: sampleVoidData }
      );
    });
    
    it('should return the void response', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleVoidResponse);
      
      const response = await achPayments.void({ transaction_data: sampleVoidData });
      
      expect(response).toEqual(sampleVoidResponse);
      expect(response.data.status).toBe('voided');
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Transaction cannot be voided', 400, 'ACH03', { 
        status: 'error',
        code: 'ACH03',
        message: 'Transaction cannot be voided - already processed'
      });
      
      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(achPayments.void({ transaction_data: sampleVoidData })).rejects.toThrow(QorPayApiError);
      await expect(achPayments.void({ transaction_data: sampleVoidData })).rejects.toMatchObject({
        message: expect.stringContaining('Transaction cannot be voided'),
        statusCode: 400,
        errorCode: 'ACH03'
      });
    });
  });

  describe('refund', () => {
    it('should call the correct endpoint with wrapped transaction data', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleRefundResponse);
      
      await achPayments.refund({ transaction_data: sampleRefundData });
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/ach/refund',
        { transaction_data: sampleRefundData }
      );
    });
    
    it('should return the refund response', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleRefundResponse);
      
      const response = await achPayments.refund({ transaction_data: sampleRefundData });
      
      expect(response).toEqual(sampleRefundResponse);
      expect(response.data.original_transaction_id).toBe('ach_txn_12345');
      expect(response.data.amount).toBe('250.00');
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Transaction not found', 404, 'ACH04', { 
        status: 'error',
        code: 'ACH04',
        message: 'Transaction not found'
      });
      
      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(achPayments.refund({ transaction_data: sampleRefundData })).rejects.toThrow(QorPayApiError);
      await expect(achPayments.refund({ transaction_data: sampleRefundData })).rejects.toMatchObject({
        message: expect.stringContaining('Transaction not found'),
        statusCode: 404,
        errorCode: 'ACH04'
      });
    });
  });

  describe('verify', () => {
    it('should call the correct endpoint with wrapped transaction data', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleVerifyResponse);
      
      await achPayments.verify({ transaction_data: sampleVerifyData });
      
      expect(mockBaseClient.post).toHaveBeenCalledWith(
        '/payment/ach/verify',
        { transaction_data: sampleVerifyData }
      );
    });
    
    it('should return the verification response', async () => {
      mockBaseClient.post = jest.fn().mockResolvedValue(sampleVerifyResponse);
      
      const response = await achPayments.verify({ transaction_data: sampleVerifyData });
      
      expect(response).toEqual(sampleVerifyResponse);
      expect(response.data.verification_id).toBe('verify_12345');
      expect(response.data.status).toBe('pending');
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Invalid routing number', 400, 'ACH05', { 
        status: 'error',
        code: 'ACH05',
        message: 'Invalid routing number'
      });
      
      mockBaseClient.post = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(achPayments.verify({ transaction_data: sampleVerifyData })).rejects.toThrow(QorPayApiError);
      await expect(achPayments.verify({ transaction_data: sampleVerifyData })).rejects.toMatchObject({
        message: expect.stringContaining('Invalid routing number'),
        statusCode: 400,
        errorCode: 'ACH05'
      });
    });
  });

  describe('getTransaction', () => {
    it('should call the correct endpoint with transaction ID', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleTransactionResponse);
      
      await achPayments.getTransaction(sampleTransactionId);
      
      expect(mockBaseClient.get).toHaveBeenCalledWith(
        `/payment/ach/transaction/${sampleTransactionId}`
      );
    });
    
    it('should return the transaction details', async () => {
      mockBaseClient.get = jest.fn().mockResolvedValue(sampleTransactionResponse);
      
      const response = await achPayments.getTransaction(sampleTransactionId);
      
      expect(response).toEqual(sampleTransactionResponse);
      expect(response.data.transaction_id).toBe('ach_txn_12345');
      expect(response.data.status).toBe('settled');
    });
    
    it('should handle API errors correctly', async () => {
      const errorResponse = new QorPayApiError('Transaction not found', 404, 'ACH04', { 
        status: 'error',
        code: 'ACH04',
        message: 'Transaction not found'
      });
      
      mockBaseClient.get = jest.fn().mockRejectedValue(errorResponse);
      
      await expect(achPayments.getTransaction(sampleTransactionId)).rejects.toThrow(QorPayApiError);
      await expect(achPayments.getTransaction(sampleTransactionId)).rejects.toMatchObject({
        message: expect.stringContaining('Transaction not found'),
        statusCode: 404,
        errorCode: 'ACH04'
      });
    });
  });
});
