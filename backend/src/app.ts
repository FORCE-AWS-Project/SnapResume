/**
 * Express Application Setup
 */

import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { authMiddleware } from './middleware/auth.middleware';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { swaggerSpec } from './config/swagger';

// Create Express app
const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers (handled by API Gateway, but good to have)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }

  return next();
});

// Health check endpoint (no auth required)
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'snapresume-backend',
  });
});

// Swagger UI (no auth required)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SnapResume API Docs',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Public routes (no auth required)
const publicPaths = [
  '/templates',
  '/api-docs'
];

// Apply authentication middleware conditionally
app.use('/api', (req, res, next) => {
  // Skip auth for public paths
  const isPublicPath = publicPaths.some(path =>
    req.path === path || req.path.startsWith(path + '/')
  );
  console.log(req.path)
  if (isPublicPath) {
    return next();
  }

  // Apply auth middleware for protected routes
  return authMiddleware(req as any, res, next);
});

// Apply routes
app.use('/api', routes);

// 404 handler
app.use(notFoundMiddleware);

// Error handler (must be last)
app.use(errorMiddleware);

export default app;
