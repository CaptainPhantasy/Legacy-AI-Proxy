export interface ProxyRequest {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, string>;
  body?: unknown;
}

export interface ProxyResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  status?: number;
}

export interface ApiConfig {
  baseURL: string;
  keyName: string;
  keyValue: string;
}

export interface ServiceConfig {
  [serviceName: string]: ApiConfig;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export interface CacheOptions {
  duration: string;
  statusCodes?: number[];
}