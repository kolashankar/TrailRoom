/**
 * Retry API calls with exponential backoff
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 10000
) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, i), maxDelay);
      
      // Don't wait after last retry
      if (i < maxRetries - 1) {
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

/**
 * Create axios instance with retry capability
 */
import axios from 'axios';

export const createRetryableAxios = () => {
  const instance = axios.create();
  
  instance.interceptors.response.use(
    response => response,
    async error => {
      const config = error.config;
      
      // Initialize retry count
      config._retryCount = config._retryCount || 0;
      
      // Check if we should retry
      if (
        config._retryCount >= 3 ||
        (error.response?.status >= 400 && error.response?.status < 500)
      ) {
        return Promise.reject(error);
      }
      
      // Increment retry count
      config._retryCount += 1;
      
      // Calculate delay
      const delay = Math.min(1000 * Math.pow(2, config._retryCount - 1), 10000);
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, delay));
      return instance(config);
    }
  );
  
  return instance;
};
