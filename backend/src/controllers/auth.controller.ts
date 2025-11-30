/**
 * Auth Controller
 * Handles authentication HTTP requests
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ResponseUtil } from '../utils';
import { SuccessMessages, ErrorMessages } from '../constants/messages';

export class AuthController {
  /**
   * POST /auth/register
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, personalInfo } = req.body;
      
      // Validate input
      if (!email || !password) {
        ResponseUtil.badRequest(res, ErrorMessages.EMAIL_REQUIRED);
        return;
      }

      // Register with Cognito
      const result = await AuthService.register(email, password, name);

      // Attempt to create DynamoDB profile (non-blocking)
      try {
        // Merge personalInfo with backward-compatible name field
        const profileData = {
          ...personalInfo,
          email, // Always use registration email
          name: personalInfo?.name || name, // personalInfo.name takes precedence
        };

        // Create user profile in DynamoDB
        await UserService.updateUserProfile(result.userId, {
          personalInfo: profileData,
        });

        console.log(`User profile created for userId: ${result.userId}`);
      } catch (dbError: any) {
        // Log error but don't fail registration
        console.error('Failed to create user profile in DynamoDB:', dbError);
        console.log('User profile will be auto-created on first login');
      }

      ResponseUtil.success(res, {
        userId: result.userId,
        userConfirmed: result.userConfirmed,
        message: SuccessMessages.AUTH_REGISTER_SUCCESS,
      });
    } catch (error: any) {
      console.error('Register error:', error);
      ResponseUtil.internalError(res, error.message || ErrorMessages.AUTH_FAILED);
    }
  }

  /**
   * POST /auth/login
   * Login user and auto-create profile in DynamoDB
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        ResponseUtil.badRequest(res, ErrorMessages.EMAIL_REQUIRED);
        return;
      }

      // Login with Cognito
      const tokens = await AuthService.login(email, password);

      // Get user info from token to extract userId
      const userInfo = await AuthService.getCurrentUser(tokens.accessToken);

      // Auto-create user profile in DynamoDB if it doesn't exist
      const existingProfile = await UserService.getUserProfile(userInfo.userId);

      if (!existingProfile) {
        await UserService.updateUserProfile(userInfo.userId, {
          personalInfo: {
            email: userInfo.email,
            name: userInfo.name,
          },
        });
      }

      ResponseUtil.success(res, {
        ...tokens,
        userId: userInfo.userId,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      ResponseUtil.unauthorized(res, error.message || ErrorMessages.AUTH_INVALID_CREDENTIALS);
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        ResponseUtil.badRequest(res, 'Refresh token is required');
        return;
      }

      const tokens = await AuthService.refreshToken(refreshToken);

      ResponseUtil.success(res, tokens);
    } catch (error: any) {
      console.error('Refresh token error:', error);
      ResponseUtil.unauthorized(res, error.message || ErrorMessages.AUTH_TOKEN_REFRESH_FAILED);
    }
  }

  /**
   * POST /auth/logout
   * Logout user (requires authentication)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const accessToken = req.headers.authorization?.replace('Bearer ', '');

      if (!accessToken) {
        ResponseUtil.badRequest(res, 'Access token is required');
        return;
      }

      await AuthService.logout(accessToken);

      ResponseUtil.success(res, { message: SuccessMessages.AUTH_LOGOUT_SUCCESS });
    } catch (error: any) {
      console.error('Logout error:', error);
      ResponseUtil.internalError(res, error.message || ErrorMessages.AUTH_FAILED);
    }
  }

  /**
   * POST /auth/forgot-password
   * Initiate forgot password flow
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        ResponseUtil.badRequest(res, ErrorMessages.EMAIL_REQUIRED);
        return;
      }

      await AuthService.forgotPassword(email);

      ResponseUtil.success(res, {
        message: SuccessMessages.AUTH_PASSWORD_RESET_SENT,
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      ResponseUtil.internalError(res, error.message || ErrorMessages.AUTH_FAILED);
    }
  }

  /**
   * POST /auth/confirm-forgot-password
   * Confirm password reset with code
   */
  static async confirmForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        ResponseUtil.badRequest(res, 'Email, code, and new password are required');
        return;
      }

      await AuthService.confirmForgotPassword(email, code, newPassword);

      ResponseUtil.success(res, { message: SuccessMessages.AUTH_PASSWORD_RESET_SUCCESS });
    } catch (error: any) {
      console.error('Confirm forgot password error:', error);
      ResponseUtil.internalError(res, error.message || ErrorMessages.AUTH_FAILED);
    }
  }

  /**
   * POST /auth/change-password
   * Change password (requires authentication)
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const accessToken = req.headers.authorization?.replace('Bearer ', '');
      const { previousPassword, newPassword } = req.body;

      if (!accessToken || !previousPassword || !newPassword) {
        ResponseUtil.badRequest(res, 'Missing required fields');
        return;
      }

      await AuthService.changePassword(accessToken, previousPassword, newPassword);

      ResponseUtil.success(res, { message: SuccessMessages.AUTH_PASSWORD_CHANGED });
    } catch (error: any) {
      console.error('Change password error:', error);
      ResponseUtil.internalError(res, error.message || ErrorMessages.AUTH_FAILED);
    }
  }

  /**
   * GET /auth/me
   * Get current user profile (requires authentication)
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      // Get user profile from DynamoDB
      const profile = await UserService.getUserProfile(userId);

      if (!profile) {
        ResponseUtil.notFound(res, ErrorMessages.USER_NOT_FOUND);
        return;
      }

      ResponseUtil.success(res, profile);
    } catch (error: any) {
      console.error('Get current user error:', error);
      ResponseUtil.internalError(res, error.message || ErrorMessages.AUTH_FAILED);
    }
  }

  /**
   * POST /auth/confirm-signup
   * Confirm user registration with verification code
   */
  static async confirmSignUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        ResponseUtil.badRequest(res, 'Email and verification code are required');
        return;
      }

      const result = await AuthService.confirmSignUp(email, code);
      ResponseUtil.success(res, result);
    } catch (error: any) {
      console.error('Confirm signup error:', error);
      ResponseUtil.internalError(res, error);
    }
  }

  /**
   * POST /auth/resend-confirmation
   * Resend confirmation code to user's email
   */
  static async resendConfirmationCode(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        ResponseUtil.badRequest(res, 'Email is required');
        return;
      }

      const result = await AuthService.resendConfirmationCode(email);
      ResponseUtil.success(res, result.message);
    } catch (error: any) {
      console.error('Resend confirmation code error:', error);
      ResponseUtil.internalError(res, error);
    }
  }
}