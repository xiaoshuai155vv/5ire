/* eslint-disable no-console */
import Debug from 'debug';
import { create } from 'zustand';
import { isNil, isNull, pick } from 'lodash';

import { ThemeType } from '../types/appearance';
import { IAPISettings, ISettings } from '../types/settings';
import { getProvider } from 'providers';

const debug = Debug('5ire:stores:useSettingsStore');

const defaultTheme = 'system';

const defaultAPI: IAPISettings = {
  provider: 'OpenAI',
  base: 'https://api.openai.com',
  key: '',
  model: '',
};

export interface ISettingStore {
  theme: ThemeType;
  api: IAPISettings;
  setTheme: (theme: ThemeType) => void;
  setAPI: (api: Partial<IAPISettings>) => void;
}

const settings = window.electron.store.get('settings', {}) as ISettings;
let apiSettings = defaultAPI;
if (settings.api?.activeProvider) {
  apiSettings =
    settings.api.providers[settings.api.activeProvider] || defaultAPI;
}

const useSettingsStore = create<ISettingStore>((set, get) => ({
  theme: settings?.theme || defaultTheme,
  api: apiSettings,
  setTheme: async (theme: ThemeType) => {
    set({ theme });
    window.electron.store.set('settings.theme', theme);
  },
  setAPI: (api: Partial<IAPISettings>) => {
    set((state) => {
      const provider = isNil(api.provider) ? state.api.provider : api.provider;
      const base = isNil(api.base) ? state.api.base : api.base;
      const key = isNil(api.key) ? state.api.key : api.key;
      const secret = isNil(api.secret) ? state.api.secret : api.secret;
      const model = isNil(api.model) ? state.api.model: api.model;
      const deploymentId = isNil(api.deploymentId)
        ? state.api.deploymentId
        : api.deploymentId;
      const newAPI = {
        provider,
        base,
        key,
        secret,
        deploymentId,
        model,
      } as IAPISettings;
      const { apiSchema } = getProvider(provider).chat;
      window.electron.store.set('settings.api.activeProvider', provider);
      window.electron.store.set(
        `settings.api.providers.${provider}`,
        pick(newAPI, [...apiSchema, 'provider'])
      );
      return { api: newAPI };
    });
  },
}));

export default useSettingsStore;
