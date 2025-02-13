import { IServiceProvider } from './types';

export default {
  name: 'ChatBro',
  apiBase: 'https://api.chatbro.cn',
  currency: 'CNY',
  options: {
    apiBaseCustomizable: false,
    apiKeyCustomizable: true,
  },
  chat: {
    apiSchema: ['base', 'key', 'model'],
    presencePenalty: { min: -2, max: 2, default: 0 },
    topP: { min: 0, max: 1, default: 1 },
    temperature: { min: 0, max: 1, default: 0.9 },
    options: {
      modelCustomizable: true,
    },
    models: {
      'gpt-4o': {
        name: 'gpt-4o',
        contextWindow: 128000,
        maxTokens: 4906,
        defaultMaxTokens: 2048,
        inputPrice: 0.005,
        outputPrice: 0.015,
        description: `GPT-4o it's most advanced multimodal model of OpenAI that’s faster and cheaper than GPT-4 Turbo with stronger vision capabilities`,
        group: 'GPT-4',
      },
      'gpt-4o-mini': {
        name: 'gpt-4o-mini',
        contextWindow: 128000,
        maxTokens: 16384,
        defaultMaxTokens: 2048,
        inputPrice: 0.00015,
        outputPrice: 0.0006,
        vision: {
          enabled: true,
          allowBase64: true,
          allowUrl: true,
        },
        description: `GPT-4o mini (“o” for “omni”) is OpenAI's advanced model in the small models category, and it's cheapest model yet. It is multimodal (accepting text or image inputs and outputting text), has higher intelligence than gpt-3.5-turbo but is just as fast. It is meant to be used for smaller tasks, including vision tasks.`,
        group: 'GPT-4',
      },
      'gpt-4': {
        name: 'gpt-4',
        contextWindow: 128000,
        maxTokens: 4906,
        defaultMaxTokens: 2048,
        inputPrice: 0.08,
        outputPrice: 0.3,
        description: `The latest GPT-4 model with improved instruction following,
      JSON mode, reproducible outputs, parallel function calling,
      and more. Returns a maximum of 4,096 output tokens.
      This preview model is not yet suited for production traffic`,
        group: 'GPT-4',
      },
      'gpt-35-turbo': {
        name: 'gpt-35-turbo',
        contextWindow: 128000,
        maxTokens: 4906,
        defaultMaxTokens: 2048,
        inputPrice: 0.01,
        outputPrice: 0.02,
        description: `Ability to understand images, in addition to all other GPT-4 Turbo capabilties.
      Returns a maximum of 4,096 output tokens.
      This is a preview model version and not suited yet for production traffic`,
        group: 'GPT-3.5',
      },
    },
  },
} as IServiceProvider;
