/**
 * Main Lambda Handler with serverless-http
 */

import serverless from 'serverless-http';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import app from './app';

// Wrap Express app with serverless-http
const handler = serverless(app);

/**
 * Lambda handler function
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Call serverless-http handler
  const result = await handler(event, context);

  return result as APIGatewayProxyResult;
};

// Export as both named and default
export { lambdaHandler as handler };
export default lambdaHandler;
