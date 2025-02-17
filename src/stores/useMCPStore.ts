import Debug from 'debug';
import { IMCPConfig, IMCPServer } from 'types/mcp';
import { create } from 'zustand';

const debug = Debug('5ire:stores:useMCPStore');

const REMOTE_CONFIG_TTL: number = 1000 * 60 * 60 * 24; // 1 day

export interface IMCPStore {
  isLoading: boolean;
  activeServerNames: string[];
  config: IMCPConfig;
  builtinConfig: IMCPConfig;
  updateLoadingState: (isLoading: boolean) => void;
  loadConfig: () => Promise<IMCPConfig>;
  fetchConfig: (refresh?: boolean) => Promise<IMCPConfig>;
  setActiveServerNames: (activeServerNames: string[]) => void;
  getActiveServerNames: () => Promise<string[]>;
  activateServer: (
    key: string,
    command?: string,
    args?: string[],
    env?: Record<string, string>,
  ) => Promise<boolean>;
  deactivateServer: (key: string) => Promise<boolean>;
}

const useMCPStore = create<IMCPStore>((set, get) => ({
  isLoading: true,
  activeServerNames: [],
  config: { servers: [] },
  builtinConfig: {
    servers: [],
  },
  updateLoadingState: (isLoading: boolean) => {
    set({ isLoading });
  },
  loadConfig: async () => {
    const config = await window.electron.mcp.getConfig();
    set({ config });
    return config;
  },
  fetchConfig: async (refresh?: boolean) => {
    let { builtinConfig } = get();
    if (!refresh) {
      if (
        builtinConfig.updated &&
        builtinConfig.servers.length > 0 &&
        Date.now() - builtinConfig.updated < REMOTE_CONFIG_TTL
      ) {
        return builtinConfig;
      }
    }
    builtinConfig = await window.electron.mcp.fetchConfig();
    builtinConfig.updated = Date.now();
    set({ builtinConfig: builtinConfig });
    return builtinConfig;
  },
  setActiveServerNames: (activeServerNames: string[]) => {
    set({ activeServerNames });
  },
  getActiveServerNames: async () => {
    const activeServerNames = await window.electron.mcp.getActiveServers();
    set({ activeServerNames });
    return activeServerNames;
  },
  activateServer: async (
    key: string,
    command?: string,
    args?: string[],
    env?: Record<string, string>,
  ) => {
    const { activeServerNames } = get();
    debug('Activating server:', {
      key: key,
      command: command,
      args: args,
      env: env,
    });
    const { error } = await window.electron.mcp.activate({
      key: key,
      command: command,
      args: args,
      env: env,
    });
    if (error) {
      throw new Error(error);
    }
    set({
      activeServerNames: [...activeServerNames, key],
    });
    await get().loadConfig();
    return true;
  },
  deactivateServer: async (key: string) => {
    const { activeServerNames } = get();
    const { error } = await window.electron.mcp.deactivated(key);
    if (error) {
      throw new Error(error);
    }
    set({
      activeServerNames: activeServerNames.filter((name) => name !== key),
    });
    await get().loadConfig();
    return true;
  },
}));

export default useMCPStore;
