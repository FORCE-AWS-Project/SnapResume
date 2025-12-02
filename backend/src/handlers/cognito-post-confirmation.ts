import { PostConfirmationTriggerEvent, PostConfirmationTriggerHandler } from 'aws-lambda';
import { UserService } from '../services/user.service';

/**
 * Cognito Post-Confirmation Trigger Handler
 *
 * This Lambda function is triggered when a user confirms their registration.
 * It creates a user record in DynamoDB with the user's information from Cognito.
 */
export const lambdaHandler: PostConfirmationTriggerHandler = async (event: PostConfirmationTriggerEvent) => {
  console.log('Cognito post-confirmation trigger invoked', {
    triggerSource: event.triggerSource,
    userPoolId: event.userPoolId,
    userName: event.userName,
    version: event.version
  });

  // Only handle sign up confirmations
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    console.log('Ignoring trigger source:', event.triggerSource);
    return event;
  }

  try {
    // Extract user attributes from the event
    const { sub, email, name } = event.request.userAttributes;

    if (!sub || !email) {
      console.error('Missing required user attributes', {
        sub: !!sub,
        email: !!email,
        attributes: event.request.userAttributes
      });
      return event; // Don't fail the signup flow
    }

    console.log('Creating user record in DynamoDB', {
      userId: sub,
      email,
      hasName: !!name
    });

    // Create user in DynamoDB using existing service
    await UserService.createUserFromCognito(sub, email, name || undefined);

    console.log('Successfully created user record', {
      userId: sub,
      email
    });

  } catch (error) {
    console.error('Error creating user record in DynamoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userName: event.userName,
      userPoolId: event.userPoolId
    });

    // Don't re-throw - we don't want to block the Cognito signup flow
    // The user can still be created in DynamoDB later if needed
  }

  // Always return the event to allow Cognito to continue
  return event;
};