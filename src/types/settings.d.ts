import { ProviderType } from 'providers/types';
import { ThemeType } from './appearance';


export interface IAPISettings {
  provider: ProviderType;
  base: string;
  key: string;
  model: string;
  secret?: string;
  deploymentId?: string;
  endpoint?: string;
}

export interface ISettings {
  theme: ThemeType;
  api: {
    activeProvider: string;
    providers: {
      [key: string]: IAPISettings;
    };
  };
}
