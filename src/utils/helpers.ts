import { ProxyRequest } from '../types';

export function validateRequest(request: ProxyRequest): string | null {
  if (!request.endpoint) {
    return 'Endpoint is required';
  }

  if (typeof request.endpoint !== 'string') {
    return 'Endpoint must be a string';
  }

  if (request.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return 'Invalid HTTP method';
  }

  if (request.params && typeof request.params !== 'object') {
    return 'Params must be an object';
  }

  return null;
}

export function buildUrl(
  baseURL: string,
  endpoint: string,
  params?: Record<string, string>,
  keyName?: string,
  keyValue?: string
): string {
  const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, baseURL);

  if (params || (keyName && keyValue)) {
    const searchParams = new URLSearchParams(url.search);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
    }

    if (keyName && keyValue && keyName !== 'Authorization') {
      searchParams.append(keyName, keyValue);
    }

    url.search = searchParams.toString();
  }

  return url.toString();
}

export function getClientIP(req: any): string {
  return req.ip ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}