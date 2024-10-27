import { IServiceProvider } from './types';

export default {
  name: 'Azure',
  apiBase: '',
  currency: 'USD',
  options: {
    apiBaseCustomizable: true,
    apiKeyCustomizable: true
  },
  chat: {
    apiSchema: ['base', 'key', 'deploymentId', 'model'],
    docs: {
      deploymentId: 'The deployment name you chose when you deployed the model',
      temperature:
        'Higher values will make the output more creative and unpredictable, while lower values will make it more precise.',
      presencePenalty:
        "Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.",
      topP: 'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with topP probability mass.',
    },
    placeholders: {
      base: ' https://{YOUR_RESOURCE_NAME}.openai.azure.com',
    },
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
        vision:{
          enabled:true,
          allowBase64:true,
          allowUrl:true,
        },
        group: 'GPT-4',
      },
      'gpt-4o-mini': {
        name: 'gpt-4o-mini',
        contextWindow: 128000,
        maxTokens: 16384,
        inputPrice: 0.00015,
        outputPrice: 0.0006,
        description: `GPT-4o mini (“o” for “omni”) is OpenAI's advanced model in the small models category, and it's cheapest model yet. It is multimodal (accepting text or image inputs and outputting text), has higher intelligence than gpt-3.5-turbo but is just as fast. It is meant to be used for smaller tasks, including vision tasks.`,
        vision:{
          enabled:true,
          allowBase64:true,
          allowUrl:true,
        },
        group: 'GPT-4',
      },
      'gpt-4': {
        name: 'gpt-4',
        contextWindow: 8192,
        maxTokens: 8192,
        inputPrice: 0.03,
        outputPrice: 0.06,
        group: 'GPT-4',
      },
      'gpt-4-turbo': {
        name: 'gpt-4-turbo',
        contextWindow: 128000,
        maxTokens: 4096,
        inputPrice: 0.03,
        outputPrice: 0.06,
        group: 'GPT-4',
      },
      'gpt-4-32k': {
        name: 'gpt-4-32k',
        contextWindow: 32000,
        inputPrice: 0.06,
        outputPrice: 0.12,
        group: 'GPT-4',
      },
      'gpt-3.5-turbo': {
        name: 'gpt-3.5-turbo',
        contextWindow: 4000,
        inputPrice: 0.0015,
        outputPrice: 0.002,
        group: 'GPT-3.5',
      },
      'gpt-3.5-turbo-16k': {
        name: 'gpt-3.5-turbo-16k',
        contextWindow: 16000,
        inputPrice: 0.003,
        outputPrice: 0.004,
        group: 'GPT-3.5',
      },
    },
  },
  embedding: {
    apiSchema: ['base', 'key', 'deploymentId', 'model'],
    placeholders: {
      base: ' https://{YOUR_RESOURCE_NAME}.openai.azure.com',
    },
    models: {
      'text-embedding-3-small': {
        name: 'text-embedding-3-small',
        dimension: 1536,
        price: 0.00002,
        maxTokens: 8191,
        description:
          'Increased performance over 2nd generation ada embedding model',
        isDefault: true,
      },
    },
  },
} as IServiceProvider;
