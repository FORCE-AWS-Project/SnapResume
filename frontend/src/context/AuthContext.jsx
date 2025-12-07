import React, { createContext, useState, useCallback, useEffect } from 'react';
import CognitoService from '../services/cognito.service';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await CognitoService.getCurrentUser();
        const currentTokens = await CognitoService.getTokens();
        
        if (currentUser && currentTokens) {
          const name = currentTokens.idToken ? 
            (() => {
              try {
                const payload = JSON.parse(atob(currentTokens.idToken.split('.')[1]));
                return payload.name || currentUser.getUsername().split('@')[0];
              } catch {
                return currentUser.getUsername().split('@')[0];
              }
            })() 
            : currentUser.getUsername().split('@')[0];
            
          setUser({
            email: currentUser.getUsername(),
            userId: currentTokens.user?.userId,
            name: name
          });
          setTokens(currentTokens);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Don't set error on startup - user might not be logged in yet
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure Cognito is initialized
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await CognitoService.signIn(email, password);
      setUser({
        email: result.user.email,
        userId: result.user.userId,
        name: result.user.name
      });
      setTokens({
        idToken: result.idToken,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await CognitoService.signUp(email, password);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Sign up failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmSignUp = useCallback(async (email, code) => {
    setLoading(true);
    setError(null);
    try {
      const result = await CognitoService.confirmSignUp(email, code);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Confirmation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      CognitoService.signOut();
      setUser(null);
      setTokens(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const result = await CognitoService.changePassword(oldPassword, newPassword);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const result = await CognitoService.forgotPassword(email);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Forgot password request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email, code, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const result = await CognitoService.confirmPassword(email, code, newPassword);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Password reset failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    tokens,
    loading,
    error,
    login,
    signup,
    confirmSignUp,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user && !!tokens
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
