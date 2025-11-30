/**
 * Auth Service
 * Handles AWS Cognito authentication operations
 */

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  GlobalSignOutCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AWS_CONFIG } from '../constants';
import { ErrorMessages, CognitoErrorMap } from '../constants/messages';

export class AuthService {
  private static cognitoClient = new CognitoIdentityProviderClient({
    region: AWS_CONFIG.REGION,
  });

  private static CLIENT_ID = AWS_CONFIG.COGNITO_CLIENT_ID;

  /**
   * Register new user
   */
  static async register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ userId: string; userConfirmed: boolean }> {
    try {
      const command = new SignUpCommand({
        ClientId: this.CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          ...(name ? [{ Name: 'name', Value: name }] : []),
        ],
      });
      console.log("AWS Config: ",AWS_CONFIG)
      const response = await this.cognitoClient.send(command);

      return {
        userId: response.UserSub!,
        userConfirmed: response.UserConfirmed || false,
      };
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Confirm user registration with verification code
   */
  static async confirmSignUp(
    email: string,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
      });

      await this.cognitoClient.send(command);

      return {
        success: true,
        message: 'Email verified successfully. You can now login.',
      };
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Resend confirmation code to user's email
   */
  static async resendConfirmationCode(
    email: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: this.CLIENT_ID,
        Username: email,
      });

      await this.cognitoClient.send(command);

      return {
        success: true,
        message: 'Verification code sent to your email.',
      };
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Login user with USER_PASSWORD_AUTH
   */
  static async login(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const command = new InitiateAuthCommand({
        ClientId: this.CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new Error(ErrorMessages.AUTH_FAILED);
      }

      return {
        accessToken: response.AuthenticationResult.AccessToken!,
        idToken: response.AuthenticationResult.IdToken!,
        refreshToken: response.AuthenticationResult.RefreshToken!,
        expiresIn: response.AuthenticationResult.ExpiresIn!,
      };
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<{
    accessToken: string;
    idToken: string;
    expiresIn: number;
  }> {
    try {
      const command = new InitiateAuthCommand({
        ClientId: this.CLIENT_ID,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new Error(ErrorMessages.AUTH_TOKEN_REFRESH_FAILED);
      }

      return {
        accessToken: response.AuthenticationResult.AccessToken!,
        idToken: response.AuthenticationResult.IdToken!,
        expiresIn: response.AuthenticationResult.ExpiresIn!,
      };
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Global sign out (invalidate all tokens)
   */
  static async logout(accessToken: string): Promise<void> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Initiate forgot password flow
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.CLIENT_ID,
        Username: email,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Confirm forgot password with code
   */
  static async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Change password (requires current password)
   */
  static async changePassword(
    accessToken: string,
    previousPassword: string,
    proposedPassword: string
  ): Promise<void> {
    try {
      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: previousPassword,
        ProposedPassword: proposedPassword,
      });

      await this.cognitoClient.send(command);
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Get current user info from Cognito
   */
  static async getCurrentUser(accessToken: string): Promise<{
    userId: string;
    email: string;
    name?: string;
  }> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.cognitoClient.send(command);

      const email = response.UserAttributes?.find((attr) => attr.Name === 'email')?.Value;
      const name = response.UserAttributes?.find((attr) => attr.Name === 'name')?.Value;

      return {
        userId: response.Username!,
        email: email!,
        name,
      };
    } catch (error: any) {
      throw this.handleCognitoError(error);
    }
  }

  /**
   * Handle Cognito errors with user-friendly messages from CognitoErrorMap
   */
  private static handleCognitoError(error: any): Error {
    console.log("Cognito error: ", error);
    const errorCode = error.name || error.code;
    const message = CognitoErrorMap[errorCode] || error.message || ErrorMessages.AUTH_FAILED;

    const newError = new Error(message);
    newError.name = errorCode;
    return newError;
  }
}
