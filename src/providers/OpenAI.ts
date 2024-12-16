import { IServiceProvider } from './types';

export default {
  name: 'OpenAI',
  apiBase: 'https://api.openai.com',
  currency: 'USD',
  options: {
    apiBaseCustomizable: true,
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
        maxTokens: 4096,
        inputPrice: 0.005,
        outputPrice: 0.015,
        vision: {
          enabled: true,
          allowBase64: true,
          allowUrl: true,
        },
        toolEnabled: true,
        isDefault: true,
        description: `GPT-4o it's most advanced multimodal model of OpenAI that’s faster and cheaper than GPT-4 Turbo with stronger vision capabilities`,
        group: 'GPT-4',
      },
      'gpt-4o-mini': {
        name: 'gpt-4o-mini',
        contextWindow: 128000,
        maxTokens: 16384,
        inputPrice: 0.00015,
        outputPrice: 0.0006,
        vision: {
          enabled: true,
          allowBase64: true,
          allowUrl: true,
        },
        toolEnabled: true,
        description: `GPT-4o mini (“o” for “omni”) is OpenAI's advanced model in the small models category, and it's cheapest model yet. It is multimodal (accepting text or image inputs and outputting text), has higher intelligence than gpt-3.5-turbo but is just as fast. It is meant to be used for smaller tasks, including vision tasks.`,
        group: 'GPT-4',
      },
      'gpt-4-turbo': {
        name: 'gpt-4-turbo',
        contextWindow: 128000,
        maxTokens: 4096,
        inputPrice: 0.005,
        outputPrice: 0.015,
        jsonModelEnabled: true,
        vision: {
          enabled: true,
          allowBase64: true,
          allowUrl: true,
        },
        toolEnabled: true,
        description: `The latest GPT-4 Turbo model with vision capabilities.
        Vision requests can now use JSON mode and function calling.
        Currently points to gpt-4-turbo-2024-04-09.`,
        group: 'GPT-4',
      },
      'gpt-4-0125-preview': {
        name: 'gpt-4-0125-preview',
        contextWindow: 128000,
        maxTokens: 4096,
        inputPrice: 0.01,
        outputPrice: 0.03,
        jsonModelEnabled: true,
        toolEnabled: true,
        vision: {
          enabled: true,
          allowBase64: true,
          allowUrl: true,
        },
        description: `Ability to understand images, in addition to all other GPT-4 Turbo capabilities.
        Returns a maximum of 4,096 output tokens.
        This is a preview model version and not suited yet for production traffic`,
        group: 'GPT-4',
      },
      'gpt-4-1106-preview': {
        name: 'gpt-4-1106-preview',
        contextWindow: 128000,
        maxTokens: 4096,
        inputPrice: 0.01,
        outputPrice: 0.03,
        jsonModelEnabled: true,
        toolEnabled: true,
        description: `The latest GPT-4 model with improved instruction following,
        JSON mode, reproducible outputs, parallel function calling,
        and more. Returns a maximum of 4,096 output tokens.
        This preview model is not yet suited for production traffic`,
        group: 'GPT-4',
      },
      'gpt-4': {
        name: 'gpt-4',
        contextWindow: 8129,
        maxTokens: 8129,
        inputPrice: 0.03,
        outputPrice: 0.06,
        toolEnabled: true,
        description: `Snapshot of gpt-4 from June 13th 2023 with improved function calling support`,
        group: 'GPT-4',
      },
      'gpt-3.5-turbo-1106': {
        name: 'gpt-3.5-turbo-1106',
        contextWindow: 16385,
        maxTokens: 4096,
        inputPrice: 0.001,
        outputPrice: 0.002,
        description: `GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more`,
        group: 'GPT-3.5',
      },
      'gpt-3.5-turbo': {
        name: 'gpt-3.5-turbo',
        contextWindow: 16385,
        inputPrice: 0.0005,
        outputPrice: 0.0015,
        description: `The latest GPT-3.5 Turbo model with higher accuracy at responding in requested formats
        and a fix for a bug which caused a text encoding issue for non-English language function calls`,
        group: 'GPT-3.5',
      },
    },
  },
  embedding: {
    apiSchema: ['base', 'key', 'model'],
    models: {
      'text-embedding-3-large': {
        name: 'text-embedding-3-large',
        dimension: 3072,
        price: 0.00013,
        maxTokens: 8191,
        description:
          'Most capable embedding model for both english and non-english tasks',
        isDefault: true,
      },
      'text-embedding-3-small': {
        name: 'text-embedding-3-small',
        dimension: 1536,
        price: 0.00002,
        maxTokens: 8191,
        description:
          'Increased performance over 2nd generation ada embedding model',
      },
      'text-embedding-ada-002': {
        name: 'text-embedding-ada-002',
        dimension: 1536,
        price: 0.0001,
        maxTokens: 8191,
        description:
          'Most capable 2nd generation embedding model, replacing 16 first generation models',
      },
    },
  },
} as IServiceProvider;
