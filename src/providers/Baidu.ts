import { IServiceProvider } from './types';

export default {
  name: 'Baidu',
  apiBase: 'https://aip.baidubce.com',
  currency: 'CNY',
  options: {
    apiBaseCustomizable: false,
    apiKeyCustomizable: true
  },
  chat: {
    apiSchema: ['base', 'key', 'secret', 'model', 'endpoint'],
    docs: {
      endpoint: 'The API address you filled in when applying',
    },
    presencePenalty: { min: 1, max: 2, default: 1 }, // penalty_score
    topP: { min: 0, max: 1, default: 0.8 }, // (0, 1]
    temperature: {
      min: 0,
      max: 1,
      default: 0.95,
      interval: {
        leftOpen: true,
        rightOpen: false,
      },
    }, // (0, 1]
    options: {
      modelCustomizable: true,
    },
    models: {
      'ERNIE-Bot 4.0': {
        name: 'ERNIE-Bot 4.0',
        contextWindow: null,
        endpoint: 'completions_pro',
        inputPrice: 0.12,
        outputPrice: 0.12,
        description: `ERNIE-Bot 4.0 is a large language model developed by Baidu,
        covering massive Chinese data, with stronger capabilities such as dialogue Q&A,
        content creation and generation.`,
        isDefault: true,
        group: 'ERNIE',
      },
      'ERNIE-Bot-turbo': {
        name: 'ERNIE-Bot-turbo',
        contextWindow: null,
        inputPrice: 0.008,
        outputPrice: 0.008,
        endpoint: 'eb-instant',
        description: `ERNIE-Bot Turbo is a large language model developed by Baidu,
        covering massive Chinese data, with stronger capabilities such as dialogue Q&A,
        content creation and generation.`,
        group: 'ERNIE',
      },
      'ERNIE-Bot': {
        name: 'ERNIE-Bot',
        contextWindow: null,
        inputPrice: 0.012,
        outputPrice: 0.012,
        endpoint: 'completions',
        description: `ERNIE-Bot is a large language model developed by Baidu,
        covering massive Chinese data, with stronger capabilities such as dialogue Q&A,
        content creation and generation.`,
        group: 'ERNIE',
      },
      'Llama-2-70B': {
        name: 'Llama-2-70B',
        contextWindow: null,
        inputPrice: 0.044,
        outputPrice: 0.044,
        endpoint: 'llama_2_70b',
        description: `The 70B parameter large language model, developed by Meta AI and open-sourced,
        performs well in scenarios such as coding, inference, and knowledge application.`,
        group: 'Open Source',
      },
    },
  },
  embedding: {
    apiSchema: ['base', 'key', 'secret', 'model', 'endpoint'],
    docs: {
      endpoint: 'The API address you filled in when applying',
    },
    models: {
      'Embedding-V1': {
        name: 'Embedding-V1',
        price: 0.002,
        maxTokens: 384,
        maxChars: 1000,
        description:
          '基于百度文心大模型技术的文本表示模型，将文本转化为用数值表示的向量形式，用于文本检索、信息推荐、知识挖掘等场景，每个文本token数不超过384且长度不超过1000个字符。',
        isDefault:true
      },
    },
  },
} as IServiceProvider;
