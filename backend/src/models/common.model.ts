/**
 * Common Model Types
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string[];
}

export interface SuccessResponse<T = unknown> {
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  lastKey?: string;
}

// Express Request with authenticated user
export interface AuthenticatedRequest {
  userId: string;
  email?: string;
}
