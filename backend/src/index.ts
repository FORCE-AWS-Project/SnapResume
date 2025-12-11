/**
 * Main Lambda Handler with serverless-http
 */

import serverless from 'serverless-http';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import app from './app';

// Wrap Express app with serverless-http
const serverlessHandler = serverless(app);

/**
 * Lambda handler function
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Call serverless-http handler
  const result = await serverlessHandler(event, context);

  return result as APIGatewayProxyResult;
};

// Also export as lambdaHandler for backward compatibility
export const lambdaHandler = handler;

// Export as default for module federation
export default handler;
