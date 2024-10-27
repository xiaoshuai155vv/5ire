import { ProviderType } from '../providers/types';

export interface IUsage {
  id: string;
  provider: ProviderType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputPrice: number;
  outputPrice: number;
  createdAt: number;
}

export interface IUsageStatistics {
  provider: ProviderType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
}
