/**
 * @file tests/integration/deposits.integration.test.ts
 * @description Integration tests for the Deposits module using MSW
 */

import { QorPayClient, QorPayApiError } from '../../src';
import mswServer from './setup/msw-server';
import { http } from 'msw';
import { QORPAY_BASE_URLS } from '../../src/types/common';

// Test credentials (from README)
const TEST_APP_KEY = 'T6554252567241061980';
const TEST_CLIENT_KEY = '01dffeb784c64d098c8c691ea589eb82';

// Test data
const mockDepositId = 'dep_1234567890';
const mockYear = 2023;
const mockStatus = 'completed';

describe('Deposits Integration Tests', () => {
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
      timeout: 5000,
    });
  });

  // Clean up the MSW server after all tests
  afterAll(() => {
    mswServer.stop();
  });

  describe('getDeposit', () => {
    it('should successfully fetch a deposit', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          id: mockDepositId,
          mid: 'mid_123456',
          amount: '1000.00',
          currency: 'USD',
          status: 'completed',
          deposit_date: '2023-01-01T12:00:00Z',
          settlement_date: '2023-01-02T12:00:00Z',
          batch_id: 'batch_123456',
          transaction_count: 10,
          transactions: [
            {
              transaction_id: 'txn_123456',
              amount: '100.00',
              currency: 'USD',
              type: 'sale',
              status: 'approved',
              created_at: '2023-01-01T10:00:00Z',
              reference_id: 'ref_123456',
            },
          ],
          metadata: {
            source: 'api',
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/deposits/${mockDepositId}`,
          () => {
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result = await qorpay.deposits.getDeposit(mockDepositId);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.id).toBe(mockDepositId);
      expect(result.data.amount).toBe('1000.00');
      expect(result.data.status).toBe('completed');
      expect(result.data.transactions).toHaveLength(1);
      expect(result.data.transactions![0].transaction_id).toBe('txn_123456');
    });

    it('should handle deposit not found error', async () => {
      const errorResponse = {
        status: 'declined',
        code: 'GW04',
        message: 'Deposit not found',
      };

      // Mock the API endpoint to return 404
      mswServer.server.use(
        http.get(`${QORPAY_BASE_URLS.sandbox}/deposits/nonexistent`, () => {
          return new Response(JSON.stringify(errorResponse), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      // Expect the method to throw an API error
      await expect(qorpay.deposits.getDeposit('nonexistent')).rejects.toThrow(
        QorPayApiError
      );
    });
  });

  describe('listDeposits', () => {
    it('should successfully list deposits with year and status', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          deposits: [
            {
              id: 'dep_1234567890',
              mid: 'mid_123456',
              amount: '1000.00',
              currency: 'USD',
              status: 'completed',
              deposit_date: '2023-01-01T12:00:00Z',
              settlement_date: '2023-01-02T12:00:00Z',
              batch_id: 'batch_123456',
              transaction_count: 10,
            },
            {
              id: 'dep_0987654321',
              mid: 'mid_123456',
              amount: '500.00',
              currency: 'USD',
              status: 'completed',
              deposit_date: '2023-01-15T12:00:00Z',
              settlement_date: '2023-01-16T12:00:00Z',
              batch_id: 'batch_098765',
              transaction_count: 5,
            },
          ],
          meta: {
            count: 2,
            limit: 50,
            offset: 0,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/deposits/${mockYear}/${mockStatus}`,
          () => {
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result = await qorpay.deposits.listDeposits(mockYear, mockStatus);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.deposits).toHaveLength(2);
      expect(result.data.deposits[0].id).toBe('dep_1234567890');
      expect(result.data.deposits[0].amount).toBe('1000.00');
      expect(result.data.meta.count).toBe(2);
    });

    it('should successfully list deposits with query parameters', async () => {
      const queryParams = {
        limit: 10,
        offset: 0,
        mid: 'mid_123456',
        deposit_date_start: '2023-01-01',
        deposit_date_end: '2023-01-31',
        sort_by: 'deposit_date',
        sort_order: 'desc' as const,
      };

      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          deposits: [
            {
              id: 'dep_1234567890',
              mid: 'mid_123456',
              amount: '1000.00',
              currency: 'USD',
              status: 'completed',
              deposit_date: '2023-01-01T12:00:00Z',
              settlement_date: '2023-01-02T12:00:00Z',
              batch_id: 'batch_123456',
              transaction_count: 10,
            },
          ],
          meta: {
            count: 1,
            limit: 10,
            offset: 0,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/deposits/${mockYear}/${mockStatus}`,
          ({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('limit')).toBe('10');
            expect(url.searchParams.get('mid')).toBe('mid_123456');
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result = await qorpay.deposits.listDeposits(
        mockYear,
        mockStatus,
        queryParams
      );

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.deposits).toHaveLength(1);
      expect(result.data.deposits[0].id).toBe('dep_1234567890');
      expect(result.data.meta.count).toBe(1);
    });

    it('should handle empty deposits list', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          deposits: [],
          meta: {
            count: 0,
            limit: 50,
            offset: 0,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/deposits/${mockYear}/${mockStatus}`,
          () => {
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result = await qorpay.deposits.listDeposits(mockYear, mockStatus);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.deposits).toHaveLength(0);
      expect(result.data.meta.count).toBe(0);
    });
  });

  describe('getDepositDetail', () => {
    it('should successfully fetch detailed deposit information', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          id: mockDepositId,
          mid: 'mid_123456',
          amount: '1000.00',
          currency: 'USD',
          status: 'completed',
          deposit_date: '2023-01-01T12:00:00Z',
          settlement_date: '2023-01-02T12:00:00Z',
          batch_id: 'batch_123456',
          transaction_count: 2,
          transactions: [
            {
              transaction_id: 'txn_123456',
              amount: '600.00',
              currency: 'USD',
              type: 'sale',
              status: 'approved',
              created_at: '2023-01-01T10:00:00Z',
              reference_id: 'ref_123456',
            },
            {
              transaction_id: 'txn_789012',
              amount: '400.00',
              currency: 'USD',
              type: 'sale',
              status: 'approved',
              created_at: '2023-01-01T11:00:00Z',
              reference_id: 'ref_789012',
            },
          ],
          metadata: {
            source: 'api',
            detailed: true,
            reconciliation_complete: true,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/deposits/detail/${mockDepositId}`,
          () => {
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result = await qorpay.deposits.getDepositDetail(mockDepositId);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.id).toBe(mockDepositId);
      expect(result.data.amount).toBe('1000.00');
      expect(result.data.transaction_count).toBe(2);
      expect(result.data.transactions).toHaveLength(2);
      expect(result.data.transactions![0].amount).toBe('600.00');
      expect(result.data.transactions![1].amount).toBe('400.00');
      expect(result.data.metadata?.detailed).toBe(true);
      expect(result.data.metadata?.reconciliation_complete).toBe(true);
    });

    it('should handle deposit detail not found error', async () => {
      const errorResponse = {
        status: 'declined',
        code: 'GW04',
        message: 'Deposit detail not found',
      };

      // Mock the API endpoint to return 404
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/deposits/detail/nonexistent`,
          () => {
            return new Response(JSON.stringify(errorResponse), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        )
      );

      // Expect the method to throw an API error
      await expect(
        qorpay.deposits.getDepositDetail('nonexistent')
      ).rejects.toThrow(QorPayApiError);
    });
  });

  describe('Input Validation', () => {
    it('should validate deposit ID parameter', async () => {
      // Call the method with empty deposit ID (should throw validation error)
      await expect(qorpay.deposits.getDeposit('')).rejects.toThrow();

      // Call the method with empty deposit ID for detail method (should throw validation error)
      await expect(qorpay.deposits.getDepositDetail('')).rejects.toThrow();
    });

    it('should validate year parameter', async () => {
      // Call the method with invalid year (should throw validation error)
      await expect(
        qorpay.deposits.listDeposits(1800, mockStatus)
      ).rejects.toThrow();
    });

    it('should validate status parameter', async () => {
      // Call the method with empty status (should throw validation error)
      await expect(
        qorpay.deposits.listDeposits(mockYear, '')
      ).rejects.toThrow();
    });
  });
});
