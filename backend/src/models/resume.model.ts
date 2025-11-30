/**
 * Resume Model Types
 */

import { PersonalInfo } from './user.model';

export interface ResumeMetadata {
  targetRole?: string;
  targetCompany?: string;
  keywords?: string[];
  lastOptimized?: string;
  optimizedForJobId?: string;
  matchScore?: number;
}

export interface ResumeStyling {
  colorScheme?: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface Resume {
  PK?: string; // USER#{userId}
  SK?: string; // RESUME#{resumeId}
  GSI1PK?: string; // USER#{userId}
  GSI1SK?: string; // UPDATED#{timestamp}
  resumeId: string;
  userId: string;
  name: string;
  templateId: string;
  sections: Record<string, string[]>; // Changed from selectedSections
  metadata?: ResumeMetadata;
  styling?: ResumeStyling;
  createdAt: string;
  updatedAt: string;
}

// Flexible resume data - supports any section types
export interface ResumeData {
  personalInfo: PersonalInfo;
  [sectionType: string]: unknown; // Any section type with any data structure
}

export interface FullResume extends Omit<Resume, 'sections'> {
  data: ResumeData;
}

export interface CreateResumeRequest {
  name: string;
  templateId: string;
  sections?: Record<string, string[]>; // Changed from selectedSections
  metadata?: ResumeMetadata;
  styling?: ResumeStyling;
}

export interface UpdateResumeRequest {
  name?: string;
  // templateId removed - not allowed to change template
  sections?: Record<string, string[]>; // Changed from selectedSections
  metadata?: ResumeMetadata;
  styling?: ResumeStyling;
}

export interface ListResumesParams {
  limit?: number;
  lastKey?: string;
}

export interface ResumeSummary {
  resumeId: string;
  name: string;
  templateId: string;
  metadata?: ResumeMetadata;
  createdAt: string;
  updatedAt: string;
}
