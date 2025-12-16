/**
 * Test Assertions
 * Enhanced assertion utilities for testing
*/

class TestAssertions {
  /**
   * Run assertion with error handling
   */
  static async runAssertion(assertionFn) {
    try {
      await assertionFn();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Assert status code
   */
  static assertStatus(actual, expected, context = '') {
    if (actual !== expected) {
      throw new Error(`${context} - Expected status ${expected}, got ${actual}`);
    }
  }

  /**
   * Assert response is successful
   */
  static assertSuccess(response, context = '') {
    if (!response.success || (response.data && response.data.success === false)) {
      throw new Error(`${context} - Expected successful response, got: ${JSON.stringify(response.data)}`);
    }
  }

  /**
   * Assert response is error
   */
  static assertError(response, context = '') {
    if (response.success && response.data && response.data.success !== false) {
      throw new Error(`${context} - Expected error response, got successful response`);
    }
  }

  /**
   * Assert type of value
   * @param {any} value - The value to check
   * @param {string} expectedType - The expected type (e.g., 'string', 'number', 'object', etc.)
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertType(value, expectedType, context = '') {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(`${context} - Expected type ${expectedType}, got ${actualType}`);
    }
  }

  /**
   * Assert object has required fields
   * @param {Object} obj - The object to check
   * @param {Array<string>} fields - The required fields
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertHasFields(obj, fields, context = '') {
    if (!obj || typeof obj !== 'object') {
      throw new Error(`${context} - Expected object, got ${typeof obj}`);
    }

    for (const field of fields) {
      if (!(field in obj)) {
        throw new Error(`${context} - Missing required field: ${field}`);
      }
    }
  }

  /**
   * Assert object has a specific field
   * @param {Object} obj - The object to check
   * @param {string} field - The required field
   * @param {string} context - Context for the assertion, useful for debugging
  */
  static assertHasField(obj, field, context = '') {
    if (!obj || typeof obj !== 'object') {
      throw new Error(`${context} - Expected object, got ${typeof obj}`);
    }

    if (!(field in obj)) {
      throw new Error(`${context} - Missing required field: ${field}`);
    }
  }

  /**
   * Assert field is not empty
   * @param {any} value - The value to check
   * @param {string} fieldName - The name of the field
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertNotEmpty(value, fieldName, context = '') {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${context} - Field ${fieldName} should not be empty`);
    }
  }

  /**
   * Assert JWT token format
   * @param {string} token - The JWT token to check
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertJWTFormat(token, context = '') {
    if (!token || typeof token !== 'string') {
      throw new Error(`${context} - JWT token should be a string`);
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error(`${context} - JWT token should have 3 parts separated by dots`);
    }

    // Check if parts are base64 encoded (basic check)
    for (let i = 0; i < 2; i++) {
      try {
        atob(parts[i]);
      } catch (error) {
        throw new Error(`${context} - JWT token part ${i + 1} is not valid base64`);
      }
    }
  }

  /**
   * Assert email format
   * @param {string} email - The email to check
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertEmailFormat(email, context = '') {
    if (!email || typeof email !== 'string') {
      throw new Error(`${context} - Email should be a string`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`${context} - Invalid email format: ${email}`);
    }
  }

  /**
   * Assert two values are equal
   * @param {any} actual - The actual value
   * @param {any} expected - The expected value
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertEqual(actual, expected, context = '') {
    if (actual !== expected) {
      throw new Error(`${context} - Expected ${expected}, got ${actual}`);
    }
  }

  /**
   * Assert two values are not equal
   * @param {any} actual - The actual value
   * @param {any} expected - The expected value
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertNotEqual(actual, expected, context = '') {
    if (actual === expected) {
      throw new Error(`${context} - Expected not equal to ${expected}, but got ${actual}`);
    }
  }

  /**
   * Assert condition is true
   * @param {boolean} condition - The condition to check
   * @param {string} message - Optional message for the assertion failure
   */
  static assertTrue(condition, message = '') {
    if (!condition) {
      throw new Error(message || 'Expected condition to be true');
    }
  }

  /**
   * Assert condition is false
   * @param {boolean} condition - The condition to check
   * @param {string} message - Optional message for the assertion failure
   */
  static assertFalse(condition, message = '') {
    if (condition) {
      throw new Error(message || 'Expected condition to be false');
    }
  }

  /**
   * Assert array contains item
   * @param {Array} array - The array to check
   * @param {any} item - The item to check for
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertContains(array, item, context = '') {
    if (!Array.isArray(array)) {
      throw new Error(`${context} - Expected array, got ${typeof array}`);
    }

    if (!array.includes(item)) {
      throw new Error(`${context} - Array does not contain ${item}`);
    }
  }

  /**
   * Assert string contains substring
   * @param {string} string - The string to check
   * @param {string} substring - The substring to check for
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertStringContains(string, substring, context = '') {
    if (typeof string !== 'string') {
      throw new Error(`${context} - Expected string, got ${typeof string}`);
    }

    if (!string.includes(substring)) {
      throw new Error(`${context} - String "${string}" does not contain "${substring}"`);
    }
  }

  /**
   * Assert string does not contain substring
   * @param {string} string - The string to check
   * @param {string} substring - The substring to check for
   * @param {string} context - Context for the assertion, useful for debugging
   */
  static assertStringNotContains(string, substring, context = '') {
    if (typeof string !== 'string') {
      throw new Error(`${context} - Expected string, got ${typeof string}`);
    }

    if (string.includes(substring)) {
      throw new Error(`${context} - String "${string}" should not contain "${substring}"`);
    }
  }

  /**
   * Assert array does not contain item
   */
  static assertNotContains(array, item, context = '') {
    if (!Array.isArray(array)) {
      throw new Error(`${context} - Expected array, got ${typeof array}`);
    }

    if (array.includes(item)) {
      throw new Error(`${context} - Array should not contain ${item}`);
    }
  }

  /**
   * Assert array length
   */
  static assertArrayLength(array, expectedLength, context = '') {
    if (!Array.isArray(array)) {
      throw new Error(`${context} - Expected array, got ${typeof array}`);
    }

    if (array.length !== expectedLength) {
      throw new Error(`${context} - Expected array length ${expectedLength}, got ${array.length}`);
    }
  }

  /**
   * Assert array is not empty
   */
  static assertArrayNotEmpty(array, context = '') {
    if (!Array.isArray(array)) {
      throw new Error(`${context} - Expected array, got ${typeof array}`);
    }

    if (array.length === 0) {
      throw new Error(`${context} - Array should not be empty`);
    }
  }

  /**
   * Assert string matches regex
   */
  static assertStringMatches(string, regex, context = '') {
    if (typeof string !== 'string') {
      throw new Error(`${context} - Expected string, got ${typeof string}`);
    }

    if (!regex.test(string)) {
      throw new Error(`${context} - String "${string}" does not match pattern ${regex}`);
    }
  }

  /**
   * Assert number is in range
   */
  static assertNumberInRange(number, min, max, context = '') {
    if (typeof number !== 'number') {
      throw new Error(`${context} - Expected number, got ${typeof number}`);
    }

    if (number < min || number > max) {
      throw new Error(`${context} - Number ${number} is not in range [${min}, ${max}]`);
    }
  }

  /**
   * Assert response time is acceptable
   */
  static assertResponseTime(responseTime, maxTime, context = '') {
    if (typeof responseTime !== 'number') {
      throw new Error(`${context} - Expected response time to be number, got ${typeof responseTime}`);
    }

    if (responseTime > maxTime) {
      throw new Error(`${context} - Response time ${responseTime}ms exceeds maximum ${maxTime}ms`);
    }
  }

  /**
   * Assert object structure matches schema
   */
  static assertObjectStructure(obj, schema, context = '') {
    if (!obj || typeof obj !== 'object') {
      throw new Error(`${context} - Expected object, got ${typeof obj}`);
    }

    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in obj)) {
        throw new Error(`${context} - Missing required property: ${key}`);
      }

      const actualType = typeof obj[key];
      if (actualType !== expectedType) {
        throw new Error(`${context} - Property ${key} expected ${expectedType}, got ${actualType}`);
      }
    }
  }

  /**
   * Assert API response format
   */
  static assertApiResponseFormat(response, context = '') {
    if (!response || typeof response !== 'object') {
      throw new Error(`${context} - Expected response object, got ${typeof response}`);
    }

    // Check if it's a success response
    if (response.success === true) {
      this.assertHasFields(response, ['success', 'data'], `${context} - Success response`);
      this.assertTrue(response.success === true, `${context} - Success flag should be true`);
    } else {
      // Check if it's an error response
      this.assertHasFields(response, ['success', 'error'], `${context} - Error response`);
      this.assertTrue(response.success === false, `${context} - Success flag should be false`);
      this.assertTrue(typeof response.error === 'string', `${context} - Error should be string`);
    }
  }

  /**
   * Assert localization data
   */
  static assertLocalizationData(data, language, context = '') {
    this.assertHasFields(data, ['language'], `${context} - Localization data`);
    this.assertEqual(data.language, language, `${context} - Language mismatch`);

    if (data.message) {
      this.assertTrue(typeof data.message === 'string', `${context} - Message should be string`);
      this.assertTrue(data.message.length > 0, `${context} - Message should not be empty`);
    }
  }

  /**
   * Assert security headers
   */
  static assertSecurityHeaders(headers, context = '') {
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    for (const header of securityHeaders) {
      if (!(header in headers)) {
        console.warn(`${context} - Missing security header: ${header}`);
      }
    }
  }

  /**
   * Assert CORS headers
   */
  static assertCorsHeaders(headers, context = '') {
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];

    for (const header of corsHeaders) {
      if (!(header in headers)) {
        console.warn(`${context} - Missing CORS header: ${header}`);
      }
    }
  }

  /**
   * Assert value exists (not null or undefined)
   */
  static exists(value, context = '') {
    if (value === null || value === undefined) {
      throw new Error(`${context} - Expected value to exist, got ${value}`);
    }
  }

  /**
   * Assert value does not exist (null or undefined)
   */
  static notExists(value, context = '') {
    if (value !== null && value !== undefined) {
      throw new Error(`${context} - Expected value to not exist, got ${value}`);
    }
  }
}

export { TestAssertions };
