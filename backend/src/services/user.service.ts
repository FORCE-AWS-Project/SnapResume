/**
 * User Service
 * Business logic for user operations using separated DynamoDB tables
 */

import AWS from 'aws-sdk';
import { AWS_CONFIG } from '../constants';
import { UserProfile, UpdateUserProfileRequest } from '../models';

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: AWS_CONFIG.REGION,
});

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
      const params = {
        TableName: this.USERS_TABLE,
        Key: {
          userId: userId,
          email: userId // Fallback using userId as sort key
        }
      };

      const result = await dynamodb.get(params).promise();
      if (result.Item) {
        return this.formatUserProfile(result.Item);
      }

      // If not found, try to query by email (more reliable)
      const queryParams = {
        TableName: this.USERS_TABLE,
        IndexName: 'EmailIndex', // Assuming email index exists
        KeyConditionExpression: 'email = :email',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':email': `placeholder@${userId}`, // Placeholder - we need email
          ':userId': userId
        }
      };

      const queryResult = await dynamodb.query(queryParams).promise();
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

        await dynamodb.put({
          TableName: this.USERS_TABLE,
          Item: {
            ...newUser,
            email: newUser.email // Ensure email is used as sort key
          },
          ConditionExpression: 'attribute_not_exists(userId)' // Prevent overwriting
        }).promise();

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
        ReturnValues: 'ALL_NEW'
      };

      const result = await dynamodb.update(updateParams).promise();

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
      await dynamodb.put({
        TableName: this.USERS_TABLE,
        Item: newUser,
        ConditionExpression: 'attribute_not_exists(userId)'
      }).promise();

      console.log('User created successfully from Cognito:', userId);
    } catch (error: any) {
      if (error.code === 'ConditionalCheckFailedException') {
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

      const result = await dynamodb.query(params).promise();
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
