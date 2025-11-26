/**
 * Recommendation Handler
 * Handles AI-powered section recommendations using AWS Bedrock
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { TABLES, getItem, queryItems } = require('../utils/dynamodb');
const { createResponse, createErrorResponse } = require('../utils/response');

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.REGION || 'us-east-1',
});

// Bedrock model ID (Claude 3.5 Sonnet)
const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

/**
 * Handle recommendation-related requests
 * @param {Object} event - Lambda event
 * @returns {Promise<Object>} API Gateway response
 */
async function handle(event) {
  const { httpMethod, path, userId } = event;
  const pathSegments = path.replace('/api/', '').split('/').filter(Boolean);

  try {
    // POST /recommendations/sections - Get section recommendations
    if (httpMethod === 'POST' && pathSegments[1] === 'sections') {
      const body = JSON.parse(event.body || '{}');
      return await getSectionRecommendations(userId, body);
    }

    return createErrorResponse(404, 'Not Found', 'Endpoint not found');
  } catch (error) {
    console.error('Error in recommendationHandler:', error);
    return createErrorResponse(500, 'Internal Server Error', error.message);
  }
}

/**
 * Get section recommendations based on job description
 * @param {string} userId - User ID
 * @param {Object} body - Request body
 * @returns {Promise<Object>} API Gateway response
 */
async function getSectionRecommendations(userId, body) {
  try {
    const { jobDescription, resumeId } = body;

    if (!jobDescription) {
      return createErrorResponse(400, 'Bad Request', 'jobDescription is required');
    }

    // Get all sections for the user
    const sectionsParams = {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'SECTION#',
      },
    };

    const sections = await queryItems(TABLES.MAIN, sectionsParams);

    if (sections.length === 0) {
      return createErrorResponse(400, 'Bad Request', 'No sections found. Please create some sections first.');
    }

    // Group sections by type
    const groupedSections = {};
    sections.forEach(section => {
      const { sectionType, PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, createdAt, updatedAt, ...sectionData } = section;
      if (!groupedSections[sectionType]) {
        groupedSections[sectionType] = [];
      }
      groupedSections[sectionType].push(sectionData);
    });

    // Call Bedrock to analyze and recommend sections
    const recommendations = await analyzeWithBedrock(jobDescription, groupedSections);

    return createResponse(200, recommendations);
  } catch (error) {
    console.error('Error getting section recommendations:', error);
    throw error;
  }
}

/**
 * Analyze job description and recommend sections using Bedrock
 * @param {string} jobDescription - Job description
 * @param {Object} sections - Grouped sections by type
 * @returns {Promise<Object>} Recommendations
 */
async function analyzeWithBedrock(jobDescription, sections) {
  try {
    // Build the prompt for Claude
    const prompt = buildPrompt(jobDescription, sections);

    // Prepare the request for Bedrock
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    console.log('Calling Bedrock with model:', MODEL_ID);
    const response = await bedrockClient.send(command);

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const analysisText = responseBody.content[0].text;

    // Parse the JSON response from Claude
    const analysisJson = extractJsonFromResponse(analysisText);

    return analysisJson;
  } catch (error) {
    console.error('Error calling Bedrock:', error);
    throw new Error(`Failed to analyze with Bedrock: ${error.message}`);
  }
}

/**
 * Build the prompt for Claude
 * @param {string} jobDescription - Job description
 * @param {Object} sections - Grouped sections
 * @returns {string} Prompt
 */
function buildPrompt(jobDescription, sections) {
  return `You are a professional resume consultant. Analyze the following job description and recommend which resume sections to include.

Job Description:
${jobDescription}

Available Resume Sections:
${JSON.stringify(sections, null, 2)}

Please analyze the job description and for each section type (experience, education, skills, projects, certifications), rank the available sections by relevance and provide a match score (0-100).

Return your analysis in the following JSON format:
{
  "recommendations": {
    "experience": [
      {
        "sectionId": "exp_001",
        "matchScore": 95,
        "matchedKeywords": ["backend", "cloud", "microservices"],
        "reason": "Brief explanation of why this section is relevant"
      }
    ],
    "education": [...],
    "skills": [...],
    "projects": [...],
    "certifications": [...]
  },
  "overallMatchScore": 87,
  "suggestedResumeName": "Suggested resume name based on job title",
  "analysis": {
    "strengths": ["List of candidate's strengths matching the job"],
    "gaps": ["List of missing qualifications or skills"],
    "recommendations": ["List of suggestions to improve the resume"]
  }
}

Important:
- Only include sections with a matchScore of 60 or higher
- Sort sections within each type by matchScore (highest first)
- matchedKeywords should be an array of specific keywords from the job description that match this section
- Keep reasons concise (1-2 sentences)
- Be specific about what makes each section relevant
- Return ONLY the JSON, no additional text before or after`;
}

/**
 * Extract JSON from Claude's response
 * @param {string} text - Response text
 * @returns {Object} Parsed JSON
 */
function extractJsonFromResponse(text) {
  try {
    // Try to parse the entire response as JSON first
    return JSON.parse(text);
  } catch (error) {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // If no code block, try to find JSON-like content
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    }

    throw new Error('Could not extract JSON from response');
  }
}

module.exports = {
  handle,
};
