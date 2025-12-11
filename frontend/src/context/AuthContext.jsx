import React, { createContext, useState, useCallback, useEffect } from 'react';
import CognitoService from '../services/cognito.service';
import API from '../services/api.service';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from API
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await API.user.getMe();
      if (response.data?.success && response.data?.data) {
        setUserProfile(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // Don't throw - user might not have profile yet
    }
    return null;
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const currentUser = await CognitoService.getCurrentUser();
        console.log("Current user from Cognito:", currentUser ? "Found" : "Not found");

        if (currentUser) {
          const currentTokens = await CognitoService.getTokens();
          console.log("Current tokens:", currentTokens ? "Valid" : "Invalid/Missing");

          if (currentTokens) {
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
              userId: currentTokens.user?.userId || currentUser.getUsername(),
              name: name
            });
            setTokens(currentTokens);

            // Set token in API Client
            API.client.setAuthToken(currentTokens.accessToken);

            // Fetch full user profile from API
            await fetchUserProfile();
          } else {
            console.warn("User exists but tokens are missing/invalid");
            // Attempt refresh?
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Don't set error on startup - user might not be logged in yet
      } finally {
        setLoading(false);
        console.log("Auth check complete. Loading: false");
      }
    };

    // Add a small delay to ensure Cognito is initialized
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchUserProfile]);

  // Sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('CognitoIdentityServiceProvider')) {
        // Reload if Cognito storage changes (e.g. login/logout in another tab)
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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

      // Set token in API Client
      API.client.setAuthToken(result.accessToken);

      // Store tokens in localStorage
      localStorage.setItem('cognitoIdToken', result.idToken);
      localStorage.setItem('cognitoAccessToken', result.accessToken);
      localStorage.setItem('cognitoRefreshToken', result.refreshToken);

      // Fetch full user profile from API after login
      await fetchUserProfile();

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

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
      setUserProfile(null);
      setTokens(null);
      setError(null);

      // Clear token from API Client
      API.client.setAuthToken(null);

      // Clear tokens from localStorage
      localStorage.removeItem('cognitoIdToken');
      localStorage.removeItem('cognitoAccessToken');
      localStorage.removeItem('cognitoRefreshToken');
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
    userProfile,
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
    fetchUserProfile,
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
