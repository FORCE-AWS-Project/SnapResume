/**
 * Template Schema Model Types
 * Based on CLAUDE.md specifications
 */

export type FieldType =
  | 'string'
  | 'text'
  | 'link'
  | 'date'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'image';

export interface FieldDefinition {
  type: FieldType;
  title: string;
  items?: {
    type: string;
  };
}

export interface ObjectFieldSchema {
  type: 'object';
  required: boolean;
  fields: Record<string, FieldDefinition>;
}

export interface ArrayFieldSchema {
  type: 'array';
  title: string;
  minItems: number;
  maxItems: number;
  itemSchema: Record<string, FieldDefinition>;
}

export type SectionSchema = ObjectFieldSchema | ArrayFieldSchema;

export type InputDataSchema = Record<string, SectionSchema>;
