/**
 * Section Handler
 * Handles CV section CRUD operations
 */

const { v4: uuidv4 } = require('uuid');
const { TABLES, getItem, putItem, updateItem, deleteItem, queryItems } = require('../utils/dynamodb');
const { createResponse, createErrorResponse } = require('../utils/response');

/**
 * Handle section-related requests
 * @param {Object} event - Lambda event
 * @returns {Promise<Object>} API Gateway response
 */
async function handle(event) {
  const { httpMethod, path, userId, queryStringParameters } = event;
  const pathSegments = path.replace('/api/', '').split('/').filter(Boolean);

  try {
    // GET /sections - List all sections
    if (httpMethod === 'GET' && pathSegments.length === 1) {
      return await listSections(userId, queryStringParameters);
    }

    // GET /sections/{sectionId} - Get section by ID
    if (httpMethod === 'GET' && pathSegments.length === 2) {
      const sectionId = pathSegments[1];
      return await getSection(userId, sectionId, queryStringParameters);
    }

    // POST /sections - Create section
    if (httpMethod === 'POST' && pathSegments.length === 1) {
      const body = JSON.parse(event.body || '{}');
      return await createSection(userId, body);
    }

    // PUT /sections/{sectionId} - Update section
    if (httpMethod === 'PUT' && pathSegments.length === 2) {
      const sectionId = pathSegments[1];
      const body = JSON.parse(event.body || '{}');
      return await updateSection(userId, sectionId, body);
    }

    // DELETE /sections/{sectionId} - Delete section
    if (httpMethod === 'DELETE' && pathSegments.length === 2) {
      const sectionId = pathSegments[1];
      return await deleteSection(userId, sectionId);
    }

    return createErrorResponse(404, 'Not Found', 'Endpoint not found');
  } catch (error) {
    console.error('Error in sectionHandler:', error);
    return createErrorResponse(500, 'Internal Server Error', error.message);
  }
}

/**
 * List all sections for a user
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} API Gateway response
 */
async function listSections(userId, queryParams = {}) {
  try {
    const limit = Math.min(parseInt(queryParams.limit) || 50, 100);
    const sectionType = queryParams.type;
    const tags = queryParams.tags;

    let items;

    if (sectionType) {
      // Use GSI2 to query by section type
      const params = {
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `SECTION#${userId}#${sectionType}`,
        },
        Limit: limit,
      };

      items = await queryItems(TABLES.MAIN, params);
    } else if (tags) {
      // Use GSI1 to query by tags
      const tagList = tags.split(',').sort().join('#');
      const params = {
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :tags)',
        ExpressionAttributeValues: {
          ':pk': `SECTION#${userId}`,
          ':tags': `TAGS#${tagList}`,
        },
        Limit: limit,
      };

      items = await queryItems(TABLES.MAIN, params);
    } else {
      // Query all sections for user
      const params = {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'SECTION#',
        },
        Limit: limit,
      };

      items = await queryItems(TABLES.MAIN, params);
    }

    // Remove internal fields
    const sections = items.map(item => {
      const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...section } = item;
      return section;
    });

    return createResponse(200, {
      sections,
      count: sections.length,
    });
  } catch (error) {
    console.error('Error listing sections:', error);
    throw error;
  }
}

/**
 * Get section by ID
 * @param {string} userId - User ID
 * @param {string} sectionId - Section ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} API Gateway response
 */
async function getSection(userId, sectionId, queryParams = {}) {
  try {
    // If sectionType is provided, use it directly
    // Otherwise, we need to query to find it
    let section;

    if (queryParams.type) {
      section = await getItem(TABLES.MAIN, {
        PK: `USER#${userId}`,
        SK: `SECTION#${queryParams.type}#${sectionId}`,
      });
    } else {
      // Query all sections and find matching sectionId
      const params = {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'SECTION#',
        },
      };

      const sections = await queryItems(TABLES.MAIN, params);
      section = sections.find(s => s.sectionId === sectionId);
    }

    if (!section) {
      return createErrorResponse(404, 'Not Found', `Section with id '${sectionId}' not found`);
    }

    // Remove internal fields
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...sectionData } = section;

    return createResponse(200, sectionData);
  } catch (error) {
    console.error('Error getting section:', error);
    throw error;
  }
}

/**
 * Create a new section
 * @param {string} userId - User ID
 * @param {Object} body - Request body
 * @returns {Promise<Object>} API Gateway response
 */
async function createSection(userId, body) {
  try {
    const { sectionType, tags = [], ...sectionData } = body;

    if (!sectionType) {
      return createErrorResponse(400, 'Bad Request', 'sectionType is required');
    }

    // Validate sectionType
    const validTypes = ['experience', 'education', 'skills', 'projects', 'certifications'];
    if (!validTypes.includes(sectionType)) {
      return createErrorResponse(400, 'Bad Request', `Invalid sectionType. Must be one of: ${validTypes.join(', ')}`);
    }

    const sectionId = uuidv4().split('-')[0];
    const now = new Date().toISOString();
    const timestamp = Date.now();

    // Sort tags for consistent GSI1SK
    const sortedTags = tags.sort().join('#');

    const section = {
      PK: `USER#${userId}`,
      SK: `SECTION#${sectionType}#${sectionId}`,
      GSI1PK: `SECTION#${userId}`,
      GSI1SK: `TAGS#${sortedTags}`,
      GSI2PK: `SECTION#${userId}#${sectionType}`,
      GSI2SK: `CREATED#${timestamp}`,
      sectionId,
      sectionType,
      tags,
      ...sectionData,
      createdAt: now,
      updatedAt: now,
    };

    await putItem(TABLES.MAIN, section);

    return createResponse(201, {
      sectionId,
      message: 'Section created successfully',
      createdAt: now,
    });
  } catch (error) {
    console.error('Error creating section:', error);
    throw error;
  }
}

/**
 * Update an existing section
 * @param {string} userId - User ID
 * @param {string} sectionId - Section ID
 * @param {Object} body - Request body
 * @returns {Promise<Object>} API Gateway response
 */
async function updateSection(userId, sectionId, body) {
  try {
    // Find the section (we need sectionType for the SK)
    const params = {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SECTION#',
      },
    };

    const sections = await queryItems(TABLES.MAIN, params);
    const existing = sections.find(s => s.sectionId === sectionId);

    if (!existing) {
      return createErrorResponse(404, 'Not Found', `Section with id '${sectionId}' not found`);
    }

    // Build updates object
    const updates = {};

    // Copy allowed fields from body
    Object.keys(body).forEach(key => {
      if (key !== 'sectionId' && key !== 'sectionType') {
        updates[key] = body[key];
      }
    });

    // If tags are updated, update GSI1SK
    if (body.tags) {
      const sortedTags = body.tags.sort().join('#');
      updates.GSI1SK = `TAGS#${sortedTags}`;
    }

    const updated = await updateItem(
      TABLES.MAIN,
      {
        PK: `USER#${userId}`,
        SK: existing.SK,
      },
      updates
    );

    return createResponse(200, {
      message: 'Section updated successfully',
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
}

/**
 * Delete a section
 * @param {string} userId - User ID
 * @param {string} sectionId - Section ID
 * @returns {Promise<Object>} API Gateway response
 */
async function deleteSection(userId, sectionId) {
  try {
    // Find the section (we need sectionType for the SK)
    const params = {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SECTION#',
      },
    };

    const sections = await queryItems(TABLES.MAIN, params);
    const existing = sections.find(s => s.sectionId === sectionId);

    if (!existing) {
      return createErrorResponse(404, 'Not Found', `Section with id '${sectionId}' not found`);
    }

    await deleteItem(TABLES.MAIN, {
      PK: `USER#${userId}`,
      SK: existing.SK,
    });

    return createResponse(200, {
      message: 'Section deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    throw error;
  }
}

module.exports = {
  handle,
};
