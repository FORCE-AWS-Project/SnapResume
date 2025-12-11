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
      // Field definition schemas
      FieldDefinition: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['string', 'text', 'link', 'date', 'number', 'boolean', 'array', 'object', 'image'],
            description: 'Data type of the field',
          },
          title: {
            type: 'string',
            description: 'Display name of the field',
          },
          items: {
            type: 'object',
            description: 'Schema for array items (only for array type)',
            properties: {
              type: { type: 'string' },
            },
          },
        },
        required: ['type', 'title'],
      },
      // Section schemas
      ObjectFieldSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['object'] },
          required: { type: 'boolean' },
          fields: {
            type: 'object',
            additionalProperties: { $ref: '#/components/schemas/FieldDefinition' },
          },
        },
        required: ['type', 'required', 'fields'],
      },
      ArrayFieldSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['array'] },
          title: { type: 'string' },
          minItems: { type: 'number' },
          maxItems: { type: 'number' },
          itemSchema: {
            type: 'object',
            additionalProperties: { $ref: '#/components/schemas/FieldDefinition' },
          },
        },
        required: ['type', 'title', 'minItems', 'maxItems', 'itemSchema'],
      },
      // Personal Info
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
          summary: { type: 'string', example: 'Experienced software engineer with 5+ years in full-stack development...' },
          customFields: {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: { twitter: 'https://twitter.com/johndoe' },
          },
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
      // Section with new structure
      Section: {
        type: 'object',
        properties: {
          sectionId: { type: 'string', example: 'section_abc123' },
          userId: { type: 'string', example: 'user_xyz789' },
          resumeId: { type: 'string', example: 'resume_def456' },
          sectionType: {
            type: 'string',
            example: 'experience',
            description: 'Type of section (experience, education, skills, projects, certifications, or custom)'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['backend', 'cloud', 'leadership'],
          },
          data: {
            type: 'object',
            description: 'Flexible data structure based on section type',
            example: {
              company: 'Tech Corp',
              position: 'Senior Software Engineer',
              location: 'San Francisco, CA',
              startDate: '2020-01',
              endDate: '2023-12',
              current: false,
              description: 'Led development of microservices platform...',
              achievements: [
                'Reduced API latency by 40%',
                'Mentored 5 junior developers'
              ],
              technologies: ['React', 'Node.js', 'AWS'],
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['sectionId', 'userId', 'resumeId', 'sectionType', 'tags', 'data'],
      },
      // Resume metadata
      ResumeMetadata: {
        type: 'object',
        properties: {
          keywords: {
            type: 'array',
            items: { type: 'string' },
            example: ['backend', 'cloud', 'leadership'],
            description: 'Keywords associated with the resume for search and AI matching'
          },
        },
      },
      ResumeStyling: {
        type: 'object',
        properties: {
          colorScheme: { type: 'string', example: 'blue' },
          fontFamily: { type: 'string', example: 'Inter' },
          fontSize: { type: 'number', example: 11 },
        },
      },
      // Resume with new structure
      Resume: {
        type: 'object',
        properties: {
          resumeId: { type: 'string', example: 'resume_abc123' },
          userId: { type: 'string', example: 'user_xyz789' },
          name: { type: 'string', example: 'Software Engineer Resume - Google' },
          templateId: { type: 'string', example: 'TPL_MODERN_001' },
          sections: {
            type: 'object',
            description: 'Mapping of section types to arrays of section IDs',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' },
            },
            example: {
              experience: ['exp_001', 'exp_002'],
              education: ['edu_001'],
              skills: ['skills_001', 'skills_002'],
              projects: ['proj_001'],
              certifications: ['cert_001'],
            },
          },
          metadata: { $ref: '#/components/schemas/ResumeMetadata' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['resumeId', 'userId', 'name', 'templateId', 'sections'],
      },
      // Full resume with combined data
      FullResume: {
        type: 'object',
        properties: {
          resumeId: { type: 'string', example: 'resume_abc123' },
          userId: { type: 'string', example: 'user_xyz789' },
          name: { type: 'string', example: 'Software Engineer Resume - Google' },
          templateId: { type: 'string', example: 'TPL_MODERN_001' },
          metadata: { $ref: '#/components/schemas/ResumeMetadata' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          data: {
            type: 'object',
            properties: {
              personalInfo: { $ref: '#/components/schemas/PersonalInfo' },
              experience: {
                type: 'array',
                items: { $ref: '#/components/schemas/Section' },
              },
              education: {
                type: 'array',
                items: { $ref: '#/components/schemas/Section' },
              },
              skills: {
                type: 'array',
                items: { $ref: '#/components/schemas/Section' },
              },
            },
          },
        },
      },
      // Template with new schema
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
          inputDataSchema: {
            type: 'object',
            description: 'Schema defining the structure of input data for this template',
            additionalProperties: {
              oneOf: [
                { $ref: '#/components/schemas/ObjectFieldSchema' },
                { $ref: '#/components/schemas/ArrayFieldSchema' },
              ],
            },
            example: {
              personalInfo: {
                type: 'object',
                required: true,
                fields: {
                  name: { type: 'string', title: 'Full Name' },
                  email: { type: 'string', title: 'Email Address' },
                },
              },
              experience: {
                type: 'array',
                title: 'Work Experience',
                minItems: 0,
                maxItems: 10,
                itemSchema: {
                  company: { type: 'string', title: 'Company Name' },
                  position: { type: 'string', title: 'Job Title' },
                },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['templateId', 'name', 'category', 'templateFileUrl', 'previewImageUrl', 'inputDataSchema'],
      },
      TemplateSummary: {
        type: 'object',
        properties: {
          templateId: { type: 'string', example: 'TPL_MODERN_001' },
          name: { type: 'string', example: 'Modern Professional' },
          category: { type: 'string', example: 'professional' },
          previewImageUrl: {
            type: 'string',
            example: 'https://cdn.example.com/previews/modern-001.png',
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['templateId', 'name', 'category', 'previewImageUrl', 'createdAt'],
      },
      // Recommendation schemas
      SectionRecommendation: {
        type: 'object',
        properties: {
          sectionId: { type: 'string', example: 'exp_001' },
          matchScore: { type: 'number', minimum: 0, maximum: 100, example: 85 },
          matchedKeywords: {
            type: 'array',
            items: { type: 'string' },
            example: ['microservices', 'AWS', 'Node.js'],
          },
          reason: { type: 'string', example: 'Strong match in backend technologies and cloud experience' },
        },
        required: ['sectionId', 'matchScore', 'matchedKeywords', 'reason'],
      },
      RecommendationsByType: {
        type: 'object',
        properties: {
          experience: {
            type: 'array',
            items: { $ref: '#/components/schemas/SectionRecommendation' },
          },
          education: {
            type: 'array',
            items: { $ref: '#/components/schemas/SectionRecommendation' },
          },
          skills: {
            type: 'array',
            items: { $ref: '#/components/schemas/SectionRecommendation' },
          },
          projects: {
            type: 'array',
            items: { $ref: '#/components/schemas/SectionRecommendation' },
          },
          certifications: {
            type: 'array',
            items: { $ref: '#/components/schemas/SectionRecommendation' },
          },
        },
      },
      RecommendationAnalysis: {
        type: 'object',
        properties: {
          strengths: {
            type: 'array',
            items: { type: 'string' },
            example: ['Strong backend experience', 'Cloud architecture skills'],
          },
          gaps: {
            type: 'array',
            items: { type: 'string' },
            example: ['Missing machine learning experience', 'No team leadership mentioned'],
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
            example: ['Add quantifiable achievements', 'Include leadership experience'],
          },
        },
        required: ['strengths', 'gaps', 'recommendations'],
      },
      RecommendationResponse: {
        type: 'object',
        properties: {
          recommendations: { $ref: '#/components/schemas/RecommendationsByType' },
          overallMatchScore: { type: 'number', minimum: 0, maximum: 100, example: 75 },
          suggestedResumeName: { type: 'string', example: 'Senior Backend Engineer Resume' },
          analysis: { $ref: '#/components/schemas/RecommendationAnalysis' },
        },
        required: ['recommendations', 'overallMatchScore', 'suggestedResumeName', 'analysis'],
      },
      // Request schemas
      CreateSectionRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Section title',
            example: 'Senior Software Engineer',
          },
          sectionType: {
            type: 'string',
            example: 'experience',
            description: 'Type of section (experience, education, skills, projects, certifications)'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['backend', 'cloud'],
            description: 'Tags for AI matching and search'
          },
          data: {
            type: 'object',
            description: 'Section data matching the template schema',
            example: {
              company: 'Tech Corp',
              position: 'Senior Software Engineer',
              startDate: '2020-01',
              current: true,
            },
          },
        },
        required: ['title', 'sectionType', 'data'],
      },
      UpdateSectionRequest: {
        type: 'object',
        properties: {
          sectionId: {
            type: 'string',
            description: 'Section ID (required for updating existing sections)',
            example: 'exp_001',
          },
          resumeId: {
            type: 'string',
            description: 'Resume ID (required for all section operations)',
            example: 'resume_def456',
          },
          title: {
            type: 'string',
            description: 'Section title',
            example: 'Senior Software Engineer',
          },
          sectionType: {
            type: 'string',
            description: 'New section type (optional, used to change section type)',
            example: 'project',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['backend', 'cloud', 'leadership'],
          },
          data: {
            type: 'object',
            description: 'Partial update of section data',
            example: {
              endDate: '2023-12',
              current: false,
            },
          },
        },
        required: ['resumeId'],
      },
      CreateResumeRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Software Engineer Resume' },
          templateId: { type: 'string', example: 'TPL_MODERN_001' },
          sections: {
            type: 'object',
            description: 'Initial sections to create (optional)',
            additionalProperties: {
              type: 'array',
              items: { $ref: '#/components/schemas/CreateSectionRequest' },
            },
            example: {
              experience: [{
                title: 'Senior Software Engineer',
                tags: ['backend', 'cloud'],
                data: {
                  company: 'Tech Corp',
                  position: 'Senior Software Engineer',
                  location: 'San Francisco, CA',
                  startDate: '2020-01',
                  endDate: '2023-12',
                  description: 'Led development of microservices platform...'
                }
              }],
              education: [{
                title: 'Bachelor of Science',
                tags: ['cs'],
                data: {
                  institution: 'University of California, Berkeley',
                  degree: 'Computer Science',
                  field: 'Computer Science',
                  location: 'Berkeley, CA',
                  startDate: '2014-09',
                  endDate: '2018-05'
                }
              }]
            },
          },
          metadata: { $ref: '#/components/schemas/ResumeMetadata' },
        },
        required: ['name', 'templateId'],
      },
      UpdateResumeRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Updated Resume Name' },
          sections: {
            type: 'object',
            description: 'Updated sections with create, update, or type change operations',
            additionalProperties: {
              type: 'array',
              items: { $ref: '#/components/schemas/UpdateSectionRequest' },
            },
            example: {
              experience: [{
                sectionId: 'exp_001',
                title: 'Senior Software Engineer',
                tags: ['backend', 'cloud', 'leadership'],
                data: {
                  endDate: '2023-12',
                  current: false,
                  achievements: ['Reduced API latency by 40%']
                }
              }, {
                title: 'Staff Software Engineer',
                tags: ['leadership', 'architecture'],
                data: {
                  company: 'New Company',
                  position: 'Staff Software Engineer',
                  startDate: '2024-01',
                  current: true
                }
              }],
              skills: [{
                sectionId: 'skills_001',
                title: 'Technical Skills',
                tags: ['technical'],
                data: {
                  category: 'Technical Skills',
                  skillsList: ['Python', 'AWS', 'Docker', 'Kubernetes']
                }
              }]
            },
          },
          metadata: { $ref: '#/components/schemas/ResumeMetadata' },
        },
      },
      GetRecommendationsRequest: {
        type: 'object',
        properties: {
          jobDescription: {
            type: 'string',
            example: 'Looking for a senior backend engineer with 5+ years of experience...',
          },
          resumeId: {
            type: 'string',
            description: 'Optional existing resume to optimize',
            example: 'resume_abc123',
          },
        },
        required: ['jobDescription'],
      },
      UpdateUserProfileRequest: {
        type: 'object',
        properties: {
          personalInfo: { $ref: '#/components/schemas/PersonalInfo' },
        },
        required: ['personalInfo'],
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
