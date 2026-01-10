/**
 * HTTP utility functions
 * Equivalent to Python's amake_request and ClientSession
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Make HTTP request with error handling
 * Equivalent to Python's amake_request
 */
export async function makeRequest<T = any>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axios({
      url,
      method: options?.method || 'GET',
      ...options,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `HTTP Request failed: ${error.response?.status} ${error.response?.statusText} - ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Make multiple parallel HTTP requests
 */
export async function makeParallelRequests<T = any>(
  urls: string[],
  options?: AxiosRequestConfig
): Promise<T[]> {
  const promises = urls.map((url) => makeRequest<T>(url, options));
  return Promise.all(promises);
}

/**
 * Retry HTTP request with exponential backoff
 */
export async function makeRequestWithRetry<T = any>(
  url: string,
  options?: AxiosRequestConfig & { maxRetries?: number; retryDelay?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries || 3;
  const retryDelay = options?.retryDelay || 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await makeRequest<T>(url, options);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw new Error('Request failed after all retries');
}

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl: string, params: Record<string, any>): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
}

/**
 * Default headers for requests
 */
export const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};
