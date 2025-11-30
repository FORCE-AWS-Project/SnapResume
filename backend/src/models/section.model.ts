/**
 * Section Model Types
 * Generic section model that supports any JSON data structure
 */

// Generic section interface - supports any data structure
export interface Section {
  PK?: string; // USER#{userId}
  SK?: string; // SECTION#{resumeId}#{sectionType}#{sectionId}
  GSI1PK?: string; // SECTION#{userId}
  GSI1SK?: string; // TAGS#{sortedTags}
  GSI2PK?: string; // SECTION#{resumeId}#{sectionType}
  GSI2SK?: string; // CREATED#{timestamp}
  sectionId: string;
  userId: string;
  resumeId: string; // NEW - sections are tied to specific resumes
  sectionType: string; // e.g., "experience", "education", "skills", or any custom type
  tags: string[];
  data: Record<string, unknown>; // Flexible JSON data based on template schema
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateSectionRequest {
  resumeId: string; // NEW - required to tie section to resume
  sectionType: string;
  tags?: string[];
  data: Record<string, unknown>; // Any JSON data structure
}

export interface UpdateSectionRequest {
  tags?: string[];
  data?: Record<string, unknown>; // Partial update of data
}

// Query params
export interface ListSectionsParams {
  type?: string; // Filter by section type
  tags?: string; // Comma-separated tags for filtering
  limit?: number;
  exclusiveStartKey?: Record<string, unknown>; // For pagination
}

// Response types
export interface ListSectionsResponse {
  sections: Section[];
  count: number;
  lastEvaluatedKey?: Record<string, unknown>;
}

export interface CreateSectionResponse {
  sectionId: string;
  createdAt: string;
}

export interface UpdateSectionResponse {
  updatedAt: string;
}
