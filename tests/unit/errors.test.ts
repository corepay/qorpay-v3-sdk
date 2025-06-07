import {
  QorPayError,
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError
} from '../../src/errors';

describe('Error Classes', () => {
  describe('QorPayError', () => {
    it('should extend Error', () => {
      const error = new QorPayError('Test error message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should set the correct error name', () => {
      const error = new QorPayError('Test error message');
      expect(error.name).toBe('QorPayError');
    });

    it('should set the correct error message', () => {
      const message = 'Test error message';
      const error = new QorPayError(message);
      expect(error.message).toBe(message);
    });

    it('should be catchable as an instance of Error', () => {
      try {
        throw new QorPayError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('QorPayApiError', () => {
    it('should extend QorPayError', () => {
      const error = new QorPayApiError('API error');
      expect(error).toBeInstanceOf(QorPayError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set the correct error name', () => {
      const error = new QorPayApiError('API error');
      expect(error.name).toBe('QorPayApiError');
    });

    it('should format the error message correctly without status code or error code', () => {
      const message = 'Invalid request';
      const error = new QorPayApiError(message);
      expect(error.message).toBe(`API Error: ${message}`);
    });

    it('should format the error message correctly with status code', () => {
      const message = 'Invalid request';
      const statusCode = 400;
      const error = new QorPayApiError(message, statusCode);
      expect(error.message).toBe(`API Error: ${message} (Status: ${statusCode})`);
    });

    it('should format the error message correctly with error code', () => {
      const message = 'Invalid request';
      const errorCode = 'GW01';
      const error = new QorPayApiError(message, undefined, errorCode);
      expect(error.message).toBe(`API Error: ${message} (Code: ${errorCode})`);
    });

    it('should format the error message correctly with both status code and error code', () => {
      const message = 'Invalid request';
      const statusCode = 400;
      const errorCode = 'GW01';
      const error = new QorPayApiError(message, statusCode, errorCode);
      expect(error.message).toBe(`API Error: ${message} (Code: ${errorCode}) (Status: ${statusCode})`);
    });

    it('should store the status code correctly', () => {
      const statusCode = 400;
      const error = new QorPayApiError('Error', statusCode);
      expect(error.statusCode).toBe(statusCode);
    });

    it('should store the error code correctly', () => {
      const errorCode = 'GW01';
      const error = new QorPayApiError('Error', undefined, errorCode);
      expect(error.errorCode).toBe(errorCode);
    });

    it('should store the response data correctly', () => {
      const responseData = { status: 'error', message: 'Something went wrong' };
      const error = new QorPayApiError('Error', 400, 'GW01', responseData);
      expect(error.responseData).toBe(responseData);
    });

    describe('fromResponse factory method', () => {
      it('should create an error from a complete response', () => {
        const response = {
          status: 400,
          data: {
            code: 'GW01',
            message: 'Invalid request',
            errors: { field: 'required' },
            requestId: 'req_123456'
          }
        };

        const error = QorPayApiError.fromResponse(response);

        expect(error).toBeInstanceOf(QorPayApiError);
        expect(error.statusCode).toBe(400);
        expect(error.errorCode).toBe('GW01');
        expect(error.responseData).toEqual({ field: 'required' });
        expect(error.requestId).toBe('req_123456');
        expect(error.message).toContain('Invalid request');
      });

      it('should handle response with minimal data', () => {
        const response = {
          status: 500
        };

        const error = QorPayApiError.fromResponse(response);

        expect(error.statusCode).toBe(500);
        expect(error.message).toContain('Unknown API error');
      });

      it('should use default status code when missing', () => {
        const response = {
          data: {
            message: 'Server error'
          }
        };

        const error = QorPayApiError.fromResponse(response);

        expect(error.statusCode).toBe(500);
        expect(error.message).toContain('Server error');
      });

      it('should handle response with error field instead of message', () => {
        const response = {
          status: 400,
          data: {
            error: 'Validation failed'
          }
        };

        const error = QorPayApiError.fromResponse(response);

        expect(error.message).toContain('Validation failed');
      });

      it('should handle empty response', () => {
        const response = {};

        const error = QorPayApiError.fromResponse(response);

        expect(error.statusCode).toBe(500);
        expect(error.message).toContain('Unknown API error');
      });
    });

    describe('error type checking methods', () => {
      it('should correctly identify client errors (4xx)', () => {
        const error400 = new QorPayApiError('Bad Request', 400);
        const error404 = new QorPayApiError('Not Found', 404);
        const error499 = new QorPayApiError('Client Error', 499);

        expect(error400.isClientError()).toBe(true);
        expect(error404.isClientError()).toBe(true);
        expect(error499.isClientError()).toBe(true);
      });

      it('should correctly identify server errors (5xx)', () => {
        const error500 = new QorPayApiError('Internal Server Error', 500);
        const error503 = new QorPayApiError('Service Unavailable', 503);
        const error599 = new QorPayApiError('Server Error', 599);

        expect(error500.isServerError()).toBe(true);
        expect(error503.isServerError()).toBe(true);
        expect(error599.isServerError()).toBe(true);
      });

      it('should correctly identify rate limit errors (429)', () => {
        const rateLimitError = new QorPayApiError('Rate Limited', 429);
        const otherError = new QorPayApiError('Other Error', 400);

        expect(rateLimitError.isRateLimitError()).toBe(true);
        expect(otherError.isRateLimitError()).toBe(false);
      });

      it('should correctly identify authentication errors (401)', () => {
        const authError = new QorPayApiError('Unauthorized', 401);
        const otherError = new QorPayApiError('Other Error', 400);

        expect(authError.isAuthenticationError()).toBe(true);
        expect(otherError.isAuthenticationError()).toBe(false);
      });

      it('should correctly identify permission errors (403)', () => {
        const permissionError = new QorPayApiError('Forbidden', 403);
        const otherError = new QorPayApiError('Other Error', 400);

        expect(permissionError.isPermissionError()).toBe(true);
        expect(otherError.isPermissionError()).toBe(false);
      });

      it('should correctly identify not found errors (404)', () => {
        const notFoundError = new QorPayApiError('Not Found', 404);
        const otherError = new QorPayApiError('Other Error', 400);

        expect(notFoundError.isNotFoundError()).toBe(true);
        expect(otherError.isNotFoundError()).toBe(false);
      });

      it('should correctly identify validation errors (400 with response data)', () => {
        const validationError = new QorPayApiError('Validation Failed', 400, 'VALIDATION', { field: 'required' });
        const simpleError = new QorPayApiError('Bad Request', 400);
        const otherError = new QorPayApiError('Other Error', 500);

        expect(validationError.isValidationError()).toBe(true);
        expect(simpleError.isValidationError()).toBe(false);
        expect(otherError.isValidationError()).toBe(false);
      });

      it('should handle undefined status codes gracefully', () => {
        const error = new QorPayApiError('Error');

        expect(error.isClientError()).toBe(false);
        expect(error.isServerError()).toBe(false);
        expect(error.isRateLimitError()).toBe(false);
        expect(error.isAuthenticationError()).toBe(false);
        expect(error.isPermissionError()).toBe(false);
        expect(error.isNotFoundError()).toBe(false);
        expect(error.isValidationError()).toBe(false);
      });
    });
  });

  describe('QorPayNetworkError', () => {
    it('should extend QorPayError', () => {
      const error = new QorPayNetworkError('Network error');
      expect(error).toBeInstanceOf(QorPayError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set the correct error name', () => {
      const error = new QorPayNetworkError('Network error');
      expect(error.name).toBe('QorPayNetworkError');
    });

    it('should format the error message correctly', () => {
      const message = 'Connection timeout';
      const error = new QorPayNetworkError(message);
      expect(error.message).toBe(`Network Error: ${message}`);
    });

    describe('fromError factory method', () => {
      it('should create a network error from a generic error', () => {
        const originalError = new Error('Generic network error');
        const networkError = QorPayNetworkError.fromError(originalError);

        expect(networkError).toBeInstanceOf(QorPayNetworkError);
        expect(networkError.message).toBe('Network Error: Generic network error');
        expect(networkError.cause).toBe(originalError);
      });

      it('should handle ECONNABORTED error code', () => {
        const originalError = { code: 'ECONNABORTED', message: 'Request aborted' };
        const networkError = QorPayNetworkError.fromError(originalError);

        expect(networkError.message).toBe('Network Error: Request timed out');
        expect(networkError.cause).toBe(originalError);
      });

      it('should handle ECONNREFUSED error code', () => {
        const originalError = { code: 'ECONNREFUSED', message: 'Connection refused' };
        const networkError = QorPayNetworkError.fromError(originalError);

        expect(networkError.message).toBe('Network Error: Connection refused');
        expect(networkError.cause).toBe(originalError);
      });

      it('should handle ECONNRESET error code', () => {
        const originalError = { code: 'ECONNRESET', message: 'Connection reset' };
        const networkError = QorPayNetworkError.fromError(originalError);

        expect(networkError.message).toBe('Network Error: Connection reset');
        expect(networkError.cause).toBe(originalError);
      });

      it('should handle ETIMEDOUT error code', () => {
        const originalError = { code: 'ETIMEDOUT', message: 'Connection timed out' };
        const networkError = QorPayNetworkError.fromError(originalError);

        expect(networkError.message).toBe('Network Error: Connection timed out');
        expect(networkError.cause).toBe(originalError);
      });

      it('should handle error without message', () => {
        const originalError = { code: 'UNKNOWN_ERROR' };
        const networkError = QorPayNetworkError.fromError(originalError);

        expect(networkError.message).toBe('Network Error: Network error occurred');
        expect(networkError.cause).toBe(originalError);
      });

      it('should handle error with custom message and unknown code', () => {
        const originalError = { code: 'CUSTOM_ERROR', message: 'Custom error message' };
        const networkError = QorPayNetworkError.fromError(originalError);

        expect(networkError.message).toBe('Network Error: Custom error message');
        expect(networkError.cause).toBe(originalError);
      });

      it('should handle null or undefined error', () => {
        const networkError1 = QorPayNetworkError.fromError(null);
        const networkError2 = QorPayNetworkError.fromError(undefined);

        expect(networkError1.message).toBe('Network Error: Network error occurred');
        expect(networkError2.message).toBe('Network Error: Network error occurred');
      });

      it('should handle error object without code property', () => {
        const originalError = { message: 'Some network issue' };
        const networkError = QorPayNetworkError.fromError(originalError);

        expect(networkError.message).toBe('Network Error: Some network issue');
        expect(networkError.cause).toBe(originalError);
      });
    });
  });

  describe('QorPayUnknownError', () => {
    it('should extend QorPayError', () => {
      const error = new QorPayUnknownError('Unknown error');
      expect(error).toBeInstanceOf(QorPayError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set the correct error name', () => {
      const error = new QorPayUnknownError('Unknown error');
      expect(error.name).toBe('QorPayUnknownError');
    });

    it('should format the error message correctly', () => {
      const message = 'Something unexpected happened';
      const error = new QorPayUnknownError(message);
      expect(error.message).toBe(`Unknown Error: ${message}`);
    });

    it('should store the original error correctly', () => {
      const originalError = new Error('Original error');
      const error = new QorPayUnknownError('Wrapper error', originalError);
      expect(error.originalError).toBe(originalError);
    });

    it('should handle null or undefined original error', () => {
      const error1 = new QorPayUnknownError('Error with null', null);
      const error2 = new QorPayUnknownError('Error with undefined', undefined);

      expect(error1.originalError).toBeNull();
      expect(error2.originalError).toBeUndefined();
    });

    describe('fromError factory method', () => {
      it('should create an unknown error from an error with message', () => {
        const originalError = new Error('Something went wrong');
        const unknownError = QorPayUnknownError.fromError(originalError);

        expect(unknownError).toBeInstanceOf(QorPayUnknownError);
        expect(unknownError.message).toBe('Unknown Error: Something went wrong');
        expect(unknownError.originalError).toBe(originalError);
      });

      it('should handle error without message', () => {
        const originalError = { code: 'UNKNOWN' };
        const unknownError = QorPayUnknownError.fromError(originalError);

        expect(unknownError.message).toBe('Unknown Error: An unexpected error occurred');
        expect(unknownError.originalError).toBe(originalError);
      });

      it('should handle null or undefined error', () => {
        const unknownError1 = QorPayUnknownError.fromError(null);
        const unknownError2 = QorPayUnknownError.fromError(undefined);

        expect(unknownError1.message).toBe('Unknown Error: An unexpected error occurred');
        expect(unknownError1.originalError).toBeNull();

        expect(unknownError2.message).toBe('Unknown Error: An unexpected error occurred');
        expect(unknownError2.originalError).toBeUndefined();
      });

      it('should handle string error', () => {
        const originalError = 'String error message';
        const unknownError = QorPayUnknownError.fromError(originalError);

        expect(unknownError.message).toBe('Unknown Error: An unexpected error occurred');
        expect(unknownError.originalError).toBe(originalError);
      });

      it('should handle object with custom message property', () => {
        const originalError = { message: 'Custom error message', details: 'extra info' };
        const unknownError = QorPayUnknownError.fromError(originalError);

        expect(unknownError.message).toBe('Unknown Error: Custom error message');
        expect(unknownError.originalError).toBe(originalError);
      });
    });
  });

  describe('Error stack traces', () => {
    it('should preserve stack traces for QorPayError', () => {
      const error = new QorPayError('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('QorPayError: Test error');
    });

    it('should preserve stack traces for QorPayApiError', () => {
      const error = new QorPayApiError('API error', 400);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('QorPayApiError: API Error: API error (Status: 400)');
    });

    it('should preserve stack traces for QorPayNetworkError', () => {
      const error = new QorPayNetworkError('Network error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('QorPayNetworkError: Network Error: Network error');
    });

    it('should preserve stack traces for QorPayUnknownError', () => {
      const error = new QorPayUnknownError('Unknown error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('QorPayUnknownError: Unknown Error: Unknown error');
    });
  });

  describe('instanceof behavior', () => {
    it('should allow catching specific error types', () => {
      const apiError = new QorPayApiError('API error');
      const networkError = new QorPayNetworkError('Network error');
      const unknownError = new QorPayUnknownError('Unknown error');

      expect(apiError instanceof QorPayApiError).toBe(true);
      expect(apiError instanceof QorPayError).toBe(true);
      expect(apiError instanceof Error).toBe(true);
      
      expect(networkError instanceof QorPayNetworkError).toBe(true);
      expect(networkError instanceof QorPayError).toBe(true);
      expect(networkError instanceof Error).toBe(true);
      
      expect(unknownError instanceof QorPayUnknownError).toBe(true);
      expect(unknownError instanceof QorPayError).toBe(true);
      expect(unknownError instanceof Error).toBe(true);
    });

    it('should maintain proper type separation', () => {
      const apiError = new QorPayApiError('API error');
      const networkError = new QorPayNetworkError('Network error');
      const unknownError = new QorPayUnknownError('Unknown error');

      expect(apiError instanceof QorPayNetworkError).toBe(false);
      expect(apiError instanceof QorPayUnknownError).toBe(false);
      
      expect(networkError instanceof QorPayApiError).toBe(false);
      expect(networkError instanceof QorPayUnknownError).toBe(false);
      
      expect(unknownError instanceof QorPayApiError).toBe(false);
      expect(unknownError instanceof QorPayNetworkError).toBe(false);
    });
  });
});
