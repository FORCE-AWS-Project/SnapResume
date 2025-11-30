/**
 * Main Router
 * Combines all route modules
 */

import { Router } from 'express';
import {
  AuthController,
  UserController,
  ResumeController,
  SectionController,
  TemplateController,
  RecommendationController,
} from '../controllers';

const router = Router();

// ==================== AUTH ROUTES ====================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Create a new user account with AWS Cognito and optionally create user profile in DynamoDB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: MySecureP@ss123
 *               name:
 *                 type: string
 *                 deprecated: true
 *                 description: Deprecated - use personalInfo.name instead. Kept for backward compatibility.
 *                 example: John Doe
 *               personalInfo:
 *                 type: object
 *                 description: Optional user profile information
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   phone:
 *                     type: string
 *                     example: +1-234-567-8900
 *                   location:
 *                     type: string
 *                     example: San Francisco, CA
 *                   linkedin:
 *                     type: string
 *                     example: https://linkedin.com/in/johndoe
 *                   github:
 *                     type: string
 *                     example: https://github.com/johndoe
 *                   portfolio:
 *                     type: string
 *                     example: https://johndoe.com
 *                   summary:
 *                     type: string
 *                     example: Experienced software engineer with 5+ years...
 *                   customFields:
 *                     type: object
 *                     additionalProperties:
 *                       type: string
 *                     example:
 *                       twitter: https://twitter.com/johndoe
 *     responses:
 *       200:
 *         description: Registration successful. User profile created in DynamoDB if provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     userConfirmed:
 *                       type: boolean
 *                     message:
 *                       type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Authenticate user with email and password. Auto-creates user profile in DynamoDB on first login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecureP@ss123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     idToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *                       example: 3600
 *                     userId:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/login', AuthController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     description: Get new access and ID tokens using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     idToken:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/refresh', AuthController.refresh);

// /**
//  * @swagger
//  * /api/auth/forgot-password:
//  *   post:
//  *     tags: [Auth]
//  *     summary: Initiate forgot password flow
//  *     description: Send password reset code to user's email
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 format: email
//  *     responses:
//  *       200:
//  *         description: Password reset code sent
//  *       400:
//  *         description: Invalid email
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  */
// router.post('/auth/forgot-password', AuthController.forgotPassword);

// /**
//  * @swagger
//  * /api/auth/confirm-forgot-password:
//  *   post:
//  *     tags: [Auth]
//  *     summary: Confirm password reset
//  *     description: Reset password using verification code
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - code
//  *               - newPassword
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 format: email
//  *               code:
//  *                 type: string
//  *               newPassword:
//  *                 type: string
//  *                 format: password
//  *                 minLength: 8
//  *     responses:
//  *       200:
//  *         description: Password reset successful
//  *       400:
//  *         description: Invalid code or password
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  */
// router.post('/auth/confirm-forgot-password', AuthController.confirmForgotPassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     description: Invalidate all tokens (global sign out)
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/logout', AuthController.logout);

// /**
//  * @swagger
//  * /api/auth/change-password:
//  *   post:
//  *     tags: [Auth]
//  *     summary: Change password
//  *     description: Change password for authenticated user
//  *     security:
//  *       - BearerAuth: []
//  *       - LocalAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - previousPassword
//  *               - newPassword
//  *             properties:
//  *               previousPassword:
//  *                 type: string
//  *                 format: password
//  *               newPassword:
//  *                 type: string
//  *                 format: password
//  *                 minLength: 8
//  *     responses:
//  *       200:
//  *         description: Password changed successfully
//  *       400:
//  *         description: Invalid password
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Error'
//  */
// router.post('/auth/change-password', AuthController.changePassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     description: Get authenticated user's profile from DynamoDB
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/auth/me', AuthController.getCurrentUser);

/**
 * @swagger
 * /api/auth/confirm-signup:
 *   post:
 *     tags: [Auth]
 *     summary: Confirm email verification
 *     description: Confirm user registration with verification code sent to email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               code:
 *                 type: string
 *                 example: 123456
 *                 description: 6-digit verification code sent to email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully. You can now login.
 *       400:
 *         description: Invalid email or code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/confirm-signup', AuthController.confirmSignUp);

/**
 * @swagger
 * /api/auth/resend-confirmation:
 *   post:
 *     tags: [Auth]
 *     summary: Resend verification code
 *     description: Send a new verification code to user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verification code sent to your email.
 *       400:
 *         description: Invalid email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/resend-confirmation', AuthController.resendConfirmationCode);

// ==================== USER ROUTES ====================

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     description: Get authenticated user's profile
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/users/me', UserController.getUserProfile);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     description: Update authenticated user's profile information
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalInfo:
 *                 $ref: '#/components/schemas/PersonalInfo'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.put('/users/me', UserController.updateUserProfile);

// ==================== RESUME ROUTES ====================

/**
 * @swagger
 * /api/resumes:
 *   get:
 *     tags: [Resumes]
 *     summary: List all resumes
 *     description: Get all resumes for authenticated user
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of resumes to return
 *       - in: query
 *         name: lastEvaluatedKey
 *         schema:
 *           type: string
 *         description: Pagination token from previous response
 *     responses:
 *       200:
 *         description: Resumes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Resume'
 *                     count:
 *                       type: integer
 *                     lastEvaluatedKey:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/resumes', ResumeController.listResumes);

/**
 * @swagger
 * /api/resumes/{resumeId}:
 *   get:
 *     tags: [Resumes]
 *     summary: Get resume by ID
 *     description: Get a specific resume (metadata only, without section data)
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     responses:
 *       200:
 *         description: Resume retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Resume'
 *       404:
 *         description: Resume not found
 */
router.get('/resumes/:resumeId', ResumeController.getResume);

/**
 * @swagger
 * /api/resumes/{resumeId}/full:
 *   get:
 *     tags: [Resumes]
 *     summary: Get full resume
 *     description: Get complete resume with all section data populated
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Resume ID
 *     responses:
 *       200:
 *         description: Full resume retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumeId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     templateId:
 *                       type: string
 *                     personalInfo:
 *                       $ref: '#/components/schemas/PersonalInfo'
 *                     experience:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 *                     education:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 *                     skills:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 *       404:
 *         description: Resume not found
 */
router.get('/resumes/:resumeId/full', ResumeController.getFullResume);

/**
 * @swagger
 * /api/resumes:
 *   post:
 *     tags: [Resumes]
 *     summary: Create new resume
 *     description: Create a new resume for authenticated user
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - templateId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Software Engineer Resume - Google
 *               templateId:
 *                 type: string
 *                 example: TPL_MODERN_001
 *               sections:
 *                 type: object
 *                 additionalProperties:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       200:
 *         description: Resume created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid input
 */
router.post('/resumes', ResumeController.createResume);

/**
 * @swagger
 * /api/resumes/{resumeId}:
 *   put:
 *     tags: [Resumes]
 *     summary: Update resume
 *     description: Update an existing resume
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               templateId:
 *                 type: string
 *               sections:
 *                 type: object
 *                 additionalProperties:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       200:
 *         description: Resume updated successfully
 *       404:
 *         description: Resume not found
 */
router.put('/resumes/:resumeId', ResumeController.updateResume);

/**
 * @swagger
 * /api/resumes/{resumeId}:
 *   delete:
 *     tags: [Resumes]
 *     summary: Delete resume
 *     description: Delete a resume
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 *       404:
 *         description: Resume not found
 */
router.delete('/resumes/:resumeId', ResumeController.deleteResume);

// ==================== SECTION ROUTES ====================

/**
 * @swagger
 * /api/sections:
 *   get:
 *     tags: [Sections]
 *     summary: List sections
 *     description: Get all sections for authenticated user, optionally filtered by resume or type
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: query
 *         name: resumeId
 *         schema:
 *           type: string
 *         description: Filter by resume ID
 *       - in: query
 *         name: sectionType
 *         schema:
 *           type: string
 *           enum: [experience, education, skills, projects, certifications]
 *         description: Filter by section type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     sections:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Section'
 *                     count:
 *                       type: integer
 */
router.get('/sections', SectionController.listSections);

/**
 * @swagger
 * /api/sections/{sectionId}:
 *   get:
 *     tags: [Sections]
 *     summary: Get section by ID
 *     description: Get a specific section
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Section'
 *       404:
 *         description: Section not found
 */
router.get('/sections/:sectionId', SectionController.getSection);

/**
 * @swagger
 * /api/sections:
 *   post:
 *     tags: [Sections]
 *     summary: Create section
 *     description: Create a new resume section
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeId
 *               - sectionType
 *             properties:
 *               resumeId:
 *                 type: string
 *                 example: resume_abc123
 *               sectionType:
 *                 type: string
 *                 enum: [experience, education, skills, projects, certifications]
 *                 example: experience
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [backend, cloud, leadership]
 *               data:
 *                 type: object
 *                 example:
 *                   company: Tech Corp
 *                   position: Senior Software Engineer
 *                   startDate: "2020-01"
 *                   endDate: "2023-12"
 *     responses:
 *       200:
 *         description: Section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Section'
 *       400:
 *         description: Invalid input
 */
router.post('/sections', SectionController.createSection);

/**
 * @swagger
 * /api/sections/{sectionId}:
 *   put:
 *     tags: [Sections]
 *     summary: Update section
 *     description: Update an existing section
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       404:
 *         description: Section not found
 */
router.put('/sections/:sectionId', SectionController.updateSection);

/**
 * @swagger
 * /api/sections/{sectionId}:
 *   delete:
 *     tags: [Sections]
 *     summary: Delete section
 *     description: Delete a section
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *       404:
 *         description: Section not found
 */
router.delete('/sections/:sectionId', SectionController.deleteSection);

// ==================== TEMPLATE ROUTES ====================

/**
 * @swagger
 * /api/templates:
 *   get:
 *     tags: [Templates]
 *     summary: List templates
 *     description: Get all available resume templates (public endpoint)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [professional, modern, creative, minimal]
 *         description: Filter by template category
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     templates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           templateId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           category:
 *                             type: string
 *                           previewImageUrl:
 *                             type: string
 */
router.get('/templates', TemplateController.listTemplates);

/**
 * @swagger
 * /api/templates/{templateId}:
 *   get:
 *     tags: [Templates]
 *     summary: Get template by ID
 *     description: Get complete template definition including schema (public endpoint)
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         example: TPL_MODERN_001
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Template'
 *       404:
 *         description: Template not found
 */
router.get('/templates/:templateId', TemplateController.getTemplate);

// ==================== RECOMMENDATION ROUTES ====================

/**
 * @swagger
 * /api/recommendations/sections:
 *   post:
 *     tags: [Recommendations]
 *     summary: Get AI-powered section recommendations
 *     description: Analyze job description and recommend best matching resume sections using AWS Bedrock
 *     security:
 *       - BearerAuth: []
 *       - LocalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobDescription
 *             properties:
 *               jobDescription:
 *                 type: string
 *                 example: We are looking for a Senior Backend Engineer with experience in microservices...
 *               resumeId:
 *                 type: string
 *                 example: resume_abc123
 *                 description: Optional - if provided, only analyzes sections from this resume
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sectionId:
 *                             type: string
 *                           sectionType:
 *                             type: string
 *                           matchScore:
 *                             type: number
 *                             minimum: 0
 *                             maximum: 100
 *                           reasoning:
 *                             type: string
 *                           section:
 *                             $ref: '#/components/schemas/Section'
 *       400:
 *         description: Invalid input or no sections found
 */
router.post('/recommendations/sections', RecommendationController.getRecommendations);

export default router;
