const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

// Table name from environment variable
const TABLE_NAME = 'resume-snap-dev-users';

/**
 * Cognito Post-Confirmation Trigger Handler
 *
 * This Lambda function is triggered when a user confirms their registration.
 * It creates a user record in DynamoDB with the user's information from Cognito.
 * This is a standalone handler that doesn't use any backend services.
 */

exports.lambdaHandler = async (event) => {
  console.log('Cognito post-confirmation trigger invoked', {
    triggerSource: event.triggerSource,
    userPoolId: event.userPoolId,
    userName: event.userName,
    version: event.version
  });

  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    console.log('Ignoring trigger source:', event.triggerSource);
    return event;
  }

  try {
    const { sub, email, name, family_name, given_name, phone_number, 'custom:role': role } = event.request.userAttributes;

    if (!sub || !email) {
      console.error('Missing required user attributes', {
        sub: !!sub,
        email: !!email,
        attributes: event.request.userAttributes
      });
      return event; 
    }

    console.log('Creating user record in DynamoDB', {
      userId: sub,
      email,
      hasName: !!name,
      hasFamilyName: !!family_name,
      hasGivenName: !!given_name
    });

    // Create user item for DynamoDB
    const userItem = {
      PK: `USER#${sub}`,
      SK: 'PROFILE',
      userId: sub,
      email: email,
      personalInfo: {
        name: name ?? "",
        email: email,
        phone: phone_number || '',
        firstName: given_name || '',
        lastName: family_name || '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userPoolId: event.userPoolId,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: userItem,
      ConditionExpression: 'attribute_not_exists(PK)' 
    });

    await docClient.send(command);

    console.log('Successfully created user record', {
      userId: sub,
      email,
      tableName: TABLE_NAME,
      pk: userItem.PK,
      sk: userItem.SK
    });

  } catch (error) {
    console.error('Error creating user record in DynamoDB', {
      error: error.message || 'Unknown error',
      stack: error.stack,
      userName: event.userName,
      userPoolId: event.userPoolId
    });

  }

  return event;
};