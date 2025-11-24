/**
 * @file src/client/base-client.ts
 * @description Base HTTP client for making API requests to QorPay.
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import type {
  QorPayClientConfig,
  Environment,
  QueryParams,
  BaseQorPayResponse,
} from '../types/common';
import { QORPAY_BASE_URLS } from '../types/common';
import {
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError,
  QorPayError,
} from '../errors';

/**
 * Base HTTP client for making API requests to QorPay.
 * Handles authentication, request formatting, and response parsing.
 */
export class BaseClient {
  private appKey: string;
  private clientKey: string;
  private baseURL: string;
  private environment: Environment;
  private timeout: number;
  private axios: AxiosInstance;

  /**
   * Creates a new BaseClient instance.
   *
   * @param config - Configuration options for the client
   */
  constructor(config: QorPayClientConfig) {
    this.appKey = config.appKey;
    this.clientKey = config.clientKey;
    this.environment = config.environment || 'sandbox';
    this.baseURL = config.baseURL || QORPAY_BASE_URLS[this.environment];
    this.timeout = config.timeout || 30000; // Default 30 second timeout

    // ... existing imports

    // Create axios instance with default configuration
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Qor-App-Key': this.appKey,
        'Qor-Client-Key': this.clientKey,
        ...(config.headers || {}), // Merge custom headers
      },
    });

    // Configure retries
    axiosRetry(this.axios, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay.bind(axiosRetry),
      retryCondition: (error: AxiosError) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429 // Retry on rate limit
        );
      },
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => {
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
      },
      (error: AxiosError) => {
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
    );
  }

  /**
   * Gets the base URL being used by the client.
   *
   * @returns The base URL for API requests
   */
  public getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Gets the environment (sandbox/production) being used by the client.
   *
   * @returns The current environment
   */
  public getEnvironment(): string {
    return this.environment;
  }

  /**
   * Makes a GET request to the API.
   *
   * @param path - The API endpoint path
   * @param params - Query parameters for the request
   * @param config - Additional axios request configuration
   * @returns Promise resolving to the API response
   */
  public async get<T extends BaseQorPayResponse>(
    path: string,
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axios.request<T>({
      method: 'GET',
      url: this.normalizePath(path),
      params,
      ...config,
    });
    return this.handleResponseData(response.data);
  }

  /**
   * Makes a POST request to the API.
   *
   * @param path - The API endpoint path
   * @param data - Request body data
   * @param config - Additional axios request configuration
   * @returns Promise resolving to the API response
   */
  public async post<T extends BaseQorPayResponse, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axios.request<T>({
      method: 'POST',
      url: this.normalizePath(path),
      data,
      ...config,
    });
    return this.handleResponseData(response.data);
  }

  /**
   * Makes a PUT request to the API.
   *
   * @param path - The API endpoint path
   * @param data - Request body data
   * @param config - Additional axios request configuration
   * @returns Promise resolving to the API response
   */
  public async put<T extends BaseQorPayResponse, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axios.request<T>({
      method: 'PUT',
      url: this.normalizePath(path),
      data,
      ...config,
    });
    return this.handleResponseData(response.data);
  }

  /**
   * Makes a PATCH request to the API.
   *
   * @param path - The API endpoint path
   * @param data - Request body data
   * @param config - Additional axios request configuration
   * @returns Promise resolving to the API response
   */
  public async patch<T extends BaseQorPayResponse, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axios.request<T>({
      method: 'PATCH',
      url: this.normalizePath(path),
      data,
      ...config,
    });
    return this.handleResponseData(response.data);
  }

  /**
   * Makes a DELETE request to the API.
   *
   * @param path - The API endpoint path
   * @param params - Query parameters for the request
   * @param config - Additional axios request configuration
   * @returns Promise resolving to the API response
   */
  public async delete<T extends BaseQorPayResponse>(
    path: string,
    params?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axios.request<T>({
      method: 'DELETE',
      url: this.normalizePath(path),
      params,
      ...config,
    });
    return this.handleResponseData(response.data);
  }

  /**
   * Handles response data, converting empty responses to null
   * @param data Response data from axios
   * @returns Processed response data
   */
  private handleResponseData<T>(data: T): T {
    // Handle empty responses (null, undefined, empty string)
    if (data === null || data === undefined || data === '') {
      return null as T;
    }
    return data;
  }

  /**
   * Ensures path has a leading slash for consistent URL construction
   * @param path Path to normalize
   * @returns Normalized path with leading slash
   */
  private normalizePath(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
  }
}
