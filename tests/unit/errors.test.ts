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
