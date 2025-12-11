/**
 * DynamoDB Key Mapper Utility
 * Handles mapping between clean domain models and DynamoDB items with keys
 */

import { Section } from '../models/section.model';
import { Resume } from '../models/resume.model';
import { Template } from '../models/template.model';
import { User } from '../models/user.model';

/**
 * Maps domain models to/from DynamoDB items
 * Handles PK, SK, and GSI key generation/removal
 */
export class DBMapper {
  /**
   * Section Mappers
   */
  static toSectionDBItem(section: Section): Record<string, unknown> {
    const timestamp = Date.now();
    return {
      ...section,
      PK: `USER#${section.userId}`,
      SK: `SECTION#${section.resumeId}#${section.sectionType}#${section.sectionId}`,
      GSI1PK: `SECTION#${section.userId}`,
      GSI1SK: `TAGS#${section.tags.sort().join('#')}`,
      GSI2PK: `SECTION#${section.resumeId}#${section.sectionType}`,
      GSI2SK: `CREATED#${timestamp}`,
    };
  }

  static fromSectionDBItem(item: Record<string, unknown>): Section {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...section } = item;
    return section as unknown as Section;
  }

  /**
   * Resume Mappers
   */
  static toResumeDBItem(resume: Resume): Record<string, unknown> {
    const timestamp = Date.now();
    return {
      ...resume,
      PK: `USER#${resume.userId}`,
      SK: `RESUME#${resume.resumeId}`,
      GSI1PK: `USER#${resume.userId}`,
      GSI1SK: `UPDATED#${timestamp}`,
    };
  }

  static fromResumeDBItem(item: Record<string, unknown>): Resume {
    const { PK, SK, GSI1PK, GSI1SK, ...resume } = item;
    return resume as unknown as Resume;
  }

  /**
   * Template Mappers
   */
  static toTemplateDBItem(template: Template): Record<string, unknown> {
    return {
      ...template,
      PK: `TEMPLATE#${template.templateId}`,
      SK: 'METADATA',
      GSI1PK: `CATEGORY#${template.category}`,
      GSI1SK: `NAME#${template.name}`,
    };
  }

  static fromTemplateDBItem(item: Record<string, unknown>): Template {
    const { PK, SK, GSI1PK, GSI1SK, ...template } = item;
    return template as unknown as Template;
  }

  /**
   * User Mappers
   */
  static toUserDBItem(user: User): Record<string, unknown> {
    return {
      ...user,
      PK: `USER#${user.userId}`,
      SK: 'PROFILE',
    };
  }

  static fromUserDBItem(item: Record<string, unknown>): User {
    const { PK, SK, ...user } = item;
    return user as unknown as User;
  }

  /**
   * Helper to strip all DynamoDB internal fields from any item
   */
  static stripDBKeys<T>(item: Record<string, unknown>): T {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...clean } = item;
    return clean as T;
  }
}
