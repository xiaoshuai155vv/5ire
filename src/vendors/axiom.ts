// @ts-ignore
import { Axiom } from '@axiomhq/js';
import { captureException } from '../main/logging';

// 检查必要的环境变量
const requiredEnvVars = {
  AXIOM_TOKEN: process.env.AXIOM_TOKEN,
  AXIOM_ORG_ID: process.env.AXIOM_ORG_ID,
  AXIOM_DATASET: process.env.AXIOM_DATASET || 'mylog' // 设置默认值
};

// 初始化 Axiom 客户端
export const axiomClient = new Axiom({
  token: requiredEnvVars.AXIOM_TOKEN || '',
  orgId: requiredEnvVars.AXIOM_ORG_ID || '',
});

// 用于验证数据集是否存在的函数
export async function validateDataset() {
  try {
    const dataset = requiredEnvVars.AXIOM_DATASET;
    if (!dataset) {
      console.warn('未设置 AXIOM_DATASET，使用默认值: mylog');
    }
    await axiomClient.datasets.get(dataset);
    console.log(`数据集 ${dataset} 验证成功`);
  } catch (error: any) {
    console.error('数据集验证失败:', error);
    captureException(error);
  }
}

// 封装日志记录函数
export async function logToAxiom(data: object) {
  try {
    const dataset = requiredEnvVars.AXIOM_DATASET;
    if (!axiomClient || !dataset) {
      console.warn('Axiom 客户端未正确初始化，跳过日志记录');
      return;
    }
    await axiomClient.ingest(dataset, data);
  } catch (error: any) {
    console.error('Axiom 日志记录失败:', error);
    captureException(error);
  }
}

export default {
  ingest(data: { [key: string]: any }[]) {
    try {
      const dataset = requiredEnvVars.AXIOM_DATASET;
      if (!axiomClient || !dataset) {
        console.warn('Axiom 客户端未正确初始化，跳过日志记录');
        return;
      }
      axiomClient.ingest(dataset, data);
    } catch (err: any) {
      captureException(err);
    }
  },
  async flush() {
    try {
      if (!axiomClient) {
        console.warn('Axiom 客户端未正确初始化，跳过 flush');
        return;
      }
      await axiomClient.flush();
    } catch (err: any) {
      captureException(err);
    }
  },
};
