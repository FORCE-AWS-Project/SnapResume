/**
 * Main Lambda Handler
 * Routes incoming API Gateway requests to appropriate handlers
 */

const userHandler = require('./handlers/userHandler');
const resumeHandler = require('./handlers/resumeHandler');
const sectionHandler = require('./handlers/sectionHandler');
const templateHandler = require('./handlers/templateHandler');
const recommendationHandler = require('./handlers/recommendationHandler');
const { createResponse, createErrorResponse } = require('./utils/response');

/**
 * Main Lambda handler function
 * @param {Object} event - API Gateway Lambda Proxy Integration event
 * @param {Object} context - Lambda context
 * @returns {Object} API Gateway Lambda Proxy Integration response
 */
exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Extract request details
    const httpMethod = event.httpMethod;
    const path = event.path.replace('/api/', ''); // Remove /api/ prefix
    const pathSegments = path.split('/').filter(Boolean);

    // Get user ID from Cognito authorizer context
    const userId = event.requestContext?.authorizer?.claims?.sub;

    if (!userId && !path.startsWith('templates')) {
      // Templates endpoint doesn't require auth, others do
      return createErrorResponse(401, 'Unauthorized', 'User not authenticated');
    }

    // Add userId to event for handlers to use
    event.userId = userId;

    // Route to appropriate handler
    const resource = pathSegments[0];

    switch (resource) {
      case 'users':
        return await userHandler.handle(event);

      case 'resumes':
        return await resumeHandler.handle(event);

      case 'sections':
        return await sectionHandler.handle(event);

      case 'templates':
        return await templateHandler.handle(event);

      case 'recommendations':
        return await recommendationHandler.handle(event);

      default:
        return createErrorResponse(404, 'Not Found', `Resource '${resource}' not found`);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return createErrorResponse(500, 'Internal Server Error', error.message);
  }
};
