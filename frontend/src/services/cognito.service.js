import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoRefreshToken } from 'amazon-cognito-identity-js';

const COGNITO_CONFIG = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  Region: import.meta.env.VITE_AWS_REGION
};

// Initialize Cognito User Pool
let userPool = null;

try {
  if (COGNITO_CONFIG.UserPoolId && COGNITO_CONFIG.ClientId) {
    userPool = new CognitoUserPool({
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      ClientId: COGNITO_CONFIG.ClientId
    });
  } else {
    console.warn('Cognito configuration missing. Please ensure .env file exists and server has been restarted.', {
      UserPoolId: COGNITO_CONFIG.UserPoolId ? 'Set' : 'Missing',
      ClientId: COGNITO_CONFIG.ClientId ? 'Set' : 'Missing',
      Region: COGNITO_CONFIG.Region
    });
  }
} catch (error) {
  console.error('Failed to initialize Cognito User Pool:', error);
}

class CognitoService {
  /**
   * Sign up a new user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise}
   */
  static signUp(email, password) {
    return new Promise((resolve, reject) => {
      if (!userPool) {
        reject(new Error('Cognito User Pool not initialized'));
        return;
      }

      userPool.signUp(
        email,
        password,
        [],
        null,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  /**
   * Confirm sign up with confirmation code
   * @param {string} email 
   * @param {string} code 
   * @returns {Promise}
   */
  static confirmSignUp(email, code) {
    return new Promise((resolve, reject) => {
      if (!userPool) {
        reject(new Error('Cognito User Pool not initialized'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Sign in a user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{idToken: string, accessToken: string, refreshToken: string}>}
   */
  static signIn(email, password) {
    return new Promise((resolve, reject) => {
      if (!userPool) {
        reject(new Error('Cognito User Pool not initialized'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          try {
            const idToken = result.getIdToken().getJwtToken();
            const accessToken = result.getAccessToken().getJwtToken();
            const refreshToken = result.getRefreshToken().getToken();

            // Get user attributes
            const idTokenPayload = result.getIdToken().payload;
            const name = idTokenPayload.name || email.split('@')[0];

            resolve({
              idToken,
              accessToken,
              refreshToken,
              user: {
                email,
                userId: idTokenPayload.sub,
                name: name
              }
            });
          } catch {
            reject(new Error('Failed to extract tokens from authentication result'));
          }
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * Sign out current user
   * @returns {void}
   */
  static signOut() {
    if (!userPool) {
      return;
    }

    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<CognitoUser|null>}
   */
  static getCurrentUser() {
    return new Promise((resolve) => {
      try {
        if (!userPool) {
          resolve(null);
          return;
        }

        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
          cognitoUser.getSession((err, session) => {
            if (err || !session || !session.isValid()) {
              resolve(null);
            } else {
              resolve(cognitoUser);
            }
          });
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        resolve(null);
      }
    });
  }

  /**
   * Get valid tokens for authenticated user
   * @returns {Promise<{idToken: string, accessToken: string, refreshToken: string}|null>}
   */
  static async getTokens() {
    try {
      const cognitoUser = await this.getCurrentUser();
      if (!cognitoUser) {
        return null;
      }

      return new Promise((resolve) => {
        cognitoUser.getSession((err, session) => {
          try {
            if (err || !session || !session.isValid()) {
              resolve(null);
            } else {
              resolve({
                idToken: session.getIdToken().getJwtToken(),
                accessToken: session.getAccessToken().getJwtToken(),
                refreshToken: session.getRefreshToken().getToken()
              });
            }
          } catch (error) {
            console.error('Error extracting tokens from session:', error);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  /**
   * Refresh tokens using refresh token
   * @param {string} refreshToken 
   * @returns {Promise}
   */
  static refreshTokens(refreshToken) {
    return new Promise((resolve, reject) => {
      try {
        if (!userPool) {
          reject(new Error('Cognito User Pool not initialized'));
          return;
        }

        const cognitoUser = userPool.getCurrentUser();
        if (!cognitoUser) {
          reject(new Error('No user found'));
          return;
        }

        const refresh = new CognitoRefreshToken({ RefreshToken: refreshToken });

        cognitoUser.refreshSession(refresh, (err, session) => {
          if (err) {
            reject(err);
          } else {
            try {
              resolve({
                idToken: session.getIdToken().getJwtToken(),
                accessToken: session.getAccessToken().getJwtToken(),
                refreshToken: session.getRefreshToken().getToken()
              });
            } catch {
              reject(new Error('Failed to extract tokens from refreshed session'));
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Change user password
   * @param {string} oldPassword 
   * @param {string} newPassword 
   * @returns {Promise}
   */
  static changePassword(oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
      try {
        if (!userPool) {
          reject(new Error('Cognito User Pool not initialized'));
          return;
        }

        const cognitoUser = userPool.getCurrentUser();
        if (!cognitoUser) {
          reject(new Error('No user found'));
          return;
        }

        cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } catch {
        reject(new Error('Failed to change password'));
      }
    });
  }

  /**
   * Forgot password request
   * @param {string} email 
   * @returns {Promise}
   */
  static forgotPassword(email) {
    return new Promise((resolve, reject) => {
      try {
        if (!userPool) {
          reject(new Error('Cognito User Pool not initialized'));
          return;
        }

        const cognitoUser = new CognitoUser({
          Username: email,
          Pool: userPool
        });

        cognitoUser.forgotPassword({
          onSuccess: (result) => {
            resolve(result);
          },
          onFailure: (err) => {
            reject(err);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Confirm forgot password and reset it
   * @param {string} email 
   * @param {string} code 
   * @param {string} newPassword 
   * @returns {Promise}
   */
  static confirmPassword(email, code, newPassword) {
    return new Promise((resolve, reject) => {
      try {
        if (!userPool) {
          reject(new Error('Cognito User Pool not initialized'));
          return;
        }

        const cognitoUser = new CognitoUser({
          Username: email,
          Pool: userPool
        });

        cognitoUser.confirmPassword(code, newPassword, {
          onSuccess: (result) => {
            resolve(result);
          },
          onFailure: (err) => {
            reject(err);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get user attributes (name, email, etc.)
   * @returns {Promise<Object>}
   */
  static getUserAttributes() {
    return new Promise((resolve, reject) => {
      try {
        const cognitoUser = userPool.getCurrentUser();
        if (!cognitoUser) {
          reject(new Error('No user found'));
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
          } else {
            const userAttrs = {};
            attributes.forEach(attr => {
              userAttrs[attr.Name] = attr.Value;
            });
            resolve(userAttrs);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default CognitoService;
