/**
 * Recommendation Service
 * Business logic for AI-powered recommendations using AWS Bedrock
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { AWS_CONFIG, BedrockConfig } from '../constants';
import { GetRecommendationsRequest, RecommendationResponse, Section } from '../models';
import { ResumeService } from './resume.service';
import { SectionService } from './section.service';

const bedrockClient = new BedrockRuntimeClient({
  region: AWS_CONFIG.REGION,
});

export class RecommendationService {
  /**
   * Get section recommendations based on job description
   */
  static async getRecommendations(
    userId: string,
    data: GetRecommendationsRequest
  ): Promise<RecommendationResponse> {
    const { jobDescription, resumeId } = data;

    const resume = await ResumeService.getResume(userId, resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }


    const { sections } = await SectionService.listSections(userId);

    if (sections.length === 0) {
      throw new Error('No sections found');
    }

    const groupedSections: Record<string, Section[]> = {};
    sections.forEach((section) => {
      const sectionType = section.sectionType;
      if (!groupedSections[sectionType]) {
        groupedSections[sectionType] = [];
      }
      groupedSections[sectionType].push(section);
    });

    const recommendations = await this.analyzeWithBedrock(
      jobDescription,
      groupedSections
    );

    return recommendations;
  }

  /**
   * Analyze job description using Bedrock Claude
   */
  private static async analyzeWithBedrock(
    jobDescription: string,
    sections: Record<string, Section[]>
  ): Promise<RecommendationResponse> {
    const prompt = this.buildPrompt(jobDescription, sections);

    const payload = {
      messages: [
        {
          role: 'user',
          content: [
            {
              text: prompt
            }
          ],
        },
      ],
      max_tokens: BedrockConfig.MAX_TOKENS,
      temperature: BedrockConfig.TEMPERATURE
    };

    const command = new InvokeModelCommand({
      modelId: BedrockConfig.MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    console.log('Calling Bedrock with model:', BedrockConfig.MODEL_ID);
    const response = await bedrockClient.send(command);

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const analysisText = responseBody.content[0].text;

    // Parse the JSON response from Claude
    const analysisJson = this.extractJsonFromResponse(analysisText);

    return analysisJson;
  }

  /**
   * Build the prompt for Claude
   */
  private static buildPrompt(
    jobDescription: string,
    sections: Record<string, Section[]>
  ): string {
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
- Only include sections with a matchScore of ${BedrockConfig.MIN_MATCH_SCORE} or higher
- Sort sections within each type by matchScore (highest first)
- matchedKeywords should be an array of specific keywords from the job description that match this section
- Keep reasons concise (1-2 sentences)
- Be specific about what makes each section relevant
- Return ONLY the JSON, no additional text before or after`;
  }

  /**
   * Extract JSON from Claude's response
   */
  private static extractJsonFromResponse(text: string): RecommendationResponse {
    try {
      return JSON.parse(text) as RecommendationResponse;
    } catch (error) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]) as RecommendationResponse;
      }

      // If no code block, try to find JSON-like content
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(text.substring(jsonStart, jsonEnd + 1)) as RecommendationResponse;
      }

      throw new Error('Could not extract JSON from response');
    }
  }
}
