/**
 * HTTP Test Client
 * Utilities for making HTTP requests in tests
*/

import { TEST_CONFIG } from '../config/testConfig.js';

class TestClient {
  constructor(baseUrl = null) {
    this.baseUrl = baseUrl || TEST_CONFIG.baseUrl;
    this.defaultHeaders = {};
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
  async request(method, path, data = null, headers = {}) {
    try {
      const options = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers
        }
      };

      // console.log(`Making ${method.toUpperCase()} request to ${this.baseUrl}${path}`, options.headers);
      if (data) {
        options.body = JSON.stringify(data);
      }

      const url = `${this.baseUrl}${path}`;

      const response = await fetch(url, options);
      let responseData;

      const contentType = response.headers.get('content-type');

      // Only try to parse JSON if there's content and the response is successful
      if (response.status !== 204 && contentType?.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.log(`JSON parse error for ${url}:`, jsonError);
          responseData = {};
        }
      } else {
        responseData = {};
      }

      // Convert Headers object to a plain object for easier access in tests
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        data: responseData,
        headers: responseHeaders,
        success: response.ok
      };
    } catch (error) {
      console.error(`Request failed: ${method.toUpperCase()} ${path}`, error);

      return {
        status: 500,
        data: { error: error.message },
        success: false
      };
    }
  }

  /**
   * GET request
   */
  async get(path, headers = {}) {
    return this.request('GET', path, null, headers);
  }

  /**
   * POST request
   */
  async post(path, data, headers = {}) {
    return this.request('POST', path, data, headers);
  }

  /**
   * PUT request
   */
  async put(path, data, headers = {}) {
    return this.request('PUT', path, data, headers);
  }

  /**
   * DELETE request
   */
  async delete(path, headers = {}) {
    return this.request('DELETE', path, null, headers);
  }

  /**
   * Make OPTIONS request
   */
  options(path, headers = {}) {
    return this.request('OPTIONS', path, null, headers);
  }

  /**
   * Set authorization header
   */
  setAuthToken(token) {
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
