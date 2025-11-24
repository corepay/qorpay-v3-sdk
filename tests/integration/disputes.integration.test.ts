/**
 * @file tests/integration/disputes.integration.test.ts
 * @description Integration tests for the Disputes module using MSW
 */

import { QorPayClient, QorPayApiError } from '../../src';
import mswServer from './setup/msw-server';
import { http } from 'msw';
import { QORPAY_BASE_URLS } from '../../src/types/common';

// Test credentials (from README)
const TEST_APP_KEY = 'T6554252567241061980';
const TEST_CLIENT_KEY = '01dffeb784c64d098c8c691ea589eb82';

// Test data
const mockDisputeId = 'disp_1234567890';
const mockTransactionId = 'txn_1234567890';

describe('Disputes Integration Tests', () => {
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

  describe('listDisputes', () => {
    it('should successfully list payment disputes', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [
            {
              id: 'disp_1234567890',
              transaction_data: {
                transaction_id: 'txn_123456',
                mid: 'mid_123456',
                amount: '100.00',
                currency: 'USD',
                reason_code: 'fraud',
                reason_description: 'Fraudulent transaction',
                status: 'open',
                created_at: '2023-01-01T12:00:00Z',
                updated_at: '2023-01-01T12:00:00Z',
                due_date: '2023-01-15T23:59:59Z',
                case_number: 'CASE123456',
                metadata: {
                  source: 'chargeback',
                },
              },
              documents: [
                {
                  id: 'doc_123456',
                  type: 'receipt',
                  filename: 'receipt.pdf',
                  content_type: 'application/pdf',
                  size: 1024,
                  url: 'https://example.com/receipt.pdf',
                  uploaded_at: '2023-01-01T13:00:00Z',
                },
              ],
              evidence: {
                submitted_at: '2023-01-02T10:00:00Z',
                status: 'pending_review',
                notes: 'Customer provided documentation',
                evidence_items: {
                  customer_communication: 'Email correspondence',
                  refund_policy: '30-day refund policy',
                },
              },
            },
            {
              id: 'disp_0987654321',
              transaction_data: {
                transaction_id: 'txn_789012',
                mid: 'mid_123456',
                amount: '50.00',
                currency: 'USD',
                reason_code: 'unrecognized',
                reason_description: 'Customer does not recognize transaction',
                status: 'under_review',
                created_at: '2023-01-15T12:00:00Z',
                updated_at: '2023-01-16T09:00:00Z',
                due_date: '2023-01-30T23:59:59Z',
                case_number: 'CASE789012',
                metadata: {
                  source: 'customer_inquiry',
                },
              },
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
        http.get(`${QORPAY_BASE_URLS.sandbox}/payment/disputes`, () => {
          return Response.json(mockResponse);
        })
      );

      // Call the method
      const result = await qorpay.disputes.listDisputes();

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(2);
      expect(result.data.disputes[0].id).toBe('disp_1234567890');
      expect(result.data.disputes[0].transaction_data.reason_code).toBe(
        'fraud'
      );
      expect(result.data.disputes[0].transaction_data.status).toBe('open');
      expect(result.data.disputes[0].documents).toHaveLength(1);
      expect(result.data.disputes[0].evidence).toBeDefined();
      expect(result.data.disputes[1].transaction_data.reason_code).toBe(
        'unrecognized'
      );
      expect(result.data.meta.count).toBe(2);
    });

    it('should successfully list payment disputes with query parameters', async () => {
      const queryParams = {
        limit: 10,
        offset: 0,
        mid: 'mid_123456',
        status: 'open',
        created_start: '2023-01-01',
        created_end: '2023-01-31',
        sort_by: 'created_at',
        sort_order: 'desc' as const,
      };

      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [
            {
              id: 'disp_1234567890',
              transaction_data: {
                transaction_id: 'txn_123456',
                mid: 'mid_123456',
                amount: '100.00',
                currency: 'USD',
                reason_code: 'fraud',
                reason_description: 'Fraudulent transaction',
                status: 'open',
                created_at: '2023-01-01T12:00:00Z',
                updated_at: '2023-01-01T12:00:00Z',
              },
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
          `${QORPAY_BASE_URLS.sandbox}/payment/disputes`,
          ({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('limit')).toBe('10');
            expect(url.searchParams.get('mid')).toBe('mid_123456');
            expect(url.searchParams.get('status')).toBe('open');
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result = await qorpay.disputes.listDisputes(queryParams);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(1);
      expect(result.data.disputes[0].id).toBe('disp_1234567890');
      expect(result.data.meta.count).toBe(1);
    });

    it('should handle empty disputes list', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [],
          meta: {
            count: 0,
            limit: 50,
            offset: 0,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(`${QORPAY_BASE_URLS.sandbox}/payment/disputes`, () => {
          return Response.json(mockResponse);
        })
      );

      // Call the method
      const result = await qorpay.disputes.listDisputes();

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(0);
      expect(result.data.meta.count).toBe(0);
    });

    it('should filter disputes by transaction ID', async () => {
      const queryParams = {
        transaction_id: mockTransactionId,
        limit: 5,
      };

      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [
            {
              id: 'disp_1234567890',
              transaction_data: {
                transaction_id: mockTransactionId,
                mid: 'mid_123456',
                amount: '100.00',
                currency: 'USD',
                reason_code: 'fraud',
                reason_description: 'Fraudulent transaction',
                status: 'open',
                created_at: '2023-01-01T12:00:00Z',
                updated_at: '2023-01-01T12:00:00Z',
              },
            },
          ],
          meta: {
            count: 1,
            limit: 5,
            offset: 0,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/payment/disputes`,
          ({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('transaction_id')).toBe(
              mockTransactionId
            );
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result = await qorpay.disputes.listDisputes(queryParams);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(1);
      expect(result.data.disputes[0].transaction_data.transaction_id).toBe(
        mockTransactionId
      );
    });
  });

  describe('listAchDisputes', () => {
    it('should successfully list ACH disputes', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [
            {
              id: 'disp_ach_1234567890',
              transaction_data: {
                transaction_id: 'ach_txn_123456',
                mid: 'mid_123456',
                amount: '500.00',
                currency: 'USD',
                reason_code: 'unauthorized',
                reason_description: 'Unauthorized ACH transaction',
                status: 'open',
                created_at: '2023-01-01T12:00:00Z',
                updated_at: '2023-01-01T12:00:00Z',
                due_date: '2023-01-15T23:59:59Z',
                case_number: 'ACH_CASE123456',
                metadata: {
                  source: 'ach_chargeback',
                },
              },
              evidence: {
                submitted_at: '2023-01-02T10:00:00Z',
                status: 'pending_review',
                notes: 'ACH authorization documentation provided',
                evidence_items: {
                  authorization_proof: 'Customer authorization form',
                  account_verification: 'Account ownership verification',
                },
              },
            },
            {
              id: 'disp_ach_0987654321',
              transaction_data: {
                transaction_id: 'ach_txn_789012',
                mid: 'mid_123456',
                amount: '250.00',
                currency: 'USD',
                reason_code: 'fraud',
                reason_description: 'Suspicious ACH activity',
                status: 'under_review',
                created_at: '2023-01-15T12:00:00Z',
                updated_at: '2023-01-16T09:00:00Z',
                due_date: '2023-01-30T23:59:59Z',
                case_number: 'ACH_CASE789012',
                metadata: {
                  source: 'fraud_detection',
                },
              },
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
        http.get(`${QORPAY_BASE_URLS.sandbox}/payment/ach/disputes`, () => {
          return Response.json(mockResponse);
        })
      );

      // Call the method
      const result = await qorpay.disputes.listAchDisputes();

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(2);
      expect(result.data.disputes[0].id).toBe('disp_ach_1234567890');
      expect(result.data.disputes[0].transaction_data.reason_code).toBe(
        'unauthorized'
      );
      expect(result.data.disputes[0].transaction_data.status).toBe('open');
      expect(result.data.disputes[1].transaction_data.reason_code).toBe(
        'fraud'
      );
      expect(result.data.disputes[1].transaction_data.status).toBe(
        'under_review'
      );
      expect(result.data.meta.count).toBe(2);
    });

    it('should successfully list ACH disputes with query parameters', async () => {
      const queryParams = {
        limit: 5,
        mid: 'mid_123456',
        status: 'open',
        due_date_start: '2023-01-01',
        due_date_end: '2023-01-31',
      };

      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [
            {
              id: 'disp_ach_1234567890',
              transaction_data: {
                transaction_id: 'ach_txn_123456',
                mid: 'mid_123456',
                amount: '500.00',
                currency: 'USD',
                reason_code: 'unauthorized',
                reason_description: 'Unauthorized ACH transaction',
                status: 'open',
                created_at: '2023-01-01T12:00:00Z',
                updated_at: '2023-01-01T12:00:00Z',
              },
            },
          ],
          meta: {
            count: 1,
            limit: 5,
            offset: 0,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/payment/ach/disputes`,
          ({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('limit')).toBe('5');
            expect(url.searchParams.get('mid')).toBe('mid_123456');
            expect(url.searchParams.get('status')).toBe('open');
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result = await qorpay.disputes.listAchDisputes(queryParams);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(1);
      expect(result.data.disputes[0].transaction_data.amount).toBe('500.00');
      expect(result.data.meta.count).toBe(1);
    });

    it('should handle empty ACH disputes list', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [],
          meta: {
            count: 0,
            limit: 50,
            offset: 0,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(`${QORPAY_BASE_URLS.sandbox}/payment/ach/disputes`, () => {
          return Response.json(mockResponse);
        })
      );

      // Call the method
      const result = await qorpay.disputes.listAchDisputes();

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(0);
      expect(result.data.meta.count).toBe(0);
    });
  });

  describe('getDispute (deprecated)', () => {
    it('should throw a deprecation error when calling getDispute', async () => {
      // Expect the method to throw a deprecation error
      await expect(qorpay.disputes.getDispute(mockDisputeId)).rejects.toThrow(
        'Individual dispute retrieval is not supported by the QorPay API. ' +
          'Use listDisputes() with transaction_id filter to find specific disputes.'
      );
    });

    it('should validate dispute ID parameter even when throwing deprecation error', async () => {
      // Expect the method to throw a validation error for empty ID
      await expect(qorpay.disputes.getDispute('')).rejects.toThrow();
    });
  });

  describe('listDisputesByTransaction', () => {
    it('should successfully list disputes by transaction', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [
            {
              id: 'disp_1234567890',
              transaction_data: {
                transaction_id: mockTransactionId,
                mid: 'mid_123456',
                amount: '100.00',
                currency: 'USD',
                reason_code: 'fraud',
                reason_description: 'Fraudulent transaction',
                status: 'open',
                created_at: '2023-01-01T12:00:00Z',
                updated_at: '2023-01-01T12:00:00Z',
              },
            },
          ],
          meta: {
            count: 1,
            limit: 50,
            offset: 0,
          },
        },
      };

      // Mock the API endpoint
      mswServer.server.use(
        http.get(
          `${QORPAY_BASE_URLS.sandbox}/transactions/${mockTransactionId}/disputes`,
          () => {
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result =
        await qorpay.disputes.listDisputesByTransaction(mockTransactionId);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(1);
      expect(result.data.disputes[0].transaction_data.transaction_id).toBe(
        mockTransactionId
      );
      expect(result.data.meta.count).toBe(1);
    });

    it('should handle no disputes found for transaction', async () => {
      const mockResponse = {
        status: 'approved',
        code: 'GW00',
        message: 'Success',
        data: {
          disputes: [],
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
          `${QORPAY_BASE_URLS.sandbox}/transactions/${mockTransactionId}/disputes`,
          () => {
            return Response.json(mockResponse);
          }
        )
      );

      // Call the method
      const result =
        await qorpay.disputes.listDisputesByTransaction(mockTransactionId);

      // Verify the response
      expect(result).toEqual(mockResponse);
      expect(result.data.disputes).toHaveLength(0);
      expect(result.data.meta.count).toBe(0);
    });
  });

  describe('Input Validation', () => {
    it('should validate dispute ID parameter', async () => {
      // Call the method with empty dispute ID (should throw validation error)
      await expect(qorpay.disputes.getDispute('')).rejects.toThrow();
    });

    it('should validate query parameters for listDisputes', async () => {
      const invalidParams = {
        limit: -1, // Invalid negative limit
        offset: -1, // Invalid negative offset
      };

      // Mock the API endpoint to avoid actual network calls
      mswServer.server.use(
        http.get(`${QORPAY_BASE_URLS.sandbox}/payment/disputes`, () => {
          return Response.json({
            status: 'approved',
            code: 'GW00',
            message: 'Success',
            data: { disputes: [], meta: { count: 0, limit: 50, offset: 0 } },
          });
        })
      );

      // Call the method with invalid parameters (should throw validation error)
      await expect(
        qorpay.disputes.listDisputes(invalidParams)
      ).rejects.toThrow();
    });
  });
});
