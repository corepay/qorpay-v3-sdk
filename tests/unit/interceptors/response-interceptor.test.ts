/**
 * @file tests/unit/interceptors/response-interceptor.test.ts
 * @description Tests for ResponseInterceptor
 */

import { ResponseInterceptor } from '../../../src/client/interceptors/response-interceptor';
import { QorPayApiError, QorPayNetworkError, QorPayUnknownError } from '../../../src/errors';

describe('ResponseInterceptor', () => {
  describe('onSuccess', () => {
    it('should pass through successful responses', () => {
      const response = {
        status: 200,
        data: { success: true, id: '123' },
        headers: {},
        config: {},
      };

      const result = ResponseInterceptor.onSuccess(response);

      expect(result).toBe(response);
    });

    it('should reject when response body has status: error', async () => {
      const response = {
        status: 200,
        data: {
          status: 'error',
          message: 'Something went wrong',
          code: 'VALIDATION_ERROR',
        },
        headers: {},
        config: {},
      };

      await expect(ResponseInterceptor.onSuccess(response)).rejects.toThrow(QorPayApiError);
    });

    it('should create QorPayApiError with correct properties when status: error', async () => {
      const response = {
        status: 200,
        data: {
          status: 'error',
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: { field: 'email' },
        },
        headers: {},
        config: {},
      };

      try {
        await ResponseInterceptor.onSuccess(response);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('API Error: Validation failed (Code: VALIDATION_ERROR) (Status: 200)');
        expect((error as QorPayApiError).statusCode).toBe(200);
        expect((error as QorPayApiError).errorCode).toBe('VALIDATION_ERROR');
        expect((error as QorPayApiError).responseData).toEqual({
          status: 'error',
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: { field: 'email' },
        });
      }
    });

    it('should use default message when error status has no message', async () => {
      const response = {
        status: 200,
        data: {
          status: 'error',
          code: 'UNKNOWN_ERROR',
        },
        headers: {},
        config: {},
      };

      try {
        await ResponseInterceptor.onSuccess(response);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('API Error: API returned an error status (Code: UNKNOWN_ERROR) (Status: 200)');
        expect((error as QorPayApiError).errorCode).toBe('UNKNOWN_ERROR');
      }
    });

    it('should handle numeric error codes', async () => {
      const response = {
        status: 200,
        data: {
          status: 'error',
          message: 'Rate limit exceeded',
          code: 429,
        },
        headers: {},
        config: {},
      };

      try {
        await ResponseInterceptor.onSuccess(response);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('API Error: Rate limit exceeded (Code: 429) (Status: 200)');
        expect((error as QorPayApiError).errorCode).toBe(429);
      }
    });

    it('should pass through responses with non-object data', () => {
      const response = {
        status: 200,
        data: 'simple string response',
        headers: {},
        config: {},
      };

      const result = ResponseInterceptor.onSuccess(response);

      expect(result).toBe(response);
    });

    it('should pass through responses with null data', () => {
      const response = {
        status: 200,
        data: null,
        headers: {},
        config: {},
      };

      const result = ResponseInterceptor.onSuccess(response);

      expect(result).toBe(response);
    });

    it('should pass through responses with data that has no status field', () => {
      const response = {
        status: 200,
        data: { message: 'Success', id: '123' },
        headers: {},
        config: {},
      };

      const result = ResponseInterceptor.onSuccess(response);

      expect(result).toBe(response);
    });

    it('should pass through responses with status field not equal to error', () => {
      const response = {
        status: 200,
        data: { status: 'success', data: 'result' },
        headers: {},
        config: {},
      };

      const result = ResponseInterceptor.onSuccess(response);

      expect(result).toBe(response);
    });
  });

  describe('onError', () => {
    it('should handle axios response errors', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: 'Bad request',
            code: 'INVALID_REQUEST',
          },
        },
        config: {},
      };

      try {
        await ResponseInterceptor.onError(error as any);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('API Error: Bad request (Code: INVALID_REQUEST) (Status: 400)');
        expect((error as QorPayApiError).statusCode).toBe(400);
        expect((error as QorPayApiError).errorCode).toBe('INVALID_REQUEST');
      }
    });

    it('should handle 401 unauthorized errors', async () => {
      const error = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized',
          },
        },
        config: {},
      };

      try {
        await ResponseInterceptor.onError(error as any);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('API Error: Unauthorized (Status: 401)');
        expect((error as QorPayApiError).statusCode).toBe(401);
      }
    });

    it('should handle 500 server errors', async () => {
      const error = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
            code: 'SERVER_ERROR',
          },
        },
        config: {},
      };

      try {
        await ResponseInterceptor.onError(error as any);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('API Error: Internal server error (Code: SERVER_ERROR) (Status: 500)');
        expect((error as QorPayApiError).statusCode).toBe(500);
        expect((error as QorPayApiError).errorCode).toBe('SERVER_ERROR');
      }
    });

    it('should use default message when HTTP error has no message', async () => {
      const error = {
        response: {
          status: 404,
          data: {},
        },
        config: {},
      };

      try {
        await ResponseInterceptor.onError(error as any);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('API Error: Request failed with status code 404 (Status: 404)');
        expect((error as QorPayApiError).statusCode).toBe(404);
      }
    });

    it('should handle HTTP errors with non-object data', async () => {
      const error = {
        response: {
          status: 400,
          data: 'Bad request string',
        },
        config: {},
      };

      try {
        await ResponseInterceptor.onError(error as any);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('Request failed with status code 400');
        expect((error as QorPayApiError).statusCode).toBe(400);
      }
    });

    it('should handle HTTP errors with null data', async () => {
      const error = {
        response: {
          status: 500,
          data: null,
        },
        config: {},
      };

      try {
        await ResponseInterceptor.onError(error as any);
        fail('Should have thrown QorPayApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayApiError);
        expect((error as QorPayApiError).message).toBe('API Error: Request failed with status code 500 (Status: 500)');
        expect((error as QorPayApiError).statusCode).toBe(500);
      }
    });

    it('should handle network errors (no response)', async () => {
      const networkError = new Error('Network error');
      (networkError as any).request = { config: {} };

      const fromErrorSpy = jest.spyOn(QorPayNetworkError, 'fromError');
      fromErrorSpy.mockReturnValue(new QorPayNetworkError('Network failure'));

      try {
        await ResponseInterceptor.onError(networkError as any);
        fail('Should have thrown QorPayNetworkError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayNetworkError);
        expect((error as QorPayNetworkError).message).toBe('Network failure');
      }

      fromErrorSpy.mockRestore();
    });

    it('should handle unknown errors (no response or request)', async () => {
      const unknownError = new Error('Unknown error');

      const fromErrorSpy = jest.spyOn(QorPayUnknownError, 'fromError');
      fromErrorSpy.mockReturnValue(new QorPayUnknownError('Unknown failure'));

      try {
        await ResponseInterceptor.onError(unknownError as any);
        fail('Should have thrown QorPayUnknownError');
      } catch (error) {
        expect(error).toBeInstanceOf(QorPayUnknownError);
        expect((error as QorPayUnknownError).message).toBe('Unknown failure');
      }

      fromErrorSpy.mockRestore();
    });

    it('should pass through existing QorPay errors', async () => {
      const qorPayError = new QorPayApiError('Existing error', 400);

      try {
        await ResponseInterceptor.onError(qorPayError as any);
        fail('Should have thrown the same QorPayApiError');
      } catch (error) {
        expect(error).toBe(qorPayError);
        expect(error).toBeInstanceOf(QorPayApiError);
      }
    });
  });

  describe('createSuccessHandler', () => {
    it('should return a function that calls onSuccess', () => {
      const mockResponse = {
        status: 200,
        data: { success: true },
        headers: {},
        config: {},
      };

      const handler = ResponseInterceptor.createSuccessHandler();
      expect(typeof handler).toBe('function');

      const onSuccessSpy = jest.spyOn(ResponseInterceptor, 'onSuccess');
      onSuccessSpy.mockReturnValue(mockResponse);

      const result = handler(mockResponse);

      expect(onSuccessSpy).toHaveBeenCalledWith(mockResponse);
      expect(result).toBe(mockResponse);

      onSuccessSpy.mockRestore();
    });
  });

  describe('createErrorHandler', () => {
    it('should return a function that calls onError', async () => {
      const mockError = new Error('Test error');
      const mockPromise = Promise.reject(mockError);

      const handler = ResponseInterceptor.createErrorHandler();
      expect(typeof handler).toBe('function');

      const onErrorSpy = jest.spyOn(ResponseInterceptor, 'onError');
      onErrorSpy.mockReturnValue(mockPromise);

      const result = await handler(mockError as any);

      expect(onErrorSpy).toHaveBeenCalledWith(mockError);
      await expect(result).rejects.toBe(mockError);

      onErrorSpy.mockRestore();
    });
  });
});