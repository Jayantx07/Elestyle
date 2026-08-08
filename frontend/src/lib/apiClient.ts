export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data: any = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  retries?: number;
  baseDelay?: number;
}

/**
 * Enterprise API Client wrapper
 * Automatically handles exponential backoff for transient errors (502, 503, 504).
 * Fails fast on client and auth errors (400, 401, 403, 404).
 */
export async function apiClient<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 3, baseDelay = 500, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const isIdempotent = ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'].includes(method);
  const actualRetries = isIdempotent ? retries : (options.retries !== undefined ? options.retries : 0);
  
  for (let attempt = 0; attempt <= actualRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        // Transient errors that should be retried (Bad Gateway, Service Unavailable, Gateway Timeout)
        const isTransient = [502, 503, 504].includes(response.status);
        if (isTransient && attempt < actualRetries) {
          throw new Error(`Transient error ${response.status}`);
        }
        
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = null;
        }
        throw new ApiError(response.status, errorData?.message || response.statusText, errorData);
      }
      
      return await response.json() as T;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error; // Never retry properly mapped 4xx API errors
      }
      if (attempt === actualRetries) {
        // Network failures like ECONNRESET or CORS will throw standard Errors.
        // We retry them up to 'actualRetries' times. If it's the last attempt, rethrow.
        throw error;
      }
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) * (0.8 + Math.random() * 0.4);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Unreachable');
}
