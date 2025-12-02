/**
 * Lambda Handlers Export
 *
 * This module exports all Lambda function handlers for the application.
 * Each handler is designed to be deployed independently or as part of a CI/CD pipeline.
 */

export { lambdaHandler as cognitoPostConfirmationHandler } from './cognito-post-confirmation';

// Future handlers can be exported here:
// export { lambdaHandler as someOtherHandler } from './some-other-handler';