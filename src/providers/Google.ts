import { IServiceProvider } from './types';

export default {
  name: 'Google',
  apiBase: 'https://generativelanguage.googleapis.com',
  currency: 'USD',
  options: {
    apiBaseCustomizable: true,
    apiKeyCustomizable: true
  },
  chat: {
    apiSchema: ['base', 'key', 'model'],
    presencePenalty: { min: -2, max: 2, default: 0 },
    topP: { min: 0, max: 1, default: 1 },
    temperature: { min: 0, max: 1, default: 0.9 },
    options: {
      modelCustomizable: true,
      streamCustomizable: true,
    },
    models: {
      'gemini-1.5-pro': {
        name: 'gemini-1.5-pro',
        contextWindow: 1048576000,
        maxTokens: 8192,
        inputPrice: 0.00035,
        outputPrice: 0.0105,
        jsonModelEnabled: true,
        vision:{
          enabled:true,
        },
        description: `The multi-modal model from Google's Gemini family that balances model performance and speed.`,
        isDefault: true,
        group: 'Gemini',
      },
      'gemini-1.5-flash': {
        name: 'gemini-1.5-flash',
        contextWindow: 1048576000,
        maxTokens: 8192,
        inputPrice: 0.00035,
        outputPrice: 0.00105,
        jsonModelEnabled: false,
        vision:{
          enabled:true,
        },
        description: `Lightweight, fast and cost-efficient while featuring multimodal reasoning and a breakthrough long context window of up to one million tokens.`,
        group: 'Gemini',
      },
    },
  },

  // https://ai.google.dev/models/gemini?hl=zh-cn#embedding
  // https://ai.google.dev/tutorials/rest_quickstart#embedding
  /**
   * curl https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=$API_KEY \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
        "model": "models/embedding-001",
        "content": {
        "parts":[{
          "text": "Write a story about a magic backpack."}]} }'
   */
  /**
   * return
   * {
  "embedding": {
    "values": [
      0.008624583,
      -0.030451821,
      -0.042496547,
      -0.029230341,
      0.05486475,
      0.006694871,
      0.004025645,
   */
  embedding: {
    apiSchema: ['base', 'key', 'model'],
    models: {
      'embedding-001': {
        name: 'embedding-001',
        dimension: 768,
        price: 0.000025,
        maxTokens: 2048,
        description:
          'Optimized for creating embeddings for text with up to 2048 tokens, 1500 requests per minute.',
        isDefault: true,
      },
    },
  }
} as IServiceProvider;
