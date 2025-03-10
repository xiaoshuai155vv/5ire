import { IServiceProvider } from './types';

export default {
  name: '5ire',
  apiBase: 'https://skyfire.agisurge.com',
  //apiBase: 'http://127.0.0.1:8000',
  currency: 'USD',
  isPremium: true,
  options: {
    apiBaseCustomizable: false,
    apiKeyCustomizable: false,
  },
  chat: {
    apiSchema: ['base', 'model'],
    presencePenalty: { min: -2, max: 2, default: 0 },
    topP: { min: 0, max: 1, default: 1 },
    temperature: { min: 0, max: 1, default: 0.9 },
    options: {
      modelCustomizable: true,
    },
    models: {
      /** 由于暂不支持 streaming，所以暂时不支持 o1 系列
      'o1-preview': {
        name: 'o1-preview',
        contextWindow: 128000,
        maxTokens: 32768,
        inputPrice: 0.015,
        outputPrice: 0.06,
        vision: {
          enabled: false,
        },
        jsonModelEnabled: false,
        description: ``,
        group: 'o1',
      },
      'o1-mini': {
        name: 'o1-mini',
        contextWindow: 128000,
        maxTokens: 65536,
        inputPrice: 0.003,
        outputPrice: 0.012,
        vision: {
          enabled: false,
        },
        jsonModelEnabled: false,
        description: ``,
        group: 'o1',
      },
      */
      'gpt-4o': {
        label: 'gpt-4o',
        contextWindow: 128000,
        maxTokens: 4096,
        defaultMaxTokens: 4000,
        inputPrice: 0.005,
        outputPrice: 0.015,
        vision: {
          enabled: true,
        },
        jsonModelEnabled: false,
        description: ``,
        group: 'GPT-4',
      },
      'gpt-4': {
        label: 'gpt-4',
        contextWindow: 128000,
        maxTokens: 4096,
        defaultMaxTokens: 4000,
        inputPrice: 0.03,
        outputPrice: 0.06,
        group: 'GPT-4',
      },
      'gpt-3.5-turbo': {
        label: 'gpt-35-turbo',
        contextWindow: 16385,
        maxTokens: 4096,
        defaultMaxTokens: 4000,
        inputPrice: 0.0015,
        outputPrice: 0.002,
        group: 'GPT-3.5',
      },
    },
  },
} as IServiceProvider;
