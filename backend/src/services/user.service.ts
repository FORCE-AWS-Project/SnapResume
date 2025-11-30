/**
 * User Service
 * Business logic for user operations
 */

import { DynamoDBUtil } from '../utils';
import { TableNames } from '../constants';
import { User, UserProfile, UpdateUserProfileRequest } from '../models';

export class UserService {
  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await DynamoDBUtil.getItem<User>(TableNames.MAIN, {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    });

    if (!user) {
      return null;
    }

    // Remove internal DynamoDB fields
    return DynamoDBUtil.stripInternalFields<UserProfile>(
      user as unknown as Record<string, unknown>
    );
  }

  /**
   * Create or update user profile
   */
  static async updateUserProfile(
    userId: string,
    data: UpdateUserProfileRequest
  ): Promise<{ userId: string; updatedAt: string }> {
    const { personalInfo } = data;

    // Check if user exists
    const existingUser = await DynamoDBUtil.getItem<User>(TableNames.MAIN, {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    });

    const now = new Date().toISOString();

    if (!existingUser) {
      // Create new user profile
      const newUser: User = {
        PK: `USER#${userId}`,
        SK: 'PROFILE',
        userId,
        email: personalInfo?.email || '',
        personalInfo,
        createdAt: now,
        updatedAt: now,
      };

      await DynamoDBUtil.putItem(TableNames.MAIN, newUser as unknown as Record<string, unknown>);

      return {
        userId,
        updatedAt: now,
      };
    }

    // Update existing user profile
    const updated = await DynamoDBUtil.updateItem<User>(
      TableNames.MAIN,
      {
        PK: `USER#${userId}`,
        SK: 'PROFILE',
      },
      {
        personalInfo,
        email: personalInfo?.email || existingUser.email,
      }
    );

    return {
      userId,
      updatedAt: updated.updatedAt,
    };
  }
}
