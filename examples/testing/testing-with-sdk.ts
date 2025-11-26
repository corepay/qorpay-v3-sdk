/**
 * Testing with QorPay SDK Example
 *
 * This example demonstrates how to write effective tests for your application
 * that uses the QorPay SDK, including mocking strategies and test patterns.
 */

import { QorPayClient } from '@corepay/qorpay-v3-sdk';

// ===== MOCKING STRATEGIES =====

// Strategy 1: Mock the entire SDK for unit tests
const createMockQorPayClient = () => ({
  payments: {
    create: jest.fn().mockResolvedValue({
      id: 'pay_test_123',
      status: 'approved',
      amount: 100,
    }),
    refund: jest.fn().mockResolvedValue({
      id: 'refund_test_456',
      status: 'approved',
      amount: 50,
    }),
  },
  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cust_test_789',
      email: 'test@example.com',
      name: 'Test User',
    }),
  },
});

// Strategy 2: Mock specific responses for integration tests
const mockPaymentResponse = {
  id: 'pay_mock_123',
  status: 'approved',
  amount: 100,
  currency: 'USD',
  created_at: '2025-01-25T10:00:00Z',
};

// ===== TEST EXAMPLES =====

describe('PaymentService', () => {
  let qorpayClient: any;
  let paymentService: any;

  beforeEach(() => {
    // Create mock client for each test
    qorpayClient = createMockQorPayClient();

    // Initialize your service with the mock client
    paymentService = new PaymentService(qorpayClient);
  });

  describe('processPayment', () => {
    it('should successfully process a valid payment', async () => {
      // Arrange
      const paymentData = {
        amount: 100,
        card: {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '25',
          cvv: '123',
        },
      };

      // Act
      const result = await paymentService.processPayment(paymentData);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('pay_test_123');
      expect(qorpayClient.payments.create).toHaveBeenCalledWith(paymentData);
    });

    it('should handle payment failure gracefully', async () => {
      // Arrange
      const paymentData = { amount: -100 }; // Invalid amount
      qorpayClient.payments.create.mockRejectedValue(new Error('Invalid amount'));

      // Act & Assert
      await expect(paymentService.processPayment(paymentData))
        .rejects.toThrow('Invalid amount');
    });

    it('should retry failed payments', async () => {
      // Arrange
      const paymentData = { amount: 100 };

      // Mock initial failure, then success
      qorpayClient.payments.create
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockPaymentResponse);

      // Act
      const result = await paymentService.processPaymentWithRetry(paymentData);

      // Assert
      expect(result.success).toBe(true);
      expect(qorpayClient.payments.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('customer management', () => {
    it('should create a customer successfully', async () => {
      // Arrange
      const customerData = {
        email: 'new@example.com',
        name: 'New Customer',
      };

      // Act
      const result = await paymentService.createCustomer(customerData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('cust_test_789');
      expect(qorpayClient.customers.create).toHaveBeenCalledWith(customerData);
    });
  });
});

// ===== SERVICE CLASS EXAMPLE =====

class PaymentService {
  constructor(private qorpayClient: any) {}

  async processPayment(paymentData: any): Promise<any> {
    try {
      const payment = await this.qorpayClient.payments.create(paymentData);

      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async processPaymentWithRetry(paymentData: any, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.processPayment(paymentData);
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  async createCustomer(customerData: any): Promise<any> {
    try {
      const customer = await this.qorpayClient.customers.create(customerData);
      return customer;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async refundPayment(paymentId: string, amount: number): Promise<any> {
    try {
      const refund = await this.qorpayClient.payments.refund(paymentId, { amount });
      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// ===== INTEGRATION TESTING EXAMPLE =====

describe('PaymentService Integration Tests', () => {
  let qorpayClient: QorPayClient;
  let paymentService: PaymentService;

  beforeAll(() => {
    // Use actual SDK for integration tests (with test credentials)
    qorpayClient = new QorPayClient({
      appKey: process.env.QORPAY_TEST_APP_KEY,
      clientKey: process.env.QORPAY_TEST_CLIENT_KEY,
      environment: 'sandbox',
    });

    paymentService = new PaymentService(qorpayClient);
  });

  it('should process real payment in sandbox', async () => {
    // This test would actually hit the sandbox API
    // Only run if test credentials are available
    if (!process.env.QORPAY_TEST_APP_KEY) {
      console.log('⏭️ Skipping integration test - no test credentials');
      return;
    }

    const paymentData = {
      amount: 1.00, // Use small amount for testing
      card: {
        number: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
      },
    };

    const result = await paymentService.processPayment(paymentData);

    expect(result.success).toBe(true);
    expect(result.paymentId).toBeDefined();
  }, 10000); // 10 second timeout for integration tests
});

// ===== TEST UTILITIES =====

class TestDataFactory {
  static createValidPaymentData(overrides: any = {}) {
    return {
      amount: 100,
      card: {
        number: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123',
      },
      customer: {
        email: 'test@example.com',
        name: 'Test User',
      },
      ...overrides,
    };
  }

  static createValidCustomerData(overrides: any = {}) {
    return {
      email: 'test@example.com',
      name: 'Test User',
      phone: '+1-555-123-4567',
      ...overrides,
    };
  }

  static createInvalidPaymentData() {
    return [
      { amount: -100 }, // Negative amount
      { amount: 0 }, // Zero amount
      { amount: 'invalid' }, // Invalid type
      { card: { number: '123' } }, // Invalid card
      { card: { number: '4111111111111111' } }, // Missing CVV/expiry
    ];
  }
}

// ===== MOCK NETWORK INTERCEPTION =====

// Example using jest.mock to intercept network calls
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    request: jest.fn((config) => {
      // Mock different responses based on the request
      if (config.url?.includes('/payments')) {
        return Promise.resolve({
          data: mockPaymentResponse,
          status: 200,
        });
      }

      if (config.url?.includes('/customers')) {
        return Promise.resolve({
          data: {
            id: 'cust_mock_123',
            email: 'test@example.com',
          },
          status: 200,
        });
      }

      // Default error response
      return Promise.reject(new Error('Not found'));
    }),
  })),
}));

// ===== PERFORMANCE TESTING =====

describe('PaymentService Performance', () => {
  it('should process payments within acceptable time limits', async () => {
    const qorpayClient = createMockQorPayClient();
    const paymentService = new PaymentService(qorpayClient);

    const startTime = Date.now();

    await paymentService.processPayment(
      TestDataFactory.createValidPaymentData()
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  it('should handle concurrent payments', async () => {
    const qorpayClient = createMockQorPayClient();
    const paymentService = new PaymentService(qorpayClient);

    const payments = Array.from({ length: 10 }, (_, i) =>
      paymentService.processPayment(
        TestDataFactory.createValidPaymentData({ amount: 100 + i })
      )
    );

    const results = await Promise.all(payments);

    expect(results).toHaveLength(10);
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });
});

// Example usage
async function demonstrateTesting() {
  console.log('🧪 QorPay SDK Testing Example');
  console.log('==============================');

  // Example of using the test data factory
  const validPayment = TestDataFactory.createValidPaymentData();
  console.log('✅ Valid payment data:', validPayment);

  const invalidPayments = TestDataFactory.createInvalidPaymentData();
  console.log('❌ Invalid payment examples:', invalidPayments);

  // Example service usage (would use mocks in real tests)
  const mockClient = createMockQorPayClient();
  const service = new PaymentService(mockClient);

  const result = await service.processPayment(validPayment);
  console.log('💳 Payment result:', result);
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
  demonstrateTesting().catch(console.error);
}

export {
  PaymentService,
  TestDataFactory,
  createMockQorPayClient,
  mockPaymentResponse,
};