/**
 * Section Service
 * Business logic for section operations
 * Supports flexible sections with any JSON data structure
 */

import { v4 as uuidv4 } from 'uuid';
import { DynamoDBUtil } from '../utils';
import { TableNames, Limits } from '../constants';
import {
  Section,
  CreateSectionRequest,
  UpdateSectionRequest,
  ListSectionsParams,
  ListSectionsResponse,
  CreateSectionResponse,
  UpdateSectionResponse,
} from '../models';

export class SectionService {
  /**
   * List all sections for a user
   */
  static async listSections(
    userId: string,
    params: ListSectionsParams = {}
  ): Promise<ListSectionsResponse> {
    const limit = Math.min(
      params.limit || Limits.DEFAULT_PAGE_LIMIT,
      Limits.MAX_PAGE_LIMIT
    );

    let result;

    if (params.type) {
      // Use GSI2 to query by section type
      result = await DynamoDBUtil.queryItems<Section>(TableNames.MAIN, {
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `SECTION#${userId}#${params.type}`,
        },
        Limit: limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      });
    } else if (params.tags) {
      // Use GSI1 to query by tags
      const tagList = params.tags.split(',').sort().join('#');
      result = await DynamoDBUtil.queryItems<Section>(TableNames.MAIN, {
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :tags)',
        ExpressionAttributeValues: {
          ':pk': `SECTION#${userId}`,
          ':tags': `TAGS#${tagList}`,
        },
        Limit: limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      });
    } else {
      // Query all sections for user
      result = await DynamoDBUtil.queryItems<Section>(TableNames.MAIN, {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'SECTION#',
        },
        Limit: limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      });
    }

    // Remove internal fields and convert to Section type
    const sections = result.items.map((item) =>
      DynamoDBUtil.stripInternalFields<Section>(item as unknown as Record<string, unknown>)
    );

    return {
      sections,
      count: result.count,
      lastEvaluatedKey: result.lastEvaluatedKey,
    };
  }

  /**
   * Get section by ID
   */
  static async getSection(
    userId: string,
    sectionId: string,
    sectionType?: string,
    resumeId?: string
  ): Promise<Section | null> {
    let section: Section | null;

    if (sectionType && resumeId) {
      // Direct get if section type and resumeId are provided
      section = await DynamoDBUtil.getItem<Section>(TableNames.MAIN, {
        PK: `USER#${userId}`,
        SK: `SECTION#${resumeId}#${sectionType}#${sectionId}`,
      });
    } else {
      // Query all sections and find matching sectionId
      const result = await DynamoDBUtil.queryItems<Section>(TableNames.MAIN, {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'SECTION#',
        },
      });
      section = result.items.find((s) => s.sectionId === sectionId) || null;
    }

    if (!section) {
      return null;
    }

    // Remove internal fields
    return DynamoDBUtil.stripInternalFields<Section>(section as unknown as Record<string, unknown>);
  }

  /**
   * Create a new section
   */
  static async createSection(
    userId: string,
    request: CreateSectionRequest
  ): Promise<CreateSectionResponse> {
    const { resumeId, sectionType, tags = [], data } = request;

    // Basic validation
    if (!resumeId || resumeId.trim().length === 0) {
      throw new Error('Resume ID is required');
    }

    if (!sectionType || sectionType.trim().length === 0) {
      throw new Error('Section type is required');
    }

    if (sectionType.length > Limits.MAX_SECTION_TYPE_LENGTH) {
      throw new Error(`Section type must be less than ${Limits.MAX_SECTION_TYPE_LENGTH} characters`);
    }

    if (tags.length > Limits.MAX_TAGS_PER_SECTION) {
      throw new Error(`Cannot have more than ${Limits.MAX_TAGS_PER_SECTION} tags`);
    }

    const sectionId = uuidv4().split('-')[0];
    const now = new Date().toISOString();
    const timestamp = Date.now();

    // Sort tags for consistent GSI1SK
    const sortedTags = tags.sort().join('#');

    const section: Section = {
      PK: `USER#${userId}`,
      SK: `SECTION#${resumeId}#${sectionType}#${sectionId}`,
      GSI1PK: `SECTION#${userId}`,
      GSI1SK: `TAGS#${sortedTags}`,
      GSI2PK: `SECTION#${resumeId}#${sectionType}`,
      GSI2SK: `CREATED#${timestamp}`,
      sectionId,
      userId,
      resumeId,
      sectionType,
      tags,
      data: data || {}, // Flexible JSON data
      createdAt: now,
      updatedAt: now,
    };

    await DynamoDBUtil.putItem(TableNames.MAIN, section as unknown as Record<string, unknown>);

    return {
      sectionId,
      createdAt: now,
    };
  }

  /**
   * Update an existing section
   */
  static async updateSection(
    userId: string,
    sectionId: string,
    request: UpdateSectionRequest
  ): Promise<UpdateSectionResponse> {
    // Find the section (we need sectionType and resumeId for the SK)
    const result = await DynamoDBUtil.queryItems<Section>(TableNames.MAIN, {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SECTION#',
      },
    });

    const existing = result.items.find((s) => s.sectionId === sectionId);

    if (!existing) {
      throw new Error('Section not found');
    }

    // Build updates object
    const updates: Record<string, unknown> = {};

    // Update data if provided
    if (request.data) {
      updates.data = request.data;
    }

    // Update tags if provided
    if (request.tags) {
      if (request.tags.length > Limits.MAX_TAGS_PER_SECTION) {
        throw new Error(`Cannot have more than ${Limits.MAX_TAGS_PER_SECTION} tags`);
      }
      updates.tags = request.tags;
      // Update GSI1SK for tag-based queries
      const sortedTags = request.tags.sort().join('#');
      updates.GSI1SK = `TAGS#${sortedTags}`;
    }

    const updated = await DynamoDBUtil.updateItem<Section>(
      TableNames.MAIN,
      {
        PK: existing.PK,
        SK: existing.SK,
      },
      updates
    );

    return {
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Delete a section
   */
  static async deleteSection(userId: string, sectionId: string): Promise<void> {
    // Find the section (we need sectionType and resumeId for the SK)
    const result = await DynamoDBUtil.queryItems<Section>(TableNames.MAIN, {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SECTION#',
      },
    });

    const existing = result.items.find((s) => s.sectionId === sectionId);

    if (!existing) {
      throw new Error('Section not found');
    }

    await DynamoDBUtil.deleteItem(TableNames.MAIN, {
      PK: existing.PK,
      SK: existing.SK,
    });
  }
}
