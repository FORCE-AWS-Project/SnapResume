/**
 * Response Utility Functions
 */

import { Response } from 'express';
import { HttpStatus, HttpStatusCode } from '../constants';
import { ApiResponse, ErrorResponse } from '../models';

export class ResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: HttpStatusCode = HttpStatus.OK
  ): Response {
    const response: ApiResponse<T> = {
      ...(message && { message }),
      ...(data && { data }),
      isOk: true,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response
   */
  static created<T>(res: Response, data?: T, message?: string): Response {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    error: string,
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: string[]
  ): Response {
    const response: ErrorResponse = {
      error,
      message,
      ...(details && { details }),
      isOk: false,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send bad request response
   */
  static badRequest(res: Response, message: string, details?: string[]): Response {
    return this.error(res, 'Bad Request', message, HttpStatus.BAD_REQUEST, details);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(res: Response, message: string): Response {
    return this.error(res, 'Unauthorized', message, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Send forbidden response
   */
  static forbidden(res: Response, message: string): Response {
    return this.error(res, 'Forbidden', message, HttpStatus.FORBIDDEN);
  }

  /**
   * Send not found response
   */
  static notFound(res: Response, message: string): Response {
    return this.error(res, 'Not Found', message, HttpStatus.NOT_FOUND);
  }

  /**
   * Send internal server error response
   */
  static internalError(res: Response, message?: string): Response {
    return this.error(
      res,
      'Internal Server Error',
      message || 'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
