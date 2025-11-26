/**
 * Template Handler
 * Handles template retrieval operations
 */

const { TABLES, getItem, queryItems } = require('../utils/dynamodb');
const { createResponse, createErrorResponse } = require('../utils/response');

/**
 * Handle template-related requests
 * @param {Object} event - Lambda event
 * @returns {Promise<Object>} API Gateway response
 */
async function handle(event) {
  const { httpMethod, path, queryStringParameters } = event;
  const pathSegments = path.replace('/api/', '').split('/').filter(Boolean);

  try {
    // GET /templates - List all templates
    if (httpMethod === 'GET' && pathSegments.length === 1) {
      return await listTemplates(queryStringParameters);
    }

    // GET /templates/{templateId} - Get template by ID
    if (httpMethod === 'GET' && pathSegments.length === 2) {
      const templateId = pathSegments[1];
      return await getTemplate(templateId);
    }

    return createErrorResponse(404, 'Not Found', 'Endpoint not found');
  } catch (error) {
    console.error('Error in templateHandler:', error);
    return createErrorResponse(500, 'Internal Server Error', error.message);
  }
}

/**
 * List all templates
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>} API Gateway response
 */
async function listTemplates(queryParams = {}) {
  try {
    const category = queryParams.category;

    let items;

    if (category) {
      // Use GSI1 to query by category
      const params = {
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :category',
        ExpressionAttributeValues: {
          ':category': `CATEGORY#${category}`,
        },
      };

      items = await queryItems(TABLES.TEMPLATES, params);
    } else {
      // Scan all templates (you might want to implement pagination here)
      const params = {
        KeyConditionExpression: 'begins_with(PK, :prefix)',
        ExpressionAttributeValues: {
          ':prefix': 'TEMPLATE#',
        },
      };

      // Since we can't use begins_with on partition key in query, we'll scan
      // In production, consider creating a GSI for listing all templates
      items = [];

      // For now, return a hardcoded list of template IDs to query
      // In production, you'd populate the templates table and scan it
      const knownTemplateIds = ['TPL_MODERN_001', 'TPL_CLASSIC_001', 'TPL_MINIMAL_001'];

      for (const templateId of knownTemplateIds) {
        const template = await getItem(TABLES.TEMPLATES, {
          PK: `TEMPLATE#${templateId}`,
          SK: 'METADATA',
        });
        if (template) {
          items.push(template);
        }
      }
    }

    // Remove internal fields and return only summary info for list
    const templates = items.map(item => {
      const { PK, SK, GSI1PK, GSI1SK, inputDataSchema, ...template } = item;
      return template;
    });

    return createResponse(200, {
      templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    throw error;
  }
}

/**
 * Get template by ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} API Gateway response
 */
async function getTemplate(templateId) {
  try {
    const template = await getItem(TABLES.TEMPLATES, {
      PK: `TEMPLATE#${templateId}`,
      SK: 'METADATA',
    });

    if (!template) {
      return createErrorResponse(404, 'Not Found', `Template with id '${templateId}' not found`);
    }

    // Remove internal fields
    const { PK, SK, GSI1PK, GSI1SK, ...templateData } = template;

    return createResponse(200, templateData);
  } catch (error) {
    console.error('Error getting template:', error);
    throw error;
  }
}

module.exports = {
  handle,
};
