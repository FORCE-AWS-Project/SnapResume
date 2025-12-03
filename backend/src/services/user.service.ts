/**
 * User Service
 * Business logic for user operations using separated DynamoDB tables
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { AWS_CONFIG } from '../constants';
import { UserProfile, UpdateUserProfileRequest } from '../models';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: AWS_CONFIG.REGION });
const docClient = DynamoDBDocumentClient.from(client);

export class UserService {
  private static readonly USERS_TABLE = process.env.DYNAMODB_USERS_TABLE;

  /**
   * Get user profile from separated users table
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!this.USERS_TABLE) {
      throw new Error('DYNAMODB_USERS_TABLE environment variable not set');
    }

    try {
      // First try to get user by primary key
      const command = new GetCommand({
        TableName: this.USERS_TABLE,
        Key: {
          userId: userId,
          email: userId // Fallback using userId as sort key
        }
      });

      const result = await docClient.send(command);
      if (result.Item) {
        return this.formatUserProfile(result.Item);
      }

      // If not found, try to query by email (more reliable)
      const queryCommand = new QueryCommand({
        TableName: this.USERS_TABLE,
        IndexName: 'EmailIndex', // Assuming email index exists
        KeyConditionExpression: 'email = :email',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':email': `placeholder@${userId}`, // Placeholder - we need email
          ':userId': userId
        }
      });

      const queryResult = await docClient.send(queryCommand);
      if (queryResult.Items && queryResult.Items.length > 0) {
        return this.formatUserProfile(queryResult.Items[0]);
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Create or update user profile in separated users table
   */
  static async updateUserProfile(
    userId: string,
    data: UpdateUserProfileRequest
  ): Promise<{ userId: string; updatedAt: string }> {
    if (!this.USERS_TABLE) {
      throw new Error('DYNAMODB_USERS_TABLE environment variable not set');
    }

    const { personalInfo } = data;

    try {
      // Get existing user
      const existingUser = await this.getUserProfile(userId);

      const now = new Date().toISOString();

      if (!existingUser) {
        // Create new user profile
        const newUser = {
          userId,
          email: personalInfo?.email || `${userId}@placeholder.com`,
          createdAt: now,
          updatedAt: now,
          personalInfo: {
            name: personalInfo?.name || '',
            email: personalInfo?.email || '',
            phone: personalInfo?.phone || '',
            location: personalInfo?.location || '',
            linkedin: personalInfo?.linkedin || '',
            github: personalInfo?.github || '',
            portfolio: personalInfo?.portfolio || '',
            summary: personalInfo?.summary || '',
          },
          metadata: {
            signUpDate: now,
            status: 'active'
          }
        };

        await docClient.send(new PutCommand({
          TableName: this.USERS_TABLE,
          Item: {
            ...newUser,
            email: newUser.email // Ensure email is used as sort key
          },
          ConditionExpression: 'attribute_not_exists(userId)' // Prevent overwriting
        }));

        return {
          userId,
          updatedAt: now,
        };
      }

      // Update existing user profile
      const updateExpression = 'set personalInfo = :personalInfo, updatedAt = :updatedAt';
      const expressionAttributeValues = {
        ':personalInfo': {
          ...existingUser.personalInfo,
          ...personalInfo,
        },
        ':updatedAt': now,
      };

      const updateParams = {
        TableName: this.USERS_TABLE,
        Key: {
          userId: userId,
          email: existingUser.email
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: ReturnValue.ALL_NEW
      };

      const result = await docClient.send(new UpdateCommand(updateParams));

      return {
        userId,
        updatedAt: result.Attributes?.updatedAt || now,
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Create user from Cognito post-confirmation trigger
   */
  static async createUserFromCognito(userId: string, email: string, name?: string): Promise<void> {
    if (!this.USERS_TABLE) {
      throw new Error('DYNAMODB_USERS_TABLE environment variable not set');
    }

    const now = new Date().toISOString();

    const newUser = {
      userId,
      email,
      createdAt: now,
      updatedAt: now,
      personalInfo: {
        name: name || '',
        email: email,
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
        summary: '',
      },
      metadata: {
        signUpDate: now,
        signUpMethod: 'cognito',
        emailVerified: true,
        status: 'active'
      }
    };

    try {
      await docClient.send(new PutCommand({
        TableName: this.USERS_TABLE,
        Item: newUser,
        ConditionExpression: 'attribute_not_exists(userId)'
      }));

      console.log('User created successfully from Cognito:', userId);
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.log('User already exists:', userId);
      } else {
        console.error('Error creating user from Cognito:', error);
        throw error;
      }
    }
  }

  /**
   * Format user profile data for API response
   */
  private static formatUserProfile(userItem: any): UserProfile {
    return {
      userId: userItem.userId,
      email: userItem.email,
      personalInfo: userItem.personalInfo || {},
      createdAt: userItem.createdAt,
      updatedAt: userItem.updatedAt,
    };
  }

  /**
   * Get user by email (for admin functions)
   */
  static async getUserByEmail(email: string): Promise<UserProfile | null> {
    if (!this.USERS_TABLE) {
      throw new Error('DYNAMODB_USERS_TABLE environment variable not set');
    }

    try {
      const params = {
        TableName: this.USERS_TABLE,
        IndexName: 'EmailIndex', // Assuming email index exists
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      };

      const result = await docClient.send(new QueryCommand(params));
      if (result.Items && result.Items.length > 0) {
        return this.formatUserProfile(result.Items[0]);
      }

      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }
}
