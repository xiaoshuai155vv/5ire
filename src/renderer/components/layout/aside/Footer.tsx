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
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAppearanceStore from 'stores/useAppearanceStore';

export default function Footer({ collapsed }: { collapsed: boolean }) {
  const toggleSidebarCollapsed = useAppearanceStore(
    (state) => state.toggleSidebarCollapsed
  );
  const { t } = useTranslation();
  const goFeedback = () => {
    window.electron.openExternal('https://5ire.canny.io/');
    window.electron.ingestEvent([{ app: 'go-feedback' }]);
  };
  const getHomepage = () => {
    window.electron.openExternal('https://get.5ire.app');
    window.electron.ingestEvent([{ app: 'go-homepage' }]);
  }
  const mailToSupport = () => {
    window.electron.openExternal('mailto:support@5ire.app');
  };


  useEffect(() => {
     //@ts-ignore
    const canny = Window?.Canny;
    if (canny) {
      canny('initChangelog', {
        appID: '64cd076f9481f00996a16c42',
        position: 'top',
        align: 'left',
        theme: 'auto'
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
            <MenuItem icon={<Chat20Regular />} onClick={goFeedback}>
              {t('Common.Feedback')}
            </MenuItem>
            <MenuItem icon={<EmojiMeme20Regular />} onClick={getHomepage}>{t('Common.About')}</MenuItem>
            <MenuItem icon={<Mail20Regular />} onClick={mailToSupport}>
              support@5ire.app
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
