import { Request, Response } from 'express';
import { ProxyRequest, ProxyResponse, ServiceConfig } from '../types';
import { buildUrl, validateRequest } from '../utils/helpers';

class ProxyController {
  private serviceConfigs: ServiceConfig;

  constructor() {
    this.serviceConfigs = this.loadServiceConfigs();
  }

  private loadServiceConfigs(): ServiceConfig {
    const configs: ServiceConfig = {};

    // Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
      configs.anthropic = {
        baseURL: 'https://api.anthropic.com/v1',
        keyName: 'x-api-key',
        keyValue: process.env.ANTHROPIC_API_KEY
      };
    }

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      configs.openai = {
        baseURL: 'https://api.openai.com/v1',
        keyName: 'Authorization',
        keyValue: `Bearer ${process.env.OPENAI_API_KEY}`
      };
    }

    // Google Gemini
    if (process.env.GOOGLE_GEMINI_API_KEY) {
      configs.gemini = {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        keyName: 'key',
        keyValue: process.env.GOOGLE_GEMINI_API_KEY
      };
    }

    // ElevenLabs
    if (process.env.ELEVENLABS_API_KEY) {
      configs.elevenlabs = {
        baseURL: 'https://api.elevenlabs.io/v1',
        keyName: 'xi-api-key',
        keyValue: process.env.ELEVENLABS_API_KEY
      };
    }

    // Zhipu GLM
    if (process.env.ZAI_GLM_API_KEY) {
      configs.glm = {
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
        keyName: 'Authorization',
        keyValue: `Bearer ${process.env.ZAI_GLM_API_KEY}`
      };
    }

    // Resend (Email)
    if (process.env.RESEND_API_KEY) {
      configs.resend = {
        baseURL: 'https://api.resend.com',
        keyName: 'Authorization',
        keyValue: `Bearer ${process.env.RESEND_API_KEY}`
      };
    }

    // Google Maps (for client-side, but we can proxy if needed)
    if (process.env.GOOGLE_MAPS_API_KEY) {
      configs.googlemaps = {
        baseURL: 'https://maps.googleapis.com/maps/api',
        keyName: 'key',
        keyValue: process.env.GOOGLE_MAPS_API_KEY
      };
    }

    // Supabase (if you need to proxy Supabase admin operations)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      configs.supabase = {
        baseURL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        keyName: 'Authorization',
        keyValue: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      };
    }

    return configs;
  }

  public async proxyRequest(req: Request, res: Response): Promise<void> {
    const { service } = req.params;
    const proxyReq: ProxyRequest = req.body;

    try {
      if (!service || !this.serviceConfigs[service]) {
        res.status(400).json({
          success: false,
          error: `Invalid service: ${service}. Available services: ${Object.keys(this.serviceConfigs).join(', ')}`
        } as ProxyResponse);
        return;
      }

      const validationError = validateRequest(proxyReq);
      if (validationError) {
        res.status(400).json({
          success: false,
          error: validationError
        } as ProxyResponse);
        return;
      }

      const config = this.serviceConfigs[service];
      const url = buildUrl(config.baseURL, proxyReq.endpoint, proxyReq.params, config.keyName, config.keyValue);

      console.log(`Proxying ${service} request to: ${url.replace(config.keyValue, '***')}`);

      const fetchOptions: RequestInit = {
        method: proxyReq.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config.keyName === 'Authorization' && { [config.keyName]: `Bearer ${config.keyValue}` })
        }
      };

      if (proxyReq.body && (proxyReq.method === 'POST' || proxyReq.method === 'PUT' || proxyReq.method === 'PATCH')) {
        fetchOptions.body = JSON.stringify(proxyReq.body);
      }

      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      const proxyResponse: ProxyResponse = {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.error || data.message || 'API request failed' : undefined,
        status: response.status
      };

      res.status(response.ok ? 200 : response.status).json(proxyResponse);

    } catch (error) {
      console.error('Proxy error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown proxy error';

      res.status(500).json({
        success: false,
        error: `Internal proxy error: ${errorMessage}`
      } as ProxyResponse);
    }
  }

  public getAvailableServices(req: Request, res: Response): void {
    res.json({
      services: Object.keys(this.serviceConfigs),
      timestamp: new Date().toISOString()
    });
  }
}

export default new ProxyController();