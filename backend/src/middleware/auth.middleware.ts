/**
 * Authentication Middleware
 * Extracts user ID from Cognito authorizer context
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils';
import { ErrorMessages } from '../constants';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract user ID from API Gateway authorizer context
    const event = (req as any).apiGateway?.event;
    console.log("Authing")
    if (!event) {
      // If not coming from API Gateway, check for userId in request (for local testing)
      const userId = req.headers['x-user-id'] as string;
      if (userId) {
        (req as any).userId = userId;
        console.log(`Local development: Using userId ${userId} from x-user-id header`);
        return next();
      }

      // For local development, check Authorization header with "Bearer test-user-id"
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token === 'test-user-id' || token.startsWith('test-user-id')) {
          const testUserId = token || 'test-user-id';
          (req as any).userId = testUserId;
          console.log(`Local development: Using test userId ${testUserId} from Authorization header`);
          return next();
        }
      }

      ResponseUtil.unauthorized(res, ErrorMessages.UNAUTHORIZED);
      return;
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
      ResponseUtil.unauthorized(res, ErrorMessages.UNAUTHORIZED);
      return;
    }

    // Add userId to request object
    (req as any).userId = userId;
    (req as any).email = event.requestContext?.authorizer?.claims?.email;

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    ResponseUtil.unauthorized(res, ErrorMessages.UNAUTHORIZED);
  }
}
