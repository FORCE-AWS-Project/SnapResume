/**
 * Resume Model Types
 */

import { CreateSectionRequest, UpdateSectionRequest } from './section.model';

export interface ResumeMetadata {
  keywords?: string[];
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
  sections: Record<string, string[]>; // Store section IDs only, not full section data
  metadata?: ResumeMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface FullResume extends Omit<Resume, 'sections'> {
  data: {
    [sectionType: string]: unknown;
  }
}

export interface CreateResumeRequest {
  name: string;
  templateId: string;
  sections?: Record<string, CreateSectionRequest[]>;
  metadata?: ResumeMetadata;
}

export interface UpdateResumeRequest {
  name?: string;
  sections?: Record<string, UpdateSectionRequest[]>;
  metadata?: ResumeMetadata;
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
