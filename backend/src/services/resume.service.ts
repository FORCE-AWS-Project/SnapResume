/**
 * Resume Service
 * Business logic for resume operations
 */

import { v4 as uuidv4 } from 'uuid';
import { DynamoDBUtil } from '../utils';
import { TableNames, Limits } from '../constants';
import {
  Resume,
  Section,
  CreateResumeRequest,
  UpdateResumeRequest,
  ListResumesParams,
  ResumeSummary,
  FullResume,
  ResumeData,
} from '../models';
import { UserService } from './user.service';
import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export class ResumeService {
  /**
   * List all resumes for a user
   */
  static async listResumes(
    userId: string,
    params: ListResumesParams = {}
  ): Promise<{ resumes: ResumeSummary[]; count: number; lastKey?: string }> {
    const limit = Math.min(
      params.limit || Limits.DEFAULT_PAGE_LIMIT,
      Limits.MAX_PAGE_LIMIT
    );

    const queryParams: Omit<QueryCommandInput, 'TableName'> = {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'RESUME#',
      },
      Limit: limit,
    };

    if (params.lastKey) {
      queryParams.ExclusiveStartKey = JSON.parse(
        Buffer.from(params.lastKey, 'base64').toString()
      );
    }

    const result = await DynamoDBUtil.queryItems<Resume>(
      TableNames.RESUMES,
      queryParams
    );

    // Remove internal fields
    const resumes: ResumeSummary[] = result.items.map((item) =>
      DynamoDBUtil.stripInternalFields<ResumeSummary>(
        item as unknown as Record<string, unknown>
      )
    );

    const response: { resumes: ResumeSummary[]; count: number; lastKey?: string } = {
      resumes,
      count: result.count,
    };

    if (result.lastEvaluatedKey) {
      response.lastKey = Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString(
        'base64'
      );
    }

    return response;
  }

  /**
   * Get resume by ID
   */
  static async getResume(userId: string, resumeId: string): Promise<Resume | null> {
    const resume = await DynamoDBUtil.getItem<Resume>(TableNames.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
    });

    if (!resume) {
      return null;
    }

    // Remove internal fields
    return DynamoDBUtil.stripInternalFields<Resume>(
      resume as unknown as Record<string, unknown>
    );
  }

  /**
   * Get full resume with all sections populated
   */
  static async getFullResume(
    userId: string,
    resumeId: string
  ): Promise<FullResume | null> {
    // Get resume metadata
    const resume = await this.getResume(userId, resumeId);

    if (!resume) {
      return null;
    }

    // Get user profile for personalInfo
    const profile = await UserService.getUserProfile(userId);

    // Collect all section IDs
    const allSectionIds: string[] = [];
    const sectionTypeMap: Record<string, string> = {};

    Object.entries(resume.sections || {}).forEach(([sectionType, sectionIds]) => {
      sectionIds?.forEach((sectionId: string) => {
        allSectionIds.push(sectionId);
        sectionTypeMap[sectionId] = sectionType;
      });
    });

    // Batch get all sections
    const sectionKeys = allSectionIds.map((sectionId) => ({
      PK: `USER#${userId}`,
      SK: `SECTION#${sectionTypeMap[sectionId]}#${sectionId}`,
    }));

    const sectionItems = await DynamoDBUtil.batchGetItems<Section>(
      TableNames.MAIN,
      sectionKeys
    );

    // Group sections by type
    const groupedSections: Record<string, unknown[]> = {};
    sectionItems.forEach((section) => {
      const cleanSection = DynamoDBUtil.stripInternalFields<Record<string, unknown>>(
        section as unknown as Record<string, unknown>
      );

      const sectionType = section.sectionType;
      if (!groupedSections[sectionType]) {
        groupedSections[sectionType] = [];
      }
      groupedSections[sectionType].push(cleanSection);
    });

    const data: ResumeData = {
      personalInfo: profile?.personalInfo || {},
      ...groupedSections,
    };

    const { sections, ...resumeMetadata } = resume;

    return {
      ...resumeMetadata,
      data,
    };
  }

  /**
   * Create a new resume
   */
  static async createResume(
    userId: string,
    data: CreateResumeRequest
  ): Promise<{ resumeId: string; createdAt: string }> {
    const resumeId = uuidv4().split('-')[0];
    const now = new Date().toISOString();
    const timestamp = Date.now();

    const resume: Resume = {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `UPDATED#${timestamp}`,
      resumeId,
      userId,
      name: data.name,
      templateId: data.templateId,
      sections: data.sections || {},
      metadata: data.metadata || {},
      styling: data.styling || {},
      createdAt: now,
      updatedAt: now,
    };

    await DynamoDBUtil.putItem<Resume>(TableNames.RESUMES, resume);

    return {
      resumeId,
      createdAt: now,
    };
  }

  /**
   * Update an existing resume
   */
  static async updateResume(
    userId: string,
    resumeId: string,
    data: UpdateResumeRequest
  ): Promise<{ updatedAt: string }> {
    // Check if resume exists
    const existing = await this.getResume(userId, resumeId);

    if (!existing) {
      throw new Error('Resume not found');
    }

    // Build updates object
    const updates: Record<string, unknown> = {};
    const allowedFields: (keyof UpdateResumeRequest)[] = [
      'name',
      'sections',
      'metadata',
      'styling',
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });

    // Update GSI1SK with new timestamp
    const timestamp = Date.now();
    updates.GSI1SK = `UPDATED#${timestamp}`;

    const updated = await DynamoDBUtil.updateItem<Resume>(
      TableNames.RESUMES,
      {
        PK: `USER#${userId}`,
        SK: `RESUME#${resumeId}`,
      },
      updates
    );

    return {
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Delete a resume
   */
  static async deleteResume(userId: string, resumeId: string): Promise<void> {
    // Check if resume exists
    const existing = await this.getResume(userId, resumeId);

    if (!existing) {
      throw new Error('Resume not found');
    }

    await DynamoDBUtil.deleteItem(TableNames.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
    });
  }
}
