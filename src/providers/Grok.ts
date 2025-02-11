import { IServiceProvider } from './types';

export default {
  name: 'Grok',
  apiBase: 'https://api.x.ai/v1',
  currency: 'USD',
  options: {
    apiBaseCustomizable: true,
    apiKeyCustomizable: true,
  },
  chat: {
    apiSchema: ['base', 'key', 'model'],
    presencePenalty: { min: -2, max: 2, default: 0 },
    topP: { min: 0, max: 1, default: 1 },
    temperature: { min: 0, max: 2, default: 0.9 },
    options: {
      modelCustomizable: false,
    },
    models: {
      'grok-beta': {
        name: 'grok-beta',
        contextWindow: 131072,
        maxTokens: 4096,
        inputPrice: 0.005,
        outputPrice: 0.015,
        isDefault: true,
        description: `Comparable performance to Grok 2 but with improved efficiency, speed and capabilities.`,
        toolEnabled: true,
        group: 'Grok',
      }
    },
  },
} as IServiceProvider;
