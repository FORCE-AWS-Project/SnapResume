/**
 * Utility functions for creating API Gateway responses
 */

/**
 * Create a successful API Gateway response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} API Gateway response
 */
function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
}

/**
 * Create an error API Gateway response
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error type
 * @param {string} message - Error message
 * @param {Array} details - Optional error details
 * @returns {Object} API Gateway response
 */
function createErrorResponse(statusCode, error, message, details = null) {
  const body = {
    error,
    message,
  };

  if (details) {
    body.details = details;
  }

  return createResponse(statusCode, body);
}

module.exports = {
  createResponse,
  createErrorResponse,
};
