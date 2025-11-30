/**
 * Resume Controller
 * Handles HTTP requests for resume operations
 */

import { Request, Response } from 'express';
import { ResumeService } from '../services';
import { ResponseUtil } from '../utils';
import { ErrorMessages, SuccessMessages } from '../constants';
import {
  AuthenticatedRequest,
  CreateResumeRequest,
  UpdateResumeRequest,
  ListResumesParams,
} from '../models';

export class ResumeController {
  static async listResumes(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req as any as AuthenticatedRequest;
      const params: ListResumesParams = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        lastKey: req.query.lastKey as string,
      };

      const result = await ResumeService.listResumes(userId, params);
      return ResponseUtil.success(res, result);
    } catch (error) {
      console.error('Error in listResumes:', error);
      return ResponseUtil.internalError(res);
    }
  }

  static async getResume(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req as any as AuthenticatedRequest;
      const { resumeId } = req.params;

      const resume = await ResumeService.getResume(userId, resumeId);

      if (!resume) {
        return ResponseUtil.notFound(res, ErrorMessages.RESUME_NOT_FOUND);
      }

      return ResponseUtil.success(res, resume);
    } catch (error) {
      console.error('Error in getResume:', error);
      return ResponseUtil.internalError(res);
    }
  }

  static async getFullResume(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req as any as AuthenticatedRequest;
      const { resumeId } = req.params;

      const resume = await ResumeService.getFullResume(userId, resumeId);

      if (!resume) {
        return ResponseUtil.notFound(res, ErrorMessages.RESUME_NOT_FOUND);
      }

      return ResponseUtil.success(res, resume);
    } catch (error) {
      console.error('Error in getFullResume:', error);
      return ResponseUtil.internalError(res);
    }
  }

  static async createResume(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req as any as AuthenticatedRequest;
      const body: CreateResumeRequest = req.body;

      if (!body.name) {
        return ResponseUtil.badRequest(res, ErrorMessages.RESUME_NAME_REQUIRED);
      }

      if (!body.templateId) {
        return ResponseUtil.badRequest(res, ErrorMessages.RESUME_TEMPLATE_REQUIRED);
      }

      const result = await ResumeService.createResume(userId, body);
      return ResponseUtil.created(res, result, SuccessMessages.RESUME_CREATED);
    } catch (error) {
      console.error('Error in createResume:', error);
      return ResponseUtil.internalError(res);
    }
  }

  static async updateResume(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req as any as AuthenticatedRequest;
      const { resumeId } = req.params;
      const body: UpdateResumeRequest = req.body;

      const result = await ResumeService.updateResume(userId, resumeId, body);
      return ResponseUtil.success(res, result, SuccessMessages.RESUME_UPDATED);
    } catch (error: any) {
      console.error('Error in updateResume:', error);
      if (error.message === 'Resume not found') {
        return ResponseUtil.notFound(res, ErrorMessages.RESUME_NOT_FOUND);
      }
      return ResponseUtil.internalError(res);
    }
  }

  static async deleteResume(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req as any as AuthenticatedRequest;
      const { resumeId } = req.params;

      await ResumeService.deleteResume(userId, resumeId);
      return ResponseUtil.success(res, undefined, SuccessMessages.RESUME_DELETED);
    } catch (error: any) {
      console.error('Error in deleteResume:', error);
      if (error.message === 'Resume not found') {
        return ResponseUtil.notFound(res, ErrorMessages.RESUME_NOT_FOUND);
      }
      return ResponseUtil.internalError(res);
    }
  }
}
