/**
 * @file src/client/base-client.ts
 * @description Base HTTP client for making API requests to QorPay.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  QorPayClientConfig,
  Environment,
  QORPAY_BASE_URLS,
  QueryParams,
  BaseQorPayResponse,
} from '../types/common';

/**
 * Base HTTP client for making API requests to QorPay.
 * Handles authentication, request formatting, and response parsing.
 */
export class BaseClient {
  private appKey: string;
  private clientKey: string;
  private baseURL: string;
  private environment: Environment;
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

    // Create axios instance with default configuration
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000, // Default 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Qor-App-Key': this.appKey,
        'Qor-Client-Key': this.clientKey,
      },
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Transform error to a more user-friendly format
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const { status, data } = error.response;
          return Promise.reject({
            status,
            ...data,
            message:
              data.message || `Request failed with status code ${status}`,
          });
        } else if (error.request) {
          // The request was made but no response was received
          return Promise.reject({
            status: 'network_error',
            code: 'NETWORK_ERROR',
            message: 'Network error: No response received from server',
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          return Promise.reject({
            status: 'request_error',
            code: 'REQUEST_ERROR',
            message: error.message || 'Error setting up the request',
          });
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
   * @returns Promise resolving to the API response
   */
  public async get<T extends BaseQorPayResponse>(
    path: string,
    params?: QueryParams
  ): Promise<T> {
    const response = await this.axios.get<T>(path, { params });
    return response.data;
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
    const response = await this.axios.post<T>(path, data, config);
    return response.data;
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
    const response = await this.axios.put<T>(path, data, config);
    return response.data;
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
    const response = await this.axios.patch<T>(path, data, config);
    return response.data;
  }

  /**
   * Makes a DELETE request to the API.
   *
   * @param path - The API endpoint path
   * @param params - Query parameters for the request
   * @returns Promise resolving to the API response
   */
  public async delete<T extends BaseQorPayResponse>(
    path: string,
    params?: QueryParams
  ): Promise<T> {
    const response = await this.axios.delete<T>(path, { params });
    return response.data;
  }
}
