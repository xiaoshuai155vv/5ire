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
  isLoading: boolean;
  activeServerNames: string[];
  config: IMCPConfig;
  remoteConfig: IMCPConfig;
  updateLoadingState: (isLoading: boolean) => void;
  fetchConfig: (refresh?: boolean) => Promise<IMCPConfig>;
  getConfig: () => Promise<IMCPConfig>;
  setConfig: (config: IMCPConfig) => Promise<boolean>;
  setActiveServerNames: (activeServerNames: string[]) => void;
  getActiveServerNames: () => Promise<string[]>;
  activateServer: (key: string, args?: string[],env?:Record<string,string>) => Promise<boolean>;
  deactivateServer: (key: string) => Promise<boolean>;
}

const useMCPStore = create<IMCPStore>((set, get) => ({
  isLoading: true,
  activeServerNames: [],
  config: {
    servers: [],
  },
  remoteConfig: {
    servers: [],
  },
  updateLoadingState: (isLoading: boolean) => {
    set({ isLoading });
  },
  fetchConfig: async (refresh?: boolean) => {
    let { remoteConfig } = get();
    if (!refresh) {
      if (
        remoteConfig.updated &&
        remoteConfig.servers.length > 0 &&
        Date.now() - remoteConfig.updated < REMOTE_CONFIG_TTL
      ) {
        return remoteConfig;
      }
    }
    remoteConfig = await window.electron.mcp.fetchConfig();
    remoteConfig.updated = Date.now();
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
      await window.electron.mcp.putConfig(_config);
      return true;
    } catch (error) {
      console.error(error);
      set({ config }); // rollback
      return false;
    }
  },
  setActiveServerNames: (activeServerNames: string[]) => {
    set({ activeServerNames });
  },
  getActiveServerNames: async () => {
    const activeServerNames = await window.electron.mcp.getActiveServers();
    set({ activeServerNames });
    return activeServerNames;
  },
  activateServer: async (key: string, args?: string[], env?:Record<string,string>) => {
    const { activeServerNames } = get();
    const { servers } = { ...get().remoteConfig };
    const oldConfig = { ...get().config };
    const newConfig = { ...oldConfig };
    // find server in oldConfig first
    let server = oldConfig.servers.find((s) => s.key === key);
    if(!server){
      server = servers.find((s) => s.key === key);
    }
    if (server) {
      const activeServer = { ...server, isActive: true };
      if (args) {
        activeServer.args = args;
      }
      if (env && Object.keys(env).length > 0) {
        activeServer.env = env;
      }
      const index = newConfig.servers.findIndex((s) => s.key === key);
      if (index > -1) {
        newConfig.servers[index] = activeServer;
      } else {
        newConfig.servers.push(activeServer);
      }
      console.log('Activating server:', {
        key: activeServer.key,
        command: activeServer.command,
        args: activeServer.args,
        env: activeServer.env,
      });
      const { error } = await window.electron.mcp.activate({
        key: activeServer.key,
        command: activeServer.command,
        args: activeServer.args,
        env: activeServer.env,
      });
      if (error) {
        throw new Error(error);
      }
      set({
        config: newConfig,
        activeServerNames: [...activeServerNames, key],
      });
      const ok = await window.electron.mcp.putConfig(newConfig);
      if (ok) {
        return true;
      }
      // rollback
      await window.electron.mcp.deactivated(activeServer.key);
      set({
        config: oldConfig,
        activeServerNames: activeServerNames.filter((name) => name !== key),
      });
      return false;
    } else {
      console.error('Server not found:', key);
      return false;
    }
  },
  deactivateServer: async (key: string) => {
    const { activeServerNames } = get();
    const oldConfig = { ...get().config };
    const newConfig = { ...oldConfig };
    const index = newConfig.servers.findIndex((s) => s.key === key);
    if (index > -1) {
      const server = newConfig.servers.splice(index, 1)[0];
      set({
        config: newConfig,
        activeServerNames: activeServerNames.filter((name) => name !== key),
      });
      let ok = await window.electron.mcp.deactivated(server.key);
      if (ok) {
        ok = await window.electron.mcp.putConfig(newConfig);
      }
      if (ok) {
        return true;
      }
      // rollback
      await window.electron.mcp.activate({
        key: server.key,
        command: server.command,
        args: server.args,
        env: server.env,
      });
      set({
        config: oldConfig,
        activeServerNames: [...activeServerNames, key],
      });
      return false;
    } else {
      console.error('Server not found:', key);
      return false;
    }
  },
}));

export default useMCPStore;
