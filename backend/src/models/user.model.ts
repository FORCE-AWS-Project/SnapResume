/**
 * User Model Types
 */

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
  customFields?: Record<string, string>;
}

export interface User {
  PK?: string; // USER#{userId}
  SK?: string; // PROFILE
  userId: string;
  email: string;
  personalInfo: PersonalInfo;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  PK?: string; // USER#{userId}
  SK?: string; // PROFILE
  userId: string;
  email: string;
  personalInfo: PersonalInfo;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  personalInfo: PersonalInfo;
}
