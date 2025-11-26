/**
 * Resume Handler
 * Handles resume/CV CRUD operations
 */

const { v4: uuidv4 } = require('uuid');
const { TABLES, getItem, putItem, updateItem, deleteItem, queryItems, batchGetItems } = require('../utils/dynamodb');
const { createResponse, createErrorResponse } = require('../utils/response');

/**
 * Handle resume-related requests
 * @param {Object} event - Lambda event
 * @returns {Promise<Object>} API Gateway response
 */
async function handle(event) {
  const { httpMethod, path, userId, queryStringParameters } = event;
  const pathSegments = path.replace('/api/', '').split('/').filter(Boolean);

  try {
    // GET /resumes - List all resumes
    if (httpMethod === 'GET' && pathSegments.length === 1) {
      return await listResumes(userId, queryStringParameters);
    }

    // GET /resumes/{resumeId} - Get resume by ID
    if (httpMethod === 'GET' && pathSegments.length === 2) {
      const resumeId = pathSegments[1];
      return await getResume(userId, resumeId);
    }

    // GET /resumes/{resumeId}/full - Get full resume with all sections populated
    if (httpMethod === 'GET' && pathSegments.length === 3 && pathSegments[2] === 'full') {
      const resumeId = pathSegments[1];
      return await getFullResume(userId, resumeId);
    }

    // POST /resumes - Create resume
    if (httpMethod === 'POST' && pathSegments.length === 1) {
      const body = JSON.parse(event.body || '{}');
      return await createResume(userId, body);
    }

    // PUT /resumes/{resumeId} - Update resume
    if (httpMethod === 'PUT' && pathSegments.length === 2) {
      const resumeId = pathSegments[1];
      const body = JSON.parse(event.body || '{}');
      return await updateResume(userId, resumeId, body);
    }

    // DELETE /resumes/{resumeId} - Delete resume
    if (httpMethod === 'DELETE' && pathSegments.length === 2) {
      const resumeId = pathSegments[1];
      return await deleteResume(userId, resumeId);
    }

    return createErrorResponse(404, 'Not Found', 'Endpoint not found');
  } catch (error) {
    console.error('Error in resumeHandler:', error);
    return createErrorResponse(500, 'Internal Server Error', error.message);
  }
}

/**
 * List all resumes for a user
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} API Gateway response
 */
async function listResumes(userId, queryParams = {}) {
  try {
    const limit = Math.min(parseInt(queryParams.limit) || 20, 100);

    const params = {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'RESUME#',
      },
      Limit: limit,
    };

    if (queryParams.lastKey) {
      params.ExclusiveStartKey = JSON.parse(Buffer.from(queryParams.lastKey, 'base64').toString());
    }

    const items = await queryItems(TABLES.RESUMES, params);

    // Remove internal fields and format response
    const resumes = items.map(item => {
      const { PK, SK, ...resume } = item;
      return resume;
    });

    const response = {
      resumes,
      count: resumes.length,
    };

    if (items.LastEvaluatedKey) {
      response.lastKey = Buffer.from(JSON.stringify(items.LastEvaluatedKey)).toString('base64');
    }

    return createResponse(200, response);
  } catch (error) {
    console.error('Error listing resumes:', error);
    throw error;
  }
}

/**
 * Get resume by ID
 * @param {string} userId - User ID
 * @param {string} resumeId - Resume ID
 * @returns {Promise<Object>} API Gateway response
 */
async function getResume(userId, resumeId) {
  try {
    const resume = await getItem(TABLES.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
    });

    if (!resume) {
      return createErrorResponse(404, 'Not Found', `Resume with id '${resumeId}' not found`);
    }

    // Remove internal fields
    const { PK, SK, GSI1PK, GSI1SK, ...resumeData } = resume;

    return createResponse(200, resumeData);
  } catch (error) {
    console.error('Error getting resume:', error);
    throw error;
  }
}

/**
 * Get full resume with all sections populated
 * @param {string} userId - User ID
 * @param {string} resumeId - Resume ID
 * @returns {Promise<Object>} API Gateway response
 */
async function getFullResume(userId, resumeId) {
  try {
    // Get resume metadata
    const resume = await getItem(TABLES.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
    });

    if (!resume) {
      return createErrorResponse(404, 'Not Found', `Resume with id '${resumeId}' not found`);
    }

    // Get user profile for personalInfo
    const profile = await getItem(TABLES.MAIN, {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    });

    // Collect all section IDs
    const allSectionIds = [];
    const sectionTypeMap = {};

    Object.entries(resume.selectedSections || {}).forEach(([sectionType, sectionIds]) => {
      sectionIds.forEach(sectionId => {
        allSectionIds.push(sectionId);
        sectionTypeMap[sectionId] = sectionType;
      });
    });

    // Batch get all sections
    const sectionKeys = allSectionIds.map(sectionId => ({
      PK: `USER#${userId}`,
      SK: `SECTION#${sectionTypeMap[sectionId]}#${sectionId}`,
    }));

    const sections = await batchGetItems(TABLES.MAIN, sectionKeys);

    // Group sections by type
    const groupedSections = {};
    sections.forEach(section => {
      const { sectionType, PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...sectionData } = section;
      if (!groupedSections[sectionType]) {
        groupedSections[sectionType] = [];
      }
      groupedSections[sectionType].push(sectionData);
    });

    // Build full resume
    const { PK, SK, GSI1PK, GSI1SK, selectedSections, ...resumeMetadata } = resume;

    return createResponse(200, {
      ...resumeMetadata,
      data: {
        personalInfo: profile?.personalInfo || {},
        ...groupedSections,
      },
    });
  } catch (error) {
    console.error('Error getting full resume:', error);
    throw error;
  }
}

/**
 * Create a new resume
 * @param {string} userId - User ID
 * @param {Object} body - Request body
 * @returns {Promise<Object>} API Gateway response
 */
async function createResume(userId, body) {
  try {
    const { name, templateId, selectedSections = {}, metadata = {}, styling = {} } = body;

    if (!name) {
      return createErrorResponse(400, 'Bad Request', 'name is required');
    }

    if (!templateId) {
      return createErrorResponse(400, 'Bad Request', 'templateId is required');
    }

    const resumeId = uuidv4().split('-')[0];
    const now = new Date().toISOString();
    const timestamp = Date.now();

    const resume = {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `UPDATED#${timestamp}`,
      resumeId,
      userId,
      name,
      templateId,
      selectedSections,
      metadata,
      styling,
      createdAt: now,
      updatedAt: now,
    };

    await putItem(TABLES.RESUMES, resume);

    return createResponse(201, {
      resumeId,
      message: 'Resume created successfully',
      createdAt: now,
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
}

/**
 * Update an existing resume
 * @param {string} userId - User ID
 * @param {string} resumeId - Resume ID
 * @param {Object} body - Request body
 * @returns {Promise<Object>} API Gateway response
 */
async function updateResume(userId, resumeId, body) {
  try {
    // Check if resume exists
    const existing = await getItem(TABLES.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
    });

    if (!existing) {
      return createErrorResponse(404, 'Not Found', `Resume with id '${resumeId}' not found`);
    }

    // Build updates object
    const updates = {};
    const allowedFields = ['name', 'selectedSections', 'metadata', 'styling', 'templateId'];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Update GSI1SK with new timestamp
    const timestamp = Date.now();
    updates.GSI1SK = `UPDATED#${timestamp}`;

    const updated = await updateItem(
      TABLES.RESUMES,
      {
        PK: `USER#${userId}`,
        SK: `RESUME#${resumeId}`,
      },
      updates
    );

    return createResponse(200, {
      message: 'Resume updated successfully',
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    throw error;
  }
}

/**
 * Delete a resume
 * @param {string} userId - User ID
 * @param {string} resumeId - Resume ID
 * @returns {Promise<Object>} API Gateway response
 */
async function deleteResume(userId, resumeId) {
  try {
    // Check if resume exists
    const existing = await getItem(TABLES.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
    });

    if (!existing) {
      return createErrorResponse(404, 'Not Found', `Resume with id '${resumeId}' not found`);
    }

    await deleteItem(TABLES.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
    });

    return createResponse(200, {
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
}

module.exports = {
  handle,
};
