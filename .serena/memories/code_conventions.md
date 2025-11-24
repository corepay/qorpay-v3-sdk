# QorPay V3 SDK - Code Conventions & Style Guide

## TypeScript Conventions

### Type Safety
- **Zero `any` types**: All code must have explicit types
- **Strict mode enabled**: Full TypeScript strict mode
- **Type inference preferred**: Let TypeScript infer types when possible
- **Interface over type**: Use `interface` for object shapes, `type` for unions/computed types

### Naming Conventions
- **PascalCase**: Classes, interfaces, types, enums
- **camelCase**: Variables, functions, methods, properties
- **UPPER_SNAKE_CASE**: Constants, environment variables
- **kebab-case**: File names, CSS classes

### Example:
```typescript
// Good
interface PaymentRequest {
  amount: number;
  currency: string;
}

class PaymentProcessor {
  private readonly MAX_RETRY_ATTEMPTS = 3;

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implementation
  }
}

// Bad
interface payment_request {
  amount: any;
  currency: string;
}

class paymentprocessor {
  processPayment(request: any) {
    // Implementation
  }
}
```

## File Structure Conventions

### Resource Class Structure
```typescript
// src/resources/[resource-name].ts
export class ResourceName {
  private readonly client: BaseClient;

  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Brief description of what this method does
   * @param param - Description of parameter
   * @returns Description of return value
   */
  async getMethod(param: ParamType): Promise<ResponseType> {
    // 1. Validate input
    ParamSchema.parse(param);
    
    // 2. Call API
    return this.client.get<ResponseType>(`/endpoint`, { param });
  }
}
```

### Type Definition Structure
```typescript
// src/types/[resource-name].ts
export interface ResourceType {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  // Resource-specific properties
}

export interface CreateResourceRequest {
  // Required fields for creation
}

export interface UpdateResourceRequest {
  // Optional fields for updates
}
```

### Schema Definition Structure
```typescript
// src/schemas/[resource-name].ts
import { z } from 'zod';

export const CreateResourceRequestSchema = z.object({
  field1: z.string().min(1, "Field 1 is required"),
  field2: z.number().positive("Field 2 must be positive"),
  optionalField: z.string().optional(),
});

export type CreateResourceRequest = z.infer<typeof CreateResourceRequestSchema>;
```

## JSDoc Documentation Standards

### Method Documentation
```typescript
/**
 * Create a new payment with the provided details
 * 
 * @param request - The payment request details
 * @param request.amount - Payment amount in decimal (e.g., 10.50)
 * @param request.card - Card payment method details
 * @returns Promise resolving to the created payment
 * 
 * @example
 * ```typescript
 * const payment = await payments.create({
 *   amount: 100.50,
 *   card: {
 *     number: '4111111111111111',
 *     expiryMonth: '12',
 *     expiryYear: '25',
 *     cvv: '123'
 *   }
 * });
 * ```
 * 
 * @throws {QorPayApiError} When payment creation fails
 */
async create(request: CreatePaymentRequest): Promise<Payment> {
  // Implementation
}
```

## Error Handling Conventions

### Error Types
- Use specific error classes from `src/errors/index.ts`
- Always include descriptive error messages
- Log errors at appropriate levels
- Don't expose sensitive information in error messages

### Error Handling Pattern
```typescript
async someOperation(params: Params): Promise<Result> {
  try {
    // Validate input
    ParamsSchema.parse(params);
    
    // Perform operation
    const result = await this.client.post<Result>('/endpoint', params);
    
    return result;
  } catch (error) {
    if (error instanceof QorPayApiError) {
      // Re-throw API errors with additional context
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      // Transform validation errors to API errors
      throw new QorPayApiError('Validation failed', 400, 'VALIDATION_ERROR', error.errors);
    }
    
    // Wrap unexpected errors
    throw QorPayUnknownError.fromError(error);
  }
}
```

## Testing Conventions

### Unit Test Structure
```typescript
describe('ResourceName', () => {
  let resource: ResourceName;
  let mockClient: jest.Mocked<BaseClient>;

  beforeEach(() => {
    mockClient = new BaseClient({...}) as jest.Mocked<BaseClient>;
    resource = new ResourceName(mockClient);
  });

  describe('methodName', () => {
    it('should call correct endpoint with transformed data', async () => {
      // Arrange
      const input = { /* test data */ };
      const expectedOutput = { /* expected result */ };
      mockClient.get.mockResolvedValue(expectedOutput);

      // Act
      const result = await resource.methodName(input);

      // Assert
      expect(mockClient.get).toHaveBeenCalledWith(
        '/expected-endpoint',
        { transformed: 'data' }
      );
      expect(result).toEqual(expectedOutput);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const input = { /* test data */ };
      const apiError = new QorPayApiError('API Error', 400);
      mockClient.get.mockRejectedValue(apiError);

      // Act & Assert
      await expect(resource.methodName(input)).rejects.toThrow(apiError);
    });
  });
});
```

### Integration Test Structure
```typescript
describe('ResourceName Integration Tests', () => {
  let qorpay: QorPayClient;

  beforeAll(async () => {
    // Start MSW server
    await startServer();
    
    qorpay = new QorPayClient({
      appKey: 'test-app-key',
      clientKey: 'test-client-key',
      environment: 'sandbox',
    });
  });

  afterAll(async () => {
    // Stop MSW server
    await stopServer();
  });

  beforeEach(() => {
    // Reset MSW handlers
    resetHandlers();
  });

  describe('methodName', () => {
    it('should perform end-to-end operation successfully', async () => {
      // Arrange
      const mockResponse = { /* mock API response */ };
      setupMockEndpoint('POST', '/endpoint', 200, mockResponse);

      // Act
      const result = await qorpay.resourceName.methodName(/* input */);

      // Assert
      expect(result).toEqual(/* expected transformed result */);
    });
  });
});
```

## Code Quality Standards

### ESLint Configuration
- `@typescript-eslint/no-explicit-any`: Disallows `any` types
- `@typescript-eslint/prefer-const`: Prefer const over let when possible
- `@typescript-eslint/no-unused-vars`: No unused variables
- `prefer-template`: Use template literals over string concatenation
- `object-shorthand`: Use property shorthand when possible

### Prettier Configuration
- 2 space indentation
- Single quotes for strings
- No trailing commas in function signatures
- Trailing commas in arrays and objects
- Print width: 80 characters

## Import/Export Conventions

### Import Order
1. External dependencies (Node.js, npm packages)
2. Internal SDK imports (other modules)
3. Relative imports (same directory)
4. Type-only imports (last)

```typescript
// External dependencies
import { z } from 'zod';
import axios from 'axios';

// Internal imports
import { BaseClient } from '../client/base-client';
import { QorPayApiError } from '../errors';

// Relative imports
import { ResourceType } from './types';

// Type-only imports
import type { CreateRequest } from './types';
```

### Export Pattern
```typescript
// Default export for main class
export default class PaymentResource {
  // Implementation
}

// Named exports for utilities and types
export { PaymentTransformer } from './transformers';
export type { PaymentRequest, PaymentResponse } from './types';
```

## Performance Conventions

### Async/Await
- Always use async/await over Promise chains
- Handle errors appropriately
- Don't create unnecessary Promises

### Memory Management
- Avoid memory leaks in long-running operations
- Clean up resources in finally blocks
- Use WeakMap for caching object metadata

### API Calls
- Implement proper retry logic
- Use appropriate timeouts
- Batch operations when possible

## Security Conventions

### Data Validation
- Always validate inputs with Zod schemas
- Sanitize data before API calls
- Validate API responses

### Error Handling
- Don't expose sensitive information in error messages
- Log errors for debugging without exposing secrets
- Use appropriate HTTP status codes

### API Keys
- Never hardcode API keys in source code
- Use environment variables for configuration
- Implement proper key rotation strategy