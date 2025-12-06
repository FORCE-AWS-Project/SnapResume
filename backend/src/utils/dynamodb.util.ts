/**
 * DynamoDB Utility Functions
 * Provides strongly-typed DynamoDB operations
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  GetCommandOutput,
  PutCommand,
  PutCommandInput,
  UpdateCommand,
  UpdateCommandInput,
  UpdateCommandOutput,
  DeleteCommand,
  DeleteCommandInput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  BatchGetCommand,
  BatchGetCommandInput,
  BatchGetCommandOutput,
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { AWS_CONFIG } from '../constants';

// DynamoDB key type
interface DynamoDBKey {
  PK: string;
  SK: string;
}

// DynamoDB query result type
interface DynamoDBQueryResult<T> {
  items: T[];
  count: number;
  lastEvaluatedKey?: Record<string, unknown>;
}

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: AWS_CONFIG.REGION });
const docClient = DynamoDBDocumentClient.from(client);

export class DynamoDBUtil {
  /**
   * Get an item from DynamoDB
   */
  static async getItem<T>(
    tableName: string,
    key: DynamoDBKey
  ): Promise<T | null> {
    try {
      const params: GetCommandInput = {
        TableName: tableName,
        Key: key,
      };

      const command = new GetCommand(params);
      const response: GetCommandOutput = await docClient.send(command);
      return (response.Item as T) || null;
    } catch (error) {
      console.error('Error getting item:', error);
      throw error;
    }
  }

  /**
   * Put an item in DynamoDB
   */
  static async putItem<T extends Object>(
    tableName: string,
    item: T
  ): Promise<void> {
    try {
      const params: PutCommandInput = {
        TableName: tableName,
        Item: item,
      };

      const command = new PutCommand(params);
      await docClient.send(command);
    } catch (error) {
      console.error('Error putting item:', error);
      throw error;
    }
  }

  /**
   * Update an item in DynamoDB
   */
  static async updateItem<T>(
    tableName: string,
    key: DynamoDBKey,
    updates: Record<string, unknown>
  ): Promise<T> {
    try {
      // Build update expression
      const updateExpressionParts: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, unknown> = {};

      Object.keys(updates).forEach((field, index) => {
        const valuePlaceholder = `:value${index}`;

        if (field.includes('.')) {
          updateExpressionParts.push(`${field} = ${valuePlaceholder}`);
        } else {
          const placeholder = `#field${index}`;
          updateExpressionParts.push(`${placeholder} = ${valuePlaceholder}`);
          expressionAttributeNames[placeholder] = field;
        }
        expressionAttributeValues[valuePlaceholder] = updates[field];
      });

      // Add updatedAt timestamp
      updateExpressionParts.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const params: UpdateCommandInput = {
        TableName: tableName,
        Key: key,
        UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      };

      const command = new UpdateCommand(params);
      const response: UpdateCommandOutput = await docClient.send(command);
      return response.Attributes as T;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  /**
   * Delete an item from DynamoDB
   */
  static async deleteItem(
    tableName: string,
    key: DynamoDBKey
  ): Promise<void> {
    try {
      const params: DeleteCommandInput = {
        TableName: tableName,
        Key: key,
      };

      const command = new DeleteCommand(params);
      await docClient.send(command);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  /**
   * Query items from DynamoDB
   */
  static async queryItems<T>(
    tableName: string,
    params: Omit<QueryCommandInput, 'TableName'>
  ): Promise<DynamoDBQueryResult<T>> {
    try {
      const command = new QueryCommand({
        TableName: tableName,
        ...params,
      });

      const response: QueryCommandOutput = await docClient.send(command);

      return {
        items: (response.Items as T[]) || [],
        lastEvaluatedKey: response.LastEvaluatedKey,
        count: response.Count || 0,
      };
    } catch (error) {
      console.error('Error querying items:', error);
      throw error;
    }
  }

  /**
   * Batch get items from DynamoDB
   */
  static async batchGetItems<T>(
    tableName: string,
    keys: DynamoDBKey[]
  ): Promise<T[]> {
    try {
      if (keys.length === 0) {
        return [];
      }

      const params: BatchGetCommandInput = {
        RequestItems: {
          [tableName]: {
            Keys: keys,
          },
        },
      };

      const command = new BatchGetCommand(params);
      const response: BatchGetCommandOutput = await docClient.send(command);
      return (response.Responses?.[tableName] as T[]) || [];
    } catch (error) {
      console.error('Error batch getting items:', error);
      throw error;
    }
  }

  /**
   * Helper to remove DynamoDB internal fields from an item
   */
  static stripInternalFields<T>(item: Record<string, unknown>): T {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...cleanItem } = item;
    return cleanItem as T;
  }

  /**
   * Helper to remove DynamoDB internal fields from multiple items
   */
  static stripInternalFieldsFromArray<T>(items: Record<string, unknown>[]): T[] {
    return items.map((item) => this.stripInternalFields<T>(item));
  }

  /**
   * Generic batch write operations (create/update/delete)
   */
  static async batchWriteItems(
    tableName: string,
    requestItems: any[]
  ): Promise<void> {
    try {
      if (requestItems.length === 0) {
        return;
      }

      const batches: any[][] = [];
      for (let i = 0; i < requestItems.length; i += 25) {
        batches.push(requestItems.slice(i, i + 25));
      }

      for (const batch of batches) {
        const params: BatchWriteCommandInput = {
          RequestItems: {
            [tableName]: batch
          }
        };

        const command = new BatchWriteCommand(params);
        await docClient.send(command);
      }
    } catch (error) {
      console.error('Error batch writing items:', error);
      throw error;
    }
  }

  /**
   * Batch create items
   */
  static async batchCreateItems<T extends Object>(
    tableName: string,
    items: T[]
  ): Promise<void> {
    const requestItems = items.map(item => ({
      PutRequest: {
        Item: item
      }
    }));

    return this.batchWriteItems(tableName, requestItems);
  }

  /**
   * Batch update items
   */
  static async batchUpdateItems(
    tableName: string,
    updates: Array<{key: DynamoDBKey, update: Record<string, unknown>}>
  ): Promise<void> {
    const transactItems = updates.map(({ key, update }) => {
      const updateExpressionParts: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, unknown> = {};

      Object.keys(update).forEach((field, index) => {
        const namePlaceholder = `#field${index}`;
        const valuePlaceholder = `:value${index}`;

        updateExpressionParts.push(`${namePlaceholder} = ${valuePlaceholder}`);
        expressionAttributeNames[namePlaceholder] = field;
        expressionAttributeValues[valuePlaceholder] = update[field];
      });

      // Add updatedAt timestamp
      updateExpressionParts.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      return {
        Update: {
          TableName: tableName,
          Key: key,
          UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues
        }
      };
    });

    // Execute the transaction
    const command = new TransactWriteCommand({
      TransactItems: transactItems
    });

    await docClient.send(command);
  }

  /**
   * Batch delete items
   */
  static async batchDeleteItems(
    tableName: string,
    keys: DynamoDBKey[]
  ): Promise<void> {
    const requestItems = keys.map(key => ({
      DeleteRequest: {
        Key: key
      }
    }));

    return this.batchWriteItems(tableName, requestItems);
  }
}
