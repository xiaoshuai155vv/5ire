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
      modelCustomizable: true,
    },
    models: {
      'grok-2-vision': {
        label: 'grok-2-vision',
        contextWindow: 32768,
        defaultMaxTokens: 4000,
        maxTokens: 4096,
        inputPrice: 0.002,
        outputPrice: 0.01,
        isDefault: true,
        vision: {
          enabled: true,
          allowBase64: true,
          allowUrl: true,
        },
        description: `specialized model for advanced image generation and understanding`,
        toolEnabled: true,
        group: 'Grok',
      },
      'grok-2': {
        label: 'grok-2',
        contextWindow: 128000,
        defaultMaxTokens: 128000,
        maxTokens: 128000,
        inputPrice: 0.002,
        outputPrice: 0.01,
        isDefault: true,
        description: `Comparable performance to Grok 2 but with improved efficiency, speed and capabilities.`,
        toolEnabled: true,
        group: 'Grok',
      },
    },
  },
} as IServiceProvider;
