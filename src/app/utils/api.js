// utils/api.js or app/lib/api.js

export const getAuthHeaders = (token) => {
  const fallbackToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const finalToken = token || fallbackToken;

  if (!finalToken) {
    throw new Error('No authentication token found. Please log in.');
  }

  return {
    'Authorization': `Bearer ${finalToken}`,
    'Content-Type': 'application/json',
  };
};
  
  export const makeApiCall = async (url, options = {}, maxRetries = 3) => {
    let lastError;
  
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
  
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
  
        clearTimeout(timeoutId);
  
        if (response.status === 502 && attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, attempt * 2000));
          continue;
        }
  
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, attempt * 2000));
          continue;
        }
        throw lastError;
      }
    }
  };
  