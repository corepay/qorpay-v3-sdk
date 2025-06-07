/**
 * Base error class for all QorPay SDK errors
 */
export class QorPayError extends Error {
  /**
   * Creates a new QorPay error
   * @param message Error message
   * @param cause Optional cause of the error
   */
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error class for API errors returned by the QorPay API
 */
export class QorPayApiError extends QorPayError {
  /**
   * Creates a new QorPay API error
   * @param message Error message
   * @param statusCode HTTP status code
   * @param errorCode API error code
   * @param errorDetails Additional error details from the API
   * @param requestId Request ID for tracking
   */
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string | number,
    public readonly errorDetails?: Record<string, any>,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * Factory method to create an API error from an API response
   * @param response API error response
   * @returns QorPayApiError instance
   */
  static fromResponse(response: {
    status?: number;
    data?: {
      code?: string | number;
      message?: string;
      error?: string;
      errors?: Record<string, any>;
      requestId?: string;
    };
  }): QorPayApiError {
    const statusCode = response.status || 500;
    const data = response.data || {};
    const message = data.message || data.error || 'Unknown API error';
    const errorCode = data.code;
    const errorDetails = data.errors;
    const requestId = data.requestId;

    return new QorPayApiError(
      message,
      statusCode,
      errorCode,
      errorDetails,
      requestId
    );
  }

  /**
   * Returns true if the error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Returns true if the error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Returns true if the error is a rate limit error (429)
   */
  isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Returns true if the error is an authentication error (401)
   */
  isAuthenticationError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Returns true if the error is a permission error (403)
   */
  isPermissionError(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Returns true if the error is a not found error (404)
   */
  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Returns true if the error is a validation error (400 with validation errors)
   */
  isValidationError(): boolean {
    return this.statusCode === 400 && !!this.errorDetails;
  }
}

/**
 * Error class for network errors (connection issues, timeouts, etc.)
 */
export class QorPayNetworkError extends QorPayError {
  /**
   * Creates a new QorPay network error
   * @param message Error message
   * @param cause Original error that caused this network error
   */
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = this.constructor.name;
  }

  /**
   * Factory method to create a network error from an error object
   * @param error Original error
   * @returns QorPayNetworkError instance
   */
  static fromError(error: any): QorPayNetworkError {
    let message = 'Network error occurred';

    if (error.message) {
      message = `Network error: ${error.message}`;
    }

    if (error.code === 'ECONNABORTED') {
      message = 'Request timed out';
    } else if (error.code === 'ECONNREFUSED') {
      message = 'Connection refused';
    } else if (error.code === 'ECONNRESET') {
      message = 'Connection reset';
    } else if (error.code === 'ETIMEDOUT') {
      message = 'Connection timed out';
    }

    return new QorPayNetworkError(message, error);
  }
}

/**
 * Error class for unexpected errors that don't fit other categories
 */
export class QorPayUnknownError extends QorPayError {
  /**
   * Creates a new QorPay unknown error
   * @param message Error message
   * @param cause Original error that caused this unknown error
   */
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = this.constructor.name;
  }

  /**
   * Factory method to create an unknown error from an error object
   * @param error Original error
   * @returns QorPayUnknownError instance
   */
  static fromError(error: any): QorPayUnknownError {
    const message = error.message || 'An unexpected error occurred';
    return new QorPayUnknownError(message, error);
  }
}
