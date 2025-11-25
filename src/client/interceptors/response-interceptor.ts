/**
 * @file src/client/interceptors/response-interceptor.ts
 * @description Response interceptor for QorPay API responses
 */

import type { AxiosResponse, AxiosError } from 'axios';
import {
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError,
  QorPayError,
} from '../../errors';

/**
 * Response interceptor class for handling incoming responses and errors
 */
export class ResponseInterceptor {
  /**
   * Handles successful responses by checking for error status in response body
   *
   * @param response - Axios response object
   * @returns Promise resolving to the response or rejecting with QorPayApiError
   */
  static onSuccess<T = unknown>(response: AxiosResponse<T>): AxiosResponse<T> | Promise<never> {
    // Check if response has status: 'error' in the body
    if (
      response.data &&
      typeof response.data === 'object' &&
      'status' in response.data &&
      (response.data as Record<string, unknown>).status === 'error'
    ) {
      const data = response.data as Record<string, unknown>;
      const apiError = new QorPayApiError(
        (typeof data.message === 'string' ? data.message : undefined) ||
          'API returned an error status',
        response.status,
        typeof data.code === 'string' || typeof data.code === 'number'
          ? data.code
          : undefined,
        data
      );
      return Promise.reject(apiError);
    }
    return response;
  }

  /**
   * Handles error responses by transforming them to appropriate QorPay error types
   *
   * @param error - Axios error object
   * @returns Promise rejecting with transformed error
   */
  static onError(error: AxiosError): Promise<never> {
    // Transform error to a more user-friendly format
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      const errorData =
        data && typeof data === 'object'
          ? (data as Record<string, unknown>)
          : {};
      const apiError = new QorPayApiError(
        (typeof errorData.message === 'string'
          ? errorData.message
          : undefined) || `Request failed with status code ${status}`,
        status,
        typeof errorData.code === 'string' ||
        typeof errorData.code === 'number'
          ? errorData.code
          : undefined,
        errorData
      );
      return Promise.reject(apiError);
    } else if (error.request) {
      // The request was made but no response was received
      const networkError = QorPayNetworkError.fromError(error);
      return Promise.reject(networkError);
    } else {
      // Check if it's already a QorPayError
      if (error instanceof QorPayError) {
        return Promise.reject(error);
      }
      // Something happened in setting up the request that triggered an Error
      const unknownError = QorPayUnknownError.fromError(error);
      return Promise.reject(unknownError);
    }
  }

  /**
   * Creates a success response handler function for use with Axios interceptors
   *
   * @returns Axios success response interceptor function
   */
  static createSuccessHandler() {
    return <T = unknown>(response: AxiosResponse<T>): AxiosResponse<T> | Promise<never> => {
      return this.onSuccess(response);
    };
  }

  /**
   * Creates an error response handler function for use with Axios interceptors
   *
   * @returns Axios error response interceptor function
   */
  static createErrorHandler() {
    return (error: AxiosError): Promise<never> => {
      return this.onError(error);
    };
  }
}