const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getAuthHeaders = () => {
  const tokens = JSON.parse(localStorage.getItem('amplifyCredentials') || '{}');
  return {
    'Content-Type': 'application/json',
    ...(tokens.idToken && { Authorization: `Bearer ${tokens.idToken.jwtToken}` }),
  };
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');

  // Get JSON response for both success and error cases
  if (contentType && contentType.includes('application/json')) {
    const jsonResponse = await response.json();

    // Check if response is in the expected {data, isOk} format
    if (typeof jsonResponse === 'object' && 'isOk' in jsonResponse) {
      if (!jsonResponse.isOk) {
        const errorMessage = jsonResponse.message || jsonResponse.error || 'Request failed';
        throw new ApiError(
          errorMessage,
          response.status,
          jsonResponse
        );
      }

      return jsonResponse.data;
    }

    // If not in {data, isOk} format, return as-is (for backward compatibility)
    return jsonResponse;
  }

  // Handle non-JSON responses
  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status,
      {}
    );
  }

  return response;
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0, {});
    }

    throw new ApiError('An unexpected error occurred.', 0, {});
  }
};

const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { method: 'GET', ...options }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { method: 'DELETE', ...options }),

  patch: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    }),
};

export { ApiError };
export default api;