/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', error);
  ResponseUtil.internalError(res, error.message);
}

export function notFoundMiddleware(req: Request, res: Response): void {
  ResponseUtil.notFound(res, `Route ${req.method} ${req.path} not found`);
}
