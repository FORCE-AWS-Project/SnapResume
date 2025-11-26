/**
 * User Handler
 * Handles user profile operations
 */

const { TABLES, getItem, putItem, updateItem } = require('../utils/dynamodb');
const { createResponse, createErrorResponse } = require('../utils/response');

/**
 * Handle user-related requests
 * @param {Object} event - Lambda event
 * @returns {Promise<Object>} API Gateway response
 */
async function handle(event) {
  const { httpMethod, path, userId } = event;
  const pathSegments = path.replace('/api/', '').split('/').filter(Boolean);

  try {
    // GET /users/me - Get user profile
    if (httpMethod === 'GET' && pathSegments[1] === 'me') {
      return await getUserProfile(userId);
    }

    // PUT /users/me - Update user profile
    if (httpMethod === 'PUT' && pathSegments[1] === 'me') {
      const body = JSON.parse(event.body || '{}');
      return await updateUserProfile(userId, body);
    }

    return createErrorResponse(404, 'Not Found', 'Endpoint not found');
  } catch (error) {
    console.error('Error in userHandler:', error);
    return createErrorResponse(500, 'Internal Server Error', error.message);
  }
}

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} API Gateway response
 */
async function getUserProfile(userId) {
  try {
    const user = await getItem(TABLES.MAIN, {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    });

    if (!user) {
      return createErrorResponse(404, 'Not Found', 'User profile not found');
    }

    // Remove internal fields
    const { PK, SK, ...userData } = user;

    return createResponse(200, userData);
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} body - Request body
 * @returns {Promise<Object>} API Gateway response
 */
async function updateUserProfile(userId, body) {
  try {
    const { personalInfo } = body;

    if (!personalInfo) {
      return createErrorResponse(400, 'Bad Request', 'personalInfo is required');
    }

    // Check if user exists
    const existingUser = await getItem(TABLES.MAIN, {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    });

    const now = new Date().toISOString();

    if (!existingUser) {
      // Create new user profile
      const newUser = {
        PK: `USER#${userId}`,
        SK: 'PROFILE',
        userId,
        email: personalInfo.email,
        personalInfo,
        createdAt: now,
        updatedAt: now,
      };

      await putItem(TABLES.MAIN, newUser);

      return createResponse(200, {
        message: 'Profile created successfully',
        userId,
        updatedAt: now,
      });
    } else {
      // Update existing user profile
      const updated = await updateItem(
        TABLES.MAIN,
        {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
        {
          personalInfo,
          email: personalInfo.email,
        }
      );

      return createResponse(200, {
        message: 'Profile updated successfully',
        userId,
        updatedAt: updated.updatedAt,
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

module.exports = {
  handle,
};
