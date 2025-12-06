/**
 * Section Controller
 * Handles HTTP requests for section operations
 */

import { Response } from 'express';
import { SectionService } from '../services';
import { ResponseUtil } from '../utils';
import { ErrorMessages, SuccessMessages } from '../constants';
import {
  AuthenticatedRequest,
  CreateSectionRequest,
  UpdateSectionRequest,
  ListSectionsParams,
} from '../models';

export class SectionController {
  /**
   * List all sections
   * GET /sections
   */
  static async listSections(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req?.user?.userId ?? "testingid111";
      const params: ListSectionsParams = {
        resumeId: req.query.resumeId as string,
        type: req.query.type as string,
        tags: req.query.tags as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await SectionService.listSections(userId, params);
      return ResponseUtil.success(res, result);
    } catch (error) {
      console.error('Error in listSections:', error);
      return ResponseUtil.internalError(res);
    }
  }

  /**
   * Get section by ID
   * GET /sections/:sectionId
   */
  static async getSection(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req?.user?.userId ?? "testingid111";
      const { sectionId } = req.params;
      const sectionType = req.query.type as string;

      const section = await SectionService.getSection(userId, sectionId, sectionType);

      if (!section) {
        return ResponseUtil.notFound(res, ErrorMessages.SECTION_NOT_FOUND);
      }

      return ResponseUtil.success(res, section);
    } catch (error) {
      console.error('Error in getSection:', error);
      return ResponseUtil.internalError(res);
    }
  }

  /**
   * Create section
   * POST /sections
   */
  static async createSection(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req?.user?.userId ?? "testingid111";
      const body: CreateSectionRequest = req.body;

      if (!body.sectionType) {
        return ResponseUtil.badRequest(res, ErrorMessages.SECTION_TYPE_REQUIRED);
      }

      const result = await SectionService.createSection(userId, body);
      return ResponseUtil.created(res, result, SuccessMessages.SECTION_CREATED);
    } catch (error: any) {
      console.error('Error in createSection:', error);
      if (error.message.includes('Invalid section type')) {
        return ResponseUtil.badRequest(res, error.message);
      }
      return ResponseUtil.internalError(res);
    }
  }

  /**
   * Update section
   * PUT /sections/:sectionId
   */
  static async updateSection(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req?.user?.userId ?? "testingid111";
      const { sectionId } = req.params;
      const body: UpdateSectionRequest = req.body;

      const result = await SectionService.updateSection(userId, sectionId, body);
      return ResponseUtil.success(res, result, SuccessMessages.SECTION_UPDATED);
    } catch (error: any) {
      console.error('Error in updateSection:', error);
      if (error.message === 'Section not found') {
        return ResponseUtil.notFound(res, ErrorMessages.SECTION_NOT_FOUND);
      }
      return ResponseUtil.internalError(res);
    }
  }

  /**
   * Delete section
   * DELETE /sections/:sectionId
   */
  static async deleteSection(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req?.user?.userId ?? "testingid111";
      const { sectionId } = req.params;

      await SectionService.deleteSection(userId, sectionId);
      return ResponseUtil.success(res, undefined, SuccessMessages.SECTION_DELETED);
    } catch (error: any) {
      console.error('Error in deleteSection:', error);
      if (error.message === 'Section not found') {
        return ResponseUtil.notFound(res, ErrorMessages.SECTION_NOT_FOUND);
      }
      return ResponseUtil.internalError(res);
    }
  }
}
