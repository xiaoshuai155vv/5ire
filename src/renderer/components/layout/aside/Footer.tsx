import {
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import {
  QuestionCircle20Regular,
  ArrowRight16Regular,
  ArrowLeft16Regular,
  Mail20Regular,
  Chat20Regular,
  EmojiMeme20Regular,
  Alert20Regular,
} from '@fluentui/react-icons';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAppearanceStore from 'stores/useAppearanceStore';

export default function Footer({ collapsed }: { collapsed: boolean }) {
  const toggleSidebarCollapsed = useAppearanceStore(
    (state) => state.toggleSidebarCollapsed
  );
  const { t } = useTranslation();
  const goTwitter = useCallback(() => {
    window.electron.openExternal('https://x.com/1ronben');
    window.electron.ingestEvent([{ app: 'go-twitter' }]);
  }, []);
  const getHomepage = useCallback(() => {
    window.electron.openExternal('https://5ire.app');
    window.electron.ingestEvent([{ app: 'go-homepage' }]);
  }, []);

  const goGitHub = useCallback(() => {
    window.electron.openExternal('https://github.com/nanbingxyz/5ire');
    window.electron.ingestEvent([{ app: 'go-github' }]);
  }, []);

  useEffect(() => {
    //@ts-ignore
    const canny = Window?.Canny;
    if (canny) {
      canny('initChangelog', {
        appID: '64cd076f9481f00996a16c42',
        position: 'top',
        align: 'left',
        theme: 'auto',
      });
    }
    //@ts-ignore
  }, [Window?.Canny]);

  return (
    <div
      className={`flex w-full items-center justify-between self-baseline border-t border-base bg-brand-sidebar px-6 py-2 ${
        collapsed ? 'flex-col' : ''
      }`}
    >
      <button
        data-canny-changelog
        type="button"
        className={`flex items-center gap-x-1 rounded-md px-2 py-2 text-xs font-medium text-brand-secondary outline-none hover:bg-brand-surface-1 hover:text-brand-base ${
          collapsed ? 'w-full justify-center' : ''
        }`}
        title="Shortcuts"
        aria-label="changelog"
      >
        <Alert20Regular />
      </button>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <button
            type="button"
            className={`flex items-center gap-x-1 rounded-md px-2 py-2 text-xs font-medium text-brand-secondary outline-none hover:bg-brand-surface-1 hover:text-brand-base ${
              collapsed ? 'w-full justify-center' : ''
            }`}
            title={t('Common.Help')}
          >
            <QuestionCircle20Regular />
            {collapsed ? '' : <span>{t('Common.Help')}</span>}
          </button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="18"
                  height="18"
                  stroke-width="1.5"
                >
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                </svg>
              }
              onClick={goTwitter}
            >
              {t('Common.Author')}
            </MenuItem>
            <MenuItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="18"
                  height="18"
                  stroke-width="1.5"
                >
                  <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path>
                </svg>
              }
              onClick={goGitHub}
            >
              {t('Common.GitHub')}
            </MenuItem>
            <MenuItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  width="20"
                  height="20"
                  stroke-width="1.5"
                >
                  <path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z"></path>
                </svg>
              }
              onClick={getHomepage}
            >
              {t('Common.About')}
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      <button
        type="button"
        className={`hidden items-center gap-3 rounded-md px-2 py-2 text-xs font-medium outline-none hover:bg-brand-surface-1 hover:text-brand-base md:flex ${
          collapsed ? 'w-full justify-center' : ''
        }`}
        onClick={() => toggleSidebarCollapsed()}
      >
        {collapsed ? <ArrowRight16Regular /> : <ArrowLeft16Regular />}
      </button>
      <div className="relative" />
    </div>
  );
}
