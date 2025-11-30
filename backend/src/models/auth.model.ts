/**
 * Auth Model Types
 */

import { PersonalInfo } from './user.model';

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string; // Kept for backward compatibility
  personalInfo?: PersonalInfo; // New optional field
}

export interface RegisterResponse {
  userId: string;
  userConfirmed: boolean;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ConfirmForgotPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  previousPassword: string;
  newPassword: string;
}
