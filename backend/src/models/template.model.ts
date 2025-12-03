import { InputDataSchema } from './schema.model';

export interface Template {
  PK?: string; 
  SK?: string;
  GSI1PK?: string;
  GSI1SK?: string;
  templateId: string;
  name: string;
  category: string;
  templateFileUrl: string;
  previewImageUrl: string;
  inputDataSchema: InputDataSchema;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSummary {
  templateId: string;
  name: string;
  category: string;
  previewImageUrl: string;
  createdAt: string;
}

export interface CreateTemplateRequest {
  templateId: string;
  name: string;
  category: string;
  templateFileUrl: string;
  previewImageUrl: string;
  inputDataSchema: InputDataSchema;
}

export interface ListTemplatesParams {
  category?: string;
}

export interface ListTemplatesResponse {
  templates: TemplateSummary[];
  count: number;
}
