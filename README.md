# Legacy AI Environment Variable Proxy Server

A secure, production-ready proxy server for handling API keys and proxying requests to third-party services. Built with TypeScript, Express, and security-first principles.

## Architecture

```
Electron App (Client) → Railway Proxy (API Keys) → 3rd Party APIs
```

The proxy server securely stores and injects API keys, ensuring sensitive credentials never leave the server environment.

## Features

- ✅ **TypeScript** - Strict typing for production reliability
- ✅ **Security** - Helmet, CORS, rate limiting, and request validation
- ✅ **Rate Limiting** - Prevent API abuse (100 req/15min general, 50 req/15min proxy)
- ✅ **Caching** - 5-minute response caching to reduce API costs
- ✅ **Logging** - Request tracking for monitoring
- ✅ **Health Checks** - `/health` endpoint for monitoring
- ✅ **Railway Ready** - Optimized for Railway deployment

## Supported Services

- **Anthropic Claude API** - Advanced AI language model
- **OpenAI GPT API** - ChatGPT and language models
- **Google Gemini API** - Google's AI language model
- **ElevenLabs API** - Voice synthesis and audio
- **Zhipu GLM API** - Chinese AI language model
- **Google Maps API** - Mapping and geolocation services
- **Resend API** - Email sending services
- **Supabase API** - Database and backend services (admin operations)

## Railway Deployment

### 1. Deploy to Railway

```bash
# Clone and deploy
git clone <your-repo>
cd legacy-ai-proxy
railway login
railway up
```

### 2. Configure Environment Variables in Railway Dashboard

Navigate to your Railway project settings → Variables and add:

```env
# AI Provider Keys (Add your actual keys here)
ANTHROPIC_API_KEY=sk-ant-api03-...
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_KEY_ID=...
GOOGLE_GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...
ZAI_GLM_API_KEY=...

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Maps Configuration
GOOGLE_MAPS_API_KEY=AIzaSy...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Email Configuration
RESEND_API_KEY=re_...

# Electron App Origin (for CORS)
ALLOWED_ORIGINS=app://.
```

### 3. Get Your Proxy URL

After deployment, Railway will provide a URL like:
```
https://your-proxy-app.up.railway.app
```

## API Usage

### Health Check
```http
GET /health
```

### List Available Services
```http
GET /api/proxy/services
```

### Proxy Request to Service

**Anthropic Claude:**
```http
POST /api/proxy/anthropic
Content-Type: application/json

{
  "endpoint": "/messages",
  "method": "POST",
  "body": {
    "model": "claude-3-sonnet-20241022",
    "max_tokens": 1000,
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }
}
```

**OpenAI GPT:**
```http
POST /api/proxy/openai
Content-Type: application/json

{
  "endpoint": "/chat/completions",
  "method": "POST",
  "body": {
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }
}
```

**Google Gemini:**
```http
POST /api/proxy/gemini
Content-Type: application/json

{
  "endpoint": "/models/gemini-pro:generateContent",
  "method": "POST",
  "body": {
    "contents": [{
      "parts": [{"text": "Hello!"}]
    }]
  }
}
```

**ElevenLabs (Text-to-Speech):**
```http
POST /api/proxy/elevenlabs
Content-Type: application/json

{
  "endpoint": "/text-to-speech/voice-id",
  "method": "POST",
  "body": {
    "text": "Hello, world!",
    "voice_settings": {
      "stability": 0.75,
      "similarity_boost": 0.75
    }
  }
}
```

## Client Integration (Electron)

```javascript
const proxyUrl = 'https://your-proxy-app.up.railway.app';

// Anthropic Claude API call
const claudeResponse = await fetch(`${proxyUrl}/api/proxy/anthropic`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: '/messages',
    method: 'POST',
    body: {
      model: 'claude-3-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: 'Hello!' }]
    }
  })
});

// OpenAI GPT API call
const openaiResponse = await fetch(`${proxyUrl}/api/proxy/openai`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: '/chat/completions',
    method: 'POST',
    body: {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello!' }]
    }
  })
});

// Google Gemini API call
const geminiResponse = await fetch(`${proxyUrl}/api/proxy/gemini`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: '/models/gemini-pro:generateContent',
    method: 'POST',
    body: {
      contents: [{
        parts: [{ text: 'Hello!' }]
      }]
    }
  })
});

// ElevenLabs TTS API call
const ttsResponse = await fetch(`${proxyUrl}/api/proxy/elevenlabs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: '/text-to-speech/your-voice-id',
    method: 'POST',
    body: {
      text: 'Hello, world!',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75
      }
    }
  })
});
```

## Security Features

- **API Key Isolation**: Keys never leave server environment
- **Rate Limiting**: By IP to prevent abuse
- **CORS Protection**: Only allowed origins can access
- **Request Validation**: All inputs validated
- **Security Headers**: Helmet middleware for OWASP compliance
- **Error Sanitization**: No sensitive data leaked in errors

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Monitoring

- Check `/health` for service status
- Monitor logs in Railway dashboard
- Rate limiting active - watch for 429 responses

## Next Steps

1. **Copy your Railway Proxy URL** after deployment
2. **Provide this URL to the Local Deployment Packing Specialist** for Electron app integration
3. **Configure your allowed origins** to include your Electron app domain

---

🔐 **Security Note**: This proxy is designed to keep API keys secure. Never expose these endpoints publicly without proper rate limiting and CORS configuration.