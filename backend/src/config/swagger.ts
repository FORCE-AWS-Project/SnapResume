/**
 * Swagger/OpenAPI Configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SnapResume API',
    version: '1.0.0',
    description: 'API documentation for SnapResume - A CV making tool with AI-powered recommendations',
    contact: {
      name: 'SnapResume Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:3005',
      description: 'Development server',
    },
    {
      url: '{apiGatewayUrl}',
      description: 'Production server',
      variables: {
        apiGatewayUrl: {
          default: 'https://api.snapresume.com',
          description: 'API Gateway URL',
        },
      },
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'AWS Cognito access token. For local testing, use "test-user-id" as the token.',
      },
      LocalAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-user-id',
        description: 'User ID for local testing (bypasses auth in development)',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          data: {
            type: 'object',
            nullable: true,
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
          },
        },
      },
      PersonalInfo: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john.doe@example.com' },
          phone: { type: 'string', example: '+1-234-567-8900' },
          location: { type: 'string', example: 'San Francisco, CA' },
          linkedin: { type: 'string', example: 'https://linkedin.com/in/johndoe' },
          github: { type: 'string', example: 'https://github.com/johndoe' },
          portfolio: { type: 'string', example: 'https://johndoe.com' },
          summary: { type: 'string', example: 'Experienced software engineer...' },
        },
      },
      User: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: 'user_xyz789' },
          email: { type: 'string', example: 'john.doe@example.com' },
          personalInfo: { $ref: '#/components/schemas/PersonalInfo' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Section: {
        type: 'object',
        properties: {
          sectionId: { type: 'string', example: 'section_abc123' },
          userId: { type: 'string', example: 'user_xyz789' },
          resumeId: { type: 'string', example: 'resume_def456' },
          sectionType: { type: 'string', example: 'experience' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['backend', 'cloud', 'leadership'],
          },
          data: {
            type: 'object',
            example: {
              company: 'Tech Corp',
              position: 'Senior Software Engineer',
              startDate: '2020-01',
              endDate: '2023-12',
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Resume: {
        type: 'object',
        properties: {
          resumeId: { type: 'string', example: 'resume_abc123' },
          userId: { type: 'string', example: 'user_xyz789' },
          name: { type: 'string', example: 'Software Engineer Resume - Google' },
          templateId: { type: 'string', example: 'TPL_MODERN_001' },
          sections: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' },
            },
            example: {
              experience: ['exp_001', 'exp_002'],
              education: ['edu_001'],
              skills: ['skills_001', 'skills_002'],
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Template: {
        type: 'object',
        properties: {
          templateId: { type: 'string', example: 'TPL_MODERN_001' },
          name: { type: 'string', example: 'Modern Professional' },
          category: { type: 'string', example: 'professional' },
          templateFileUrl: {
            type: 'string',
            example: 'https://cdn.example.com/templates/modern-001.html',
          },
          previewImageUrl: {
            type: 'string',
            example: 'https://cdn.example.com/previews/modern-001.png',
          },
          inputDataSchema: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User profile management' },
    { name: 'Resumes', description: 'Resume management' },
    { name: 'Sections', description: 'Resume section management' },
    { name: 'Templates', description: 'Resume template operations' },
    { name: 'Recommendations', description: 'AI-powered section recommendations' },
  ],
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
