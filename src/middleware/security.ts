import rateLimit from 'express-rate-limit';
import cache from 'apicache';
import { Request, Response, NextFunction } from 'express';
import { getClientIP } from '../utils/helpers';

export const createRateLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      return getClientIP(req);
    }
  });
};

export const createStrictRateLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Stricter limit for API endpoints
    message: {
      success: false,
      error: 'API rate limit exceeded, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    keyGenerator: (req: Request) => {
      return getClientIP(req);
    }
  });
};

export const createCache = (duration: string = '5 minutes') => {
  return {
    onlyGet: cache.middleware(duration, (req: Request, res: Response) => {
      return req.method === 'GET';
    }),
    all: cache.middleware(duration)
  };
};

export const validateOrigin = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (!origin || allowedOrigins.includes(origin)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Origin not allowed'
      });
    }
  };
};

export const logRequests = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - UA: ${userAgent}`);
    next();
  };
};