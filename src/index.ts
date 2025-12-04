import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import proxyRoutes from './routes/proxyRoutes';
import { createRateLimiter, createStrictRateLimiter, createCache, logRequests } from './middleware/security';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'app://.'];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(logRequests());

const generalRateLimit = createRateLimiter();
const strictRateLimit = createStrictRateLimiter();
const cache = createCache('5 minutes');

app.use('/api/', generalRateLimit);
app.use('/api/proxy/services', cache.onlyGet);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/proxy', strictRateLimit, proxyRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /health - Health check',
      'GET /api/proxy/services - List available services',
      'POST /api/proxy/:service - Proxy request to service'
    ]
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, () => {
  console.log(`
🚀 Legacy AI Proxy Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📡 Health Check: http://localhost:${PORT}/health

🔐 Available Services:
   - Anthropic Claude API
   - OpenAI GPT API
   - Google Gemini API
   - ElevenLabs API (TTS)
   - Zhipu GLM API
   - Google Maps API
   - Resend API (Email)
   - Supabase API (Admin)

📊 Rate Limiting:
   - General: 100 requests/15min per IP
   - Proxy: 50 requests/15min per IP

📝 Docs:
   GET  /api/proxy/services
   POST /api/proxy/:service

Security Headers: ✅ Enabled
CORS: ✅ Configured
Rate Limiting: ✅ Active
Caching: ✅ Enabled (5min)
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;