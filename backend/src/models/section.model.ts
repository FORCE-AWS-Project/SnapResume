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
  resumeId: string;
  title: string;
  sectionType: string;
  tags: string[];
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateSectionRequest {
  resumeId: string;
  sectionType: string;
  tags?: string[];
  title: string;
  data: Record<string, unknown>;
}

export interface UpdateSectionRequest {
  sectionId: string;
  resumeId: string;
  title?: string;
  sectionType?: string; // Optional field to support section type changes
  tags?: string[];
  data?: Record<string, unknown>;
}

// Query params
export interface ListSectionsParams {
  resumeId?: string;
  type?: string;
  tags?: string;
  limit?: number;
  exclusiveStartKey?: Record<string, unknown>;
}

// Response types
export interface ListSectionsResponse {
  sections: Section[];
  count: number;
  lastEvaluatedKey?: Record<string, unknown>;
}