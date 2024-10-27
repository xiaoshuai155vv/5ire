import { create } from 'zustand';
import { ThemeType } from 'types/appearance';

const defaultTheme = 'light';

interface IAppearanceStore {
  theme: Omit<ThemeType, 'system'>;
  sidebar: {
    hidden: boolean;
    collapsed: boolean;
  };
  setTheme: (theme: Omit<ThemeType, 'system'>) => void;
  toggleSidebarCollapsed: () => void;
  toggleSidebarVisibility: () => void;
  getPalette: (name: 'success'|'warning'|'error'|'info') => string;
}

const useAppearanceStore = create<IAppearanceStore>((set, get) => ({
  theme: defaultTheme,
  sidebar: {
    hidden: false,
    collapsed: false,
  },
  setTheme: (theme: Omit<ThemeType, 'system'>) => set({ theme }),
  toggleSidebarCollapsed: () => {
    set((state) => {
      const collapsed = !state.sidebar.collapsed;
      const hidden = false;
      localStorage.setItem('collapsed', String(collapsed));
      window.electron.ingestEvent([{ app: 'toggle-sidebar-collapsed' }]);
      return { sidebar: { collapsed, hidden } };
    });
  },
  toggleSidebarVisibility: () => {
    set((state) => {
      const hidden = !state.sidebar.hidden;
      const collapsed = false;
      localStorage.setItem('hidden', String(hidden));
      window.electron.ingestEvent([{ app: 'toggle-sidebar-visibility' }]);
      return { sidebar: { collapsed, hidden } };
    });
  },
  getPalette: (name: 'error'|'warning'|'success'|'info') => {
    const light = {
      success: '#3d7d3f',
      warning: '#d98926',
      error: '#c6474e',
      info: '#6e747d',
    };
    const dark = {
      success: '#64b75d',
      warning: '#e6a52a',
      error: '#de5d43',
      info: '#e7edf2',
    }
    const {theme} = get();
    return theme === 'dark'? dark[name] : light[name];
  }
}));

export default useAppearanceStore;
