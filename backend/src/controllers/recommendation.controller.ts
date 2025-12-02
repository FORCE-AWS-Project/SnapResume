/**
 * Recommendation Controller
 * Handles HTTP requests for AI-powered recommendation operations
 */

import { Response } from 'express';
import { RecommendationService } from '../services';
import { ResponseUtil } from '../utils';
import { ErrorMessages } from '../constants';
import { AuthenticatedRequest, GetRecommendationsRequest } from '../models';

export class RecommendationController {
  /**
   * Get section recommendations based on job description
   * POST /recommendations/sections
   */
  static async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user.userId;
      const body: GetRecommendationsRequest = req.body;

      if (!body.jobDescription) {
        return ResponseUtil.badRequest(res, ErrorMessages.JOB_DESCRIPTION_REQUIRED);
      }

      const result = await RecommendationService.getRecommendations(userId, body);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      console.error('Error in getRecommendations:', error);
      if (error.message === 'No sections found') {
        return ResponseUtil.badRequest(res, ErrorMessages.NO_SECTIONS_FOUND);
      }
      return ResponseUtil.internalError(res, ErrorMessages.BEDROCK_ERROR);
    }
  }
}
