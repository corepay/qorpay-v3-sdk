/**
 * @file tests/unit/proof-of-delivery.test.ts
 * @description Tests for proofOfDelivery resource class using real instances
 */

import type { QorPayClient } from '../../src/client/qorpay-client';
import {
  createTestClient,
  mockSuccessfulResponse,
  mockFailedResponse,
} from '../utils/test-client';

// Mock ONLY the network layer (axios)
jest.mock('axios');
jest.mock('axios-retry');

describe('ProofOfDelivery', () => {
  let client: QorPayClient;
  let mockAxiosInstance: any;

  const mockPODDocument = {
    id: 'pod_123456',
    transaction_id: 'txn_123456',
    document_type: 'signature',
    document_url: 'https://example.com/documents/signature_123.pdf',
    uploaded_at: '2024-01-01T00:00:00Z',
    metadata: { delivery_confirmed: true },
  };

  const mockPODListResponse = {
    status: 'success',
    data: {
      documents: [
        mockPODDocument,
        {
          ...mockPODDocument,
          id: 'pod_789012',
          document_type: 'photo',
          document_url: 'https://example.com/documents/photo_456.jpg',
        },
      ],
      total_count: 2,
      has_more: false,
    },
  };

  beforeEach(() => {
    const setup = createTestClient();
    client = setup.client;
    mockAxiosInstance = setup.mockAxiosInstance;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize proof of delivery resource', () => {
      expect(client.proofOfDelivery).toBeDefined();
      expect(typeof client.proofOfDelivery.create).toBe('function');
      expect(typeof client.proofOfDelivery.get).toBe('function');
      expect(typeof client.proofOfDelivery.update).toBe('function');
      expect(typeof client.proofOfDelivery.delete).toBe('function');
      expect(typeof client.proofOfDelivery.list).toBe('function');
      expect(typeof client.proofOfDelivery.getByTransaction).toBe('function');
    });
  });

  describe('create', () => {
    it('should create a POD document successfully', async () => {
      const documentData = {
        transaction_id: 'txn_123456',
        document_type: 'signature',
        document_url: 'https://example.com/documents/new_signature.pdf',
        metadata: { delivery_notes: 'Customer signed personally' },
      };

      mockSuccessfulResponse(mockPODDocument);

      const result = await client.proofOfDelivery.create(documentData);

      expect(result).toEqual(mockPODDocument);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/proof-of-delivery',
          data: expect.objectContaining({
            transaction_id: 'txn_123456',
            document_type: 'signature',
            document_url: 'https://example.com/documents/new_signature.pdf',
          }),
        })
      );
    });

    it('should create document with minimal data', async () => {
      const documentData = {
        transaction_id: 'txn_789012',
        document_type: 'photo',
        document_url: 'https://example.com/documents/delivery_photo.jpg',
      };

      mockSuccessfulResponse({
        ...mockPODDocument,
        id: 'pod_minimal',
        transaction_id: 'txn_789012',
        document_type: 'photo',
      });

      const result = await client.proofOfDelivery.create(documentData);

      expect(result.transaction_id).toBe('txn_789012');
      expect(result.document_type).toBe('photo');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/proof-of-delivery',
          data: expect.objectContaining({
            transaction_id: 'txn_789012',
            document_type: 'photo',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const documentData = {
        transaction_id: '',
        document_type: 'invalid',
        document_url: '',
      };

      mockFailedResponse('Invalid document data', 400);

      await expect(
        client.proofOfDelivery.create(documentData)
      ).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should retrieve a POD document successfully', async () => {
      const documentId = 'pod_123456';

      mockSuccessfulResponse(mockPODDocument);

      const result = await client.proofOfDelivery.get(documentId);

      expect(result).toEqual(mockPODDocument);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/proof-of-delivery/${documentId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('POD document not found', 404);

      await expect(
        client.proofOfDelivery.get('invalid_document')
      ).rejects.toThrow();
    });

    it('should handle empty document ID', async () => {
      mockFailedResponse('Document ID is required', 400);

      await expect(client.proofOfDelivery.get('')).rejects.toThrow();
    });

    it('should handle document ID with special characters', async () => {
      const documentId = 'pod_123/with/special-chars';

      mockSuccessfulResponse(mockPODDocument);

      await client.proofOfDelivery.get(documentId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: `/proof-of-delivery/${documentId}`,
        })
      );
    });
  });

  describe('update', () => {
    it('should update a POD document successfully', async () => {
      const documentId = 'pod_123456';
      const updateData = {
        document_url: 'https://example.com/documents/updated_signature.pdf',
        metadata: { delivery_confirmed: true, notes: 'Updated document URL' },
      };

      mockSuccessfulResponse({
        ...mockPODDocument,
        document_url: 'https://example.com/documents/updated_signature.pdf',
        metadata: { delivery_confirmed: true, notes: 'Updated document URL' },
      });

      const result = await client.proofOfDelivery.update(
        documentId,
        updateData
      );

      expect(result.document_url).toBe(
        'https://example.com/documents/updated_signature.pdf'
      );
      expect(result.metadata.notes).toBe('Updated document URL');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: `/proof-of-delivery/${documentId}`,
          data: expect.objectContaining({
            document_url: 'https://example.com/documents/updated_signature.pdf',
          }),
        })
      );
    });

    it('should update document with partial data', async () => {
      const documentId = 'pod_123456';
      const updateData = {
        metadata: { delivery_notes: 'Customer provided additional ID' },
      };

      mockSuccessfulResponse({
        ...mockPODDocument,
        metadata: { delivery_notes: 'Customer provided additional ID' },
      });

      const result = await client.proofOfDelivery.update(
        documentId,
        updateData
      );

      expect(result.metadata.delivery_notes).toBe(
        'Customer provided additional ID'
      );
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: `/proof-of-delivery/${documentId}`,
          data: expect.objectContaining({
            metadata: { delivery_notes: 'Customer provided additional ID' },
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const updateData = {
        document_url: '',
      };

      mockFailedResponse('Invalid update data', 400);

      await expect(
        client.proofOfDelivery.update('invalid_document', updateData)
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a POD document successfully', async () => {
      const documentId = 'pod_123456';

      mockSuccessfulResponse({
        status: 'success',
        message: 'POD document deleted successfully',
      });

      const result = await client.proofOfDelivery.delete(documentId);

      expect(result.status).toBe('success');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: `/proof-of-delivery/${documentId}`,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('POD document not found', 404);

      await expect(
        client.proofOfDelivery.delete('invalid_document')
      ).rejects.toThrow();
    });

    it('should handle deletion of document with special characters', async () => {
      const documentId = 'pod_123/with/special-chars';

      mockSuccessfulResponse({
        status: 'success',
        message: 'POD document deleted successfully',
      });

      await client.proofOfDelivery.delete(documentId);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: `/proof-of-delivery/${documentId}`,
        })
      );
    });
  });

  describe('list', () => {
    it('should list POD documents with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        transaction_id: 'txn_123456',
        document_type: 'signature',
      };

      mockSuccessfulResponse(mockPODListResponse);

      const result = await client.proofOfDelivery.list(params);

      expect(result.data.documents).toHaveLength(2);
      expect(result.data.total_count).toBe(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/proof-of-delivery',
          params,
        })
      );
    });

    it('should list documents without parameters', async () => {
      mockSuccessfulResponse(mockPODListResponse);

      const result = await client.proofOfDelivery.list();

      expect(result.data.documents).toHaveLength(2);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/proof-of-delivery',
        })
      );
    });

    it('should list documents with different document types', async () => {
      const params = {
        document_type: 'photo',
        limit: 5,
      };

      mockSuccessfulResponse({
        ...mockPODListResponse,
        data: {
          documents: [{ ...mockPODDocument, document_type: 'photo' }],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await client.proofOfDelivery.list(params);

      expect(result.data.documents).toHaveLength(1);
      expect(result.data.documents[0].document_type).toBe('photo');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/proof-of-delivery',
          params,
        })
      );
    });

    it('should propagate API errors', async () => {
      mockFailedResponse('Unable to retrieve POD documents', 500);

      await expect(client.proofOfDelivery.list()).rejects.toThrow();
    });

    it('should handle empty list response', async () => {
      mockSuccessfulResponse({
        status: 'success',
        data: {
          documents: [],
          total_count: 0,
          has_more: false,
        },
      });

      const result = await client.proofOfDelivery.list();

      expect(result.data.documents).toEqual([]);
      expect(result.data.total_count).toBe(0);
    });

    it('should list documents for specific transaction', async () => {
      const params = {
        transaction_id: 'txn_789012',
      };

      mockSuccessfulResponse({
        ...mockPODListResponse,
        data: {
          documents: [{ ...mockPODDocument, transaction_id: 'txn_789012' }],
          total_count: 1,
          has_more: false,
        },
      });

      const result = await client.proofOfDelivery.list(params);

      expect(result.data.documents).toHaveLength(1);
      expect(result.data.documents[0].transaction_id).toBe('txn_789012');
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/proof-of-delivery',
          params,
        })
      );
    });
  });
});
