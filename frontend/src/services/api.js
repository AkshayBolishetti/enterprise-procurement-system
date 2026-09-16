const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Safely parse backend error response and map to clean user-facing message.
 * Ensures internal SQL, stack trace, or package names are NEVER displayed.
 */
export function formatErrorMessage(errorResponse, status) {
  if (status === 401) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  if (status === 409) {
    return 'An account or record with these details already exists.';
  }
  if (status >= 500) {
    return 'An unexpected server error occurred. Please try again later.';
  }

  // Handle standard ApiResponse format { success, message, errors }
  if (errorResponse) {
    if (typeof errorResponse.message === 'string') {
      const msg = errorResponse.message;
      // Filter out internal class/DB exception names
      if (
        msg.includes('org.postgresql') ||
        msg.includes('com.mysql') ||
        msg.includes('hibernate') ||
        msg.includes('Exception') ||
        msg.includes('DataIntegrityViolation') ||
        msg.includes('ConstraintViolation')
      ) {
        return 'An error occurred while processing your request. Please try again.';
      }

      // Map specific backend duplicate messages cleanly
      if (msg.toLowerCase().includes('already exists')) {
        return msg;
      }
      if (msg.toLowerCase().includes('only one global admin')) {
        return 'Registration failed: An Administrator account already exists in the system.';
      }
      if (msg.toLowerCase().includes('department is mandatory')) {
        return 'Please select a valid department for user registration.';
      }

      return msg;
    }
  }

  return 'Something went wrong. Please check your input and try again.';
}

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    credentials: 'include', // Crucial for Spring Security session cookie
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    let data;
    if (config.responseType === 'blob') {
      data = await response.blob();
    } else {
      const isJson = response.headers.get('content-type')?.includes('application/json');
      data = isJson ? await response.json() : await response.text();
    }

    if (!response.ok) {
      const errorMessage = formatErrorMessage(data, response.status);
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      errorObj.errors = data?.errors || null;
      errorObj.response = { data, status: response.status }; 
      throw errorObj;
    }

    return config.responseType === 'blob' ? { data } : data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to backend server. Please ensure backend is running.');
    }
    throw error;
  }
}

const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
