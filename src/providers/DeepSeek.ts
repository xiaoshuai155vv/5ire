import { IServiceProvider } from './types';

export default {
  name: 'DeepSeek',
  apiBase: 'https://api.deepseek.com',
  currency: 'CNY',
  options: {
    apiBaseCustomizable: true,
    apiKeyCustomizable: true,
  },
  chat: {
    apiSchema: ['base', 'key', 'model'],
    presencePenalty: { min: -2, max: 2, default: 0 },
    topP: { min: 0, max: 1, default: 1 },
    temperature: { min: 0, max: 2, default: 1 },
    options: {
      modelCustomizable: false,
    },
    models: {
      'deepseek-chat': {
        name: 'deepseek-chat',
        contextWindow: 128000,
        maxTokens: 4096,
        inputPrice: 0.0001,
        outputPrice: 0.001,
        isDefault: true,
        description: ``,
        group: 'DeepSeek',
      }
    },
  },
} as IServiceProvider;
