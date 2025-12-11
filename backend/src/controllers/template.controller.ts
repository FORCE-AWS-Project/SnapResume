/**
 * Template Controller
 * Handles HTTP requests for template operations
 */

import { Request, Response } from 'express';
import { TemplateService } from '../services';
import { ResponseUtil } from '../utils';
import { ErrorMessages } from '../constants';
import { ListTemplatesParams } from '../models';

export class TemplateController {
  /**
   * List all templates
   * GET /templates
   */
  static async listTemplates(req: Request, res: Response): Promise<Response> {
    try {
      const params: ListTemplatesParams = {
        category: req.query.category as string,
      };

      const result = await TemplateService.listTemplates(params);
      return ResponseUtil.success(res, result);
    } catch (error) {
      console.error('Error in listTemplates:', error);
      return ResponseUtil.internalError(res);
    }
  }

  /**
   * Get template by ID
   * GET /templates/:templateId
   */
  static async getTemplate(req: Request, res: Response): Promise<Response> {
    try {
      const { templateId } = req.params;

      const template = await TemplateService.getTemplate(templateId);

      if (!template) {
        return ResponseUtil.notFound(res, ErrorMessages.TEMPLATE_NOT_FOUND);
      }

      return ResponseUtil.success(res, template);
    } catch (error) {
      console.error('Error in getTemplate:', error);
      return ResponseUtil.internalError(res);
    }
  }
}
