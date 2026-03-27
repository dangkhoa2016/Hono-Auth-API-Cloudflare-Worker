/**
 * HTTP Test Client
 * Utilities for making HTTP requests in tests
*/

import { TEST_CONFIG } from '../config/testConfig.js';

class TestClient {
  constructor(baseUrl = null) {
    this.baseUrl = baseUrl || TEST_CONFIG.baseUrl;
    this.defaultHeaders = {};
    this.defaultOptions = {
      timeoutMs: 20000,
      retries: 2,
      retryDelayMs: 150,
      retryOnHttp5xx: true
    };
    this.setHeader('Content-Type', 'application/json');
    this.setRandomIpHeaders();
  }

  /**
   * Make HTTP request to API endpoint
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} data - Request body data
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response object with status and data
   */
  async request(method, path, data = null, headers = {}, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const { timeoutMs, retries, retryDelayMs, retryOnHttp5xx } = mergedOptions;
    const url = `${this.baseUrl}${path}`;

    const attemptRequest = async (attempt = 0) => {
      const controller = new AbortController();
      let timeoutId;

      try {
        timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const fetchOptions = {
          method,
          headers: {
            ...this.defaultHeaders,
            ...headers
          },
          signal: controller.signal
        };

        if (data) {
          fetchOptions.body = JSON.stringify(data);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type');
        let responseData;

        if (response.status !== 204 && contentType?.includes('application/json')) {
          try {
            responseData = await response.json();
          } catch (jsonError) {
            console.log(`JSON parse error for ${url}:`, jsonError);
            responseData = {};
          }
        } else if (response.status !== 204) {
          responseData = await response.text();
        } else {
          responseData = {};
        }

        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        // Retry on transient 5xx if enabled
        if (response.status >= 500 && retryOnHttp5xx && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          return attemptRequest(attempt + 1);
        }

        return {
          status: response.status,
          data: responseData,
          headers: responseHeaders,
          success: response.ok
        };
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const isRetryable = error.name === 'AbortError' || error.code === 'ECONNRESET';
        if (attempt < retries && isRetryable) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          return attemptRequest(attempt + 1);
        }

        console.error(`Request failed: ${method.toUpperCase()} ${path}`, error);

        return {
          status: error.name === 'AbortError' ? 504 : 500,
          data: { error: error.message },
          success: false
        };
      }
    };

    return attemptRequest();
  }

  /**
   * GET request
   */
  async get(path, headers = {}, options = {}) {
    return this.request('GET', path, null, headers, options);
  }

  /**
   * POST request
   */
  async post(path, data, headers = {}, options = {}) {
    return this.request('POST', path, data, headers, options);
  }

  /**
   * PUT request
   */
  async put(path, data, headers = {}, options = {}) {
    return this.request('PUT', path, data, headers, options);
  }

  /**
   * DELETE request
   */
  async delete(path, headers = {}, options = {}) {
    return this.request('DELETE', path, null, headers, options);
  }

  /**
   * Make OPTIONS request
   */
  options(path, headers = {}, options = {}) {
    return this.request('OPTIONS', path, null, headers, options);
  }

  /**
   * Set authorization header
   */
  setAuthToken(token) {
    if (!token) {
      delete this.defaultHeaders.Authorization;
      return;
    }
    this.setHeader('Authorization', `Bearer ${token}`);
  }

  /**
   * Set language header
   */
  setLanguage(language) {
    this.setHeader('Accept-Language', language);
  }

  /**
   * Set custom header
   */
  setHeader(key, value) {
    this.defaultHeaders[key] = value;
  }

  setRandomIpHeaders() {
    const randomIp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    this.setHeader('x-forwarded-for', randomIp);
    this.setHeader('cf-connecting-ip', randomIp);
  }

  /**
   * Clear authorization header
   */
  clearAuthToken() {
    delete this.defaultHeaders.Authorization;
  }
}

export { TestClient };
