import Debug from 'debug';
import { create } from 'zustand';

const debug = Debug('5ire:stores:useMCPStore');

const REMOTE_CONFIG_TTL: number = 1000 * 60 * 60 * 24; // 1 day

export interface IMCPServer {
  key: string;
  command: 'uvx' | 'npx';
  description?: string;
  args: string[];
  env?: Record<string, string>;
  isActive: boolean;
}

export interface IMCPConfig {
  servers: IMCPServer[];
  updated?: number;
}
export interface IMCPStore {
  config: IMCPConfig;
  remoteConfig: IMCPConfig;
  fetchConfig: (refresh?: boolean) => Promise<IMCPConfig>;
  getConfig: () => Promise<IMCPConfig>;
  setConfig: (config: IMCPConfig) => Promise<boolean>;
  activateServer: (key: string) => Promise<boolean>;
  deactivateServer: (key: string) => Promise<boolean>;
}

const useMCPStore = create<IMCPStore>((set, get) => ({
  config: {
    servers: [],
  },
  remoteConfig: {
    servers: [],
  },
  fetchConfig: async (refresh?: boolean) => {
    let { remoteConfig } = get();
    if (!refresh) {
      if (
        remoteConfig.updated &&
        remoteConfig.servers.length > 0 &&
        Date.now() - remoteConfig.updated < REMOTE_CONFIG_TTL
      ) {
        debug('Using cached remote mcp config', remoteConfig);
        return remoteConfig;
      }
    }
    remoteConfig = await window.electron.mcp.fetchConfig();
    remoteConfig.updated = Date.now();
    debug('Fetched remote mcp config', remoteConfig);
    set({ remoteConfig });
    return remoteConfig;
  },
  getConfig: async () => {
    let config = get().config;
    if (config.servers.length === 0) {
      config = await window.electron.mcp.getConfig();
    }
    set({ config });
    return config;
  },
  setConfig: async (_config: IMCPConfig) => {
    const config = { ...get().config };
    try {
      set({ config: _config });
      await window.electron.mcp.setConfig(_config);
      return true;
    } catch (error) {
      console.error(error);
      set({ config }); // rollback
      return false;
    }
  },
  activateServer: async (key: string) => {
    const { servers } = { ...get().remoteConfig };
    const oldConfig = { ...get().config };
    const newConfig = { ...oldConfig };
    const server = servers.find((s) => s.key === key);
    if (server) {
      const activeServer = { ...server, isActive: true };
      const index = newConfig.servers.findIndex((s) => s.key === key);
      if (index > -1) {
        newConfig.servers[index] = activeServer;
      } else {
        newConfig.servers.push(activeServer);
      }
      set({ config: newConfig });
      const ok = await window.electron.mcp.setConfig(newConfig);
      if (ok) {
        return true;
      }
    } else {
      console.error('Server not found:', key);
    }
    set({ config: oldConfig }); // rollback
    return false;
  },
  deactivateServer: async (key: string) => {
    const oldConfig = { ...get().config };
    const newConfig = { ...oldConfig };
    const index = newConfig.servers.findIndex((s) => s.key === key);
    if (index > -1) {
      newConfig.servers.splice(index, 1);
      set({ config: newConfig });
      const ok = await window.electron.mcp.setConfig(newConfig);
      if (ok) {
        return true;
      }
    } else {
      console.error('Server not found:', key);
    }
    set({ config: oldConfig }); // rollback
    return false;
  },
}));

export default useMCPStore;
