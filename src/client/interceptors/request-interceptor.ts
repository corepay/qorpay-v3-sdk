/**
 * @file src/client/interceptors/request-interceptor.ts
 * @description Request interceptor for QorPay API requests
 */

import type { InternalAxiosRequestConfig } from 'axios';
import {
  performanceTracker,
  type PerformanceHeaders,
} from '../../utils/performance';

/**
 * Request interceptor class for handling outgoing requests
 */
export class RequestInterceptor {
  /**
   * Handles outgoing requests by adding performance tracking headers
   * and merging custom headers with default headers
   *
   * @param config - Axios request configuration
   * @param performanceHeaders - Performance tracking headers to add
   * @returns Updated request configuration with merged headers
   */
  static onRequest(
    config: InternalAxiosRequestConfig,
    performanceHeaders?: PerformanceHeaders
  ): InternalAxiosRequestConfig {
    // Start performance tracking if not already started
    let perfHeaders = performanceHeaders;
    if (!perfHeaders && config.method && config.url) {
      const { headers: newPerfHeaders } = performanceTracker.startRequest(
        config.method.toUpperCase(),
        config.url
      );
      perfHeaders = newPerfHeaders;
    }

    // Merge performance headers with existing headers
    if (perfHeaders) {
      config.headers = config.headers || {};
      Object.assign(config.headers, perfHeaders);
    }

    return config;
  }

  /**
   * Creates a request handler function for use with Axios interceptors
   *
   * @returns Axios request interceptor function
   */
  static createHandler() {
    return (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      return this.onRequest(config);
    };
  }
}
