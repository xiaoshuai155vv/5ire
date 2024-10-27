import { IServiceProvider } from './types';

export default {
  name: 'Moonshot',
  apiBase: 'https://api.moonshot.cn',
  currency: 'CNY',
  options: {
    apiBaseCustomizable: false,
    apiKeyCustomizable: true
  },
  chat: {
    apiSchema: ['base', 'key', 'model'],
    presencePenalty: { min: -2, max: 2, default: 0 },
    topP: { min: 0, max: 1, default: 1 },
    temperature: { min: 0, max: 1, default: 0.3 },
    options: {
      modelCustomizable: true,
    },
    models: {
      'moonshot-v1-8k': {
        name: 'moonshot-v1-8k',
        contextWindow: 8192,
        maxTokens: 1024,
        inputPrice: 0.012,
        outputPrice: 0.012,
        isDefault: true,
        group: 'Moonshot',
      },
      'moonshot-v1-32k': {
        name: 'moonshot-v1-32k',
        contextWindow: 32768,
        maxTokens: 1024,
        inputPrice: 0.024,
        outputPrice: 0.024,
        group: 'Moonshot',
      },
      'moonshot-v1-128k': {
        name: 'moonshot-v1-128k',
        contextWindow: 131072,
        maxTokens: 1024,
        inputPrice: 0.06,
        outputPrice: 0.06,
        group: 'Moonshot',
      },
    },
  },
} as IServiceProvider;
