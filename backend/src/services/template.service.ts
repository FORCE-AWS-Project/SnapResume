/**
 * Template Service
 * Business logic for template operations
 */

import { DynamoDBUtil } from '../utils';
import { TableNames } from '../constants';
import { Template, TemplateSummary, ListTemplatesParams } from '../models';

export class TemplateService {
  /**
   * List all templates
   */
  static async listTemplates(
    params: ListTemplatesParams = {}
  ): Promise<{ templates: TemplateSummary[]; count: number }> {
    let result;

    if (params.category) {
      // Use GSI1 to query by category
      result = await DynamoDBUtil.queryItems<Template>(TableNames.TEMPLATES, {
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :category',
        ExpressionAttributeValues: {
          ':category': `CATEGORY#${params.category}`,
        },
      });
    } else {
      // For listing all templates, we need a known list
      // In production, you'd scan or have a dedicated GSI
      const knownTemplateIds = ['TPL_MODERN_001', 'TPL_CLASSIC_001', 'TPL_MINIMAL_001'];

      const items: Template[] = [];
      for (const templateId of knownTemplateIds) {
        const template = await DynamoDBUtil.getItem<Template>(TableNames.TEMPLATES, {
          PK: `TEMPLATE#${templateId}`,
          SK: 'METADATA',
        });
        if (template) {
          items.push(template);
        }
      }

      result = {
        items,
        count: items.length,
      };
    }

    // Remove internal fields and return only summary info
    const templates: TemplateSummary[] = result.items.map((item) =>
      DynamoDBUtil.stripInternalFields<TemplateSummary>(
        item as unknown as Record<string, unknown>
      )
    );

    return {
      templates,
      count: result.count,
    };
  }

  /**
   * Get template by ID
   */
  static async getTemplate(templateId: string): Promise<Template | null> {
    const template = await DynamoDBUtil.getItem<Template>(TableNames.TEMPLATES, {
      PK: `TEMPLATE#${templateId}`,
      SK: 'METADATA',
    });

    if (!template) {
      return null;
    }

    // Remove internal fields
    return DynamoDBUtil.stripInternalFields<Template>(
      template as unknown as Record<string, unknown>
    );
  }
}
