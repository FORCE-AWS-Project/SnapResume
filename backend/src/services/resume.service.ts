/**
 * Resume Service
 * Business logic for resume operations
 */

import { v4 as uuidv4 } from 'uuid';
import { DynamoDBUtil } from '../utils';
import { TableNames, Limits } from '../constants';
import {
  Resume,
  CreateResumeRequest,
  UpdateResumeRequest,
  ListResumesParams,
  ResumeSummary,
  FullResume,
} from '../models';
import { SectionService } from './section.service';
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
   * Create a new resume
   */
  static async createResume(
    userId: string,
    data: CreateResumeRequest
  ): Promise<Resume> {
    const resumeId = uuidv4().split('-')[0];
    const now = new Date().toISOString();
    const timestamp = Date.now();

    const sections = data.sections
      ? await SectionService.bulkCreateSections(userId, resumeId, data.sections)
      : {};

    const resume: Resume = {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `UPDATED#${timestamp}`,
      resumeId,
      userId,
      name: data.name,
      templateId: data.templateId,
      sections,
      metadata: data.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    await DynamoDBUtil.putItem<Resume>(TableNames.RESUMES, resume);

    return DynamoDBUtil.stripInternalFields<Resume>((await this.getResume(userId,resumeId)) as unknown as Record<string,unknown>);
  }

  /**
   * Update an existing resume
   */
  static async updateResume(
    userId: string,
    resumeId: string,
    data: UpdateResumeRequest
  ): Promise<Resume> {
    const existing = await this.getResume(userId, resumeId);

    if (!existing) {
      throw new Error('Resume not found');
    }

    const sections = data.sections
      ? await SectionService.bulkProcessResumeSections(userId, resumeId, data.sections)
      : undefined;

    const updates: Record<string, unknown> = {};
    const allowedFields: (keyof UpdateResumeRequest)[] = [
      'name',
      'metadata',
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });

    if (sections) {
      updates.sections = sections;
    }

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

    return DynamoDBUtil.stripInternalFields<Resume>(updated as unknown as Record<string,unknown>);
  }

  /**
   * Get full resume with sections
   */
  static async getFullResume(userId: string, resumeId: string): Promise<FullResume | null> {
    const resume = await this.getResume(userId, resumeId);

    if (!resume) {
      return null;
    }

    const data = {};

    if (resume.sections) {
      const allSectionIds: string[] = [];
      for (const sectionIds of Object.values(resume.sections)) {
        allSectionIds.push(...sectionIds);
      }

      const allSections = await SectionService.bulkReadSections(userId, allSectionIds);

      for (const [sectionType, sectionIds] of Object.entries(resume.sections)) {
        data[sectionType] = allSections.filter(section =>
          sectionIds.includes(section.sectionId) && section.sectionType === sectionType
        );
      }
    }

    return {
      ...resume,
      data,
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

    // Delete all sections for the resume
    await SectionService.bulkDeleteResumeSections(userId, resumeId);

    // Delete the resume
    await DynamoDBUtil.deleteItem(TableNames.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${resumeId}`
    });
  }
}
