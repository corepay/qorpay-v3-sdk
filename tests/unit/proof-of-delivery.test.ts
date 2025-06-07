/**
 * @file tests/unit/proof-of-delivery.test.ts
 * @description Unit tests for the ProofOfDelivery resource module
 */

import { ProofOfDelivery } from '../../src/resources/proof-of-delivery';
import { BaseClient } from '../../src/client/base-client';
import { QorPayApiError } from '../../src/errors';

// Mock the BaseClient
jest.mock('../../src/client/base-client');

describe('ProofOfDelivery', () => {
  let mockClient: jest.Mocked<BaseClient>;
  let proofOfDelivery: ProofOfDelivery;

  beforeEach(() => {
    // Create a new mock client before each test
    mockClient = new BaseClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key'
    }) as jest.Mocked<BaseClient>;

    // Create the ProofOfDelivery instance with the mock client
    proofOfDelivery = new ProofOfDelivery(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockCreateRequest = {
      transaction_id: 'txn_123456',
      delivery_date: '2023-01-15T14:30:00Z',
      carrier: 'UPS',
      tracking_number: '1Z999AA1234567890',
      signed_by: 'John Doe',
      notes: 'Package delivered to front door',
      metadata: {
        delivery_type: 'standard'
      }
    };

    const mockCreateResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Proof of delivery created successfully',
      data: {
        id: 'pod_123456',
        transaction_id: 'txn_123456',
        delivery_date: '2023-01-15T14:30:00Z',
        carrier: 'UPS',
        tracking_number: '1Z999AA1234567890',
        signed_by: 'John Doe',
        notes: 'Package delivered to front door',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z',
        metadata: {
          delivery_type: 'standard'
        }
      }
    };

    it('should create a proof of delivery record successfully', async () => {
      // Mock the post method to return a successful response
      mockClient.post.mockResolvedValue(mockCreateResponse);

      // Call the method
      const result = await proofOfDelivery.create(mockCreateRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/proof-of-delivery',
        mockCreateRequest
      );

      // Verify the result
      expect(result).toEqual(mockCreateResponse);
      expect(result.data.id).toBe('pod_123456');
      expect(result.data.transaction_id).toBe('txn_123456');
      expect(result.data.carrier).toBe('UPS');
      expect(result.data.tracking_number).toBe('1Z999AA1234567890');
    });

    it('should handle API errors when creating a proof of delivery record', async () => {
      // Mock the post method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid transaction ID',
        400,
        'GW01'
      );
      mockClient.post.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(proofOfDelivery.create(mockCreateRequest)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.post).toHaveBeenCalledWith(
        '/proof-of-delivery',
        mockCreateRequest
      );
    });
  });

  describe('get', () => {
    const mockPodId = 'pod_123456';
    const mockGetResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        id: 'pod_123456',
        transaction_id: 'txn_123456',
        delivery_date: '2023-01-15T14:30:00Z',
        carrier: 'UPS',
        tracking_number: '1Z999AA1234567890',
        signed_by: 'John Doe',
        notes: 'Package delivered to front door',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z'
      }
    };

    it('should get a proof of delivery record successfully', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockGetResponse);

      // Call the method
      const result = await proofOfDelivery.get(mockPodId);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/proof-of-delivery/${mockPodId}`
      );

      // Verify the result
      expect(result).toEqual(mockGetResponse);
      expect(result.data.id).toBe(mockPodId);
      expect(result.data.transaction_id).toBe('txn_123456');
    });

    it('should handle API errors when getting a proof of delivery record', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Proof of delivery not found',
        404,
        'GW04'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(proofOfDelivery.get(mockPodId)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        `/proof-of-delivery/${mockPodId}`
      );
    });
  });

  describe('update', () => {
    const mockPodId = 'pod_123456';
    const mockUpdateRequest = {
      delivery_date: '2023-01-16T10:00:00Z',
      signed_by: 'Jane Smith',
      notes: 'Package delivered to back door'
    };

    const mockUpdateResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Proof of delivery updated successfully',
      data: {
        id: 'pod_123456',
        transaction_id: 'txn_123456',
        delivery_date: '2023-01-16T10:00:00Z',
        carrier: 'UPS',
        tracking_number: '1Z999AA1234567890',
        signed_by: 'Jane Smith',
        notes: 'Package delivered to back door',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-02T12:00:00Z'
      }
    };

    it('should update a proof of delivery record successfully', async () => {
      // Mock the put method to return a successful response
      mockClient.put.mockResolvedValue(mockUpdateResponse);

      // Call the method
      const result = await proofOfDelivery.update(mockPodId, mockUpdateRequest);

      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/proof-of-delivery/${mockPodId}`,
        mockUpdateRequest
      );

      // Verify the result
      expect(result).toEqual(mockUpdateResponse);
      expect(result.data.delivery_date).toBe('2023-01-16T10:00:00Z');
      expect(result.data.signed_by).toBe('Jane Smith');
      expect(result.data.notes).toBe('Package delivered to back door');
    });

    it('should handle API errors when updating a proof of delivery record', async () => {
      // Mock the put method to throw an API error
      const mockError = new QorPayApiError(
        'Invalid update data',
        400,
        'GW01'
      );
      mockClient.put.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(proofOfDelivery.update(mockPodId, mockUpdateRequest)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.put).toHaveBeenCalledWith(
        `/proof-of-delivery/${mockPodId}`,
        mockUpdateRequest
      );
    });
  });

  describe('list', () => {
    const mockQueryParams = {
      transaction_id: 'txn_123456',
      delivery_date_start: '2023-01-01',
      delivery_date_end: '2023-01-31',
      carrier: 'UPS',
      limit: 10,
      offset: 0
    };

    const mockListResponse = {
      status: 'approved',
      code: 'GW00',
      message: 'Success',
      data: {
        proof_of_delivery: [
          {
            id: 'pod_123456',
            transaction_id: 'txn_123456',
            delivery_date: '2023-01-15T14:30:00Z',
            carrier: 'UPS',
            tracking_number: '1Z999AA1234567890',
            signed_by: 'John Doe',
            notes: 'Package delivered to front door',
            created_at: '2023-01-01T12:00:00Z',
            updated_at: '2023-01-01T12:00:00Z'
          },
          {
            id: 'pod_789012',
            transaction_id: 'txn_789012',
            delivery_date: '2023-01-20T16:45:00Z',
            carrier: 'FedEx',
            tracking_number: '123456789012',
            signed_by: 'Jane Smith',
            notes: 'Package delivered to office',
            created_at: '2023-01-20T12:00:00Z',
            updated_at: '2023-01-20T12:00:00Z'
          }
        ],
        meta: {
          count: 2,
          limit: 10,
          offset: 0
        }
      }
    };

    it('should list proof of delivery records successfully with query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockListResponse);

      // Call the method with query parameters
      const result = await proofOfDelivery.list(mockQueryParams);

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/proof-of-delivery',
        mockQueryParams
      );

      // Verify the result
      expect(result).toEqual(mockListResponse);
      expect(result.data.proof_of_delivery.length).toBe(2);
      expect(result.data.proof_of_delivery[0].id).toBe('pod_123456');
      expect(result.data.proof_of_delivery[1].carrier).toBe('FedEx');
      expect(result.data.meta.count).toBe(2);
    });

    it('should list proof of delivery records successfully without query parameters', async () => {
      // Mock the get method to return a successful response
      mockClient.get.mockResolvedValue(mockListResponse);

      // Call the method without query parameters
      const result = await proofOfDelivery.list();

      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/proof-of-delivery',
        undefined
      );

      // Verify the result
      expect(result).toEqual(mockListResponse);
    });

    it('should handle API errors when listing proof of delivery records', async () => {
      // Mock the get method to throw an API error
      const mockError = new QorPayApiError(
        'Access denied',
        403,
        'GW03'
      );
      mockClient.get.mockRejectedValue(mockError);

      // Expect the method to throw the same error
      await expect(proofOfDelivery.list(mockQueryParams)).rejects.toThrow(mockError);
      
      // Verify the client was called with the correct parameters
      expect(mockClient.get).toHaveBeenCalledWith(
        '/proof-of-delivery',
        mockQueryParams
      );
    });
  });
});
