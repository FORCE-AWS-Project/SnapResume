import { config } from "dotenv";

config()

export const Limits = {
  // Pagination
  DEFAULT_PAGE_LIMIT: 20,
  MAX_PAGE_LIMIT: 100,
  MAX_SECTIONS_LIMIT: 50,

  // Resume
  MAX_RESUMES_PER_USER: 100,
  MAX_SECTIONS_PER_RESUME: 50,

  // Sections
  MAX_SECTIONS_PER_TYPE: 20, // Generic limit for any section type

  // Text lengths
  MAX_NAME_LENGTH: 200,
  MAX_SECTION_TYPE_LENGTH: 50,
  MAX_TAGS_PER_SECTION: 20,
} as const;

export const BedrockConfig = {
  MODEL_ID: 'amazon.nova-pro-v1:0',
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  MIN_MATCH_SCORE: 60,
} as const;

export const DateFormats = {
  ISO_DATE: 'YYYY-MM-DD',
  MONTH_YEAR: 'YYYY-MM',
  DATE_REGEX: /^\d{4}-\d{2}(-\d{2})?$/,
} as const;

export const TableNames = {
  SECTIONS: process.env.DYNAMODB_SECTIONS_TABLE || '',
  RESUMES: process.env.DYNAMODB_RESUMES_TABLE || '',
  TEMPLATES: process.env.DYNAMODB_TEMPLATES_TABLE || '',
  USERS: process.env.DYNAMODB_USERS_TABLE || '',
} as const;

export const AWS_CONFIG = {
  REGION: process.env.REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET || '',
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || '',
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || '',
  ACCESS_KEY: process.env.ACCESS_KEY || "",
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY || ""
} as const;
