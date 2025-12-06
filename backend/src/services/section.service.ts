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
  Resume,
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

    if (params.resumeId && params.type) {
      // Query sections for specific resume and type
      result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `SECTION#${params.resumeId}#${params.type}`,
        },
        Limit: limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      });
    } else if (params.resumeId) {
      // Query all sections for specific resume
      result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': `SECTION#${params.resumeId}#`,
        },
        Limit: limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      });
    } else if (params.type) {
      // Use GSI2 to query by section type across all resumes
      result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        FilterExpression: 'sectionType = :type',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'SECTION#',
          ':type': params.type,
        },
        Limit: limit,
        ExclusiveStartKey: params.exclusiveStartKey,
      });
    } else if (params.tags) {
      // Use GSI1 to query by tags
      const tagList = params.tags.split(',').sort().join('#');
      result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
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
      result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
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
      section = await DynamoDBUtil.getItem<Section>(TableNames.SECTIONS, {
        PK: `USER#${userId}`,
        SK: `SECTION#${resumeId}#${sectionType}#${sectionId}`,
      });
    } else {
      // Query all sections and find matching sectionId
      const result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
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
  ): Promise<Section> {
    const { resumeId, title, sectionType, tags = [], data } = request;

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
      title,
      userId,
      resumeId,
      sectionType,
      tags,
      data: data || {}, // Flexible JSON data
      createdAt: now,
      updatedAt: now,
    };

    await DynamoDBUtil.putItem(TableNames.SECTIONS, section as unknown as Record<string, unknown>);

    return DynamoDBUtil.stripInternalFields(section as unknown as Record<string,unknown>);
  }

  /**
   * Update an existing section
   */
  static async updateSection(
    userId: string,
    sectionId: string,
    request: UpdateSectionRequest
  ): Promise<Section> {
    // Find the section (we need sectionType and resumeId for the SK)
    const result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
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

    if(request.title){
      updates.title = request.title;
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
      TableNames.SECTIONS,
      {
        PK: existing.PK,
        SK: existing.SK,
      },
      updates
    );

    return DynamoDBUtil.stripInternalFields(updated as unknown as Record<string,unknown>);
  }

  /**
   * Change section type (requires recreation due to SK structure)
   */
  static async changeSectionType(
    userId: string,
    sectionId: string,
    oldType: string,
    newType: string
  ): Promise<Section> {
    const result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': `SECTION#`,
      },
    });

    const existing = result.items.find((s) => s.sectionId === sectionId && s.sectionType === oldType);

    if (!existing) {
      throw new Error('Section not found');
    }

    const newSectionId = uuidv4().split('-')[0];
    const now = new Date().toISOString();
    const timestamp = Date.now();

    const newSection: Section = {
      PK: existing.PK,
      SK: `SECTION#${existing.resumeId}#${newType}#${newSectionId}`,
      GSI1PK: existing.GSI1PK,
      GSI1SK: existing.GSI1SK,
      GSI2PK: `SECTION#${existing.resumeId}#${newType}`,
      GSI2SK: `CREATED#${timestamp}`,
      sectionId: newSectionId,
      title: existing.title,
      userId: existing.userId,
      resumeId: existing.resumeId,
      sectionType: newType,
      tags: existing.tags,
      data: existing.data,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    await DynamoDBUtil.deleteItem(TableNames.SECTIONS, {
      PK: existing.PK,
      SK: existing.SK,
    });

    await DynamoDBUtil.putItem(TableNames.SECTIONS, newSection as unknown as Record<string, unknown>);

    return DynamoDBUtil.stripInternalFields(newSection as unknown as Record<string, unknown>);
  }

  /**
   * Delete a section
   */
  static async deleteSection(userId: string, sectionId: string): Promise<void> {
    // Find the section (we need sectionType and resumeId for the SK)
    const result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
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

    await DynamoDBUtil.deleteItem(TableNames.SECTIONS, {
      PK: existing.PK,
      SK: existing.SK,
    });

    const resume = await DynamoDBUtil.getItem<Resume>(TableNames.RESUMES, {
      PK: `USER#${userId}`,
      SK: `RESUME#${existing.resumeId}`,
    });

    if (resume && resume.sections) {
      const sectionType = existing.sectionType;
      const sectionIds = resume.sections[sectionType] || [];
      const filteredIds = sectionIds.filter((id: string) => id !== sectionId);
      let updatedItems = {
        sections: {}
      }
      updatedItems.sections[sectionType] = filteredIds;

      await DynamoDBUtil.updateItem(
        TableNames.RESUMES,
        {
          PK: `USER#${userId}`,
          SK: `RESUME#${existing.resumeId}`,
        },
        updatedItems
      );
    }
  }

  /**
   * Bulk read sections by IDs
   */
  static async bulkReadSections(
    userId: string,
    sectionIds: string[]
  ): Promise<Section[]> {
    if (sectionIds.length === 0) return [];

    // Query all sections for the user
    const allSections = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SECTION#',
      },
    });

    // Filter by the requested section IDs
    return allSections.items
      .filter(section => sectionIds.includes(section.sectionId))
      .map(section => DynamoDBUtil.stripInternalFields(section as unknown as Record<string, unknown>));
  }

  /**
   * Bulk read sections by resume and type
   */
  static async bulkReadResumeSections(
    userId: string,
    resumeId: string,
    sectionTypes?: string[]
  ): Promise<Record<string, Section[]>> {
    if (sectionTypes && sectionTypes.length > 0) {
      // Query specific section types
      const promises = sectionTypes.map(async (sectionType) => {
        const result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
          IndexName: 'GSI2',
          KeyConditionExpression: 'GSI2PK = :pk',
          ExpressionAttributeValues: {
            ':pk': `SECTION#${resumeId}#${sectionType}`,
          },
        });

        return {
          sectionType,
          sections: result.items.map(section =>
            DynamoDBUtil.stripInternalFields(section as unknown as Record<string, unknown>) as Section
          )
        };
      });

      const results = await Promise.all(promises);
      const sectionsByType: Record<string, Section[]> = {};

      results.forEach(({ sectionType, sections }) => {
        sectionsByType[sectionType] = sections;
      });

      return sectionsByType;
    } else {
      // Query all sections for the resume
      const result = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': `SECTION#${resumeId}#`,
        },
      });

      const sectionsByType: Record<string, Section[]> = {};

      result.items.forEach(section => {
        const cleanSection = DynamoDBUtil.stripInternalFields(section as unknown as Record<string, unknown>);
        if (!sectionsByType[section.sectionType]) {
          sectionsByType[section.sectionType] = [];
        }
        sectionsByType[section.sectionType].push(cleanSection as Section);
      });

      return sectionsByType;
    }
  }

  /**
   * Bulk create sections for a resume
   */
  static async bulkCreateSections(
    userId: string,
    resumeId: string,
    sectionsData: Record<string, CreateSectionRequest[]>
  ): Promise<Record<string, string[]>> {
    const sections: Record<string, string[]> = {};
    const sectionItems: any[] = [];
    const now = new Date().toISOString();
    const timestamp = Date.now();

    for (const [sectionType, sectionRequests] of Object.entries(sectionsData)) {
      sections[sectionType] = [];

      for (const sectionRequest of sectionRequests) {
        const sectionId = uuidv4().split('-')[0];
        sections[sectionType].push(sectionId);

        const sortedTags = (sectionRequest.tags || []).sort().join('#');
        const sectionItem = {
          PK: `USER#${userId}`,
          SK: `SECTION#${resumeId}#${sectionType}#${sectionId}`,
          GSI1PK: `SECTION#${userId}`,
          GSI1SK: `TAGS#${sortedTags}`,
          GSI2PK: `SECTION#${resumeId}#${sectionType}`,
          GSI2SK: `CREATED#${timestamp}`,
          sectionId,
          title: sectionRequest.title,
          userId,
          resumeId,
          sectionType,
          tags: sectionRequest.tags || [],
          data: sectionRequest.data || {},
          createdAt: now,
          updatedAt: now,
        };

        sectionItems.push(sectionItem);
      }
    }

    if (sectionItems.length > 0) {
      await DynamoDBUtil.batchCreateItems(TableNames.SECTIONS, sectionItems);
    }

    return sections;
  }

  /**
   * Bulk update sections
   */
  static async bulkUpdateSections(
    userId: string,
    updates: Array<{sectionId: string, data: Partial<UpdateSectionRequest>}>
  ): Promise<void> {
    if (updates.length === 0) return;

    // Get all sections to find their PK/SK
    const allSections = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SECTION#',
      },
    });

    const sectionUpdates: Array<{key: {PK: string, SK: string}, update: Record<string, unknown>}> = [];

    for (const update of updates) {
      const existingSection = allSections.items.find(s => s.sectionId === update.sectionId);
      if (!existingSection) continue;

      const updateData: Record<string, unknown> = {};

      if (update.data.title) updateData.title = update.data.title;
      if (update.data.data) updateData.data = update.data.data;
      if (update.data.tags) {
        updateData.tags = update.data.tags;
        updateData.GSI1SK = `TAGS#${update.data.tags.sort().join('#')}`;
      }

      sectionUpdates.push({
        key: {
          PK: existingSection.PK,
          SK: existingSection.SK
        },
        update: updateData
      });
    }

    if (sectionUpdates.length > 0) {
      await DynamoDBUtil.batchUpdateItems(TableNames.SECTIONS, sectionUpdates);
    }
  }

  /**
   * Bulk delete all sections for a resume
   */
  static async bulkDeleteResumeSections(
    userId: string,
    resumeId: string
  ): Promise<void> {
    const sections = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': `SECTION#${resumeId}#`
      }
    });

    if (sections.items.length === 0) return;

    const deleteRequests = sections.items.map(section => ({
      DeleteRequest: {
        Key: {
          PK: section.PK,
          SK: section.SK
        }
      }
    }));

    await DynamoDBUtil.batchWriteItems(TableNames.SECTIONS, deleteRequests);
  }

  /**
   * Bulk create and update sections for resume update
   */
  static async bulkProcessResumeSections(
    userId: string,
    resumeId: string,
    sectionsData: Record<string, UpdateSectionRequest[]>,
  ): Promise<Record<string, string[]>> {
    const sections: Record<string, string[]> = {};
    const sectionCreates: any[] = [];
    const sectionUpdates: Array<{key: {PK: string, SK: string}, update: Record<string, unknown>}> = [];
    const typeChanges: Array<{oldType: string, newType: string, sectionId: string}> = [];

    const now = new Date().toISOString();
    const timestamp = Date.now();

    const existingSectionIds: string[] = [];
    for (const updateRequests of Object.values(sectionsData)) {
      for (const updateRequest of updateRequests) {
        if (updateRequest.sectionId) {
          existingSectionIds.push(updateRequest.sectionId);
        }
      }
    }

    const existingSectionsMap = new Map<string, any>();
    if (existingSectionIds.length > 0) {
      const allSections = await DynamoDBUtil.queryItems<Section>(TableNames.SECTIONS, {
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'SECTION#',
        },
      });

      allSections.items.forEach(section => {
        if (existingSectionIds.includes(section.sectionId)) {
          existingSectionsMap.set(section.sectionId, section);
        }
      });
    }

    for (const [sectionType, updateRequests] of Object.entries(sectionsData)) {
      sections[sectionType] = [];

      for (const updateRequest of updateRequests) {
        if (existingSectionsMap.get(updateRequest.sectionId ?? "")) {
          if (updateRequest.sectionType && updateRequest.sectionType !== sectionType) {
            typeChanges.push({
              oldType: sectionType,
              newType: updateRequest.sectionType,
              sectionId: updateRequest.sectionId
            });
            sections[updateRequest.sectionType] = sections[updateRequest.sectionType] || [];
          } else {
            const existingSection = existingSectionsMap.get(updateRequest.sectionId);
            if (existingSection) {
              const updateData: Record<string, unknown> = {};

              if (updateRequest.title) updateData.title = updateRequest.title;
              if (updateRequest.data) updateData.data = updateRequest.data;
              if (updateRequest.tags) {
                updateData.tags = updateRequest.tags;
                updateData.GSI1SK = `TAGS#${updateRequest.tags.sort().join('#')}`;
              }

              sectionUpdates.push({
                key: {
                  PK: existingSection.PK,
                  SK: existingSection.SK
                },
                update: updateData
              });
              sections[sectionType].push(updateRequest.sectionId);
            }
          }
        } else {
          const sectionId = uuidv4().split('-')[0];
          sections[sectionType].push(sectionId);

          const sortedTags = (updateRequest.tags || []).sort().join('#');
          const sectionItem = {
            PK: `USER#${userId}`,
            SK: `SECTION#${resumeId}#${sectionType}#${sectionId}`,
            GSI1PK: `SECTION#${userId}`,
            GSI1SK: `TAGS#${sortedTags}`,
            GSI2PK: `SECTION#${resumeId}#${sectionType}`,
            GSI2SK: `CREATED#${timestamp}`,
            sectionId,
            title: updateRequest.title,
            userId,
            resumeId,
            sectionType,
            tags: updateRequest.tags || [],
            data: updateRequest.data || {},
            createdAt: now,
            updatedAt: now,
          };

          sectionCreates.push(sectionItem);
        }
      }
    }

    const batchPromises: Promise<void>[] = [];
    
    console.log("Section creates: ",sectionCreates);
    console.log("Section updates: ",sectionUpdates);

    if (sectionCreates.length > 0) {
      batchPromises.push(DynamoDBUtil.batchCreateItems(TableNames.SECTIONS, sectionCreates));
    }

    if (sectionUpdates.length > 0) {
      batchPromises.push(DynamoDBUtil.batchUpdateItems(TableNames.SECTIONS, sectionUpdates));
    }
    await Promise.all(batchPromises);

    for (const change of typeChanges) {
      const updated = await this.changeSectionType(
        userId,
        change.sectionId,
        change.oldType,
        change.newType
      );
      sections[change.newType].push(updated.sectionId);
    }

    return sections;
  }
}
