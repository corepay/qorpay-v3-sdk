/**
 * @file src/client/base-client.ts
 * @description Base HTTP client for making API requests to QorPay.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import {
  QorPayClientConfig,
  Environment,
  QORPAY_BASE_URLS,
  QueryParams,
  BaseQorPayResponse,
} from '../types/common';
import {
  QorPayApiError,
  QorPayNetworkError,
  QorPayUnknownError
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

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => {
        // Check if response has status: 'error' in the body
        if (response.data && response.data.status === 'error') {
          const apiError = new QorPayApiError(
            response.data.message || 'API returned an error status',
            response.status,
            response.data.code,
            response.data
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
          const apiError = new QorPayApiError(
            data?.message || `Request failed with status code ${status}`,
            status,
            data?.code,
            data
          );
          return Promise.reject(apiError);
        } else if (error.request) {
          // The request was made but no response was received
          const networkError = QorPayNetworkError.fromError(error);
          return Promise.reject(networkError);
        } else {
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
      ...config
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
  public async post<T extends BaseQorPayResponse, D = any>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axios.request<T>({
      method: 'POST',
      url: this.normalizePath(path),
      data,
      ...config
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
  public async put<T extends BaseQorPayResponse, D = any>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axios.request<T>({
      method: 'PUT',
      url: this.normalizePath(path),
      data,
      ...config
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
  public async patch<T extends BaseQorPayResponse, D = any>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axios.request<T>({
      method: 'PATCH',
      url: this.normalizePath(path),
      data,
      ...config
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
      ...config
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
