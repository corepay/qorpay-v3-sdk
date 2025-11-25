/**
 * @file tests/unit/proof-of-delivery.test.ts
 * @description Unit tests for ProofOfDelivery resource class
 */

import { ProofOfDelivery } from '../../src/resources/proof-of-delivery';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';
import type {
  ProofOfDeliveryCreateRequest,
  ProofOfDeliveryUpdateRequest,
  ProofOfDeliveryResponse,
  ProofOfDeliveryListResponse,
} from '../../src/types/transactions';

// Mock dependencies
jest.mock('../../src/client/base-client');

describe('ProofOfDelivery', () => {
  let pod: ProofOfDelivery;
  let mockClient: jest.Mocked<BaseClient>;

  const mockPODDocument: ProofOfDeliveryResponse = {
    status: 'success',
    code: '200',
    message: 'POD document retrieved successfully',
    reference_id: 'ref_123',
    data: {
      id: 'pod_123456',
      transaction_id: 'txn_123456',
      document_type: 'signature',
      document_url: 'https://example.com/documents/signature_123.pdf',
      uploaded_at: '2024-01-01T00:00:00Z',
      metadata: { delivery_confirmed: true },
    },
  };

  const mockPODListResponse: ProofOfDeliveryListResponse = {
    status: 'success',
    code: '200',
    message: 'POD documents retrieved',
    reference_id: 'ref_123',
    data: {
      documents: [mockPODDocument.data],
      total: 1,
      has_more: false,
    },
  };

  beforeEach(() => {
    mockClient = new BaseClient({
      appKey: 'test',
      clientKey: 'test',
    }) as jest.Mocked<BaseClient>;
    pod = new ProofOfDelivery(mockClient);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with BaseClient instance', () => {
      expect(pod['client']).toBe(mockClient);
      expect(pod['basePath']).toBe('/proof-of-delivery');
    });
  });

  describe('create', () => {
    it('should create a POD record successfully', async () => {
      const createData: ProofOfDeliveryCreateRequest = {
        transaction_id: 'txn_123456',
        document_type: 'signature',
        document_url: 'https://example.com/signature.pdf',
        metadata: { carrier: 'UPS', tracking_number: '1Z12345' },
      };

      mockClient.post.mockResolvedValue(mockPODDocument);

      const result = await pod.create(createData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/proof-of-delivery',
        createData
      );
      expect(result).toEqual(mockPODDocument);
    });

    it('should create POD with minimal data', async () => {
      const minimalData: ProofOfDeliveryCreateRequest = {
        transaction_id: 'txn_123456',
        document_type: 'photo',
      };

      mockClient.post.mockResolvedValue(mockPODDocument);

      const result = await pod.create(minimalData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/proof-of-delivery',
        minimalData
      );
      expect(result).toEqual(mockPODDocument);
    });

    it('should propagate API errors', async () => {
      const createData: ProofOfDeliveryCreateRequest = {
        transaction_id: 'txn_123456',
        document_type: 'signature',
      };

      const apiError = new QorPayApiError('POD creation failed', 400);
      mockClient.post.mockRejectedValue(apiError);

      await expect(pod.create(createData)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const createData: ProofOfDeliveryCreateRequest = {
        transaction_id: 'txn_123456',
        document_type: 'signature',
      };

      const networkError = new Error('Network failure');
      mockClient.post.mockRejectedValue(networkError);

      await expect(pod.create(createData)).rejects.toThrow(networkError);
    });

    it('should handle empty request data', async () => {
      const emptyData = {} as ProofOfDeliveryCreateRequest;

      mockClient.post.mockResolvedValue(mockPODDocument);

      const result = await pod.create(emptyData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/proof-of-delivery',
        emptyData
      );
      expect(result).toEqual(mockPODDocument);
    });
  });

  describe('get', () => {
    it('should retrieve a POD document successfully', async () => {
      const podId = 'pod_123456';

      mockClient.get.mockResolvedValue(mockPODDocument);

      const result = await pod.get(podId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/proof-of-delivery/pod_123456'
      );
      expect(result).toEqual(mockPODDocument);
    });

    it('should propagate API errors', async () => {
      const podId = 'pod_invalid';

      const apiError = new QorPayApiError('POD not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(pod.get(podId)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const podId = 'pod_123456';

      const networkError = new Error('Network failure');
      mockClient.get.mockRejectedValue(networkError);

      await expect(pod.get(podId)).rejects.toThrow(networkError);
    });

    it('should handle empty POD ID', async () => {
      const emptyPodId = '';

      mockClient.get.mockResolvedValue(mockPODDocument);

      const result = await pod.get(emptyPodId);

      expect(mockClient.get).toHaveBeenCalledWith('/proof-of-delivery/');
      expect(result).toEqual(mockPODDocument);
    });
  });

  describe('update', () => {
    it('should update a POD document successfully', async () => {
      const podId = 'pod_123456';
      const updateData: ProofOfDeliveryUpdateRequest = {
        document_url: 'https://example.com/updated_signature.pdf',
        metadata: { delivery_confirmed: true, delivered_by: 'John Doe' },
      };

      mockClient.put.mockResolvedValue(mockPODDocument);

      const result = await pod.update(podId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/proof-of-delivery/pod_123456',
        updateData
      );
      expect(result).toEqual(mockPODDocument);
    });

    it('should update POD with minimal data', async () => {
      const podId = 'pod_123456';
      const minimalData: ProofOfDeliveryUpdateRequest = {
        metadata: { status: 'delivered' },
      };

      mockClient.put.mockResolvedValue(mockPODDocument);

      const result = await pod.update(podId, minimalData);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/proof-of-delivery/pod_123456',
        minimalData
      );
      expect(result).toEqual(mockPODDocument);
    });

    it('should propagate API errors', async () => {
      const podId = 'pod_123456';
      const updateData: ProofOfDeliveryUpdateRequest = {
        document_url: 'https://example.com/updated.pdf',
      };

      const apiError = new QorPayApiError('POD update failed', 400);
      mockClient.put.mockRejectedValue(apiError);

      await expect(pod.update(podId, updateData)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const podId = 'pod_123456';
      const updateData: ProofOfDeliveryUpdateRequest = {};

      const networkError = new Error('Network failure');
      mockClient.put.mockRejectedValue(networkError);

      await expect(pod.update(podId, updateData)).rejects.toThrow(networkError);
    });

    it('should handle empty POD ID for update', async () => {
      const emptyPodId = '';
      const updateData: ProofOfDeliveryUpdateRequest = {};

      mockClient.put.mockResolvedValue(mockPODDocument);

      const result = await pod.update(emptyPodId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/proof-of-delivery/',
        updateData
      );
      expect(result).toEqual(mockPODDocument);
    });
  });

  describe('list', () => {
    it('should list POD documents successfully', async () => {
      const params = {
        transaction_id: 'txn_123456',
        limit: 10,
        offset: 0,
      };

      mockClient.get.mockResolvedValue(mockPODListResponse);

      const result = await pod.list(params);

      expect(mockClient.get).toHaveBeenCalledWith('/proof-of-delivery', params);
      expect(result).toEqual(mockPODListResponse);
    });

    it('should list POD documents without parameters', async () => {
      mockClient.get.mockResolvedValue(mockPODListResponse);

      const result = await pod.list();

      expect(mockClient.get).toHaveBeenCalledWith(
        '/proof-of-delivery',
        undefined
      );
      expect(result).toEqual(mockPODListResponse);
    });

    it('should list POD documents with date filters', async () => {
      const params = {
        delivery_date_start: '2024-01-01',
        delivery_date_end: '2024-01-31',
        carrier: 'UPS',
        tracking_number: '1Z12345',
      };

      mockClient.get.mockResolvedValue(mockPODListResponse);

      const result = await pod.list(params);

      expect(mockClient.get).toHaveBeenCalledWith('/proof-of-delivery', params);
      expect(result).toEqual(mockPODListResponse);
    });

    it('should propagate API errors', async () => {
      const params = { limit: 10 };

      const apiError = new QorPayApiError('Failed to list PODs', 400);
      mockClient.get.mockRejectedValue(apiError);

      await expect(pod.list(params)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const networkError = new Error('Network failure');
      mockClient.get.mockRejectedValue(networkError);

      await expect(pod.list()).rejects.toThrow(networkError);
    });

    it('should handle limit parameter of zero', async () => {
      const params = {
        limit: 0,
      };

      mockClient.get.mockResolvedValue(mockPODListResponse);

      const result = await pod.list(params);

      expect(mockClient.get).toHaveBeenCalledWith('/proof-of-delivery', params);
      expect(result).toEqual(mockPODListResponse);
    });
  });

  describe('delete', () => {
    it('should delete a POD document successfully', async () => {
      const podId = 'pod_123456';
      const deleteResponse = {
        status: 'success',
        code: '200',
        message: 'POD deleted successfully',
      };

      mockClient.delete.mockResolvedValue(deleteResponse);

      const result = await pod.delete(podId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/proof-of-delivery/pod_123456'
      );
      expect(result).toEqual(deleteResponse);
    });

    it('should propagate API errors', async () => {
      const podId = 'pod_123456';

      const apiError = new QorPayApiError('POD not found', 404);
      mockClient.delete.mockRejectedValue(apiError);

      await expect(pod.delete(podId)).rejects.toThrow(apiError);
    });

    it('should propagate network errors', async () => {
      const podId = 'pod_123456';

      const networkError = new Error('Network failure');
      mockClient.delete.mockRejectedValue(networkError);

      await expect(pod.delete(podId)).rejects.toThrow(networkError);
    });

    it('should handle empty POD ID for delete', async () => {
      const emptyPodId = '';

      mockClient.delete.mockResolvedValue({
        status: 'success',
        code: '200',
        message: 'POD deleted successfully',
      });

      const result = await pod.delete(emptyPodId);

      expect(mockClient.delete).toHaveBeenCalledWith('/proof-of-delivery/');
      expect(result.message).toBe('POD deleted successfully');
    });
  });

  describe('getByTransaction', () => {
    it('should retrieve POD by transaction ID successfully', async () => {
      const transactionId = 'txn_123456';

      mockClient.get.mockResolvedValue(mockPODDocument);

      const result = await pod.getByTransaction(transactionId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/transactions/txn_123456/proof-of-delivery'
      );
      expect(result).toEqual(mockPODDocument);
    });

    it('should propagate API errors', async () => {
      const transactionId = 'txn_invalid';

      const apiError = new QorPayApiError('Transaction not found', 404);
      mockClient.get.mockRejectedValue(apiError);

      await expect(pod.getByTransaction(transactionId)).rejects.toThrow(
        apiError
      );
    });

    it('should propagate network errors', async () => {
      const transactionId = 'txn_123456';

      const networkError = new Error('Network failure');
      mockClient.get.mockRejectedValue(networkError);

      await expect(pod.getByTransaction(transactionId)).rejects.toThrow(
        networkError
      );
    });

    it('should handle empty transaction ID', async () => {
      const emptyTransactionId = '';

      mockClient.get.mockResolvedValue(mockPODDocument);

      const result = await pod.getByTransaction(emptyTransactionId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/transactions//proof-of-delivery'
      );
      expect(result).toEqual(mockPODDocument);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in IDs', async () => {
      const podId = 'pod_123-456_789';

      mockClient.get.mockResolvedValue(mockPODDocument);

      const result = await pod.get(podId);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/proof-of-delivery/pod_123-456_789'
      );
      expect(result).toEqual(mockPODDocument);
    });

    it('should handle large metadata objects', async () => {
      const createData: ProofOfDeliveryCreateRequest = {
        transaction_id: 'txn_123456',
        document_type: 'signature',
        metadata: {
          carrier: 'UPS',
          tracking_number: '1Z12345',
          delivered_by: 'John Doe',
          delivery_time: '2024-01-01T10:30:00Z',
          location: { lat: 40.7128, lng: -74.006 },
          notes: 'Customer was satisfied with delivery'.repeat(10),
        },
      };

      mockClient.post.mockResolvedValue(mockPODDocument);

      const result = await pod.create(createData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/proof-of-delivery',
        createData
      );
      expect(result).toEqual(mockPODDocument);
    });

    it('should handle empty list response', async () => {
      const emptyListResponse: ProofOfDeliveryListResponse = {
        status: 'success',
        code: '200',
        message: 'No POD documents found',
        reference_id: 'ref_123',
        data: {
          documents: [],
          total: 0,
          has_more: false,
        },
      };

      mockClient.get.mockResolvedValue(emptyListResponse);

      const result = await pod.list({ transaction_id: 'txn_not_found' });

      expect(result.data.documents).toHaveLength(0);
      expect(result.data.total).toBe(0);
    });

    it('should handle pagination parameters', async () => {
      const params = {
        limit: 50,
        offset: 100,
        sort_by: 'created_at',
        sort_order: 'desc' as const,
      };

      mockClient.get.mockResolvedValue(mockPODListResponse);

      await pod.list(params);

      expect(mockClient.get).toHaveBeenCalledWith('/proof-of-delivery', params);
    });
  });
});
