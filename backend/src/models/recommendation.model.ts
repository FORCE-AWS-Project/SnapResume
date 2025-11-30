/**
 * Recommendation Model Types
 */

export interface SectionRecommendation {
  sectionId: string;
  matchScore: number;
  matchedKeywords: string[];
  reason: string;
}

export interface RecommendationsByType {
  experience?: SectionRecommendation[];
  education?: SectionRecommendation[];
  skills?: SectionRecommendation[];
  projects?: SectionRecommendation[];
  certifications?: SectionRecommendation[];
}

export interface RecommendationAnalysis {
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface RecommendationResponse {
  recommendations: RecommendationsByType;
  overallMatchScore: number;
  suggestedResumeName: string;
  analysis: RecommendationAnalysis;
}

export interface GetRecommendationsRequest {
  jobDescription: string;
  resumeId?: string;
}
