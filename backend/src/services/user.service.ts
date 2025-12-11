/**
 * User Service
 * Business logic for user operations using DynamoDB
 */

import { DynamoDBUtil } from '../utils/dynamodb.util';
import { TableNames } from '../constants';
import { UserProfile, UpdateUserProfileRequest } from '../models';

export class UserService {
  /**
   * Get user profile from DynamoDB main table using PK/SK pattern
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!TableNames.USERS) {
      throw new Error('DYNAMODB_USERS_TABLE environment variable not set');
    }

    try {
      console.log("User id: ",userId)
      const userItem = await DynamoDBUtil.getItem(TableNames.USERS, {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      });
      console.log("Useritem: ",userItem)
      if (userItem) {
        return this.formatUserProfile(userItem);
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Create or update user profile in DynamoDB
   */
  static async updateUserProfile(
    userId: string,
    data: UpdateUserProfileRequest
  ): Promise<{ userId: string; updatedAt: string }> {
    if (!TableNames.USERS) {
      throw new Error('DYNAMODB_USERS_TABLE environment variable not set');
    }

    const { personalInfo } = data;

    try {
      // Get existing user
      const existingUser = await this.getUserProfile(userId);

      const now = new Date().toISOString();

      if (!existingUser) {
        const newUser = {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
          userId,
          email: personalInfo?.email || '',
          personalInfo: {
            name: personalInfo?.name || '',
            email: personalInfo?.email || '',
            phone: personalInfo?.phone || '',
            location: personalInfo?.location || '',
          },
          createdAt: now,
          updatedAt: now,
          metadata: {
            signUpDate: now,
            status: 'active'
          }
        };

        await DynamoDBUtil.putItem(TableNames.USERS, newUser);

        return {
          userId,
          updatedAt: now,
        };
      }

      // Update existing user profile
      const updates = {
        'personalInfo': {
          ...existingUser.personalInfo,
          ...personalInfo,
        },
        'updatedAt': now
      };

      await DynamoDBUtil.updateItem(TableNames.USERS, {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      }, updates);

      return {
        userId,
        updatedAt: now,
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
    if (!TableNames.USERS) {
      throw new Error('DYNAMODB_USERS_TABLE environment variable not set');
    }

    const now = new Date().toISOString();

    const newUser = {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      userId,
      email,
      personalInfo: {
        name: name || '',
        email: email,
        phone: '',
        location: '',
        summary: '',
      },
      createdAt: now,
      updatedAt: now,
      metadata: {
        signUpDate: now,
        signUpMethod: 'cognito',
        emailVerified: true,
        status: 'active'
      }
    };

    try {
      // Check if user already exists first
      const existingUser = await this.getUserProfile(userId);
      if (existingUser) {
        console.log('User already exists:', userId);
        return;
      }

      await DynamoDBUtil.putItem(TableNames.USERS, newUser);
      console.log('User created successfully from Cognito:', userId);
    } catch (error) {
      console.error('Error creating user from Cognito:', error);
      throw error;
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
}
