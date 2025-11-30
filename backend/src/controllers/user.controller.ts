/**
 * User Controller
 * Handles HTTP requests for user operations
 */

import { Request, Response } from 'express';
import { UserService } from '../services';
import { ResponseUtil } from '../utils';
import { ErrorMessages, SuccessMessages } from '../constants';
import { AuthenticatedRequest, UpdateUserProfileRequest } from '../models';

export class UserController {
  /**
   * Get user profile
   * GET /users/me
   */
  static async getUserProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req as any as AuthenticatedRequest;

      const profile = await UserService.getUserProfile(userId);

      if (!profile) {
        return ResponseUtil.notFound(res, ErrorMessages.USER_NOT_FOUND);
      }

      return ResponseUtil.success(res, profile);
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return ResponseUtil.internalError(res);
    }
  }

  /**
   * Update user profile
   * PUT /users/me
   */
  static async updateUserProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req as any as AuthenticatedRequest;
      const body: UpdateUserProfileRequest = req.body;

      if (!body.personalInfo) {
        return ResponseUtil.badRequest(res, 'personalInfo is required');
      }

      const result = await UserService.updateUserProfile(userId, body);

      return ResponseUtil.success(res, result, SuccessMessages.PROFILE_UPDATED);
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return ResponseUtil.internalError(res);
    }
  }
}
