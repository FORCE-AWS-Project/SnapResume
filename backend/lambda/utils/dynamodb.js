/**
 * DynamoDB utility functions
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  BatchGetCommand,
} = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Table names from environment variables
const TABLES = {
  MAIN: process.env.DYNAMODB_MAIN_TABLE,
  RESUMES: process.env.DYNAMODB_RESUMES_TABLE,
  TEMPLATES: process.env.DYNAMODB_TEMPLATES_TABLE,
  SESSIONS: process.env.DYNAMODB_SESSIONS_TABLE,
};

/**
 * Get an item from DynamoDB
 * @param {string} tableName - Table name
 * @param {Object} key - Primary key
 * @returns {Promise<Object|null>} Item or null if not found
 */
async function getItem(tableName, key) {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });

    const response = await docClient.send(command);
    return response.Item || null;
  } catch (error) {
    console.error('Error getting item:', error);
    throw error;
  }
}

/**
 * Put an item in DynamoDB
 * @param {string} tableName - Table name
 * @param {Object} item - Item to put
 * @returns {Promise<void>}
 */
async function putItem(tableName, item) {
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });

    await docClient.send(command);
  } catch (error) {
    console.error('Error putting item:', error);
    throw error;
  }
}

/**
 * Update an item in DynamoDB
 * @param {string} tableName - Table name
 * @param {Object} key - Primary key
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated item
 */
async function updateItem(tableName, key, updates) {
  try {
    // Build update expression
    const updateExpressionParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((field, index) => {
      const placeholder = `#field${index}`;
      const valuePlaceholder = `:value${index}`;

      updateExpressionParts.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = field;
      expressionAttributeValues[valuePlaceholder] = updates[field];
    });

    // Add updatedAt timestamp
    updateExpressionParts.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);
    return response.Attributes;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

/**
 * Delete an item from DynamoDB
 * @param {string} tableName - Table name
 * @param {Object} key - Primary key
 * @returns {Promise<void>}
 */
async function deleteItem(tableName, key) {
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });

    await docClient.send(command);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

/**
 * Query items from DynamoDB
 * @param {string} tableName - Table name
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of items
 */
async function queryItems(tableName, params) {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      ...params,
    });

    const response = await docClient.send(command);
    return response.Items || [];
  } catch (error) {
    console.error('Error querying items:', error);
    throw error;
  }
}

/**
 * Batch get items from DynamoDB
 * @param {string} tableName - Table name
 * @param {Array} keys - Array of primary keys
 * @returns {Promise<Array>} Array of items
 */
async function batchGetItems(tableName, keys) {
  try {
    if (keys.length === 0) {
      return [];
    }

    const command = new BatchGetCommand({
      RequestItems: {
        [tableName]: {
          Keys: keys,
        },
      },
    });

    const response = await docClient.send(command);
    return response.Responses?.[tableName] || [];
  } catch (error) {
    console.error('Error batch getting items:', error);
    throw error;
  }
}

module.exports = {
  TABLES,
  getItem,
  putItem,
  updateItem,
  deleteItem,
  queryItems,
  batchGetItems,
};
