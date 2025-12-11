/**
 * Schema Validator Utility
 * Validates section data against template schemas using Joi
 */

import Joi from 'joi';
import { AWS_CONFIG } from '../constants';
import {
  SectionSchema,
  ArrayFieldSchema,
  ObjectFieldSchema,
  FieldDefinition,
} from '../models/schema.model';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class SchemaValidator {
  /**
   * Validate section data against template schema
   * @param data - Section data to validate
   * @param schema - Template schema definition
   * @returns Validation result with errors if any
   */
  static validate(data: unknown, schema: SectionSchema): ValidationResult {
    const joiSchema = this.convertToJoiSchema(schema);
    const { error } = joiSchema.validate(data, { abortEarly: false });

    if (error) {
      return {
        valid: false,
        errors: error.details.map((detail) => detail.message),
      };
    }

    return {
      valid: true,
      errors: [],
    };
  }

  /**
   * Convert our template schema to Joi schema
   */
  private static convertToJoiSchema(schema: SectionSchema): Joi.Schema {
    if (schema.type === 'object') {
      return this.convertObjectSchema(schema as ObjectFieldSchema);
    } else {
      return this.convertArraySchema(schema as ArrayFieldSchema);
    }
  }

  /**
   * Convert object field schema to Joi object schema
   */
  private static convertObjectSchema(schema: ObjectFieldSchema): Joi.ObjectSchema {
    const joiFields: Record<string, Joi.Schema> = {};

    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      joiFields[fieldName] = this.convertFieldDefinition(fieldDef);
    }

    let objectSchema = Joi.object(joiFields);

    if (schema.required) {
      objectSchema = objectSchema.required();
    }

    return objectSchema;
  }

  /**
   * Convert array field schema to Joi array schema
   */
  private static convertArraySchema(schema: ArrayFieldSchema): Joi.ArraySchema {
    const itemFields: Record<string, Joi.Schema> = {};

    for (const [fieldName, fieldDef] of Object.entries(schema.itemSchema)) {
      itemFields[fieldName] = this.convertFieldDefinition(fieldDef);
    }

    return Joi.array()
      .items(Joi.object(itemFields))
      .min(schema.minItems)
      .max(schema.maxItems);
  }

  /**
   * Convert a field definition to Joi schema
   */
  private static convertFieldDefinition(fieldDef: FieldDefinition): Joi.Schema {
    switch (fieldDef.type) {
      case 'string':
      case 'text':
        return Joi.string();

      case 'link':
        return Joi.string().uri();

      case 'image':
        // Validate S3 URL format
        const s3Pattern = new RegExp(`^https://${AWS_CONFIG.S3_BUCKET}\\.s3\\.`);
        return Joi.string()
          .pattern(s3Pattern)
          .message('Image must be a valid S3 URL from our bucket');

      case 'date':
        // Allow YYYY-MM-DD or YYYY-MM format
        return Joi.string()
          .pattern(/^\d{4}-\d{2}(-\d{2})?$/)
          .message('Date must be in YYYY-MM-DD or YYYY-MM format');

      case 'number':
        return Joi.number();

      case 'boolean':
        return Joi.boolean();

      case 'array':
        if (fieldDef.items?.type === 'string') {
          return Joi.array().items(Joi.string());
        }
        return Joi.array();

      case 'object':
        return Joi.object();

      default:
        return Joi.any();
    }
  }
}
