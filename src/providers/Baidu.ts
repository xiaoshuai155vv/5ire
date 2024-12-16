import { IServiceProvider } from './types';

export default {
  name: 'Baidu',
  apiBase: 'https://qianfan.baidubce.com',
  currency: 'CNY',
  options: {
    apiBaseCustomizable: false,
    apiKeyCustomizable: true,
  },
  description:
    '[API 密钥] 和 [API Secret] 的获取参考：https://cloud.baidu.com/doc/Reference/s/9jwvz2egb',
  chat: {
    apiSchema: ['base', 'key', 'secret', 'model'],
    docs: {
      key: '用户账号->安全认证->[Access Key]',
      secret: '用户账号->安全认证->[Secret Key]',
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
      'ERNIE-4.0-8K': {
        name: 'ERNIE-4.0-8K',
        contextWindow: 5120,
        maxTokens: 2048,
        inputPrice: 0.03,
        outputPrice: 0.09,
        description: `百度自研的旗舰级超大规模⼤语⾔模型，相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。 百度文心系列中效果最强大的⼤语⾔模型，理解、生成、逻辑、记忆能力达到业界顶尖水平。`,
        isDefault: true,
        group: 'ERNIE',
      },
      'ERNIE-4.0-8K-Preview': {
        name: 'ERNIE-4.0-8K-Preview',
        contextWindow: 5120,
        maxTokens: 2048,
        inputPrice: 0.03,
        outputPrice: 0.09,
        description: `百度自研的旗舰级超大规模⼤语⾔模型，相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。`,
        isDefault: true,
        group: 'ERNIE',
      },
      'ERNIE-4.0-8K-Latest': {
        name: 'ERNIE-4.0-8K-Latest',
        contextWindow: 5120,
        maxTokens: 2048,
        inputPrice: 0.03,
        outputPrice: 0.09,
        description: `ERNIE-4.0-8K-Latest相比ERNIE-4.0-8K能力全面提升，其中角色扮演能力和指令遵循能力提升较大；相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效，支持5K tokens输入+2K tokens输出。`,
        isDefault: true,
        group: 'ERNIE',
      },
      'ERNIE-4.0-Turbo-8K': {
        name: 'ERNIE-4.0-Turbo-8K',
        contextWindow: 5120,
        maxTokens: 2048,
        inputPrice: 0.03,
        outputPrice: 0.09,
        description: `ERNIE 4.0 Turbo是百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀`,
        group: 'ERNIE',
      },
      'ERNIE-4.0-Turbo-8K-Preview': {
        name: 'ERNIE-4.0-Turbo-8K-Preview',
        contextWindow: 5120,
        maxTokens: 2048,
        inputPrice: 0.03,
        outputPrice: 0.09,
        description: `ERNIE 4.0 Turbo是百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀`,
        group: 'ERNIE',
      },
      'ERNIE-4.0-Turbo-8K-Latest': {
        name: 'ERNIE-4.0-Turbo-8K-Latest',
        contextWindow: 5120,
        maxTokens: 2048,
        inputPrice: 0.03,
        outputPrice: 0.09,
        description: `ERNIE 4.0 Turbo是百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀`,
        group: 'ERNIE',
      },
      'ERNIE-3.5-8K': {
        name: 'ERNIE-3.5-8K',
        contextWindow: 124000,
        maxTokens: 4096,
        inputPrice: 0.0008,
        outputPrice: 0.002,
        description: `百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。`,
        group: 'ERNIE',
      },
    },
  },
  embedding: {
    apiSchema: ['base', 'key', 'secret', 'model'],
    models: {
      'Embedding-V1': {
        name: 'Embedding-V1',
        price: 0.002,
        maxTokens: 384,
        maxChars: 1000,
        description:
          '基于百度文心大模型技术的文本表示模型，将文本转化为用数值表示的向量形式，用于文本检索、信息推荐、知识挖掘等场景，每个文本token数不超过384且长度不超过1000个字符。',
        isDefault: true,
      },
    },
  },
} as IServiceProvider;
