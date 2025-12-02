/**
 * Authentication Middleware
 *
 * Validates and extracts user information from Cognito JWT tokens.
 * Supports both access tokens and ID tokens with automatic fallback.
 */

import { Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils';
import { AWS_CONFIG, ErrorMessages } from '../constants';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { AuthenticatedRequest } from '../models/auth.model';

// Create Cognito JWT verifiers for both access and ID tokens
const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: AWS_CONFIG.COGNITO_USER_POOL_ID || '',
  tokenUse: 'access',
  clientId: AWS_CONFIG.COGNITO_CLIENT_ID,
});

const idTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: AWS_CONFIG.COGNITO_USER_POOL_ID || '',
  tokenUse: 'id',
  clientId: AWS_CONFIG.COGNITO_CLIENT_ID,
});

/**
 * Authentication middleware that validates Cognito JWT tokens
 * and extracts user information.
 */
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authentication failed: Missing or invalid Authorization header', {
        hasHeader: !!authHeader,
        headerValue: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
      });
      ResponseUtil.unauthorized(res, ErrorMessages.UNAUTHORIZED);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Try to verify as access token first, then fall back to ID token
    let payload;
    let tokenType: 'access' | 'id' = 'access';

    try {
      payload = await accessTokenVerifier.verify(token);
    } catch (accessError) {
      try {
        payload = await idTokenVerifier.verify(token);
        tokenType = 'id';
        console.log('Successfully verified ID token', {
          userId: payload.sub,
          email: payload.email,
          tokenUse: 'id'
        });
      } catch (idError) {
        console.error('Authentication failed: Both access and ID token verification failed', {
          accessError: accessError instanceof Error ? accessError.message : 'Unknown error',
          idError: idError instanceof Error ? idError.message : 'Unknown error'
        });
        ResponseUtil.unauthorized(res, ErrorMessages.UNAUTHORIZED);
        return;
      }
    }

    // Validate required claims
    if (!payload.sub) {
      console.error('Authentication failed: Missing sub claim in token');
      ResponseUtil.unauthorized(res, ErrorMessages.UNAUTHORIZED);
      return;
    }

    // Extract user information from token claims
    const userName = payload.name ||
                   payload['cognito:username'] ||
                   payload.email?.split('@')[0] ||
                   'Unknown';

    // Attach user info to request object
    req.user = {
      userId: payload.sub,
      email: payload.email || '',
      name: userName,
      sub: payload.sub,
      tokenUse: tokenType
    };

    return next();

  } catch (error) {
    console.error('Unexpected error in auth middleware:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    ResponseUtil.unauthorized(res, ErrorMessages.UNAUTHORIZED);
  }
}

/**
 * Optional authentication middleware that allows requests without authentication
 * but sets user info if token is present.
 */
export async function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user info
      return next();
    }

    // Token present, try to authenticate
    await authMiddleware(req, res, next);
  } catch (error) {
    // Optional auth should never block the request
    console.warn('Optional authentication failed, continuing without user context:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    next();
  }
}